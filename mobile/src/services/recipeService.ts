import { Ingredient, Recipe, RecipeStep, UserPreferences } from '../types';
import { getApiBaseUrl, isBackendEnabled } from '../config/api';
import { getIngredientImage, getRecipeImage } from '../utils/imageHelper';
import { primaryRecipes, alternateRecipes } from '../data/mockData';

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
    if (!ingredients?.length) throw new Error('Scan a photo and confirm ingredients first.');

    if (!isBackendEnabled()) {
      let sourceList = _useAlternate ? alternateRecipes : primaryRecipes;
      if (preferences?.vegetarianOnly) {
        const meatWords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'bacon', 'turkey', 'shrimp', 'steak', 'meat'];
        const filtered = sourceList.filter((recipe) => {
          const text = ((recipe.title || '') + ' ' + (recipe.name || '') + ' ' + (recipe.description || '')).toLowerCase();
          return !meatWords.some((word) => text.includes(word));
        });
        if (filtered.length > 0) {
          sourceList = filtered;
        }
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            sourceList.map((recipe, index) => {
              const title = recipe.title || recipe.name || 'Delicious Meal';
              return {
                ...recipe,
                id: recipe.id || `recipe_${index + 1}_${Date.now()}`,
                name: recipe.name || title,
                title: title,
                image: recipe.image || getRecipeImage(title, index),
                servings: recipe.servings || preferences?.peopleCount || 2,
                instructions: recipe.instructions || [],
              };
            })
          );
        }, 500);
      });
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/recipes`, {
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
      return data.recipes.map((recipe, index) => {
        const title = recipe.title || recipe.name || 'Delicious Meal';
        return {
          ...recipe,
          id: recipe.id || `recipe_${index + 1}_${Date.now()}`,
          name: recipe.name || title,
          title: title,
          image: recipe.image || getRecipeImage(title, index),
          servings: recipe.servings || preferences?.peopleCount || 2,
          availableIngredients: (recipe.availableIngredients || []).map((item, itemIndex) => ({
            ...item,
            id: `avail_${index}_${itemIndex}`,
            image: item.image || getIngredientImage(item.name),
          })),
          missingIngredients: (recipe.missingIngredients || []).map((item, itemIndex) => ({
            ...item,
            id: `miss_${index}_${itemIndex}`,
            image: item.image || getIngredientImage(item.name),
          })),
          instructions: recipe.instructions || [],
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Recipe request failed.';
      throw new Error(`${msg}\n(API: ${getApiBaseUrl()})`);
    }
  },

  /**
   * Fetches cooking instructions for a specific recipe from POST /api/instructions.
   */
  getInstructions: async (recipe: Recipe): Promise<RecipeStep[]> => {
    if (!recipe.title) throw new Error('Recipe has no title.');

    if (!isBackendEnabled()) {
      if (recipe.instructions && recipe.instructions.length > 0) {
        return recipe.instructions;
      }
      return [
        { id: 'st_1', step: 1, title: 'Prepare Ingredients', description: 'Chop and measure all fresh ingredients according to recipe specifications.' },
        { id: 'st_2', step: 2, title: 'Cook and Combine', description: 'Heat a pan over medium heat and sauté the ingredients until cooked through.' },
        { id: 'st_3', step: 3, title: 'Season and Serve', description: 'Add seasonings to taste, garnish with fresh herbs, and serve warm.' },
      ];
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/instructions`, {
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
    } catch (err) {
      // If backend fails, fallback to existing recipe instructions if available
      if (recipe.instructions && recipe.instructions.length > 0) {
        return recipe.instructions;
      }
      const msg = err instanceof Error ? err.message : 'Instruction request failed.';
      throw new Error(`${msg}\n(API: ${getApiBaseUrl()})`);
    }
  },
};
