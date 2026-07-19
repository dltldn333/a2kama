import a2kama from "a2kama";

// Import a2kama separated configs
import "./a2kama/base.js";
import "./a2kama/layout.js";
import "./a2kama/glass.js";
import "./a2kama/dock.js";
import "./a2kama/lock.js";

// We now export the initialized function to be called after Lenis in main.js
window.initA2kama = function() {
  const rootNode = document.querySelector("#root");
  a2kama.init(rootNode, { quality: "medium", layer: "selected" });
};
