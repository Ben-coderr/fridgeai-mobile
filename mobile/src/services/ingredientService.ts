import { Ingredient } from '../types';

export const ingredientService = {
  getDetectedIngredients: async (): Promise<Ingredient[]> => {
    return [];
  },

  addIngredient: async (newIngredient: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    const item: Ingredient = {
      ...newIngredient,
      id: `ing_${Date.now()}`,
    };
    return Promise.resolve(item);
  },
};
