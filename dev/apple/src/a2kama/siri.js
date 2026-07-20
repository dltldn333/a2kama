import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";

const siriGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 1.0,
  lightSymmetry: 1,
  refraction: 120,
  depth: 40,
  dispersion: 0,
  frost: 0,
  bevelWidth: 10,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 50,
});

a2kama.register("siriGlass", siriGlassRecipe);

const siriCircle = document.querySelector(".siri-circle");

siriCircle.dataset.mirageTravel = `traveler 4`;
siriCircle.dataset.a2kama = "siriGlass";
siriCircle.dataset.mirageSelect = "include-self";

window.updateSiriCircleAnimation = function(progress) {
  if (!siriCircle || !window.gsap) return;
  const siriDist = Math.abs(progress - 1.0);
  const shouldBeVisible = siriDist < 0.2; // Show within 20% distance

  if (shouldBeVisible && !siriCircle.classList.contains("is-visible")) {
    siriCircle.classList.add("is-visible");
    window.gsap.killTweensOf(siriCircle);
    // Set initial hidden state then animate in with delay
    window.gsap.set(siriCircle, { scaleX: 1, scaleY: 0, opacity: 0 });
    window.gsap.to(siriCircle, {
      scaleY: 1,
      opacity: 1,
      duration: 1.0,
      delay: 0.35, // 살짝 기다렸다가
      ease: "elastic.out(1, 0.65)", // 좀 더 다이나믹하게
    });
  } else if (
    !shouldBeVisible &&
    siriCircle.classList.contains("is-visible")
  ) {
    siriCircle.classList.remove("is-visible");
    window.gsap.killTweensOf(siriCircle);
    // Animate out quickly
    window.gsap.to(siriCircle, {
      scaleY: 0,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
    });
  }
};