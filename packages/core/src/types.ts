export interface RecipeShader {
  uvModifier?: string;
  colorModifier?: string;
  uniforms?: Record<string, any>;
}

export interface Recipe {
  shader: RecipeShader;
  // Extensible for future properties
}
