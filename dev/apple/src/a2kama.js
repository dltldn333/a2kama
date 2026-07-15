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

//   // Dispatch window scroll event when showcase scrolls so mirage-engine updates the camera
  showcase.addEventListener("scroll", () => {
    window.dispatchEvent(new Event("scroll"));
  });
}

const glassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 0,
  lightSymmetry: 1,
  refraction: 100,
  depth: 30,
  dispersion: 0,
  frost: 0,
  bevelWidth: 20,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 30,
});

a2kama.register("myGlass", glassRecipe);

// Initialize a2kama with quality scaling to fix mirage-engine performance

const rootNode = document.querySelector("#root");
a2kama.init(rootNode, { quality: "medium",  layer:"selected"});