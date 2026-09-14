import type { Recipe } from "a2kama";
import { fbm, pxToUv } from "./glsl";

export interface HeatHazeOptions {
  /**
   * Animation speed multiplier. 0 freezes the shimmer.
   * @default 2
   * @range [0, 4]
   */
  speed?: number;

  /**
   * Shimmer displacement of the background, in pixels.
   * @default 5
   * @range [0, 30]
   */
  amplitude?: number;

  /**
   * Size of the rising air pockets, in pixels.
   * @default 48
   * @range [10, 200]
   */
  scale?: number;

  /**
   * How strongly the warm tint colors the background.
   * @default 0.1
   * @range [0, 1]
   */
  tintStrength?: number;

  /**
   * Warm tint as RGB in [0, 1].
   * @default [1, 0.85, 0.7]
   */
  tint?: [number, number, number];
}

export const a2kHeatHaze = {
  normal(options: HeatHazeOptions = {}): Recipe {
    const { speed = 2, amplitude = 5, scale = 48, tintStrength = 0.1, tint = [1, 0.85, 0.7] } = options;

    return {
      shader: {
        uniforms: {
          uHazeTime: 0,
          uHazeSpeed: speed,
          uHazeAmplitude: amplitude,
          uHazeScale: scale,
          uHazeTintStrength: tintStrength,
          uHazeTint: [...tint],
        },
        uvModifier: /* glsl */ `
          ${pxToUv("hazePxToUv")}

          float hazeT = uHazeTime;
          vec2 hazeP = p / max(uHazeScale, 1.0);

          // Noise drifting upward and stretched vertically, like rising air
          ${fbm("hazeX", "vec2(hazeP.x * 1.4, hazeP.y * 0.6 - hazeT * 1.2)")}
          ${fbm("hazeY", "vec2(hazeP.x * 1.4 + 7.3, hazeP.y * 0.6 - hazeT * 1.2 + 3.1)")}
          vec2 hazeOffset = (vec2(hazeX, hazeY) - 0.5) * 2.0 * uHazeAmplitude;

          // Stronger near the bottom, where the heat comes from
          hazeOffset *= mix(1.0, 0.45, smoothstep(-1.0, 1.0, p.y / max(halfSize.y, 1.0)));
          resultUv = screenUv + hazeOffset * hazePxToUv;
        `,
        colorModifier: /* glsl */ `
          vec3 hazeColor = mix(finalColor.rgb, finalColor.rgb * uHazeTint * 1.15, clamp(uHazeTintStrength, 0.0, 1.0));
          finalColor.rgb = mix(finalColor.rgb, min(hazeColor, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uHazeSpeed",
        amplitude: "uHazeAmplitude",
        scale: "uHazeScale",
        tintStrength: "uHazeTintStrength",
        tint: "uHazeTint",
      },
      time: { uniform: "uHazeTime", speed: "uHazeSpeed" },
    };
  },
};
