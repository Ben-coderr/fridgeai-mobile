import { Ingredient, Recipe, RecipeStep, UserPreferences } from '../types';
import { API_BASE_URL, USE_BACKEND } from '../config/api';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

export const recipeService = {
  /**
   * Fetches recipes based on preferences and detected ingredients.
   * Calls POST /api/recipes and surfaces backend failures to the user.
   */
  getRecipes: async (
    preferences?: UserPreferences,
    ingredients?: Ingredient[],
    _useAlternate: boolean = false
  ): Promise<Recipe[]> => {
    if (!USE_BACKEND) throw new Error('AI recipe generation is disabled.');
    if (!ingredients?.length) throw new Error('Scan a photo and confirm ingredients first.');
    const response = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })),
        preferences: preferences || { peopleCount: 2, mealType: 'Dinner', preference: 'Quick' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(errorBody?.error || `Recipe request failed (${response.status}).`);
    }
    const data = (await response.json()) as { recipes?: Recipe[] };
    if (!Array.isArray(data.recipes) || data.recipes.length === 0) throw new Error('AI returned no recipes.');
    return data.recipes.map((recipe, index) => ({
      ...recipe,
      id: recipe.id || `recipe_${index + 1}_${Date.now()}`,
      name: recipe.name || recipe.title,
      title: recipe.title || recipe.name,
      image: recipe.image || DEFAULT_IMAGE,
      servings: recipe.servings || preferences?.peopleCount || 2,
      availableIngredients: (recipe.availableIngredients || []).map((item, itemIndex) => ({
        ...item, id: `avail_${index}_${itemIndex}`, image: item.image || DEFAULT_IMAGE,
      })),
      missingIngredients: (recipe.missingIngredients || []).map((item, itemIndex) => ({
        ...item, id: `miss_${index}_${itemIndex}`, image: item.image || DEFAULT_IMAGE,
      })),
      instructions: recipe.instructions || [],
    }));
  },

  /**
   * Fetches cooking instructions for a specific recipe from POST /api/instructions.
   */
  getInstructions: async (recipe: Recipe): Promise<RecipeStep[]> => {
    if (!USE_BACKEND || !recipe.title) throw new Error('AI instructions are unavailable.');
    const response = await fetch(`${API_BASE_URL}/api/instructions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        servings: recipe.servings,
        ingredients: (recipe.availableIngredients || []).map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(errorBody?.error || `Instruction request failed (${response.status}).`);
    }
    const data = (await response.json()) as { instructions?: RecipeStep[] };
    if (!Array.isArray(data.instructions) || !data.instructions.length) throw new Error('AI returned no instructions.');
    return data.instructions;
  },

};
