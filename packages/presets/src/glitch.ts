import type { Recipe } from "a2kama";
import { hash, pxToUv } from "./glsl";

export interface GlitchOptions {
  /**
   * How often the glitch pattern changes. 0 freezes it.
   * @default 2
   * @range [0, 4]
   */
  speed?: number;

  /**
   * Share of rows that glitch, and how hard.
   * @default 0.6
   * @range [0, 1]
   */
  intensity?: number;

  /**
   * RGB channel split in pixels.
   * @default 6
   * @range [0, 30]
   */
  split?: number;

  /**
   * Maximum sideways shift of a glitched row, in pixels.
   * @default 28
   * @range [0, 80]
   */
  shift?: number;

  /**
   * Height of the glitched rows, in pixels.
   * @default 22
   * @range [4, 80]
   */
  blockSize?: number;

  /**
   * Darkness of the scanlines.
   * @default 0.25
   * @range [0, 1]
   */
  scanlines?: number;
}

export const a2kGlitch = {
  normal(options: GlitchOptions = {}): Recipe {
    const { speed = 2, intensity = 0.6, split = 6, shift = 28, blockSize = 22, scanlines = 0.25 } = options;

    return {
      shader: {
        uniforms: {
          uGlitchTime: 0,
          uGlitchSpeed: speed,
          uGlitchIntensity: intensity,
          uGlitchSplit: split,
          uGlitchShift: shift,
          uGlitchBlockSize: blockSize,
          uGlitchScanlines: scanlines,
        },
        uvModifier: /* glsl */ `
          ${pxToUv("glitchPxToUv")}

          // The pattern jumps 12 times per (speed-scaled) second
          float glitchStep = floor(uGlitchTime * 12.0);
          float glitchRow = floor(p.y / max(uGlitchBlockSize, 1.0));
          float glitchIntensity = clamp(uGlitchIntensity, 0.0, 1.0);

          float glitchActive = step(1.0 - glitchIntensity * 0.45, ${hash("vec2(glitchRow, glitchStep)")});
          float glitchShift = (${hash("vec2(glitchRow + 13.0, glitchStep)")} - 0.5) * 2.0 * uGlitchShift * glitchActive;

          // Occasional jolt of the whole element
          float glitchJolt = step(0.93, ${hash("vec2(glitchStep, 7.0)")}) * glitchIntensity;
          resultUv = screenUv + vec2(glitchShift + glitchJolt * uGlitchShift * 0.5, 0.0) * glitchPxToUv;
        `,
        colorModifier: /* glsl */ `
          vec2 glitchSplit = vec2(uGlitchSplit * (0.35 + glitchActive + glitchJolt), 0.0) * glitchPxToUv;
          vec3 glitchRgb = vec3(
            texture2D(uTexture, resultUv + glitchSplit).r,
            texture2D(uTexture, resultUv).g,
            texture2D(uTexture, resultUv - glitchSplit).b
          );

          float glitchScan = 1.0 - uGlitchScanlines * (0.5 + 0.5 * sin(p.y * 3.14159265));
          float glitchNoise = ${hash("floor(p / 4.0) + vec2(glitchStep)")} * glitchActive * 0.25 * glitchIntensity;

          finalColor.rgb = mix(finalColor.rgb, min(glitchRgb * glitchScan + vec3(glitchNoise), vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uGlitchSpeed",
        intensity: "uGlitchIntensity",
        split: "uGlitchSplit",
        shift: "uGlitchShift",
        blockSize: "uGlitchBlockSize",
        scanlines: "uGlitchScanlines",
      },
      time: { uniform: "uGlitchTime", speed: "uGlitchSpeed" },
    };
  },
};
