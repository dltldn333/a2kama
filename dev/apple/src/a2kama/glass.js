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
const dummyDockGlassRecipe = a2kGlass.normal({
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
a2kama.register("dummyDockGlass", dummyDockGlassRecipe);

const sliderThumb = document.querySelector(".slider-thumb");

sliderThumb.dataset.mirageTravel = `traveler 2`;
sliderThumb.dataset.a2kama = "thumbGlass";
sliderThumb.dataset.mirageSelect = "include-self";

const glassDockDummy = document.querySelector(".glass-dock-dummy");

glassDockDummy.dataset.mirageTravel = `traveler 2`;
glassDockDummy.dataset.a2kama = "dummyDockGlass";
glassDockDummy.dataset.mirageSelect = "include-tree";

// ─── glass-dock-dummy bg alpha control via glass-opacity slider ──────────────
// Slider writes --glass-alpha (-1 ~ 1) onto [data-glass-scene].
// Map → rgba background alpha: 0.2 ~ 0.8, default 0.5 (slider center = 0)
(function initDummyBgAlphaControl() {
  const glassScene = document.querySelector("[data-glass-scene]");
  if (!glassScene || !glassDockDummy) return;

  // getOptions는 a2kama.init() 이후에만 유효 → lazy하게 캐싱
  let dockGlassOptions = null;

  const applyAlpha = () => {
    const raw = parseFloat(
      getComputedStyle(glassScene).getPropertyValue("--glass-alpha") || "0",
    );
    // raw: -1 ~ 1  →  alpha: 0.2 ~ 0.8  (center 0 → 0.5)
    const alpha = 0.5 + raw * 0.3;

    gsap.to(glassDockDummy, {
      backgroundColor: `rgba(255, 255, 255, ${alpha})`,
      duration: 0.2,
      ease: "power2.out",
      overwrite: true,
    });

    // 엔진 init 이후 최초 1회만 가져오고 이후 캐싱
    if (!dockGlassOptions) {
      dockGlassOptions = a2kama.getOptions(glassDockDummy);
    }
    if (dockGlassOptions) {
      console.log(dockGlassOptions)
      dockGlassOptions.frost = alpha * 25;
    }
  };

  const observer = new MutationObserver(applyAlpha);
  observer.observe(glassScene, {
    attributes: true,
    attributeFilter: ["style"],
  });

  applyAlpha();
})();
