export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  image: string;
  category?: string;
}

export interface RecipeStep {
  id: string;
  step: number;
  title: string;
  description: string;
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  cookingTime: number; // in minutes
  prepTime: number;    // in minutes
  servings: number;
  difficulty: string;  // 'Easy' | 'Medium' | 'Hard'
  isBestMatch?: boolean;
  availableIngredients: Ingredient[];
  missingIngredients: Ingredient[];
  instructions: RecipeStep[];
  isFavorite?: boolean;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type PreferenceType = 'Quick' | 'Healthy' | 'High Protein' | 'Budget';

export interface UserPreferences {
  peopleCount: number;
  mealType: MealType;
  preference: PreferenceType;
  vegetarianOnly?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  image: string;
  isPurchased: boolean;
  recipeName?: string;
}

export type ScanningStepStatus = 'pending' | 'active' | 'completed';

export interface ScanningStep {
  id: number;
  title: string;
  subtitle: string;
  status: ScanningStepStatus;
}
