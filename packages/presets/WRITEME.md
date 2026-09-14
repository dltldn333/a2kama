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

`a2kWater.normal(options)` renders an animated water surface. Several directional waves are layered in element space, their slopes refract the background, and slopes facing the light glint. a2kama advances the `uWaterTime` uniform every frame, so no animation loop is needed.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `2.0` | 0 – 4 | Animation speed multiplier. `0` freezes the surface. |
| `amplitude` | `8` | 0 – 40 | Maximum refraction offset in pixels. |
| `wavelength` | `90` | 10 – 400 | Length of the primary wave in pixels. |
| `direction` | `30` | 0 – 360 | Travel direction of the primary wave in degrees (0 = right, 90 = up). |
| `turbulence` | `0.6` | 0 – 1 | Weight of the secondary waves. `0` gives clean parallel waves. |
| `edgeSoftness` | `16` | 0 – 100 | Distance from the edge, in pixels, over which the distortion fades in. |
| `highlight` | `0.5` | 0 – 2 | Strength of the glints on slopes facing the light. |
| `lightDirection` | `45` | 0 – 360 | Angle of the light source in degrees. |
| `tint` | `[0.36, 0.66, 0.85]` | 0 – 1 each | Water color as RGB. |
| `tintStrength` | `0.18` | 0 – 1 | How much of the tint is mixed into the background. |

`intensity` is still accepted as a deprecated alias of `amplitude`.

## Interactive presets

`a2kJelly` and `a2kRipple` stay still until they are poked. Pass the element's options and a pointer position to `trigger()`:

```javascript
const card = document.querySelector(".widget");
const options = a2kama.getOptions(card);

card.addEventListener("click", (event) => {
  a2kRipple.trigger(options, card, event.clientX, event.clientY);
});
```

### a2kJelly

A tinted gel that wobbles out from the point where it is poked, then settles.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `2` | 0 – 4 | Speed of the wobble after a poke. |
| `wobble` | `10` | 0 – 40 | Wobble displacement in pixels. |
| `duration` | `1.6` | 0.2 – 4 | Seconds until the wobble settles, at speed 1. |
| `softness` | `36` | 1 – 120 | Width of the soft, bulging rim in pixels. |
| `refraction` | `18` | 0 – 80 | Lens pull at the rim in pixels. |
| `gloss` | `0.8` | 0 – 2 | Glossy highlight strength. |
| `tintStrength` | `0.45` | 0 – 1 | How strongly the jelly color fills the body. |
| `tint` | `[1, 0.42, 0.68]` | 0 – 1 each | Jelly color as RGB. |

### a2kRipple

Rings that spread from each click point.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `480` | 0 – 1200 | How fast the rings travel, in pixels per second. |
| `amplitude` | `10` | 0 – 40 | Maximum refraction offset in pixels. |
| `wavelength` | `36` | 8 – 160 | Distance between rings in pixels. |
| `duration` | `1.6` | 0.2 – 5 | Seconds until a ripple fades out. |
| `autoInterval` | `0` | 0 – 8 | Seconds between automatic ripples from the center. `0` turns them off. |
| `highlight` | `0.35` | 0 – 2 | Brightness of the ring crests. |

## More presets

All animated presets advance their own time uniform through a2kama; `speed` scales it.

### a2kPrism

A row of prism facets that bend and split the background into color.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `facetSize` | `10` | 2 – 200 | Width of each facet in pixels. |
| `angle` | `35` | 0 – 360 | Direction across the facets in degrees. |
| `refraction` | `10` | 0 – 40 | How far each facet bends the background, in pixels. |
| `dispersion` | `6` | 0 – 30 | RGB split between channels in pixels. |
| `rainbow` | `0.3` | 0 – 1 | Strength of the rainbow sheen. |

### a2kAurora

Swaying aurora curtains over the background.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `2` | 0 – 4 | Animation speed multiplier. |
| `intensity` | `0.8` | 0 – 2 | Brightness of the aurora. |
| `scale` | `240` | 40 – 600 | Size of the curtain pattern in pixels. |
| `warp` | `6` | 0 – 30 | Sideways warp of the background in pixels. |
| `colorA` | `[0.15, 1, 0.65]` | 0 – 1 each | First aurora color as RGB. |
| `colorB` | `[0.55, 0.35, 1]` | 0 – 1 each | Second aurora color as RGB. |

### a2kBloom

Bright parts of the background glow.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `threshold` | `0.55` | 0 – 0.95 | Brightness above which the background glows. |
| `radius` | `22` | 0 – 60 | Glow radius in pixels. |
| `intensity` | `1.2` | 0 – 4 | Glow strength. |
| `tint` | `[1, 0.95, 0.9]` | 0 – 1 each | Glow color as RGB. |

### a2kHeatHaze

Rising air that shimmers the background.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `2` | 0 – 4 | Animation speed multiplier. |
| `amplitude` | `5` | 0 – 30 | Shimmer displacement in pixels. |
| `scale` | `48` | 10 – 200 | Size of the air pockets in pixels. |
| `tintStrength` | `0.1` | 0 – 1 | How strongly the warm tint colors the background. |
| `tint` | `[1, 0.85, 0.7]` | 0 – 1 each | Warm tint as RGB. |

### a2kSmoke

Curling smoke drifting over the background.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `1.2` | 0 – 4 | Animation speed multiplier. |
| `density` | `0.65` | 0 – 1 | How much the smoke covers the background. |
| `scale` | `170` | 40 – 500 | Size of the wisps in pixels. |
| `distortion` | `5` | 0 – 30 | Swirl displacement in pixels. |
| `color` | `[0.92, 0.93, 0.96]` | 0 – 1 each | Smoke color as RGB. |

### a2kOil

An iridescent oil film swirling over a darkened background.

| Option | Default | Range | Description |
| :----- | :------ | :---- | :---------- |
| `speed` | `0.8` | 0 – 4 | Animation speed multiplier. |
| `intensity` | `0.65` | 0 – 1 | Strength of the film colors. |
| `scale` | `190` | 40 – 500 | Size of the swirls in pixels. |
| `refraction` | `7` | 0 – 30 | Swirl displacement in pixels. |
| `darkness` | `0.3` | 0 – 1 | How much the background is darkened. |
| `bands` | `1` | 0.2 – 4 | Density of the color bands. |

::BASE
