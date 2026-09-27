import { alternateRecipes, primaryRecipes } from '../data/mockData';
import { Ingredient, Recipe, RecipeStep, UserPreferences } from '../types';
import { API_BASE_URL, USE_BACKEND } from '../config/api';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

export const recipeService = {
  /**
   * Fetches recipes based on preferences and detected ingredients.
   * If backend is active, calls POST /api/recipes with failover to local recipes.
   */
  getRecipes: async (
    preferences?: UserPreferences,
    ingredients?: Ingredient[],
    useAlternate: boolean = false
  ): Promise<Recipe[]> => {
    if (USE_BACKEND && ingredients && ingredients.length > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: ingredients.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unit: i.unit,
            })),
            preferences: preferences || {
              peopleCount: 2,
              mealType: 'Dinner',
              preference: 'Quick',
            },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { recipes: Recipe[]; source: string };
          if (Array.isArray(data.recipes) && data.recipes.length > 0) {
            const fallbackSet = useAlternate ? alternateRecipes : primaryRecipes;

            return data.recipes.map((r, idx) => {
              const fallbackRecipe = fallbackSet[idx % fallbackSet.length] || primaryRecipes[0];
              return {
                id: r.id || `recipe_${idx + 1}_${Date.now()}`,
                name: r.name || r.title || fallbackRecipe.name,
                title: r.title || r.name || fallbackRecipe.title,
                description: r.description || fallbackRecipe.description,
                image: r.image || fallbackRecipe.image || DEFAULT_IMAGE,
                cookingTime: typeof r.cookingTime === 'number' ? r.cookingTime : fallbackRecipe.cookingTime,
                prepTime: typeof r.prepTime === 'number' ? r.prepTime : fallbackRecipe.prepTime,
                servings: typeof r.servings === 'number' ? r.servings : (preferences?.peopleCount || 2),
                difficulty: r.difficulty || fallbackRecipe.difficulty || 'Medium',
                isBestMatch: typeof r.isBestMatch === 'boolean' ? r.isBestMatch : idx === 0,
                availableIngredients: (r.availableIngredients && r.availableIngredients.length > 0)
                  ? r.availableIngredients.map((item, iIdx) => ({
                      id: `avail_${idx}_${iIdx}`,
                      name: item.name,
                      quantity: item.quantity || 1,
                      unit: item.unit || 'pcs',
                      image: item.image || fallbackRecipe.availableIngredients[0]?.image || DEFAULT_IMAGE,
                    }))
                  : fallbackRecipe.availableIngredients,
                missingIngredients: (r.missingIngredients && r.missingIngredients.length > 0)
                  ? r.missingIngredients.map((item, mIdx) => ({
                      id: `miss_${idx}_${mIdx}`,
                      name: item.name,
                      quantity: item.quantity || 1,
                      unit: item.unit || 'pcs',
                      image: item.image || fallbackRecipe.missingIngredients[0]?.image || DEFAULT_IMAGE,
                    }))
                  : fallbackRecipe.missingIngredients,
                instructions: (r.instructions && r.instructions.length > 0)
                  ? r.instructions
                  : fallbackRecipe.instructions,
              };
            });
          }
        }
      } catch (err) {
        console.warn('[recipeService] Failed to fetch recipes from backend, using local mock:', err);
      }
    }

    // Default local fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(useAlternate ? [...alternateRecipes] : [...primaryRecipes]);
      }, 200);
    });
  },

  /**
   * Fetches cooking instructions for a specific recipe from POST /api/instructions.
   */
  getInstructions: async (recipe: Recipe): Promise<RecipeStep[]> => {
    if (USE_BACKEND && recipe.title) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/instructions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            servings: recipe.servings,
            ingredients: (recipe.availableIngredients || []).map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unit: i.unit,
            })),
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { instructions: RecipeStep[] };
          if (Array.isArray(data.instructions) && data.instructions.length > 0) {
            return data.instructions;
          }
        }
      } catch (err) {
        console.warn('[recipeService] Failed to fetch instructions from backend:', err);
      }
    }

    return recipe.instructions || primaryRecipes[0].instructions;
  },

  getRecipeById: async (id: string): Promise<Recipe | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = [...primaryRecipes, ...alternateRecipes];
        resolve(all.find((r) => r.id === id));
      }, 100);
    });
  },
};
