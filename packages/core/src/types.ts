export interface RecipeShader {
  uvModifier?: string;
  colorModifier?: string;
}

export interface Recipe {
  shader: RecipeShader;
  // Extensible for future properties
}
