import type { Recipe } from "a2kama";

export interface WaterOptions {
  /**
   * Animation speed multiplier. 0 freezes the surface.
   * @default 2.0
   * @range [0.0, 4.0]
   */
  speed?: number;

  /**
   * Maximum refraction offset of the background, in pixels.
   * @default 8
   * @range [0, 40]
   */
  amplitude?: number;

  /**
   * @deprecated Use `amplitude` instead. Same unit (pixels).
   */
  intensity?: number;

  /**
   * Length of the primary wave in pixels.
   * @default 90
   * @range [10, 400]
   */
  wavelength?: number;

  /**
   * Travel direction of the primary wave in degrees (0 = right, 90 = up).
   * @default 30
   * @range [0, 360]
   */
  direction?: number;

  /**
   * Weight of the secondary waves layered over the primary one.
   * 0 gives clean parallel waves, 1 gives a choppy surface.
   * @default 0.6
   * @range [0.0, 1.0]
   */
  turbulence?: number;

  /**
   * Distance from the edge, in pixels, over which the distortion fades in.
   * Keeps the rounded border stable.
   * @default 16
   * @range [0, 100]
   */
  edgeSoftness?: number;

  /**
   * Strength of the glints on wave slopes facing the light.
   * @default 0.5
   * @range [0.0, 2.0]
   */
  highlight?: number;

  /**
   * Angle of the light source in degrees.
   * @default 45
   * @range [0, 360]
   */
  lightDirection?: number;

  /**
   * Water color as RGB in [0, 1].
   * @default [0.36, 0.66, 0.85]
   */
  tint?: [number, number, number];

  /**
   * How much of the tint color is mixed into the refracted background.
   * @default 0.18
   * @range [0.0, 1.0]
   */
  tintStrength?: number;
}

export const a2kWater = {
  normal(options: WaterOptions = {}): Recipe {
    const {
      speed = 2.0,
      amplitude = options.intensity ?? 8,
      wavelength = 90,
      direction = 30,
      turbulence = 0.6,
      edgeSoftness = 16,
      highlight = 0.5,
      lightDirection = 45,
      tint = [0.36, 0.66, 0.85],
      tintStrength = 0.18,
    } = options;

    return {
      shader: {
        uniforms: {
          uWaterTime: 0,
          uWaterSpeed: speed,
          uWaterAmplitude: amplitude,
          uWaterWavelength: wavelength,
          uWaterDirection: direction,
          uWaterTurbulence: turbulence,
          uWaterEdgeSoftness: edgeSoftness,
          uWaterHighlight: highlight,
          uWaterLightDirection: lightDirection,
          uWaterTint: [...tint],
          uWaterTintStrength: tintStrength,
        },
        uvModifier: /* glsl */ `
          // --- Settings ---
          float waterAmplitude = max(uWaterAmplitude, 0.0);
          float waterWavelength = max(uWaterWavelength, 1.0);
          float waterTurbulence = clamp(uWaterTurbulence, 0.0, 1.0);
          float waterEdge = max(uWaterEdgeSoftness, 0.001);

          // --- Edge mask (element-local pixels) ---
          vec2 waterRadii = mix(clampedRadius.xw, clampedRadius.yz, step(0.0, p.x));
          float waterRadius = mix(waterRadii.y, waterRadii.x, step(0.0, p.y));
          float waterDist = sdRoundedBox(p, halfSize, waterRadius);
          // 0 on the border, 1 once waterEdge pixels inside
          float waterMask = smoothstep(0.0, waterEdge, -waterDist);

          // --- Height field ---
          // Sum of directional sine waves anchored to the element (p), so the
          // surface moves with the element instead of sticking to the screen.
          // Each octave turns by the golden angle and shortens by the golden
          // ratio, which keeps the pattern from visibly repeating.
          float waterAngle = radians(uWaterDirection);
          float waterK = 6.28318530 / waterWavelength;
          float waterHeight = 0.0;
          vec2 waterSlope = vec2(0.0);
          float waterWeightSum = 0.0;

          for (int i = 0; i < 4; i++) {
            float waterI = float(i);
            float waterWeight = i == 0 ? 1.0 : pow(0.55, waterI) * waterTurbulence;
            float waterOctaveAngle = waterAngle + waterI * 2.39996323;
            vec2 waterDir = vec2(cos(waterOctaveAngle), sin(waterOctaveAngle));
            float waterRatio = pow(1.61803399, waterI);
            // Deep-water dispersion: angular speed grows with sqrt(wavenumber)
            float waterOmega = 3.14159265 * sqrt(waterRatio);
            float waterPhase = dot(waterDir, p) * waterK * waterRatio - uWaterTime * waterOmega + waterI * 1.7;
            waterHeight += sin(waterPhase) * waterWeight;
            waterSlope += waterDir * cos(waterPhase) * waterWeight;
            waterWeightSum += waterWeight;
          }

          // Normalized to roughly [-1, 1]
          waterHeight /= waterWeightSum;
          waterSlope /= waterWeightSum;

          // --- Refraction ---
          // UV per CSS pixel: p is in CSS pixels, so dividing the screenUv
          // derivative by the p derivative is independent of devicePixelRatio.
          vec2 waterPxToUv = vec2(dFdx(screenUv.x), dFdy(screenUv.y));
          waterPxToUv /= max(abs(vec2(dFdx(p.x), dFdy(p.y))), vec2(0.0001));
          if (abs(waterPxToUv.x) < 0.000001) waterPxToUv.x = 1.0 / 1920.0;
          if (abs(waterPxToUv.y) < 0.000001) waterPxToUv.y = 1.0 / 1080.0;

          vec2 waterOffset = waterSlope * waterAmplitude * waterMask;
          resultUv = screenUv + waterOffset * waterPxToUv;
        `,
        colorModifier: /* glsl */ `
          // --- Settings ---
          float waterHighlight = max(uWaterHighlight, 0.0);
          float waterLightAngle = radians(uWaterLightDirection);
          vec2 waterLightDir = vec2(cos(waterLightAngle), sin(waterLightAngle));

          // --- Lighting ---
          // Slopes facing the light glint and crests get a soft sheen. Both fade
          // out with the amplitude so still water stays unlit.
          float waterMotion = smoothstep(0.0, 4.0, waterAmplitude);
          float waterGlint = pow(max(dot(waterSlope, waterLightDir), 0.0), 3.0);
          float waterCrest = smoothstep(0.35, 1.0, waterHeight) * 0.35;
          float waterLight = (waterGlint + waterCrest) * waterHighlight * waterMotion * waterMask * bgMask;

          // --- Tint ---
          // Only the body is tinted; the shadow around it keeps its color.
          float waterTintAmount = clamp(uWaterTintStrength, 0.0, 1.0) * bgMask;
          vec3 waterColor = mix(finalColor.rgb, uWaterTint, waterTintAmount);

          finalColor.rgb = min(waterColor + vec3(waterLight), vec3(1.0));
        `,
      },
      optionMap: {
        speed: "uWaterSpeed",
        amplitude: "uWaterAmplitude",
        wavelength: "uWaterWavelength",
        direction: "uWaterDirection",
        turbulence: "uWaterTurbulence",
        edgeSoftness: "uWaterEdgeSoftness",
        highlight: "uWaterHighlight",
        lightDirection: "uWaterLightDirection",
        tint: "uWaterTint",
        tintStrength: "uWaterTintStrength",
      },
      time: {
        uniform: "uWaterTime",
        speed: "uWaterSpeed",
      },
    };
  },
};
