import type { Recipe } from "a2kama";
import { fbm, pxToUv } from "./glsl";

export interface SmokeOptions {
  /**
   * Animation speed multiplier. 0 freezes the smoke.
   * @default 1.2
   * @range [0, 4]
   */
  speed?: number;

  /**
   * How much the smoke covers the background.
   * @default 0.65
   * @range [0, 1]
   */
  density?: number;

  /**
   * Size of the smoke wisps, in pixels.
   * @default 170
   * @range [40, 500]
   */
  scale?: number;

  /**
   * Swirl displacement of the background, in pixels.
   * @default 5
   * @range [0, 30]
   */
  distortion?: number;

  /**
   * Smoke color as RGB in [0, 1].
   * @default [0.92, 0.93, 0.96]
   */
  color?: [number, number, number];
}

export const a2kSmoke = {
  normal(options: SmokeOptions = {}): Recipe {
    const { speed = 1.2, density = 0.65, scale = 170, distortion = 5, color = [0.92, 0.93, 0.96] } = options;

    return {
      shader: {
        uniforms: {
          uSmokeTime: 0,
          uSmokeSpeed: speed,
          uSmokeDensity: density,
          uSmokeScale: scale,
          uSmokeDistortion: distortion,
          uSmokeColor: [...color],
        },
        uvModifier: /* glsl */ `
          ${pxToUv("smokePxToUv")}

          float smokeT = uSmokeTime;
          vec2 smokeP = p / max(uSmokeScale, 1.0);

          // Domain warping: noise displaced by noise gives curling wisps
          ${fbm("smokeWarpA", "smokeP + vec2(smokeT * 0.07, smokeT * 0.11)")}
          ${fbm("smokeWarpB", "smokeP + vec2(5.2 - smokeT * 0.05, 1.3 + smokeT * 0.09)")}
          vec2 smokeWarp = vec2(smokeWarpA, smokeWarpB);
          resultUv = screenUv + (smokeWarp - 0.5) * 2.0 * uSmokeDistortion * smokePxToUv;
        `,
        colorModifier: /* glsl */ `
          ${fbm("smokeField", "smokeP * 1.3 + smokeWarp * 2.2 + vec2(0.0, smokeT * 0.15)")}
          float smokeAmount = smoothstep(0.35, 0.85, smokeField) * clamp(uSmokeDensity, 0.0, 1.0);
          finalColor.rgb = mix(finalColor.rgb, uSmokeColor, smokeAmount * bgMask);
        `,
      },
      optionMap: {
        speed: "uSmokeSpeed",
        density: "uSmokeDensity",
        scale: "uSmokeScale",
        distortion: "uSmokeDistortion",
        color: "uSmokeColor",
      },
      time: { uniform: "uSmokeTime", speed: "uSmokeSpeed" },
    };
  },
};
