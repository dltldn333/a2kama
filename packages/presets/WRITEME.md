::header{pkg="@a2kama/presets"}

# @a2kama/presets

> **Ready-made shader recipes for [a2kama](https://www.npmjs.com/package/a2kama).**

Each preset returns a recipe that you register with `a2kama.register()`. The same presets are also re-exported from `a2kama/presets`.

## Usage

```javascript
import a2kama from "a2kama";
import { a2kGlass } from "@a2kama/presets";

a2kama.register("myGlass", a2kGlass.normal({ refraction: 150, depth: 30 }));
a2kama.init();
```

Options can be changed after `init()`. Assignments are applied to the shader immediately.

```javascript
const options = a2kama.getOptions(".glass-card");
options.refraction = 200;
```

## a2kGlass

`a2kGlass.normal(options)` renders refractive glass with a beveled edge and specular highlights.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `lightDirection` | `45` | 0 – 360 | Angle of the main light source in degrees. |
| `lightIntensity` | `0.6` | 0 – 2 | Intensity multiplier for the specular highlights. |
| `lightSymmetry` | `1.0` | 0 – 1 | Light reflection symmetry (0 single-sided, 1 mirrored). |
| `refraction` | `100` | 0 – 300 | Base strength of background refraction. |
| `depth` | `40` | 0 – 200 | Apparent thickness of the glass in pixels. |
| `dispersion` | `0` | 0 – 200 | Chromatic aberration. Heavy on performance when > 0. |
| `frost` | `0` | 0 – 100 | Blur radius for frosted glass. Heavy on performance when > 0. |
| `splay` | `0` | 0 – 200 | Tangential distortion that pulls the background towards the corners. |
| `zoom` | `1.0` | 0.1 – 5 | Scale of the background inside the glass. |
| `bevelWidth` | `depth / 2` | 0 – depth | Width of the outer beveled edge in pixels. |
| `bevelCurve` | `3.0` | 0.1 – 10 | Sharpness of the beveled edge. |

## a2kWater

`a2kWater.normal(options)` is an experimental placeholder: a static sine ripple with a blue tint.

| Option | Default | Description |
| :----- | :------ | :---------- |
| `intensity` | `0.5` | Ripple strength. |
| `speed` | `1.0` | Reserved; not used yet. |

::BASE
