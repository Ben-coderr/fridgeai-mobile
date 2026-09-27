/**
 * Image Resolver for FridgeAI
 * Provides:
 * 1. High-quality ingredient images via TheMealDB transparent PNG CDN + curated fallbacks.
 * 2. Appetizing, diverse recipe dish images via smart category matching and TheMealDB search.
 */

// ─────────────────────────────────────────────────────────────
// 1. Ingredient Image Resolver (TheMealDB CDN + Normalizer)
// ─────────────────────────────────────────────────────────────

const INGREDIENT_NAME_MAP: Record<string, string> = {
  eggs: 'Egg',
  egg: 'Egg',
  tomatoes: 'Tomato',
  tomato: 'Tomato',
  chicken: 'Chicken',
  'chicken breast': 'Chicken Breast',
  'chicken breasts': 'Chicken Breast',
  'chicken thigh': 'Chicken',
  milk: 'Milk',
  cheese: 'Cheese',
  'cheddar cheese': 'Cheddar Cheese',
  'mozzarella': 'Mozzarella',
  parmesan: 'Parmesan',
  butter: 'Butter',
  broccoli: 'Broccoli',
  carrots: 'Carrots',
  carrot: 'Carrots',
  'bell pepper': 'Bell Pepper',
  pepper: 'Bell Pepper',
  peppers: 'Bell Pepper',
  pasta: 'Penne',
  spaghetti: 'Spaghetti',
  noodles: 'Noodles',
  garlic: 'Garlic',
  'garlic cloves': 'Garlic',
  onion: 'Onion',
  onions: 'Onion',
  'red onion': 'Red Onion',
  'olive oil': 'Olive Oil',
  oil: 'Olive Oil',
  basil: 'Basil',
  'fresh basil': 'Basil',
  rice: 'Rice',
  'white rice': 'Rice',
  'brown rice': 'Rice',
  beef: 'Beef',
  steak: 'Beef',
  pork: 'Pork',
  bacon: 'Bacon',
  ham: 'Ham',
  sausage: 'Sausage',
  salmon: 'Salmon',
  tuna: 'Tuna',
  shrimp: 'Prawns',
  prawns: 'Prawns',
  fish: 'Fish',
  avocado: 'Avocado',
  lemon: 'Lemon',
  lime: 'Lime',
  potato: 'Potatoes',
  potatoes: 'Potatoes',
  spinach: 'Spinach',
  mushroom: 'Mushrooms',
  mushrooms: 'Mushrooms',
  cucumber: 'Cucumber',
  lettuce: 'Lettuce',
  bread: 'Bread',
  flour: 'Flour',
  sugar: 'Sugar',
  salt: 'Salt',
  'black pepper': 'Black Pepper',
  'soy sauce': 'Soy Sauce',
  honey: 'Honey',
  yogurt: 'Yogurt',
  cream: 'Heavy Cream',
  mayo: 'Mayonnaise',
  mayonnaise: 'Mayonnaise',
  mustard: 'Mustard',
  corn: 'Sweetcorn',
  peas: 'Peas',
  beans: 'Black Beans',
  'black beans': 'Black Beans',
  tofu: 'Tofu',
};

export function getIngredientImageUrl(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'https://www.themealdb.com/images/ingredients/Food.png';
  }

  const cleanName = name.toLowerCase().trim();

  // 1. Direct dictionary match
  if (INGREDIENT_NAME_MAP[cleanName]) {
    return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(INGREDIENT_NAME_MAP[cleanName])}.png`;
  }

  // 2. Substring match
  for (const [key, normalized] of Object.entries(INGREDIENT_NAME_MAP)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(normalized)}.png`;
    }
  }

  // 3. Fallback: Capitalize first letter of each word and try TheMealDB
  const titleCased = cleanName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(titleCased)}.png`;
}

// ─────────────────────────────────────────────────────────────
// 2. Curated High-Definition Recipe Dish Photos (Unsplash HD)
// ─────────────────────────────────────────────────────────────

const DISH_CATEGORY_IMAGES: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ['pasta', 'spaghetti', 'fettuccine', 'penne', 'macaroni', 'carbonara', 'lasagna', 'linguine'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['curry', 'tikka', 'masala', 'korma'],
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['soup', 'stew', 'broth', 'chowder', 'ramen'],
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['fried rice', 'biryani', 'risotto', 'paella', 'rice bowl'],
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['rice'],
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['stir fry', 'stir-fry', 'wok', 'teriyaki', 'asian'],
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['salad', 'greens', 'caesar', 'slaw', 'bowl'],
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['egg', 'omelette', 'omelet', 'frittata', 'scramble', 'shakshuka', 'breakfast'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['chicken', 'wings', 'drumstick', 'roast chicken'],
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['steak', 'beef', 'ribeye', 'sirloin', 'meat'],
    url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['burger', 'sandwich', 'panini', 'toast', 'wrap', 'sub'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['taco', 'tacos', 'burrito', 'quesadilla', 'fajita', 'mexican'],
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['pizza', 'flatbread', 'calzone'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['salmon', 'fish', 'tuna', 'cod', 'seafood', 'shrimp', 'prawn'],
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    keywords: ['pancake', 'pancakes', 'waffle', 'crepe', 'french toast'],
    url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
  },
];

// Fallback pool with varied delicious meals so multiple recipes don't look identical
const VARIED_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // Colorful Bowl
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', // Stir Fry
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', // Mexican Dish
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', // Rice Dish
];

/**
 * Fast local lookup for the best matching recipe image
 */
export function getCuratedRecipeImage(title: string, index = 0): string {
  if (!title) return VARIED_FALLBACK_IMAGES[index % VARIED_FALLBACK_IMAGES.length];

  const lowerTitle = title.toLowerCase();

  for (const entry of DISH_CATEGORY_IMAGES) {
    for (const keyword of entry.keywords) {
      if (lowerTitle.includes(keyword)) {
        return entry.url;
      }
    }
  }

  return VARIED_FALLBACK_IMAGES[index % VARIED_FALLBACK_IMAGES.length];
}

/**
 * Resolves a recipe image dynamically:
 * 1. Checks TheMealDB search for the recipe title (or primary keyword) with a 1.2s timeout
 * 2. Falls back to our curated high-definition food library
 */
export async function resolveRecipeImage(title: string, index = 0): Promise<string> {
  const fallbackUrl = getCuratedRecipeImage(title, index);

  if (!title || typeof title !== 'string') {
    return fallbackUrl;
  }

  // Extract a sensible search term (e.g. first 2 words or a known dish keyword)
  const lower = title.toLowerCase();
  let searchTerm = '';

  for (const entry of DISH_CATEGORY_IMAGES) {
    const matched = entry.keywords.find((k) => lower.includes(k));
    if (matched) {
      searchTerm = matched;
      break;
    }
  }

  if (!searchTerm) {
    searchTerm = title.split(' ').slice(0, 2).join(' ');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as { meals?: Array<{ strMealThumb?: string }> };
      if (data?.meals && data.meals.length > 0 && data.meals[0].strMealThumb) {
        return data.meals[0].strMealThumb;
      }
    }
  } catch {
    // Network timeout or error — quietly fallback to curated high-res image
  }

  return fallbackUrl;
}
