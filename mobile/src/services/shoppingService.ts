import { Recipe, ShoppingItem } from '../types';

export const shoppingService = {
  getShoppingListForRecipe: async (recipe: Recipe): Promise<ShoppingItem[]> => {
    return recipe.missingIngredients.map((ingredient) => ({
      id: `shop_${ingredient.id}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      image: ingredient.image,
      isPurchased: false,
      recipeName: recipe.title,
    }));
  },
};
