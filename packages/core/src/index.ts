import { Mirage, MirageConfig } from "mirage-engine";
import { Recipe } from "./types";

class A2kama {
  private recipes: Map<string, Recipe> = new Map();
  private mirageInstance: Mirage | null = null;
  private rootElement: HTMLElement | null = null;

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
          el.dataset.mirageTravel = "traveler";
          // el.dataset.mirageFilter = "exclude-self";
          // el.dataset.mirageDom = "hide";

          // Inject the generated shader from the recipe
          el.dataset.mirageShader = JSON.stringify(recipe.shader);
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
      quality: "high",
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
