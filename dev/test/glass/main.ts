import a2kama from "a2kama";
import { a2kGlass, a2kWater } from "a2kama/presets";
import gsap from "gsap";

console.log("a2kama imported:", a2kama);

// 1. Create recipes
const glassRecipe = a2kGlass.normal({
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

const waterRecipe = a2kWater.normal({
  speed: 1.5,
  intensity: 0.8,
});

// 2. Register recipes
a2kama.register("myGlass", glassRecipe);
a2kama.register("myWater", waterRecipe);

// 3. Initialize on the root element
const rootEl = document.getElementById("root");
if (rootEl) {
  a2kama.init(rootEl);
}

// ----------------------------------------------------
// UI Logic for Glass Options
// ----------------------------------------------------
const glassBoxes = document.querySelectorAll(".box[data-a2kama='myGlass']");
const targetGlass = glassBoxes[0] as HTMLElement;

if (targetGlass) {
  // Get the reactive Proxy object for this element
  const options = a2kama.getOptions(targetGlass);

  if (options) {
    const inputs = document.querySelectorAll<HTMLInputElement>("#controls input[type='range']");
    
    inputs.forEach((input) => {
      const valSpan = document.getElementById(`val-${input.id}`);
      
      // Initialize UI with current option values
      if (options[input.id] !== undefined) {
        input.value = options[input.id];
        if (valSpan) valSpan.innerText = Number(options[input.id]).toFixed(2);
      }

      input.addEventListener("input", (e) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        if (valSpan) valSpan.innerText = val.toFixed(2);

        // Animate the option changes smoothly with GSAP
        // Modifying the `options` proxy automatically triggers engine updates
        gsap.to(options, {
          [input.id]: val,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }
}

// ----------------------------------------------------
// Dynamic DOM destruction testing
// ----------------------------------------------------
const tempBtn = document.getElementById("temp-btn");
if (tempBtn) {
  tempBtn.addEventListener("click", () => {
    console.log("Disposing temporary button");
    a2kama.dispose(tempBtn);
    tempBtn.remove();
  });
}
