import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ingredient, MealType, PreferenceType, Recipe, ShoppingItem, UserPreferences } from '../types';
import { defaultPreferences } from '../data/mockData';
import { shoppingService } from '../services/shoppingService';
import { recipeService } from '../services/recipeService';
import { getIngredientImage } from '../utils/imageHelper';

interface AppContextType {
  ingredients: Ingredient[];
  setDetectedIngredients: (items: Ingredient[]) => void;
  updateIngredientQuantity: (id: string, delta: number) => void;
  deleteIngredient: (id: string) => void;
  addIngredient: (name: string, quantity: number, unit: string) => void;
  resetIngredients: () => void;

  preferences: UserPreferences;
  setPeopleCount: (count: number) => void;
  setMealType: (type: MealType) => void;
  setPreference: (pref: PreferenceType) => void;
  setVegetarianOnly: (val: boolean) => void;

  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  selectedRecipe: Recipe;
  setSelectedRecipe: (recipe: Recipe) => void;
  generateDifferentRecipes: () => Promise<void>;
  favorites: Record<string, boolean>;
  toggleFavorite: (recipeId: string) => void;

  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  updateShoppingQuantity: (id: string, delta: number) => void;
  addShoppingItem: (name: string, quantity: number, unit: string) => void;
  markAllAsPurchased: () => void;

  resetToHome: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptyRecipe: Recipe = {
  id: '', name: '', title: '', description: '', image: '', cookingTime: 0,
  prepTime: 0, servings: 1, difficulty: '', availableIngredients: [],
  missingIngredients: [], instructions: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(emptyRecipe);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Initialize shopping list on mount or selected recipe change
  useEffect(() => {
    shoppingService.getShoppingListForRecipe(selectedRecipe).then((items) => {
      setShoppingList(items);
    });
  }, [selectedRecipe]);

  const setDetectedIngredients = (items: Ingredient[]) => {
    setIngredients(items);
  };

  const updateIngredientQuantity = (id: string, delta: number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === id) {
          const newQty = Math.max(1, ing.quantity + delta);
          return { ...ing, quantity: newQty };
        }
        return ing;
      })
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const addIngredient = (name: string, quantity: number, unit: string) => {
    const newItem: Ingredient = {
      id: `custom_${Date.now()}`,
      name,
      quantity,
      unit,
      image: getIngredientImage(name),
    };
    setIngredients((prev) => [...prev, newItem]);
  };

  const resetIngredients = () => {
    setIngredients([]);
  };

  const setPeopleCount = (count: number) => {
    setPreferencesState((prev) => ({ ...prev, peopleCount: Math.max(1, count) }));
  };

  const setMealType = (type: MealType) => {
    setPreferencesState((prev) => ({ ...prev, mealType: type }));
  };

  const setPreference = (pref: PreferenceType) => {
    setPreferencesState((prev) => ({ ...prev, preference: pref }));
  };

  const setVegetarianOnly = (val: boolean) => {
    setPreferencesState((prev) => ({ ...prev, vegetarianOnly: val }));
  };

  const generateDifferentRecipes = async () => {
    const generated = await recipeService.getRecipes(preferences, ingredients);
    setRecipes(generated);
    if (generated.length > 0) setSelectedRecipe(generated[0]);
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites((prev) => ({
      ...prev,
      [recipeId]: !prev[recipeId],
    }));
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPurchased: !item.isPurchased } : item))
    );
  };

  const updateShoppingQuantity = (id: string, delta: number) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const addShoppingItem = (name: string, quantity: number, unit: string) => {
    const newItem: ShoppingItem = {
      id: `custom_shop_${Date.now()}`,
      name,
      quantity,
      unit,
      image: getIngredientImage(name),
      isPurchased: false,
      recipeName: selectedRecipe.title,
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const markAllAsPurchased = () => {
    setShoppingList((prev) => prev.map((item) => ({ ...item, isPurchased: true })));
  };

  const resetToHome = () => {
    setIngredients([]);
    setPreferencesState(defaultPreferences);
    setRecipes([]);
    setSelectedRecipe(emptyRecipe);
  };

  return (
    <AppContext.Provider
      value={{
        ingredients,
        setDetectedIngredients,
        updateIngredientQuantity,
        deleteIngredient,
        addIngredient,
        resetIngredients,
        preferences,
        setPeopleCount,
        setMealType,
        setPreference,
        setVegetarianOnly,
        recipes,
        setRecipes,
        selectedRecipe,
        setSelectedRecipe,
        generateDifferentRecipes,
        favorites,
        toggleFavorite,
        shoppingList,
        toggleShoppingItem,
        updateShoppingQuantity,
        addShoppingItem,
        markAllAsPurchased,
        resetToHome,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
