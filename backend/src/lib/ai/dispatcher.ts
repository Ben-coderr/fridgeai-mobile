import { extractStatusCode, KeyPool } from './keyPool';
import { callGeminiVision } from './geminiProvider';
import { callOpenRouterVision } from './openrouterProvider';
import { callGroqRecipes, callGroqInstructions } from './groqProvider';
import {
  DetectedIngredientItem,
  GeneratedRecipe,
  GeneratedInstructionStep,
  ValidationError,
} from './schemas';
import {
  MOCK_DETECTED_INGREDIENTS,
  MOCK_RECIPES,
  MOCK_INSTRUCTIONS_MAP,
  DEFAULT_MOCK_INSTRUCTIONS,
} from './mockData';

// ─────────────────────────────────────────────────────────────
// Key Pools Singleton Initialization
// ─────────────────────────────────────────────────────────────
function parseKeyList(envVarNames: string[]): string[] {
  for (const name of envVarNames) {
    let val = process.env[name];
    if (val && val.trim().length > 0) {
      val = val.trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      return val
        .split(',')
        .map((k) => k.trim().replace(/^['"]+|['"]+$/g, ''))
        .filter((k) => k.length > 0);
    }
  }
  return [];
}

let geminiPoolInstance: KeyPool | null = null;
let openRouterPoolInstance: KeyPool | null = null;
let groqPoolInstance: KeyPool | null = null;

function summarizeProviderFailure(provider: string, error: unknown): string {
  const statusCode = extractStatusCode(error);
  if (error instanceof ValidationError) {
    return `${provider} returned an unusable response.`;
  }
  if (statusCode) {
    return `${provider} request failed (HTTP ${statusCode}).`;
  }
  return `${provider} request failed.`;
}

export function getGeminiPool(): KeyPool {
  if (!geminiPoolInstance) {
    const keys = parseKeyList(['GEMINI_API_KEYS', 'GEMINI_API_KEY']);
    geminiPoolInstance = new KeyPool(keys, { providerName: 'Gemini' });
  }
  return geminiPoolInstance;
}

export function getOpenRouterPool(): KeyPool {
  if (!openRouterPoolInstance) {
    const keys = parseKeyList(['OPENROUTER_API_KEYS', 'OPENROUTER_API_KEY']);
    openRouterPoolInstance = new KeyPool(keys, { providerName: 'OpenRouter' });
  }
  return openRouterPoolInstance;
}

export function getGroqPool(): KeyPool {
  if (!groqPoolInstance) {
    const keys = parseKeyList(['GROQ_API_KEYS', 'GROQ_API_KEY']);
    groqPoolInstance = new KeyPool(keys, { providerName: 'Groq' });
  }
  return groqPoolInstance;
}

// Helper to reset pools for testing
export function _resetPoolsForTesting(
  geminiKeys: string[] = [],
  openRouterKeys: string[] = [],
  groqKeys: string[] = []
) {
  geminiPoolInstance = new KeyPool(geminiKeys, { providerName: 'Gemini' });
  openRouterPoolInstance = new KeyPool(openRouterKeys, { providerName: 'OpenRouter' });
  groqPoolInstance = new KeyPool(groqKeys, { providerName: 'Groq' });
}

// ─────────────────────────────────────────────────────────────
// 1. Vision Dispatcher: Gemini -> OpenRouter
// ─────────────────────────────────────────────────────────────
export interface VisionDispatchResult {
  source: 'gemini' | 'openrouter' | 'mock';
  ingredients: DetectedIngredientItem[];
}

export async function dispatchVision(
  imageBuffer: Buffer,
  mimeType: string
): Promise<VisionDispatchResult> {
  // Check mock mode
  if (process.env.MOCK_AI === 'true') {
    console.log('[Dispatcher:Vision] MOCK_AI is enabled. Returning mock ingredients.');
    return { source: 'mock', ingredients: MOCK_DETECTED_INGREDIENTS };
  }

  const failures: string[] = [];

  // Tier 1: Gemini Pool
  const geminiPool = getGeminiPool();
  if (geminiPool.size() > 0) {
    try {
      console.log('[Dispatcher:Vision] Attempting Tier 1 (Gemini)...');
      const ingredients = await geminiPool.executeWithRetry((key) =>
        callGeminiVision(key, imageBuffer, mimeType)
      );
      console.log('[Dispatcher:Vision] Gemini succeeded.');
      return { source: 'gemini', ingredients };
    } catch (err) {
      const message = (err as Error).message || 'Unknown Gemini error';
      failures.push(summarizeProviderFailure('Gemini', err));
      console.warn(
        `[Dispatcher:Vision] Gemini Tier 1 failed (${message}). Failing over to OpenRouter Tier 2...`
      );
    }
  } else {
    console.log('[Dispatcher:Vision] No Gemini keys configured. Skipping to Tier 2...');
  }

  // Tier 2: OpenRouter Pool
  const openRouterPool = getOpenRouterPool();
  if (openRouterPool.size() > 0) {
    try {
      console.log('[Dispatcher:Vision] Attempting Tier 2 (OpenRouter)...');
      const ingredients = await openRouterPool.executeWithRetry((key) =>
        callOpenRouterVision(key, imageBuffer, mimeType)
      );
      console.log('[Dispatcher:Vision] OpenRouter succeeded.');
      return { source: 'openrouter', ingredients };
    } catch (err) {
      const message = (err as Error).message || 'Unknown OpenRouter error';
      failures.push(summarizeProviderFailure('OpenRouter', err));
      console.warn(`[Dispatcher:Vision] OpenRouter failed: ${message}`);
    }
  } else {
    console.log('[Dispatcher:Vision] No OpenRouter keys configured.');
  }

  throw new Error(
    `Image analysis failed with all configured AI providers. ${failures.join(' | ') || 'No provider keys are configured.'}`
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Recipes Dispatcher: Groq (Primary) -> Groq (Backup Model) -> Mock
// ─────────────────────────────────────────────────────────────
export interface RecipesDispatchResult {
  source: 'groq' | 'mock';
  recipes: GeneratedRecipe[];
}

/**
 * Calculates backend ingredient coverage score and marks the best match.
 * Sorts recipes by coverage ratio: availableCount / (availableCount + missingCount).
 */
export function scoreAndRankRecipes(recipes: GeneratedRecipe[]): GeneratedRecipe[] {
  if (recipes.length === 0) return [];

  const scored = recipes.map((recipe) => {
    const availCount = recipe.availableIngredients?.length || 0;
    const missCount = recipe.missingIngredients?.length || 0;
    const total = availCount + missCount;
    const coverage = total > 0 ? availCount / total : 0;
    return { ...recipe, _coverage: coverage };
  });

  // Sort descending by coverage
  scored.sort((a, b) => b._coverage - a._coverage);

  // Take maximum 3 recipes
  const top3 = scored.slice(0, 3);

  // Highest coverage recipe is best match
  return top3.map((recipe, idx) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _coverage, ...cleanRecipe } = recipe;
    return {
      ...cleanRecipe,
      isBestMatch: idx === 0,
      image:
        cleanRecipe.image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    };
  });
}

export async function dispatchRecipes(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  preferences: { peopleCount: number; mealType: string; preference: string }
): Promise<RecipesDispatchResult> {
  if (process.env.MOCK_AI === 'true') {
    console.log('[Dispatcher:Recipes] MOCK_AI is enabled. Returning mock recipes.');
    return { source: 'mock', recipes: scoreAndRankRecipes(MOCK_RECIPES) };
  }

  const groqPool = getGroqPool();

  if (groqPool.size() > 0) {
    // Tier 1: Groq with primary model
    try {
      console.log('[Dispatcher:Recipes] Attempting Groq primary model...');
      const recipes = await groqPool.executeWithRetry((key) =>
        callGroqRecipes(key, ingredients, preferences, { useBackupModel: false })
      );
      console.log('[Dispatcher:Recipes] Groq primary model succeeded.');
      return { source: 'groq', recipes: scoreAndRankRecipes(recipes) };
    } catch (err) {
      console.warn(
        `[Dispatcher:Recipes] Groq primary model failed (${(err as Error).message}). Attempting backup model...`
      );
    }

    // Tier 2: Groq with backup model
    try {
      console.log('[Dispatcher:Recipes] Attempting Groq backup model...');
      const recipes = await groqPool.executeWithRetry((key) =>
        callGroqRecipes(key, ingredients, preferences, { useBackupModel: true })
      );
      console.log('[Dispatcher:Recipes] Groq backup model succeeded.');
      return { source: 'groq', recipes: scoreAndRankRecipes(recipes) };
    } catch (err) {
      console.warn(`[Dispatcher:Recipes] Groq backup model failed: ${(err as Error).message}`);
    }
  } else {
    console.log('[Dispatcher:Recipes] No Groq keys configured. Skipping to Mock Tier...');
  }

  throw new Error('Recipe generation failed with all configured AI models. Check backend logs and Groq keys.');
}

// ─────────────────────────────────────────────────────────────
// 3. Instructions Dispatcher: Groq (Primary) -> Groq (Backup Model) -> Mock
// ─────────────────────────────────────────────────────────────
export interface InstructionsDispatchResult {
  source: 'groq' | 'mock';
  instructions: GeneratedInstructionStep[];
}

export async function dispatchInstructions(recipeDetails: {
  recipeId?: string;
  recipeTitle: string;
  servings: number;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
}): Promise<InstructionsDispatchResult> {
  if (process.env.MOCK_AI === 'true') {
    console.log('[Dispatcher:Instructions] MOCK_AI is enabled. Returning mock instructions.');
    const mockSteps =
      (recipeDetails.recipeId && MOCK_INSTRUCTIONS_MAP[recipeDetails.recipeId]) ||
      DEFAULT_MOCK_INSTRUCTIONS;
    return { source: 'mock', instructions: mockSteps };
  }

  const groqPool = getGroqPool();

  if (groqPool.size() > 0) {
    // Tier 1: Groq with primary model
    try {
      console.log('[Dispatcher:Instructions] Attempting Groq primary model...');
      const instructions = await groqPool.executeWithRetry((key) =>
        callGroqInstructions(key, recipeDetails, { useBackupModel: false })
      );
      console.log('[Dispatcher:Instructions] Groq primary model succeeded.');
      return { source: 'groq', instructions };
    } catch (err) {
      console.warn(
        `[Dispatcher:Instructions] Groq primary model failed (${(err as Error).message}). Attempting backup model...`
      );
    }

    // Tier 2: Groq with backup model
    try {
      console.log('[Dispatcher:Instructions] Attempting Groq backup model...');
      const instructions = await groqPool.executeWithRetry((key) =>
        callGroqInstructions(key, recipeDetails, { useBackupModel: true })
      );
      console.log('[Dispatcher:Instructions] Groq backup model succeeded.');
      return { source: 'groq', instructions };
    } catch (err) {
      console.warn(`[Dispatcher:Instructions] Groq backup model failed: ${(err as Error).message}`);
    }
  } else {
    console.log('[Dispatcher:Instructions] No Groq keys configured. Skipping to Mock Tier...');
  }

  throw new Error('Recipe instructions could not be generated. Check backend logs and Groq keys.');
}
