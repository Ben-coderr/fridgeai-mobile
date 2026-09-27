import { initialDetectedIngredients } from '../data/mockData';
import { Ingredient } from '../types';

export const ingredientService = {
  getDetectedIngredients: async (): Promise<Ingredient[]> => {
    // Simulates an async service fetch
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...initialDetectedIngredients]);
      }, 100);
    });
  },

  addIngredient: async (newIngredient: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    const item: Ingredient = {
      ...newIngredient,
      id: `ing_${Date.now()}`,
    };
    return Promise.resolve(item);
  },
};
