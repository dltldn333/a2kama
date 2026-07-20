import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";

const siriGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 1.0,
  lightSymmetry: 1,
  refraction: 200,
  depth: 50,
  dispersion: 0,
  frost: 0,
  bevelWidth: 10,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 100,
});

a2kama.register("siriGlass", siriGlassRecipe);

const siriCircle = document.querySelector(".siri-circle");

siriCircle.dataset.mirageTravel = `traveler 4`;
siriCircle.dataset.a2kama = "siriGlass";
siriCircle.dataset.mirageSelect = "include-self";