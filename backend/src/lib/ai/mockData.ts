import { DetectedIngredientItem, GeneratedRecipe, GeneratedInstructionStep } from './schemas';

// ─────────────────────────────────────────────────────────────
// 1. Deterministic Mock Detected Ingredients
// ─────────────────────────────────────────────────────────────
export const MOCK_DETECTED_INGREDIENTS: DetectedIngredientItem[] = [
  { name: 'Eggs', quantity: 6, unit: 'pcs', category: 'Dairy & Eggs' },
  { name: 'Tomatoes', quantity: 3, unit: 'pcs', category: 'Produce' },
  { name: 'Chicken breast', quantity: 2, unit: 'pcs', category: 'Meat' },
  { name: 'Milk', quantity: 1, unit: 'bottle', category: 'Dairy & Eggs' },
  { name: 'Cheddar Cheese', quantity: 1, unit: 'block', category: 'Dairy & Eggs' },
  { name: 'Broccoli', quantity: 1, unit: 'head', category: 'Produce' },
  { name: 'Carrots', quantity: 3, unit: 'pcs', category: 'Produce' },
  { name: 'Bell pepper', quantity: 1, unit: 'pc', category: 'Produce' },
];

// ─────────────────────────────────────────────────────────────
// 2. Deterministic Mock Recipes
// ─────────────────────────────────────────────────────────────
export const MOCK_RECIPES: GeneratedRecipe[] = [
  {
    id: 'mediterranean-shakshuka',
    name: 'Mediterranean Shakshuka',
    title: 'Mediterranean Shakshuka',
    description: 'Poached eggs nestled in a spiced, simmered tomato and sweet bell pepper sauce.',
    cookingTime: 20,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    isBestMatch: true,
    availableIngredients: [
      { name: 'Eggs', quantity: 4, unit: 'pcs' },
      { name: 'Tomatoes', quantity: 3, unit: 'pcs' },
      { name: 'Bell pepper', quantity: 1, unit: 'pc' },
    ],
    missingIngredients: [
      { name: 'Olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'Cumin & Paprika', quantity: 1, unit: 'tsp' },
    ],
    instructions: [
      {
        id: 'shak-1',
        step: 1,
        title: 'Sauté Veggies',
        description: 'Heat olive oil in a skillet. Sauté chopped bell pepper and minced garlic until softened (about 4 minutes).',
      },
      {
        id: 'shak-2',
        step: 2,
        title: 'Simmer Tomato Sauce',
        description: 'Add diced tomatoes, cumin, and paprika. Simmer on medium-low for 10 minutes until thick and fragrant.',
      },
      {
        id: 'shak-3',
        step: 3,
        title: 'Poach Eggs',
        description: 'Make 4 small hollows in the sauce. Crack an egg into each hollow. Cover and cook on low heat for 5-7 minutes.',
      },
      {
        id: 'shak-4',
        step: 4,
        title: 'Garnish & Serve',
        description: 'Remove from heat. Season with cracked pepper and fresh herbs. Serve hot directly from the pan.',
      },
    ],
  },
  {
    id: 'creamy-chicken-broccoli',
    name: 'Pan-Seared Chicken & Broccoli',
    title: 'Pan-Seared Chicken & Broccoli',
    description: 'Juicy golden chicken breast paired with crisp-tender broccoli in a light savory sauce.',
    cookingTime: 25,
    prepTime: 10,
    servings: 2,
    difficulty: 'Medium',
    isBestMatch: false,
    availableIngredients: [
      { name: 'Chicken breast', quantity: 2, unit: 'pcs' },
      { name: 'Broccoli', quantity: 1, unit: 'head' },
      { name: 'Milk', quantity: 100, unit: 'ml' },
    ],
    missingIngredients: [
      { name: 'Butter', quantity: 1, unit: 'tbsp' },
      { name: 'Garlic powder', quantity: 1, unit: 'tsp' },
      { name: 'Salt & Pepper', quantity: 1, unit: 'pinch' },
    ],
    instructions: [
      {
        id: 'chick-1',
        step: 1,
        title: 'Prepare Chicken',
        description: 'Slice chicken breasts horizontally into cutlets. Season both sides with garlic powder, salt, and pepper.',
      },
      {
        id: 'chick-2',
        step: 2,
        title: 'Steam Broccoli',
        description: 'Cut broccoli into florets. Steam or blanch in boiling water for 3 minutes until vibrant green, then drain.',
      },
      {
        id: 'chick-3',
        step: 3,
        title: 'Sear Chicken',
        description: 'Melt butter in a pan over medium-high heat. Sear chicken for 4-5 minutes per side until golden brown.',
      },
      {
        id: 'chick-4',
        step: 4,
        title: 'Combine & Finish',
        description: 'Reduce heat, pour in milk and swirl to deglaze pan juices. Add steamed broccoli, toss for 2 minutes and serve.',
      },
    ],
  },
  {
    id: 'garden-veggie-frittata',
    name: 'Garden Veggie Frittata',
    title: 'Garden Veggie Frittata',
    description: 'Fluffy baked egg skillet packed with sweet carrots, bell pepper, and melted cheddar.',
    cookingTime: 18,
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    isBestMatch: false,
    availableIngredients: [
      { name: 'Eggs', quantity: 5, unit: 'pcs' },
      { name: 'Carrots', quantity: 2, unit: 'pcs' },
      { name: 'Cheddar Cheese', quantity: 50, unit: 'g' },
      { name: 'Bell pepper', quantity: 1, unit: 'pc' },
    ],
    missingIngredients: [
      { name: 'Olive oil', quantity: 1, unit: 'tbsp' },
      { name: 'Black pepper', quantity: 1, unit: 'pinch' },
    ],
    instructions: [
      {
        id: 'frit-1',
        step: 1,
        title: 'Whisk Eggs',
        description: 'Crack eggs into a large bowl, season with black pepper, and whisk vigorously until frothy.',
      },
      {
        id: 'frit-2',
        step: 2,
        title: 'Sauté Veggies',
        description: 'Heat oil in an oven-safe skillet. Sauté finely diced carrots and bell pepper for 4 minutes until tender.',
      },
      {
        id: 'frit-3',
        step: 3,
        title: 'Pour & Melt Cheese',
        description: 'Pour whisked eggs over vegetables. Scatter shredded cheddar evenly across the top.',
      },
      {
        id: 'frit-4',
        step: 4,
        title: 'Cook to Golden',
        description: 'Cook covered on low heat for 8 minutes until eggs are set and cheese is completely melted.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 3. Deterministic Mock Instructions by Recipe ID
// ─────────────────────────────────────────────────────────────
export const MOCK_INSTRUCTIONS_MAP: Record<string, GeneratedInstructionStep[]> = {
  'mediterranean-shakshuka': MOCK_RECIPES[0].instructions!,
  'creamy-chicken-broccoli': MOCK_RECIPES[1].instructions!,
  'garden-veggie-frittata': MOCK_RECIPES[2].instructions!,
};

export const DEFAULT_MOCK_INSTRUCTIONS: GeneratedInstructionStep[] = [
  {
    id: 'default-1',
    step: 1,
    title: 'Prep Ingredients',
    description: 'Rinse, peel, and chop all ingredients according to the recipe specifications.',
  },
  {
    id: 'default-2',
    step: 2,
    title: 'Heat Skillet & Aromatics',
    description: 'Warm a large pan or skillet over medium heat with a light drizzle of cooking oil.',
  },
  {
    id: 'default-3',
    step: 3,
    title: 'Cook Main Ingredients',
    description: 'Add your primary ingredients into the pan, stirring occasionally until thoroughly cooked.',
  },
  {
    id: 'default-4',
    step: 4,
    title: 'Season & Serve',
    description: 'Taste and adjust seasonings with salt and pepper. Plate and serve immediately while warm.',
  },
];
