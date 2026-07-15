import { Mirage, MirageConfig } from "mirage-engine";
import { Recipe } from "./types";

class A2kama {
  private recipes: Map<string, Recipe> = new Map();
  private mirageInstance: Mirage | null = null;
  private rootElement: HTMLElement | null = null;
  private animatedUniforms: WeakMap<HTMLElement, Record<string, any>> = new WeakMap();

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
      let initialUniforms: Record<string, any> = {};
      let optionMap: Record<string, string> = {};
      
      const shaderData = targetElement.dataset.mirageShader;
      const mapData = targetElement.dataset.a2kamaMap;

      if (shaderData) {
        try {
          const parsed = JSON.parse(shaderData);
          if (parsed.uniforms) {
            initialUniforms = { ...parsed.uniforms };
          }
        } catch (e) {
          console.error("a2kama: Failed to parse mirageShader dataset", e);
        }
      }
      
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
          if (uniformKey in initialUniforms) {
            userOptions[userKey] = initialUniforms[uniformKey];
          }
        }
      } else {
        Object.assign(userOptions, initialUniforms);
      }

      // Create a Proxy to intercept all property assignments.
      const proxy = new Proxy(userOptions, {
        set(target, property, value) {
          target[property as string] = value;
          
          // Map back to uniform key
          const uniformKey = optionMap[property as string] || (property as string);
          initialUniforms[uniformKey] = value;

          // Synchronize with mirage-engine on every property change
          engine.updateUniforms(targetElement, initialUniforms);
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

  init(root?: HTMLElement, config?: MirageConfig) {
    this.rootElement = root || document.body;

    // Scan DOM for a2kama attributes
    const elements = this.rootElement.querySelectorAll("[data-a2kama]");

    elements.forEach((el) => {
      const recipeName = el.getAttribute("data-a2kama");
      if (recipeName && this.recipes.has(recipeName)) {
        const recipe = this.recipes.get(recipeName)!;

        if (el instanceof HTMLElement) {
          // Apply mirage attributes required by the engine for travelers
          // el.dataset.mirageTravel = "traveler";
          // el.dataset.mirageFilter = "exclude-self";
          el.dataset.mirageDom = "hide";

          // Inject the generated shader from the recipe
          el.dataset.mirageShader = JSON.stringify(recipe.shader);
          if (recipe.optionMap) {
            el.dataset.a2kamaMap = JSON.stringify(recipe.optionMap);
          }
        }
      } else {
        console.warn(
          `a2kama: Recipe '${recipeName}' not found for element`,
          el,
        );
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
    this.mirageInstance.start();
  }

  dispose(element: HTMLElement) {
    if (this.mirageInstance) {
      // Clean up the element from mirage engine
      // Currently mirage-engine may not expose a specific single element destroy,
      // but we remove the attributes and if mirage tracks mutations, it may handle it.
      // At a minimum, we clear its shader data.
      delete element.dataset.mirageTravel;
      delete element.dataset.mirageFilter;
      delete element.dataset.mirageDom;
      delete element.dataset.mirageShader;
    }
  }

  // Expose the raw instance for advanced usage
  get engine(): Mirage | null {
    return this.mirageInstance;
  }
}

const a2kama = new A2kama();
export default a2kama;
export * from "./types";
