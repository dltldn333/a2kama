import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";

const thumbGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 0.6,
  lightSymmetry: 1,
  refraction: 100,
  depth: 30,
  dispersion: 0,
  frost: 0,
  bevelWidth: 10,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 100,
});

a2kama.register("thumbGlass", thumbGlassRecipe);

const sliderThumb = document.querySelector(".slider-thumb");

sliderThumb.dataset.mirageTravel = `traveler 2`;
sliderThumb.dataset.a2kama = "thumbGlass";
sliderThumb.dataset.mirageSelect = "include-self";
