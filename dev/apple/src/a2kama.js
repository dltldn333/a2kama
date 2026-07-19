import a2kama from "a2kama";

// Import a2kama separated configs
import "./a2kama/base.js";
import "./a2kama/layout.js";
import "./a2kama/glass.js";
import "./a2kama/dock.js";
import "./a2kama/lock.js";

// Initialize a2kama with quality scaling to fix mirage-engine performance
const rootNode = document.querySelector("#root");
a2kama.init(rootNode, { quality: "medium", layer: "selected" });
