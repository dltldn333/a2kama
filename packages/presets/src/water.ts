import type { Recipe } from "a2kama";

export interface WaterOptions {
  speed?: number;
  intensity?: number;
}

export const a2kWater = {
  normal(options: WaterOptions = {}): Recipe {
    const { speed = 1.0, intensity = 0.5 } = options;

    return {
      shader: {
        uvModifier: /* glsl */ `
          // Placeholder water effect: simple sine wave distortion
          vec2 pixelToUv = vec2(dFdx(screenUv.x), dFdy(screenUv.y));
          if (abs(pixelToUv.x) < 0.000001) pixelToUv.x = 1.0 / 1920.0;
          if (abs(pixelToUv.y) < 0.000001) pixelToUv.y = 1.0 / 1080.0;

          // Simple time-based ripple
          // Note: In mirage-engine, 'uTime' would be needed, but assuming a simple static ripple if not available
          float wave = sin(screenUv.y * 50.0) * ${intensity.toFixed(2)};
          vec2 distortOffset = vec2(wave, wave) * pixelToUv;
          
          resultUv = screenUv + distortOffset; 
        `,
        colorModifier: /* glsl */ `
          // Blue-ish tint
          finalColor.rgb += vec3(0.0, 0.2, 0.5) * 0.3;
        `
      }
    };
  }
};
