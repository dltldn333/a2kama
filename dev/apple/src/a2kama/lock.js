import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";

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
