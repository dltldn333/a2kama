import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";



// Fix mirage-engine scroll sync by overriding window.scrollY to match Lenis showcase wrapper
const showcase = document.querySelector(".showcase");
if (showcase) {
  Object.defineProperty(window, "scrollY", {
    get() {
      return showcase.scrollTop;
    },
  });

  // Also override scrollX just in case
  Object.defineProperty(window, "scrollX", {
    get() {
      return showcase.scrollLeft;
    },
  });
}

const glassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 0.6,
  lightSymmetry: 1,
  refraction: 50,
  depth: 20,
  dispersion: 0,
  frost: 20,
  bevelWidth: 15,
  bevelCurve: 2.5,
  zoom: 1.0,
  splay: 10,
});

a2kama.register("myGlass", glassRecipe);

// Initialize a2kama with quality scaling to fix mirage-engine performance

const rootNode = document.querySelector("#root");
a2kama.init(rootNode, { quality: "medium",  layer:"selected"});