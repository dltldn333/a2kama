// Inline GLSL building blocks shared by presets.
// Hooks are injected into main(), so these expand to statements, not functions.
// Every helper takes a name used as a variable prefix to avoid collisions.

/** Declares vec2 `name`: UV offset per CSS pixel, independent of devicePixelRatio. */
export const pxToUv = (name: string) => /* glsl */ `
  vec2 ${name} = vec2(dFdx(screenUv.x), dFdy(screenUv.y));
  ${name} /= max(abs(vec2(dFdx(p.x), dFdy(p.y))), vec2(0.0001));
  if (abs(${name}.x) < 0.000001) ${name}.x = 1.0 / 1920.0;
  if (abs(${name}.y) < 0.000001) ${name}.y = 1.0 / 1080.0;
`;

/**
 * Declares float `name`: signed distance to the element's rounded box in pixels (negative inside),
 * and float `${name}Radius`: the corner radius used for it.
 */
export const boxDistance = (name: string) => /* glsl */ `
  vec2 ${name}Radii = mix(clampedRadius.xw, clampedRadius.yz, step(0.0, p.x));
  float ${name}Radius = mix(${name}Radii.y, ${name}Radii.x, step(0.0, p.y));
  float ${name} = sdRoundedBox(p, halfSize, ${name}Radius);
`;

/** Expression: pseudo-random value in [0, 1) for a vec2 input. */
export const hash = (input: string) => `fract(sin(dot(${input}, vec2(127.1, 311.7))) * 43758.5453)`;

/** Declares float `name`: smooth 2D value noise at `point`, in [0, 1]. */
export const valueNoise = (name: string, point: string) => /* glsl */ `
  float ${name};
  {
    vec2 ${name}I = floor(${point});
    vec2 ${name}F = fract(${point});
    vec2 ${name}U = ${name}F * ${name}F * (3.0 - 2.0 * ${name}F);
    float ${name}A = ${hash(`${name}I`)};
    float ${name}B = ${hash(`${name}I + vec2(1.0, 0.0)`)};
    float ${name}C = ${hash(`${name}I + vec2(0.0, 1.0)`)};
    float ${name}D = ${hash(`${name}I + vec2(1.0, 1.0)`)};
    ${name} = mix(mix(${name}A, ${name}B, ${name}U.x), mix(${name}C, ${name}D, ${name}U.x), ${name}U.y);
  }
`;

/** Declares float `name`: four octaves of value noise at `point`, roughly in [0, 1]. */
export const fbm = (name: string, point: string) => /* glsl */ `
  float ${name} = 0.0;
  {
    vec2 ${name}P = ${point};
    float ${name}Amp = 0.5;
    for (int ${name}Octave = 0; ${name}Octave < 4; ${name}Octave++) {
      ${valueNoise(`${name}N`, `${name}P`)}
      ${name} += ${name}Amp * ${name}N;
      ${name}P = ${name}P * 2.03 + vec2(17.1, 9.2);
      ${name}Amp *= 0.5;
    }
    ${name} /= 0.9375;
  }
`;

/** Expression: fully saturated RGB for a hue in [0, 1). */
export const hueToRgb = (hue: string) =>
  `clamp(abs(mod(${hue} * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0)`;
