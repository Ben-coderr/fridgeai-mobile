import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ingredient, MealType, PreferenceType, Recipe, ShoppingItem, UserPreferences } from '../types';
import { defaultPreferences, initialDetectedIngredients, primaryRecipes, alternateRecipes } from '../data/mockData';
import { shoppingService } from '../services/shoppingService';

interface AppContextType {
  ingredients: Ingredient[];
  updateIngredientQuantity: (id: string, delta: number) => void;
  deleteIngredient: (id: string) => void;
  addIngredient: (name: string, quantity: number, unit: string) => void;
  resetIngredients: () => void;

  preferences: UserPreferences;
  setPeopleCount: (count: number) => void;
  setMealType: (type: MealType) => void;
  setPreference: (pref: PreferenceType) => void;

  recipes: Recipe[];
  selectedRecipe: Recipe;
  setSelectedRecipe: (recipe: Recipe) => void;
  generateDifferentRecipes: () => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialDetectedIngredients);
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [recipes, setRecipes] = useState<Recipe[]>(primaryRecipes);
  const [, setIsAlternate] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(primaryRecipes[0]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Initialize shopping list on mount or selected recipe change
  useEffect(() => {
    shoppingService.getShoppingListForRecipe(selectedRecipe.id).then((items) => {
      setShoppingList(items);
    });
  }, [selectedRecipe.id]);

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
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
    };
    setIngredients((prev) => [...prev, newItem]);
  };

  const resetIngredients = () => {
    setIngredients(initialDetectedIngredients);
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

  const generateDifferentRecipes = () => {
    setIsAlternate((prev) => {
      const next = !prev;
      const newRecipeSet = next ? alternateRecipes : primaryRecipes;
      setRecipes(newRecipeSet);
      setSelectedRecipe(newRecipeSet[0]);
      return next;
    });
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
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
      isPurchased: false,
      recipeName: selectedRecipe.title,
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const markAllAsPurchased = () => {
    setShoppingList((prev) => prev.map((item) => ({ ...item, isPurchased: true })));
  };

  const resetToHome = () => {
    setIngredients(initialDetectedIngredients);
    setPreferencesState(defaultPreferences);
    setRecipes(primaryRecipes);
    setIsAlternate(false);
    setSelectedRecipe(primaryRecipes[0]);
  };

  return (
    <AppContext.Provider
      value={{
        ingredients,
        updateIngredientQuantity,
        deleteIngredient,
        addIngredient,
        resetIngredients,
        preferences,
        setPeopleCount,
        setMealType,
        setPreference,
        recipes,
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
