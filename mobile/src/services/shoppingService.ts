import { primaryRecipes } from '../data/mockData';
import { ShoppingItem } from '../types';

export const shoppingService = {
  getShoppingListForRecipe: async (recipeId?: string): Promise<ShoppingItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recipe = primaryRecipes.find((r) => r.id === recipeId) || primaryRecipes[0];
        const items: ShoppingItem[] = recipe.missingIngredients.map((ing) => ({
          id: `shop_${ing.id}`,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          image: ing.image,
          isPurchased: false,
          recipeName: recipe.title,
        }));
        resolve(items);
      }, 100);
    });
  },
};
