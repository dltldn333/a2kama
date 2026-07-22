import a2kama from "a2kama";

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

  // Dispatch window scroll event when showcase scrolls so mirage-engine updates the camera
  showcase.addEventListener("scroll", () => {
    window.dispatchEvent(new Event("scroll"));
  });
}

window.a2kama = a2kama;
