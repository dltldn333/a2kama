export interface RecipeShader {
  uvModifier?: string;
  colorModifier?: string;
  uniforms?: Record<string, any>;
}

export interface RecipeTime {
  /** Uniform that receives the elapsed time in seconds every frame. */
  uniform: string;
  /** Uniform whose value scales how fast time advances (1 = real time). */
  speed?: string;
}

export interface Recipe {
  shader: RecipeShader;
  optionMap?: Record<string, string>;
  /** Lets a2kama advance a time uniform every frame for animated recipes. */
  time?: RecipeTime;
}
