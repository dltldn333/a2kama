import type { Recipe } from "a2kama";
import { fbm, pxToUv } from "./glsl";

export interface OilOptions {
  /**
   * Animation speed multiplier. 0 freezes the swirl.
   * @default 0.8
   * @range [0, 4]
   */
  speed?: number;

  /**
   * Strength of the iridescent film.
   * @default 0.65
   * @range [0, 1]
   */
  intensity?: number;

  /**
   * Size of the swirls, in pixels.
   * @default 190
   * @range [40, 500]
   */
  scale?: number;

  /**
   * Swirl displacement of the background, in pixels.
   * @default 7
   * @range [0, 30]
   */
  refraction?: number;

  /**
   * How much the background is darkened under the film.
   * @default 0.3
   * @range [0, 1]
   */
  darkness?: number;

  /**
   * Density of the color bands.
   * @default 1
   * @range [0.2, 4]
   */
  bands?: number;
}

export const a2kOil = {
  normal(options: OilOptions = {}): Recipe {
    const { speed = 0.8, intensity = 0.65, scale = 190, refraction = 7, darkness = 0.3, bands = 1 } = options;

    return {
      shader: {
        uniforms: {
          uOilTime: 0,
          uOilSpeed: speed,
          uOilIntensity: intensity,
          uOilScale: scale,
          uOilRefraction: refraction,
          uOilDarkness: darkness,
          uOilBands: bands,
        },
        uvModifier: /* glsl */ `
          ${pxToUv("oilPxToUv")}

          float oilT = uOilTime;
          vec2 oilP = p / max(uOilScale, 1.0);
          ${fbm("oilWarpA", "oilP + vec2(oilT * 0.06, -oilT * 0.04)")}
          ${fbm("oilWarpB", "oilP * 1.3 + vec2(3.7 - oilT * 0.05, 8.1 + oilT * 0.03)")}
          ${fbm("oilThickness", "oilP + vec2(oilWarpA, oilWarpB) * 1.8")}
          resultUv = screenUv + (vec2(oilWarpA, oilWarpB) - 0.5) * 2.0 * uOilRefraction * oilPxToUv;
        `,
        colorModifier: /* glsl */ `
          // Thin-film interference: the color cycles with film thickness
          float oilPhase = oilThickness * 3.0 * uOilBands + oilT * 0.05;
          vec3 oilFilm = 0.5 + 0.5 * cos(6.28318530 * (oilPhase + vec3(0.0, 0.33, 0.67)));

          vec3 oilBase = finalColor.rgb * (1.0 - clamp(uOilDarkness, 0.0, 1.0));
          vec3 oilColor = mix(oilBase, oilBase + oilFilm * 0.6, clamp(uOilIntensity, 0.0, 1.0));
          finalColor.rgb = mix(finalColor.rgb, min(oilColor, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uOilSpeed",
        intensity: "uOilIntensity",
        scale: "uOilScale",
        refraction: "uOilRefraction",
        darkness: "uOilDarkness",
        bands: "uOilBands",
      },
      time: { uniform: "uOilTime", speed: "uOilSpeed" },
    };
  },
};
