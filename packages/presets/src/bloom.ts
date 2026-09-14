import type { Recipe } from "a2kama";
import { pxToUv } from "./glsl";

export interface BloomOptions {
  /**
   * Brightness above which the background starts to glow.
   * @default 0.55
   * @range [0, 0.95]
   */
  threshold?: number;

  /**
   * Glow radius in pixels.
   * @default 22
   * @range [0, 60]
   */
  radius?: number;

  /**
   * Glow strength.
   * @default 1.2
   * @range [0, 4]
   */
  intensity?: number;

  /**
   * Glow color as RGB in [0, 1].
   * @default [1, 0.95, 0.9]
   */
  tint?: [number, number, number];
}

export const a2kBloom = {
  normal(options: BloomOptions = {}): Recipe {
    const { threshold = 0.55, radius = 22, intensity = 1.2, tint = [1, 0.95, 0.9] } = options;

    return {
      shader: {
        uniforms: {
          uBloomThreshold: threshold,
          uBloomRadius: radius,
          uBloomIntensity: intensity,
          uBloomTint: [...tint],
        },
        colorModifier: /* glsl */ `
          ${pxToUv("bloomPxToUv")}

          float bloomThreshold = clamp(uBloomThreshold, 0.0, 0.95);
          vec3 bloomSum = vec3(0.0);
          float bloomWeight = 0.0;

          // Golden-angle spiral of samples; only bright ones contribute
          for (int bloomI = 0; bloomI < 24; bloomI++) {
            float bloomF = float(bloomI);
            float bloomR = sqrt((bloomF + 0.5) / 24.0);
            float bloomA = bloomF * 2.39996323;
            vec2 bloomOffset = vec2(cos(bloomA), sin(bloomA)) * bloomR * uBloomRadius;
            vec3 bloomSample = texture2D(uTexture, resultUv + bloomOffset * bloomPxToUv).rgb;
            float bloomLum = dot(bloomSample, vec3(0.299, 0.587, 0.114));
            float bloomKnee = smoothstep(bloomThreshold, min(bloomThreshold + 0.25, 1.0), bloomLum);
            float bloomW = 1.0 - bloomR * 0.6;
            bloomSum += bloomSample * bloomKnee * bloomW;
            bloomWeight += bloomW;
          }

          vec3 bloomGlow = bloomSum / bloomWeight * uBloomTint * uBloomIntensity;
          finalColor.rgb = mix(finalColor.rgb, min(finalColor.rgb + bloomGlow, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        threshold: "uBloomThreshold",
        radius: "uBloomRadius",
        intensity: "uBloomIntensity",
        tint: "uBloomTint",
      },
    };
  },
};
