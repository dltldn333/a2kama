import type { Recipe } from "a2kama";
import { hueToRgb, pxToUv } from "./glsl";

export interface PrismOptions {
  /**
   * Width of each prism facet in pixels.
   * @default 10
   * @range [2, 200]
   */
  facetSize?: number;

  /**
   * Direction across the facets, in degrees.
   * @default 35
   * @range [0, 360]
   */
  angle?: number;

  /**
   * How far each facet bends the background, in pixels.
   * @default 10
   * @range [0, 40]
   */
  refraction?: number;

  /**
   * RGB split between channels, in pixels.
   * @default 6
   * @range [0, 30]
   */
  dispersion?: number;

  /**
   * Strength of the rainbow sheen on the facets.
   * @default 0.3
   * @range [0, 1]
   */
  rainbow?: number;
}

export const a2kPrism = {
  normal(options: PrismOptions = {}): Recipe {
    const { facetSize = 10, angle = 35, refraction = 10, dispersion = 6, rainbow = 0.3 } = options;

    return {
      shader: {
        uniforms: {
          uPrismFacetSize: facetSize,
          uPrismAngle: angle,
          uPrismRefraction: refraction,
          uPrismDispersion: dispersion,
          uPrismRainbow: rainbow,
        },
        uvModifier: /* glsl */ `
          ${pxToUv("prismPxToUv")}

          float prismAngle = radians(uPrismAngle);
          vec2 prismDir = vec2(cos(prismAngle), sin(prismAngle));
          float prismCoord = dot(p, prismDir) / max(uPrismFacetSize, 1.0);
          float prismIndex = floor(prismCoord);
          float prismFacet = fract(prismCoord);

          // Each facet tilts the background from one side to the other, like a row of prisms
          float prismTilt = (prismFacet - 0.5) * 2.0;
          resultUv = screenUv + prismDir * prismTilt * uPrismRefraction * prismPxToUv;
        `,
        colorModifier: /* glsl */ `
          vec2 prismSplit = prismDir * uPrismDispersion * (0.5 + 0.5 * abs(prismTilt)) * prismPxToUv;
          vec3 prismRgb = vec3(
            texture2D(uTexture, resultUv + prismSplit).r,
            texture2D(uTexture, resultUv).g,
            texture2D(uTexture, resultUv - prismSplit).b
          );

          vec3 prismHue = ${hueToRgb("fract(prismIndex * 0.13 + prismFacet * 0.35)")};
          float prismEdgeLine = smoothstep(0.92, 1.0, prismFacet) * 0.35;
          vec3 prismColor = prismRgb + prismHue * uPrismRainbow * (0.4 + 0.6 * prismFacet) + vec3(prismEdgeLine);

          finalColor.rgb = mix(finalColor.rgb, min(prismColor, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        facetSize: "uPrismFacetSize",
        angle: "uPrismAngle",
        refraction: "uPrismRefraction",
        dispersion: "uPrismDispersion",
        rainbow: "uPrismRainbow",
      },
    };
  },
};
