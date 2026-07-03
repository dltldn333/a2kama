import type { Recipe } from "a2kama";

export interface GlassOptions {
  lightDirection?: number;
  lightIntensity?: number;
  lightSymmetry?: number;
  refraction?: number;
  depth?: number;
  dispersion?: number;
  frost?: number;
  splay?: number;
  zoom?: number;
  bevelWidth?: number;
  bevelCurve?: number;
}

export const a2kGlass = {
  normal(options: GlassOptions = {}): Recipe {
    const {
      lightDirection = -45,
      lightIntensity = 1,
      lightSymmetry = 1,
      refraction = 150,
      depth = 30,
      dispersion = 0,
      frost = 10,
      splay = 100,
      zoom = 1.0,
      bevelWidth = depth / 2,
      bevelCurve = 3.0
    } = options;

    return {
      shader: {
        uvModifier: /* glsl */ `
          // --- Settings ---
          float textureZoom = ${zoom.toFixed(3)};
          float maxDepth = ${depth.toFixed(3)};
          float bevelWidth = ${bevelWidth.toFixed(3)}; 
          float refraction = ${refraction.toFixed(3)};
          float bevelCurve = ${bevelCurve.toFixed(3)};

          // --- Logic ---
          vec2 xRadii_uv = mix(uBorderRadius.xw, uBorderRadius.yz, step(0.0, p.x));
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
          float splayAmount = ${splay.toFixed(3)} / 100.0;
          
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
          float lightDirection = ${lightDirection.toFixed(3)};
          float lightIntensity = ${lightIntensity.toFixed(3)};
          float lightSymmetry = ${lightSymmetry.toFixed(3)};
          float bevel = ${bevelWidth.toFixed(3)};

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
          
          finalColor.rgb += vec3(1.0) * (dirLight * lightIntensity);
        `,
      },
    };
  },
};
