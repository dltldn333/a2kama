---
"a2kama": minor
"@a2kama/presets": minor
---

Rewrite the water preset as an animated, uniform-driven shader (`amplitude`, `wavelength`, `direction`, `turbulence`, `edgeSoftness`, `tint`, `highlight`, ...) and let recipes declare a `time` uniform that a2kama advances every frame. Harden the glass shader against division by zero and NaN at the element center.
