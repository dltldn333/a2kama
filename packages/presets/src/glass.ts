import type { Recipe } from "a2kama";

export interface GlassOptions {
  /**
   * Angle of the main light source in degrees.
   * @default 45
   * @range [0, 360]
   */
  lightDirection?: number;

  /**
   * Intensity multiplier for the specular highlights.
   * @default 0.6
   * @range [0.0, 2.0]
   */
  lightIntensity?: number;

  /**
   * Ratio of light reflection symmetry (0.0 for single-sided, 1.0 for mirrored).
   * @default 1.0
   * @range [0.0, 1.0]
   */
  lightSymmetry?: number;

  /**
   * Base strength of background refraction/distortion.
   * @default 100
   * @range [0, 300]
   */
  refraction?: number;

  /**
   * Apparent thickness of the glass in pixels.
   * @default 40
   * @range [0, 200]
   */
  depth?: number;

  /**
   * Strength of chromatic aberration (RGB splitting).
   * ⚠️ Heavy on performance when > 0.
   * @default 0
   * @range [0, 200]
   */
  dispersion?: number;

  /**
   * Gaussian blur radius for the frosted glass effect.
   * ⚠️ Heavy on performance when > 0.
   * @default 0
   * @range [0, 100]
   */
  frost?: number;

  /**
   * Tangential distortion strength that pulls the background towards the corners.
   * @default 0
   * @range [0, 200]
   */
  splay?: number;

  /**
   * Scale multiplier for the background texture inside the glass.
   * @default 1.0
   * @range [0.1, 5.0]
   */
  zoom?: number;

  /**
   * Width of the outer beveled edge in pixels.
   * @default depth / 2
   * @range [0, depth]
   */
  bevelWidth?: number;

  /**
   * Sharpness/curvature of the beveled edge.
   * @default 3.0
   * @range [0.1, 10.0]
   */
  bevelCurve?: number;
}
export const a2kGlass = {
  normal(options: GlassOptions = {}): Recipe {
    const {
      lightDirection = 45,
      lightIntensity = 0.6,
      lightSymmetry = 1,
      refraction = 100,
      depth = 40,
      dispersion = 0,
      frost = 0,
      splay = 0,
      zoom = 1.0,
      bevelWidth = depth / 2,
      bevelCurve = 3.0,
    } = options;

    return {
      shader: {
        uniforms: {
          uGlassLightDirection: lightDirection,
          uGlassLightIntensity: lightIntensity,
          uGlassLightSymmetry: lightSymmetry,
          uGlassRefraction: refraction,
          uGlassDepth: depth,
          uGlassDispersion: dispersion,
          uGlassFrost: frost,
          uGlassSplay: splay,
          uGlassZoom: zoom,
          uGlassBevelWidth: bevelWidth,
          uGlassBevelCurve: bevelCurve,
        },
        uvModifier: /* glsl */ `
          // --- Settings ---
          float textureZoom = uGlassZoom;
          float maxDepth = uGlassDepth;
          float bevelWidth = uGlassBevelWidth; 
          float refraction = uGlassRefraction;
          float bevelCurve = uGlassBevelCurve;

          // --- Logic ---
          vec2 xRadii_uv = mix(clampedRadius.xw, clampedRadius.yz, step(0.0, p.x));
          float r_uv = mix(xRadii_uv.y, xRadii_uv.x, step(0.0, p.y));
          float d_uv = sdRoundedBox(p, halfSize, r_uv);

          vec2 e_uv = vec2(0.5, 0.0);
          float dx_uv = sdRoundedBox(p + e_uv.xy, halfSize, r_uv) - sdRoundedBox(p - e_uv.xy, halfSize, r_uv);
          float dy_uv = sdRoundedBox(p + e_uv.yx, halfSize, r_uv) - sdRoundedBox(p - e_uv.yx, halfSize, r_uv);
          vec2 grad = normalize(vec2(dx_uv, dy_uv)); 
          if (length(vec2(dx_uv, dy_uv)) < 0.001) grad = normalize(p);

          float edgeDist = max(-d_uv, 0.0);
          
          // Smooth out diagonal tears in deep interior by blending to a radial vector
          float blend_uv = smoothstep(max(1.0, r_uv * 0.5), max(2.0, r_uv * 1.5), edgeDist);
          grad = normalize(mix(grad, normalize(p), blend_uv));
          
          float mask1 = step(0.0, edgeDist) * step(edgeDist, bevelWidth);
          float t1 = edgeDist / bevelWidth; 

          float curve1 = pow(1.0 - t1, bevelCurve); 

          float target1 = bevelWidth + (maxDepth - bevelWidth) * curve1;
          float push1 = ((target1 - edgeDist) + (t1 * bevelCurve)) * mask1;

          float mask2 = step(bevelWidth, edgeDist) * step(edgeDist, maxDepth);
          float t2 = (edgeDist - bevelWidth) / (maxDepth - bevelWidth); 
          float curve2 = pow(1.0 - t2, bevelCurve); 
          float push2 = curve2 * bevelCurve * mask2;

          float pushDist = push1 + push2;

          vec2 pixelToUv = vec2(dFdx(screenUv.x), dFdy(screenUv.y));
          if (abs(pixelToUv.x) < 0.000001) pixelToUv.x = 1.0 / 1920.0;
          if (abs(pixelToUv.y) < 0.000001) pixelToUv.y = 1.0 / 1080.0;

          vec2 zoomOffset = p * pixelToUv * (1.0 / textureZoom - 1.0);
          
          float refStrength = refraction / 100.0;
          float splayAmount = uGlassSplay / 100.0;
          
          // Calculate tangent pull towards corners for splay distortion
          vec2 tangentPull = p / max(halfSize, 0.001);
          vec2 splayDir = tangentPull - grad * dot(tangentPull, grad);
          
          // Add splay distortion (tangential). Reversed (-splayDir) so image is pulled towards the corners.
          vec2 distortDir = -grad - splayDir * splayAmount;

          vec2 distortOffset = distortDir * pushDist * refStrength * pixelToUv;
          
          resultUv = screenUv + zoomOffset + distortOffset; 
        `,
        colorModifier: /* glsl */ `
          // --- Settings ---
          float lightDirection = uGlassLightDirection;
          float lightIntensity = uGlassLightIntensity;
          float lightSymmetry = uGlassLightSymmetry;
          float bevel = uGlassBevelWidth;

          // --- Logic ---
          vec2 e_c = vec2(0.5, 0.0);
          float dx_c = sdRoundedBox(p + e_c.xy, halfSize, r_uv) - sdRoundedBox(p - e_c.xy, halfSize, r_uv);
          float dy_c = sdRoundedBox(p + e_c.yx, halfSize, r_uv) - sdRoundedBox(p - e_c.yx, halfSize, r_uv);
          vec2 dir_c = normalize(vec2(dx_c, dy_c));
          if (length(vec2(dx_c, dy_c)) < 0.001) dir_c = normalize(p);

          float edgeDist_c = max(-d, 0.0);
          float blend_c = smoothstep(max(1.0, r_uv * 0.5), max(2.0, r_uv * 1.5), edgeDist_c);
          dir_c = normalize(mix(dir_c, normalize(p), blend_c));

          float n_cos_c = max(bevel + d, 0.0) / max(bevel, 0.001);
          float n_sin_c = sqrt(max(1.0 - n_cos_c * n_cos_c, 0.0));
          vec3 normal_c = normalize(vec3(dir_c.x * n_cos_c, dir_c.y * n_cos_c, n_sin_c));

          float lightRad = lightDirection * 3.14159265 / 180.0;
          vec2 lightDir2D = vec2(cos(lightRad), sin(lightRad));
          
          vec2 norm2D = length(normal_c.xy) > 0.001 ? normalize(normal_c.xy) : vec2(0.0);
          float dot2D = dot(norm2D, lightDir2D);
          
          float diffuseBase = mix(max(dot2D, 0.0), abs(dot2D), lightSymmetry);
          float diffuse = pow(diffuseBase, mix(1.0, 3.0, lightSymmetry));
          
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float edgeReflection = smoothstep(-1.5, 0.0, d) * smoothstep(0.0, -1.5, d);
          float crispEdge = edgeReflection * diffuse;

          float fresnel = pow(1.0 - max(dot(normal_c, viewDir), 0.0), 3.0);
          
          float dirLight = (diffuse * fresnel) + crispEdge;
          
          // Frost (Blur) & Dispersion (Chromatic Aberration)
          float frostRadius = uGlassFrost;
          vec4 texColorDisp = vec4(0.0);
          
          if (frostRadius > 0.0) {
              float weightSum = 0.0;
              // Sigma controls the blur spread. 
              float sigma = max(frostRadius * 0.2, 1.0);
              float twoSigmaSq = 2.0 * sigma * sigma;
              
              // Standard 7x7 Gaussian Blur (49 samples) for better performance
              for(float x = -3.0; x <= 3.0; x += 1.0) {
                  for(float y = -3.0; y <= 3.0; y += 1.0) {
                      // Standard Gaussian weight formula
                      float weight = exp(-(x*x + y*y) / twoSigmaSq);
                      
                      // Spacing between samples. 
                      // Removed min() constraint as requested, allowing indefinite scaling at the cost of potential ghosting at extreme values.
                      float spacing = frostRadius * 0.15; 
                      vec2 texOffset = vec2(x, y) * spacing * pixelToUv;
                      
                      if (uGlassDispersion > 0.0) {
                          vec2 dispOff = distortDir * pushDist * refStrength * pixelToUv * (uGlassDispersion / 1000.0);
                          float rC = texture2D(uTexture, resultUv + texOffset + dispOff).r;
                          float gC = texture2D(uTexture, resultUv + texOffset).g;
                          float bC = texture2D(uTexture, resultUv + texOffset - dispOff).b;
                          float aC = texture2D(uTexture, resultUv + texOffset).a;
                          texColorDisp += vec4(rC, gC, bC, aC) * weight;
                      } else {
                          texColorDisp += texture2D(uTexture, resultUv + texOffset) * weight;
                      }
                      
                      weightSum += weight;
                  }
              }
              texColorDisp /= weightSum;
          } else {
              if (uGlassDispersion > 0.0) {
                  vec2 dispOff = distortDir * pushDist * refStrength * pixelToUv * (uGlassDispersion / 1000.0);
                  float r = texture2D(uTexture, resultUv + dispOff).r;
                  float g = texture2D(uTexture, resultUv).g;
                  float b = texture2D(uTexture, resultUv - dispOff).b;
                  float a = texture2D(uTexture, resultUv).a;
                  texColorDisp = vec4(r, g, b, a);
              } else {
                  texColorDisp = texture2D(uTexture, resultUv);
              }
          }
          
          vec4 newBaseColor = vec4(uBgColor.rgb, uBgColor.a);
          if (uGradientCount > 0) {
            vec4 gradColor = calculateGradientLayer(p); // use p instead of vUv to match base shader
            newBaseColor = blendSrcOver(gradColor, newBaseColor);
          }
          
          // 1. Blend background tint (newBaseColor) over the refracted texture
          vec4 glassBase = blendSrcOver(newBaseColor, texColorDisp);
          
          // 2. Blend border over the glass base
          vec4 glassyMain = blendSrcOver(borderLayer, glassBase);
          
          // 3. Mask the glassy body to the rounded box so it doesn't bleed out to the bounding box
          glassyMain.a *= bgMask;
          
          // 4. Add specular highlights (masked by bgMask)
          glassyMain.rgb += vec3(1.0) * (dirLight * lightIntensity) * bgMask;

          // 5. Finally, blend glassyMain over the existing shadowLayer
          finalColor = blendSrcOver(glassyMain, shadowLayer);
        `,
      },
      optionMap: {
        lightDirection: "uGlassLightDirection",
        lightIntensity: "uGlassLightIntensity",
        lightSymmetry: "uGlassLightSymmetry",
        refraction: "uGlassRefraction",
        depth: "uGlassDepth",
        dispersion: "uGlassDispersion",
        frost: "uGlassFrost",
        splay: "uGlassSplay",
        zoom: "uGlassZoom",
        bevelWidth: "uGlassBevelWidth",
        bevelCurve: "uGlassBevelCurve",
      },
    };
  },
};
