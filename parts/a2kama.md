# a2kama

A lightweight styling library that applies WebGL-based distortion shader effects (like glass refraction) to HTML DOM elements. Built to work seamlessly with `mirage-engine`.

**Demo:** [https://glasslab.netlify.app](https://glasslab.netlify.app)

## Installation

```bash
npm install a2kama @a2kama/presets
```

*(`mirage-engine` and `three` are installed automatically as dependencies.)*

## Usage

Apply the shader effect by adding the `data-a2kama` attribute to your HTML elements.

```html
<div data-a2kama="myGlass" class="glass-card">
  <!-- Content goes here -->
</div>
```

Define a recipe using the provided presets and register it to the engine.

```javascript
import a2kama from "a2kama";
import { a2kGlass } from "@a2kama/presets";

// Create a shader recipe
const glassRecipe = a2kGlass.normal({ 
  refraction: 150, 
  depth: 30 
});

// Register the recipe
a2kama.register("myGlass", glassRecipe);

// Initialize the engine
a2kama.init();
```

## Removing Elements

When dynamically removing an element from the DOM, call `dispose()` first. It removes the a2kama shader attributes from the element so the engine stops rendering it.

```javascript
const element = document.querySelector('.glass-card');

// Detach the shader from the element before removing it from the DOM
a2kama.dispose(element);
element.remove();
```
