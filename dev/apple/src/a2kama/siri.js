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

window.updateSiriCircleAnimation = function (progress) {
  if (!siriCircle || !window.gsap) return;
  const siriDist = Math.abs(progress - 1.0);
  const shouldBeVisible = siriDist < 0.2; // Show within 20% distance

  if (shouldBeVisible && !siriCircle.classList.contains("is-visible")) {
    siriCircle.classList.add("is-visible");
    window.gsap.killTweensOf(siriCircle);
    // Set initial hidden state then animate in with delay
    window.gsap.set(siriCircle, { width: "300px", height: 0, opacity: 0 });
    window.gsap.to(siriCircle, {
      height: 200,
      opacity: 1,
      duration: 1.0,
      delay: 0.35, // 살짝 기다렸다가
      ease: "elastic.out(1, 0.65)", // 좀 더 다이나믹하게
    });
  } else if (!shouldBeVisible && siriCircle.classList.contains("is-visible")) {
    siriCircle.classList.remove("is-visible");
    window.gsap.killTweensOf(siriCircle);
    // Animate out quickly
    window.gsap.to(siriCircle, {
      height: 0,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
    });
  }
};

// --- Add interaction logic for Siri buttons ---
const siriBtns = document.querySelectorAll(".siri-btn");
if (siriBtns.length > 0 && siriCircle) {
  siriBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 1. Update active class
      siriBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 2. Animate Siri Circle based on button text
      const state = btn.textContent.trim().toLowerCase();

      if (window.gsap) {
        window.gsap.killTweensOf(siriCircle);

        let targetProps = {
          duration: 0.6,
          ease: "power3.out",
        };

        const fullGradient =
          "linear-gradient(rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)";

        switch (state) {
          case "default":
            targetProps.width = 300;
            targetProps.height = 200;
            targetProps.opacity = 1;
            targetProps.borderRadius = 100;
            targetProps.ease = "elastic.out(1, 0.65)";
            targetProps.duration = 1.0;
            break;
          case "thinking":
            targetProps.width = 400;
            targetProps.height = 100;
            targetProps.borderRadius = 100;
            // targetProps.background = fullGradient;
            targetProps.opacity = 1;
            break;
          case "text":
            targetProps.width = "90% ";
            targetProps.height = 200;
            targetProps.borderRadius = 40;
            targetProps.opacity = 1;
            break;
          case "contents":
            targetProps.width = "90% ";
            targetProps.height = "80%";
            targetProps.borderRadius = 40;
            targetProps.opacity = 1;
            targetProps.duration = 0.8;
            break;
          case "off":
            targetProps.height = 0;
            targetProps.opacity = 0;
            targetProps.duration = 0.35;
            targetProps.ease = "power2.in";
            break;
        }

        window.gsap.to(siriCircle, targetProps);
      }
    });
  });
}
