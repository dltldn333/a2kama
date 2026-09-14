import type { Recipe } from "a2kama";
import { pxToUv } from "./glsl";

export interface RippleOptions {
  /**
   * How fast the rings travel outward, in pixels per second.
   * @default 480
   * @range [0, 1200]
   */
  speed?: number;

  /**
   * Maximum refraction offset of the rings, in pixels.
   * @default 10
   * @range [0, 40]
   */
  amplitude?: number;

  /**
   * Distance between rings, in pixels.
   * @default 36
   * @range [8, 160]
   */
  wavelength?: number;

  /**
   * Seconds until a ripple fades out.
   * @default 1.6
   * @range [0.2, 5]
   */
  duration?: number;

  /**
   * Seconds between automatic ripples from the center. 0 turns them off.
   * @default 0
   * @range [0, 8]
   */
  autoInterval?: number;

  /**
   * Brightness of the ring crests.
   * @default 0.35
   * @range [0, 2]
   */
  highlight?: number;
}

/** Ripples started by `trigger()`; each click reuses the oldest slot. */
const CLICK_SLOTS = 3;

function rippleSource(center: string, age: string) {
  return /* glsl */ `
    {
      vec2 rippleDelta = p - ${center};
      float rippleR = length(rippleDelta);
      float rippleAge = ${age};
      float rippleLife = step(0.0, rippleAge) * (1.0 - smoothstep(0.0, rippleDuration, rippleAge));
      float rippleX = (rippleR - rippleAge * uRippleSpeed) / rippleWavelength;
      float rippleH = sin(rippleX * 6.28318530) * exp(-rippleX * rippleX * 1.5) * rippleLife;
      rippleOffset += rippleDelta / max(rippleR, 0.001) * rippleH;
      rippleShade += rippleH;
    }
  `;
}

const clickSlots = Array.from({ length: CLICK_SLOTS }, (_, i) => i + 1);

export const a2kRipple = {
  normal(options: RippleOptions = {}): Recipe {
    const { speed = 480, amplitude = 10, wavelength = 36, duration = 1.6, autoInterval = 0, highlight = 0.35 } =
      options;

    const clickUniforms: Record<string, number | number[]> = {};
    const clickOptions: Record<string, string> = {};
    for (const slot of clickSlots) {
      clickUniforms[`uRippleCenter${slot}`] = [0, 0];
      clickUniforms[`uRippleStart${slot}`] = -1000;
      clickOptions[`center${slot}`] = `uRippleCenter${slot}`;
      clickOptions[`start${slot}`] = `uRippleStart${slot}`;
    }

    return {
      shader: {
        uniforms: {
          uRippleTime: 0,
          uRippleSpeed: speed,
          uRippleAmplitude: amplitude,
          uRippleWavelength: wavelength,
          uRippleDuration: duration,
          uRippleAutoInterval: autoInterval,
          uRippleHighlight: highlight,
          ...clickUniforms,
        },
        uvModifier: /* glsl */ `
          ${pxToUv("ripplePxToUv")}

          float rippleDuration = max(uRippleDuration, 0.01);
          float rippleWavelength = max(uRippleWavelength, 1.0);
          vec2 rippleOffset = vec2(0.0);
          float rippleShade = 0.0;

          // Automatic ripple from the center
          ${rippleSource("vec2(0.0)", "uRippleAutoInterval > 0.0 ? mod(uRippleTime, uRippleAutoInterval) : -1.0")}
          // Ripples placed by trigger()
          ${clickSlots.map((slot) => rippleSource(`uRippleCenter${slot}`, `uRippleTime - uRippleStart${slot}`)).join("")}

          resultUv = screenUv + rippleOffset * uRippleAmplitude * ripplePxToUv;
        `,
        colorModifier: /* glsl */ `
          vec3 rippleColor = finalColor.rgb + vec3(max(rippleShade, 0.0) * uRippleHighlight);
          finalColor.rgb = mix(finalColor.rgb, min(rippleColor, vec3(1.0)), bgMask);
        `,
      },
      optionMap: {
        speed: "uRippleSpeed",
        amplitude: "uRippleAmplitude",
        wavelength: "uRippleWavelength",
        duration: "uRippleDuration",
        autoInterval: "uRippleAutoInterval",
        highlight: "uRippleHighlight",
        time: "uRippleTime",
        ...clickOptions,
      },
      time: { uniform: "uRippleTime" },
    };
  },

  /**
   * Starts a ripple at a viewport point on an element using this recipe.
   * @param options The object returned by `a2kama.getOptions(element)`.
   */
  trigger(options: Record<string, any>, element: HTMLElement, clientX: number, clientY: number) {
    const rect = element.getBoundingClientRect();
    const slots = clickSlots.map((slot) => ({ slot, start: options[`start${slot}`] as number }));
    const { slot } = slots.reduce((oldest, next) => (next.start < oldest.start ? next : oldest));

    // Shader space: origin at the element center, y pointing up
    options[`center${slot}`] = [clientX - (rect.left + rect.width / 2), rect.top + rect.height / 2 - clientY];
    options[`start${slot}`] = options.time;
  },
};
