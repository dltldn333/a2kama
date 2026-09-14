import type { Recipe } from "a2kama";
import { boxDistance, pxToUv } from "./glsl";

export interface JellyOptions {
  /**
   * Speed of the wobble after a poke.
   * @default 2
   * @range [0, 4]
   */
  speed?: number;

  /**
   * Wobble displacement of the background, in pixels.
   * @default 15
   * @range [0, 40]
   */
  wobble?: number;

  /**
   * Seconds until the wobble settles, at speed 1.
   * @default 1.6
   * @range [0.2, 4]
   */
  duration?: number;

  /**
   * Width of the soft, bulging rim in pixels.
   * @default 36
   * @range [1, 120]
   */
  softness?: number;

  /**
   * Lens pull at the rim, in pixels.
   * @default 18
   * @range [0, 80]
   */
  refraction?: number;

  /**
   * Glossy highlight strength.
   * @default 0.3
   * @range [0, 2]
   */
  gloss?: number;

  /**
   * How strongly the jelly color fills the body.
   * @default 0.45
   * @range [0, 1]
   */
  tintStrength?: number;

  /**
   * Jelly color as RGB in [0, 1].
   * @default [1, 0.42, 0.68]
   */
  tint?: [number, number, number];
}

export const a2kJelly = {
  normal(options: JellyOptions = {}): Recipe {
    const {
      speed = 2,
      wobble = 15,
      duration = 1.6,
      softness = 36,
      refraction = 18,
      gloss = 0.3,
      tintStrength = 0.45,
      tint = [1, 0.42, 0.68],
    } = options;

    return {
      shader: {
        uniforms: {
          uJellyTime: 0,
          uJellySpeed: speed,
          uJellyWobble: wobble,
          uJellyDuration: duration,
          uJellySoftness: softness,
          uJellyRefraction: refraction,
          uJellyGloss: gloss,
          uJellyTintStrength: tintStrength,
          uJellyTint: [...tint],
          uJellyPokeCenter: [0, 0],
          uJellyPokeStart: -1000,
        },
        uvModifier: /* glsl */ `
          ${boxDistance("jellyDist")}
          ${pxToUv("jellyPxToUv")}

          // 1 on the rim, 0 once past the soft zone
          float jellyEdge = 1.0 - smoothstep(0.0, max(uJellySoftness, 0.001), max(-jellyDist, 0.0));
          vec2 jellyRadial = p / max(halfSize, vec2(1.0));

          // The body only moves after a poke, then settles
          float jellyAge = uJellyTime - uJellyPokeStart;
          float jellySettle = step(0.0, jellyAge) * exp(-jellyAge * 4.0 / max(uJellyDuration, 0.05));
          vec2 jellyFromPoke = p - uJellyPokeCenter;
          float jellyPokeDist = length(jellyFromPoke);
          float jellyWave = sin(jellyPokeDist * 0.045 - jellyAge * 14.0);
          vec2 jellyWobble = (
            jellyFromPoke / max(jellyPokeDist, 1.0) * jellyWave
            + vec2(sin(jellyAge * 11.0), cos(jellyAge * 9.0)) * 0.35
          ) * jellySettle;

          vec2 jellyOffset = -jellyRadial * jellyEdge * jellyEdge * uJellyRefraction
            + jellyWobble * uJellyWobble * (0.35 + 0.65 * jellyEdge);
          resultUv = screenUv + jellyOffset * jellyPxToUv;
        `,
        colorModifier: /* glsl */ `
          // Colored gel: part multiply, part the jelly color itself
          vec3 jellyGel = mix(finalColor.rgb * uJellyTint * 1.3, uJellyTint, 0.3);
          vec3 jellyColor = mix(finalColor.rgb, jellyGel, clamp(uJellyTintStrength, 0.0, 1.0));

          // Soft highlight near the top-left that shifts while wobbling
          vec2 jellyGlossPos = (jellyRadial - vec2(-0.45, 0.55) + jellyWobble * 0.04) * vec2(1.6, 3.2);
          float jellyGloss = exp(-dot(jellyGlossPos, jellyGlossPos) * 2.0) * 0.9;
          float jellyRim = pow(jellyEdge, 3.0) * 0.5;

          jellyColor += vec3(jellyGloss + jellyRim) * uJellyGloss;
          finalColor.rgb = mix(finalColor.rgb, min(jellyColor, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uJellySpeed",
        wobble: "uJellyWobble",
        duration: "uJellyDuration",
        softness: "uJellySoftness",
        refraction: "uJellyRefraction",
        gloss: "uJellyGloss",
        tintStrength: "uJellyTintStrength",
        tint: "uJellyTint",
        time: "uJellyTime",
        pokeCenter: "uJellyPokeCenter",
        pokeStart: "uJellyPokeStart",
      },
      time: { uniform: "uJellyTime", speed: "uJellySpeed" },
    };
  },

  /**
   * Pokes the jelly at a viewport point, making it wobble from there.
   * @param options The object returned by `a2kama.getOptions(element)`.
   */
  trigger(options: Record<string, any>, element: HTMLElement, clientX: number, clientY: number) {
    const rect = element.getBoundingClientRect();
    // Shader space: origin at the element center, y pointing up
    options.pokeCenter = [clientX - (rect.left + rect.width / 2), rect.top + rect.height / 2 - clientY];
    options.pokeStart = options.time;
  },
};
