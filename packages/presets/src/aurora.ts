import type { Recipe } from "a2kama";
import { fbm, pxToUv } from "./glsl";

export interface AuroraOptions {
  /**
   * Animation speed multiplier. 0 freezes the curtains.
   * @default 2
   * @range [0, 4]
   */
  speed?: number;

  /**
   * Brightness of the aurora over the background.
   * @default 0.8
   * @range [0, 2]
   */
  intensity?: number;

  /**
   * Size of the curtain pattern, in pixels.
   * @default 240
   * @range [40, 600]
   */
  scale?: number;

  /**
   * Sideways warp of the background, in pixels.
   * @default 6
   * @range [0, 30]
   */
  warp?: number;

  /**
   * First aurora color as RGB in [0, 1].
   * @default [0.15, 1, 0.65]
   */
  colorA?: [number, number, number];

  /**
   * Second aurora color as RGB in [0, 1].
   * @default [0.55, 0.35, 1]
   */
  colorB?: [number, number, number];
}

export const a2kAurora = {
  normal(options: AuroraOptions = {}): Recipe {
    const {
      speed = 2,
      intensity = 0.8,
      scale = 240,
      warp = 6,
      colorA = [0.15, 1, 0.65],
      colorB = [0.55, 0.35, 1],
    } = options;

    return {
      shader: {
        uniforms: {
          uAuroraTime: 0,
          uAuroraSpeed: speed,
          uAuroraIntensity: intensity,
          uAuroraScale: scale,
          uAuroraWarp: warp,
          uAuroraColorA: [...colorA],
          uAuroraColorB: [...colorB],
        },
        uvModifier: /* glsl */ `
          ${pxToUv("auroraPxToUv")}

          float auroraT = uAuroraTime;
          vec2 auroraP = p / max(uAuroraScale, 1.0);
          ${fbm("auroraWarpNoise", "auroraP * 1.5 + vec2(auroraT * 0.05, -auroraT * 0.03)")}
          resultUv = screenUv + vec2(auroraWarpNoise - 0.5, 0.0) * 2.0 * uAuroraWarp * auroraPxToUv;
        `,
        colorModifier: /* glsl */ `
          ${fbm("auroraField", "vec2(auroraP.x * 1.2 + auroraWarpNoise * 1.5, auroraT * 0.08)")}

          // Vertical curtains that sway sideways and fade toward the bottom
          float auroraY = p.y / max(halfSize.y, 1.0);
          float auroraCurtain = pow(0.5 + 0.5 * sin((auroraP.x + auroraField * 1.8 + auroraT * 0.06) * 9.0), 3.0);
          float auroraFade = smoothstep(-1.0, 0.7, auroraY);

          vec3 auroraColor = mix(uAuroraColorA, uAuroraColorB, clamp(auroraField * 1.4 - 0.2 + auroraY * 0.3, 0.0, 1.0));
          float auroraAmount = auroraCurtain * auroraFade * clamp(uAuroraIntensity, 0.0, 2.0);
          vec3 auroraOut = finalColor.rgb * (1.0 - 0.35 * clamp(uAuroraIntensity, 0.0, 1.0)) + auroraColor * auroraAmount;

          finalColor.rgb = mix(finalColor.rgb, min(auroraOut, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uAuroraSpeed",
        intensity: "uAuroraIntensity",
        scale: "uAuroraScale",
        warp: "uAuroraWarp",
        colorA: "uAuroraColorA",
        colorB: "uAuroraColorB",
      },
      time: { uniform: "uAuroraTime", speed: "uAuroraSpeed" },
    };
  },
};
