import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";

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

a2kama.register("dockGlass", dockGlassRecipe);
a2kama.register("dockBtnGlass", dockBtnGlassRecipe);

// dock control
const dock = document.querySelector(".bottom-dock");
const dockStyleOn4 = { transform: "scaleY(0.9)" };
if (dock) {
  dock.dataset.mirageTravel += ` native 4 ${JSON.stringify(dockStyleOn4)}`;
}

const dockBtns = document.querySelectorAll(".dock-buttons-group button svg");
const dockBtnsText = document.querySelectorAll(".dock-buttons-group button small");
const highlightStyleOn4 = { color: "#3641d6" };
for (let i = 0; i < dockBtns.length; i++) {
  const dockBtn = dockBtns[i];
  const dockBtnText = dockBtnsText[i];
  dockBtn.dataset.mirageTravel = ` native 4 ${JSON.stringify(highlightStyleOn4)}`;
  
  if (dockBtnText) {
    dockBtnText.dataset.mirageTravel = ` native 4 ${JSON.stringify(highlightStyleOn4)}`;
  }
}
