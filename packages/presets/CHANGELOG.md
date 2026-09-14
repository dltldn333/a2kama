# @a2kama/presets

## 1.1.0

### Minor Changes

- 601cc5a: Add jelly, prism, aurora, bloom, ripple, heat haze, smoke and oil presets. Add `a2kama.setRecipe()` to swap an element's recipe at runtime, and make `getOptions()` reads return live uniform values.
- ccd6ed4: Rewrite the water preset as an animated, uniform-driven shader (`amplitude`, `wavelength`, `direction`, `turbulence`, `edgeSoftness`, `tint`, `highlight`, ...) and let recipes declare a `time` uniform that a2kama advances every frame. Harden the glass shader against division by zero and NaN at the element center.

### Patch Changes

- 2782f68: Publish compiled `dist` output (ESM, CJS and type declarations) instead of raw TypeScript sources.
