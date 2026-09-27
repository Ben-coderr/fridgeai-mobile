import { alternateRecipes, primaryRecipes } from '../data/mockData';
import { Recipe, UserPreferences } from '../types';

export const recipeService = {
  getRecipes: async (_preferences?: UserPreferences, useAlternate: boolean = false): Promise<Recipe[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(useAlternate ? [...alternateRecipes] : [...primaryRecipes]);
      }, 200);
    });
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
