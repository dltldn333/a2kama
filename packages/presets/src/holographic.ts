import type { Recipe } from "a2kama";
import { hueToRgb, pxToUv, valueNoise } from "./glsl";

export interface HolographicOptions {
  /**
   * Animation speed multiplier. 0 freezes the color shift.
   * @default 1.2
   * @range [0, 4]
   */
  speed?: number;

  /**
   * How much of the rainbow foil covers the background.
   * @default 0.5
   * @range [0, 1]
   */
  intensity?: number;

  /**
   * Number of rainbow bands across the element.
   * @default 1.6
   * @range [0.1, 6]
   */
  bands?: number;

  /**
   * Direction of the bands and foil lines, in degrees.
   * @default 60
   * @range [0, 360]
   */
  angle?: number;

  /**
   * Amount of sparkling glints.
   * @default 0.35
   * @range [0, 1]
   */
  sparkle?: number;

  /**
   * Refraction of the foil lines, in pixels.
   * @default 3
   * @range [0, 20]
   */
  refraction?: number;
}

export const a2kHolographic = {
  normal(options: HolographicOptions = {}): Recipe {
    const { speed = 1.2, intensity = 0.5, bands = 1.6, angle = 60, sparkle = 0.35, refraction = 3 } = options;

    return {
      shader: {
        uniforms: {
          uHoloTime: 0,
          uHoloSpeed: speed,
          uHoloIntensity: intensity,
          uHoloBands: bands,
          uHoloAngle: angle,
          uHoloSparkle: sparkle,
          uHoloRefraction: refraction,
        },
        uvModifier: /* glsl */ `
          ${pxToUv("holoPxToUv")}

          float holoT = uHoloTime;
          float holoAngle = radians(uHoloAngle);
          vec2 holoDir = vec2(cos(holoAngle), sin(holoAngle));

          // Fine foil lines, one every ~25 px
          float holoRidge = sin(dot(p, holoDir) * 0.25);
          resultUv = screenUv + holoDir * holoRidge * uHoloRefraction * holoPxToUv;
        `,
        colorModifier: /* glsl */ `
          ${valueNoise("holoNoise", "p / 90.0 + vec2(holoT * 0.1, 0.0)")}

          float holoPhase = dot(p / max(halfSize, vec2(1.0)), holoDir) * uHoloBands + holoT * 0.25 + holoNoise * 0.6;
          vec3 holoRainbow = ${hueToRgb("fract(holoPhase)")};
          float holoLines = 0.5 + 0.5 * holoRidge;

          // Sparse 6 px cells that flash on and off
          vec2 holoCell = floor(p / 6.0);
          float holoGlintRand = fract(sin(dot(holoCell, vec2(12.9898, 78.233)) + floor(holoT * 6.0)) * 43758.5453);
          float holoGlint = step(1.0 - 0.02 * uHoloSparkle, holoGlintRand);

          vec3 holoColor = mix(
            finalColor.rgb,
            finalColor.rgb * 0.6 + holoRainbow * (0.55 + 0.45 * holoLines),
            clamp(uHoloIntensity, 0.0, 1.0)
          );
          holoColor += vec3(holoGlint * uHoloSparkle);
          finalColor.rgb = mix(finalColor.rgb, min(holoColor, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uHoloSpeed",
        intensity: "uHoloIntensity",
        bands: "uHoloBands",
        angle: "uHoloAngle",
        sparkle: "uHoloSparkle",
        refraction: "uHoloRefraction",
      },
      time: { uniform: "uHoloTime", speed: "uHoloSpeed" },
    };
  },
};
