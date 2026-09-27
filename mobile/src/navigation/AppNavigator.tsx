import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanningScreen } from '../screens/ScanningScreen';
import { IngredientsScreen } from '../screens/IngredientsScreen';
import { PreferencesScreen } from '../screens/PreferencesScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { CookingInstructionsScreen } from '../screens/CookingInstructionsScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PdfExportScreen } from '../screens/PdfExportScreen';

export type RootStackParamList = {
  Home: undefined;
  Scanning: { imageUri?: string; base64?: string } | undefined;
  Ingredients: undefined;
  Preferences: undefined;
  Recipes: undefined;
  RecipeDetail: { recipeId?: string } | undefined;
  CookingInstructions: { recipeId?: string } | undefined;
  ShoppingList: { recipeId?: string } | undefined;
  PdfExport: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F9F7F3' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Scanning"
        component={ScanningScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Ingredients" component={IngredientsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen
        name="CookingInstructions"
        component={CookingInstructionsScreen}
      />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen
        name="PdfExport"
        component={PdfExportScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};
