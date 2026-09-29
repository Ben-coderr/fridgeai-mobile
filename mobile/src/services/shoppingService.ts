import { Recipe, ShoppingItem } from '../types';

export const COMMON_PANTRY_STAPLES = [
  'salt',
  'black pepper',
  'pepper',
  'water',
  'tap water',
  'cooking oil',
  'vegetable oil',
  'olive oil',
  'oil',
  'sugar',
  'flour',
];

/**
 * Checks whether an ingredient name corresponds to an everyday pantry staple
 * (e.g. salt, pepper, oil, water) that users usually have on hand.
 */
export function isPantryStaple(ingredientName: string): boolean {
  if (!ingredientName) return false;
  const normalized = ingredientName.trim().toLowerCase();
  return COMMON_PANTRY_STAPLES.some(
    (staple) => normalized === staple || normalized.includes(staple)
  );
}

export const shoppingService = {
  /**
   * Generates shopping items from a recipe's missing ingredients.
   * By default, filters out common household pantry staples (salt, pepper, oil, etc.).
   */
  getShoppingListForRecipe: async (
    recipe: Recipe,
    excludeStaples: boolean = true
  ): Promise<ShoppingItem[]> => {
    if (!recipe?.missingIngredients?.length) {
      return [];
    }

    const items = excludeStaples
      ? recipe.missingIngredients.filter((ing) => !isPantryStaple(ing.name))
      : recipe.missingIngredients;

    return items.map((ingredient) => ({
      id: `shop_${ingredient.id || ingredient.name}`,
      name: ingredient.name,
      quantity: ingredient.quantity || 1,
      unit: ingredient.unit || '',
      image: ingredient.image || '',
      isPurchased: false,
      recipeName: recipe.title || recipe.name || '',
    }));
  },
};
