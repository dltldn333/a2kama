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

window.a2kama = a2kama;

const dockGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 0.6,
  lightSymmetry: 1,
  refraction: 50,
  depth: 120,
  dispersion: 0,
  frost: 0,
  bevelWidth: 15,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 0,
});

const dockBtnGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 0.6,
  lightSymmetry: 1,
  refraction: 20,
  depth: 120,
  dispersion: 100,
  frost: 0,
  bevelWidth: 10,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 0,
});

const lockGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 0,
  lightSymmetry: 1,
  refraction: 100,
  depth: 30,
  dispersion: 100,
  frost: 0,
  bevelWidth: 20,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 30,
});

a2kama.register("lockGlass", lockGlassRecipe);
a2kama.register("dockGlass", dockGlassRecipe);
a2kama.register("dockBtnGlass", dockBtnGlassRecipe);

// dock control

const dock = document.querySelector(".bottom-dock");
// const dockStyleOn4 = { height: "60px" };
// const dockStyleOn4 = { height: "56px", transform: "translateY(5px)" };
const dockStyleOn4 = { transform: "scaleY(0.9)" };
dock.dataset.mirageTravel += ` native 4 ${JSON.stringify(dockStyleOn4)}`;

const dockBtns = document.querySelectorAll(".dock-buttons-group button span");
const dockBtnsText = document.querySelectorAll(".dock-buttons-group button small");
// const highlightStyleOn3 = { color: "black" };
const highlightStyleOn4 = { color: "#3641d6" };
for (let i = 0; i < dockBtns.length; i++) {
  const dockBtn = dockBtns[i];
  const dockBtnText = dockBtnsText[i];
  dockBtn.dataset.mirageTravel = ` native 4 ${JSON.stringify(highlightStyleOn4)}`;
  
  if (dockBtnText) {
    dockBtnText.dataset.mirageTravel = ` native 4 ${JSON.stringify(highlightStyleOn4)}`;
  }
}

// Initialize a2kama with quality scaling to fix mirage-engine performance

const rootNode = document.querySelector("#root");
a2kama.init(rootNode, { quality: "medium", layer: "selected" });
// a2kama.init(rootNode, { quality: "medium", layer: 26 });
