import { Mirage, MirageConfig } from "mirage-engine";
import { Recipe, RecipeTime } from "./types";

interface Clock extends RecipeTime {
  elapsed: number;
}

class A2kama {
  private recipes: Map<string, Recipe> = new Map();
  private mirageInstance: Mirage | null = null;
  private rootElement: HTMLElement | null = null;
  private animatedUniforms: WeakMap<HTMLElement, Record<string, any>> = new WeakMap();
  // Current uniform values per element, shared by getOptions() and the clocks.
  private uniformValues: WeakMap<HTMLElement, Record<string, any>> = new WeakMap();
  private clocks: Map<HTMLElement, Clock> = new Map();
  private lastFrameTime: number | null = null;
  // Elements whose recipe changed after init and still need a layout pass once rebuilt.
  private pendingResync: Set<HTMLElement> = new Set();
  private resyncCount = 0;

  /**
   * Retrieves a reactive Proxy object for the element's options.
   * Any changes to the properties of this object will automatically apply to the WebGL shader.
   * @param element The target element or a CSS selector.
   * @returns A Proxy object of the options.
   */
  getOptions(element: HTMLElement | string): Record<string, any> | null {
    if (!this.mirageInstance) {
      console.warn("a2kama: Engine is not initialized yet.");
      return null;
    }

    const targetElement = typeof element === "string" ? document.querySelector(element) as HTMLElement : element;
    if (!targetElement) {
      console.warn("a2kama: Target element not found.", element);
      return null;
    }

    let currentUniforms = this.animatedUniforms.get(targetElement);
    if (!currentUniforms) {
      const uniforms = this.getUniformValues(targetElement);
      let optionMap: Record<string, string> = {};

      const mapData = targetElement.dataset.a2kamaMap;
      if (mapData) {
        try {
          optionMap = JSON.parse(mapData);
        } catch (e) {
          console.error("a2kama: Failed to parse a2kamaMap dataset", e);
        }
      }

      const engine = this.mirageInstance;

      // Create a user-facing options object
      const userOptions: Record<string, any> = {};
      if (Object.keys(optionMap).length > 0) {
        for (const [userKey, uniformKey] of Object.entries(optionMap)) {
          if (uniformKey in uniforms) {
            userOptions[userKey] = uniforms[uniformKey];
          }
        }
      } else {
        Object.assign(userOptions, uniforms);
      }

      // Create a Proxy to intercept all property reads and assignments.
      const proxy = new Proxy(userOptions, {
        get(target, property) {
          if (typeof property !== "string") return Reflect.get(target, property);

          // Read live uniform values, so values driven elsewhere (e.g. time) are current
          const uniformKey = optionMap[property] || property;
          return uniformKey in uniforms ? uniforms[uniformKey] : target[property];
        },
        set(target, property, value) {
          target[property as string] = value;

          // Map back to uniform key
          const uniformKey = optionMap[property as string] || (property as string);
          uniforms[uniformKey] = value;

          // Send only the changed uniform, so values driven elsewhere (e.g. time) are not reset
          engine.updateUniforms(targetElement, { [uniformKey]: value });
          return true; // Indicate success
        }
      });

      this.animatedUniforms.set(targetElement, proxy);
      currentUniforms = proxy;
    }

    return currentUniforms;
  }

  register(name: string, recipe: Recipe) {
    this.recipes.set(name, recipe);
  }

  /**
   * Applies a registered recipe to an element, replacing the recipe it had.
   * Options objects from getOptions() for the previous recipe no longer apply; call it again.
   * @param element The target element.
   * @param name The name the recipe was registered with.
   */
  setRecipe(element: HTMLElement, name: string) {
    const recipe = this.recipes.get(name);
    if (!recipe) {
      console.warn(`a2kama: Recipe '${name}' not found for element`, element);
      return;
    }

    element.dataset.a2kama = name;
    // Apply mirage attributes required by the engine for travelers
    // element.dataset.mirageTravel = "traveler";
    // element.dataset.mirageFilter = "exclude-self";
    element.dataset.mirageDom = "hide";

    // Inject the generated shader from the recipe
    element.dataset.mirageShader = JSON.stringify(recipe.shader);
    if (recipe.optionMap) {
      element.dataset.a2kamaMap = JSON.stringify(recipe.optionMap);
    } else {
      delete element.dataset.a2kamaMap;
    }

    this.uniformValues.set(element, { ...recipe.shader.uniforms });
    this.animatedUniforms.delete(element);
    if (this.mirageInstance) this.pendingResync.add(element);
    if (recipe.time) {
      this.clocks.set(element, { ...recipe.time, elapsed: 0 });
    } else {
      this.clocks.delete(element);
    }
  }

  init(root?: HTMLElement, config?: MirageConfig) {
    this.rootElement = root || document.body;

    // Scan DOM for a2kama attributes
    const elements = this.rootElement.querySelectorAll("[data-a2kama]");

    elements.forEach((el) => {
      const recipeName = el.getAttribute("data-a2kama");
      if (recipeName && el instanceof HTMLElement) {
        this.setRecipe(el, recipeName);
      }
    });

    // Default configuration based on dev reference
    const defaultConfig: MirageConfig = {
      quality: "medium",
      mode: "overlay",
      travelerClipArea: "50px",
      ...config,
    };

    this.mirageInstance = new Mirage(this.rootElement, defaultConfig);
    const tracker = this.mirageInstance.getTracker();
    tracker.onLayoutChange.add(this.resyncRebuiltMeshes);
    tracker.onRender.add(this.advanceClocks);
    this.mirageInstance.start();
  }

  dispose(element: HTMLElement) {
    this.clocks.delete(element);
    this.uniformValues.delete(element);
    this.animatedUniforms.delete(element);

    if (this.mirageInstance) {
      // Clean up the element from mirage engine
      // Currently mirage-engine may not expose a specific single element destroy,
      // but we remove the attributes and if mirage tracks mutations, it may handle it.
      // At a minimum, we clear its shader data.
      delete element.dataset.mirageTravel;
      delete element.dataset.mirageFilter;
      delete element.dataset.mirageDom;
      delete element.dataset.mirageShader;
      delete element.dataset.a2kamaMap;
    }
  }

  // Expose the raw instance for advanced usage
  get engine(): Mirage | null {
    return this.mirageInstance;
  }

  private getUniformValues(element: HTMLElement): Record<string, any> {
    const cached = this.uniformValues.get(element);
    if (cached) return cached;

    let uniforms: Record<string, any> = {};
    const shaderData = element.dataset.mirageShader;
    if (shaderData) {
      try {
        const parsed = JSON.parse(shaderData);
        if (parsed.uniforms) {
          uniforms = { ...parsed.uniforms };
        }
      } catch (e) {
        console.error("a2kama: Failed to parse mirageShader dataset", e);
      }
    }

    this.uniformValues.set(element, uniforms);
    return uniforms;
  }

  // Runs after mirage-engine has applied a layout change, including mesh rebuilds.
  // A rebuilt mesh is scaled before its box-shadow padding is known, so it renders too small
  // until the next layout pass. A no-op style change on the element schedules that pass.
  private resyncRebuiltMeshes = () => {
    for (const element of this.pendingResync) {
      element.style.setProperty("--a2kama-resync", String(++this.resyncCount));
    }
    this.pendingResync.clear();
  };

  // Runs once per engine frame, right before the scene is drawn.
  private advanceClocks = () => {
    const now = performance.now();
    // Cap the step so a tab returning from the background does not jump ahead.
    const delta = this.lastFrameTime === null ? 0 : Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    if (!this.mirageInstance) return;

    for (const [element, clock] of this.clocks) {
      const uniforms = this.uniformValues.get(element);
      const speed = clock.speed && uniforms ? Number(uniforms[clock.speed] ?? 1) : 1;

      clock.elapsed += delta * speed;
      if (uniforms) uniforms[clock.uniform] = clock.elapsed;
      this.mirageInstance.updateUniforms(element, { [clock.uniform]: clock.elapsed });
    }
  };
}

const a2kama = new A2kama();
export default a2kama;
export * from "./types";
// @ts-ignore
import * as THREE from "three";
export { THREE };
