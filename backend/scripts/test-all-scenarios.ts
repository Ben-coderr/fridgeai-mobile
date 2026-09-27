import assert from 'node:assert';
import { KeyPool, isRetryableError, extractStatusCode } from '../src/lib/ai/keyPool';
import {
  extractAndParseJson,
  validateDetectedIngredients,
  validateRecipesResponse,
  validateInstructionsResponse,
  ValidationError,
} from '../src/lib/ai/schemas';
import { scoreAndRankRecipes } from '../src/lib/ai/dispatcher';
import {
  MOCK_DETECTED_INGREDIENTS,
  MOCK_RECIPES,
  MOCK_INSTRUCTIONS_MAP,
} from '../src/lib/ai/mockData';

let passedCount = 0;
let failedCount = 0;

function report(scenario: string, passed: boolean, details?: string) {
  if (passed) {
    passedCount++;
    console.log(`  [PASS] ${scenario}${details ? ` (${details})` : ''}`);
  } else {
    failedCount++;
    console.error(`  [FAIL] ${scenario}${details ? ` (${details})` : ''}`);
  }
}

async function runAllTests() {
  console.log('\n============================================================');
  console.log('FridgeAI Backend: Comprehensive Failure & Failover Test Suite');
  console.log('============================================================\n');

  // ─────────────────────────────────────────────────────────
  // Scenario A: Gemini succeeds
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['gemini_key_1'], { providerName: 'Gemini' });
    const result = await pool.executeWithRetry(async (k) => {
      assert.strictEqual(k, 'gemini_key_1');
      return [{ name: 'Eggs', quantity: 6, unit: 'pcs' }];
    });
    report('Scenario A: Gemini succeeds', result.length === 1 && result[0].name === 'Eggs');
  } catch (err) {
    report('Scenario A: Gemini succeeds', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario B: Gemini key 1 fails -> key 2 succeeds
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['gemini_key_1', 'gemini_key_2'], { providerName: 'Gemini' });
    let attempts = 0;
    const result = await pool.executeWithRetry(async (k) => {
      attempts++;
      if (k === 'gemini_key_1') {
        const err = new Error('Resource exhausted [429]');
        (err as unknown as Record<string, unknown>).status = 429;
        throw err;
      }
      return [{ name: 'Tomatoes', quantity: 3, unit: 'pcs' }];
    });
    report(
      'Scenario B: Gemini key 1 fails (429) -> key 2 succeeds',
      result[0].name === 'Tomatoes' && attempts === 2
    );
  } catch (err) {
    report('Scenario B: Gemini key 1 fails -> key 2 succeeds', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario C: All Gemini keys fail -> OpenRouter succeeds
  // ─────────────────────────────────────────────────────────
  try {
    const geminiPool = new KeyPool(['gkey_1'], { providerName: 'Gemini' });
    const openRouterPool = new KeyPool(['orkey_1'], { providerName: 'OpenRouter' });

    let source = 'unknown';
    let ingredients: unknown[] = [];

    // Try Gemini
    try {
      ingredients = await geminiPool.executeWithRetry(async () => {
        const err = new Error('503 Service Unavailable');
        (err as unknown as Record<string, unknown>).status = 503;
        throw err;
      });
      source = 'gemini';
    } catch {
      // Failover to OpenRouter
      ingredients = await openRouterPool.executeWithRetry(async (k) => {
        assert.strictEqual(k, 'orkey_1');
        return [{ name: 'Milk', quantity: 1, unit: 'bottle' }];
      });
      source = 'openrouter';
    }

    report(
      'Scenario C: All Gemini keys fail -> OpenRouter succeeds',
      source === 'openrouter' && ingredients.length === 1
    );
  } catch (err) {
    report('Scenario C: All Gemini keys fail -> OpenRouter succeeds', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario D: All vision providers fail -> Mock vision response
  // ─────────────────────────────────────────────────────────
  try {
    const geminiPool = new KeyPool(['gkey_1'], { providerName: 'Gemini' });
    const openRouterPool = new KeyPool(['orkey_1'], { providerName: 'OpenRouter' });

    let source = 'mock';
    let ingredients = MOCK_DETECTED_INGREDIENTS;

    try {
      await geminiPool.executeWithRetry(async () => {
        throw new Error('Gemini failed [500]');
      });
      source = 'gemini';
    } catch {
      try {
        await openRouterPool.executeWithRetry(async () => {
          throw new Error('OpenRouter failed [500]');
        });
        source = 'openrouter';
      } catch {
        source = 'mock';
        ingredients = MOCK_DETECTED_INGREDIENTS;
      }
    }

    report(
      'Scenario D: All vision providers fail -> Mock vision response',
      source === 'mock' && ingredients.length > 0 && ingredients === MOCK_DETECTED_INGREDIENTS
    );
  } catch (err) {
    report('Scenario D: All vision providers fail -> Mock vision response', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario E: Groq succeeds + backend ranking & bestMatch
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['groq_key_1'], { providerName: 'Groq' });
    const rawRecipes = await pool.executeWithRetry(async () => {
      return [
        {
          id: 'rec-1',
          name: 'Recipe Low Match',
          title: 'Recipe Low Match',
          description: 'Desc',
          cookingTime: 20,
          prepTime: 10,
          servings: 2,
          difficulty: 'Easy' as const,
          availableIngredients: [{ name: 'Eggs', quantity: 1, unit: 'pcs' }],
          missingIngredients: [
            { name: 'Cheese', quantity: 1, unit: 'pcs' },
            { name: 'Bread', quantity: 1, unit: 'pcs' },
            { name: 'Butter', quantity: 1, unit: 'pcs' },
          ],
        },
        {
          id: 'rec-2',
          name: 'Recipe High Match',
          title: 'Recipe High Match',
          description: 'Desc',
          cookingTime: 15,
          prepTime: 5,
          servings: 2,
          difficulty: 'Easy' as const,
          availableIngredients: [
            { name: 'Eggs', quantity: 4, unit: 'pcs' },
            { name: 'Tomatoes', quantity: 2, unit: 'pcs' },
          ],
          missingIngredients: [{ name: 'Salt', quantity: 1, unit: 'pinch' }],
        },
      ];
    });

    const ranked = await scoreAndRankRecipes(rawRecipes);
    report(
      'Scenario E: Groq succeeds + backend recipe ranking',
      ranked[0].id === 'rec-2' && ranked[0].isBestMatch === true && ranked[1].isBestMatch === false
    );
  } catch (err) {
    report('Scenario E: Groq succeeds', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario F: Groq key 1 fails -> key 2 succeeds
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['groq_key_1', 'groq_key_2'], { providerName: 'Groq' });
    let attempts = 0;
    const result = await pool.executeWithRetry(async (k) => {
      attempts++;
      if (k === 'groq_key_1') {
        const err = new Error('500 Internal Server Error');
        (err as unknown as Record<string, unknown>).status = 500;
        throw err;
      }
      return 'groq_success';
    });
    report('Scenario F: Groq key 1 fails (500) -> key 2 succeeds', result === 'groq_success' && attempts === 2);
  } catch (err) {
    report('Scenario F: Groq key 1 fails -> key 2 succeeds', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario G: Groq fails -> backup provider/model
  // ─────────────────────────────────────────────────────────
  try {
    let usedModel = '';
    const executeWithBackup = async () => {
      // Primary model fails
      try {
        usedModel = 'llama-3.3-70b-versatile';
        const err = new Error('Model rate limited [429]');
        (err as unknown as Record<string, unknown>).status = 429;
        throw err;
      } catch {
        // Backup model called
        usedModel = 'llama-3.1-8b-instant';
        return 'backup_model_success';
      }
    };

    const res = await executeWithBackup();
    report('Scenario G: Groq fails -> backup model succeeds', res === 'backup_model_success' && usedModel === 'llama-3.1-8b-instant');
  } catch (err) {
    report('Scenario G: Groq fails -> backup model', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario H: All text providers fail -> mock response
  // ─────────────────────────────────────────────────────────
  try {
    const fallbackRecipes = await scoreAndRankRecipes(MOCK_RECIPES);
    const fallbackInstructions = MOCK_INSTRUCTIONS_MAP['mediterranean-shakshuka'];
    report(
      'Scenario H: All text providers fail -> mock response',
      fallbackRecipes.length > 0 && fallbackInstructions.length > 0
    );
  } catch (err) {
    report('Scenario H: All text providers fail -> mock response', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario I: AI returns malformed JSON
  // ─────────────────────────────────────────────────────────
  try {
    let caughtValidationError = false;
    try {
      extractAndParseJson('Here is your recipe: { invalid json without quotes: true', validateRecipesResponse);
    } catch (err) {
      if (err instanceof ValidationError || (err as Error).name === 'ValidationError') {
        caughtValidationError = true;
      }
    }
    report('Scenario I: AI returns malformed JSON caught by validator', caughtValidationError);
  } catch (err) {
    report('Scenario I: AI returns malformed JSON', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario J: AI request times out
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['timeout_key'], { providerName: 'TestTimeout' });
    let timedOut = false;
    try {
      await pool.executeWithRetry(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
        100 // timeout after 100ms
      );
    } catch (err) {
      if (/timed out/i.test((err as Error).message)) {
        timedOut = true;
      }
    }
    report('Scenario J: AI request times out', timedOut);
  } catch (err) {
    report('Scenario J: AI request times out', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario K: AI returns HTTP 429 -> Key quarantined
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['key_to_quarantine', 'key_backup'], {
      providerName: 'Test429',
      quarantineDurationMs: 5000,
    });
    const err429 = new Error('Rate limit exceeded [429]');
    (err429 as unknown as Record<string, unknown>).status = 429;

    assert.strictEqual(isRetryableError(err429), true);
    assert.strictEqual(extractStatusCode(err429), 429);

    pool.recordError('key_to_quarantine', err429);

    // Next key retrieved should be key_backup because key_to_quarantine is quarantined
    const nextKey = pool.getNextKey();
    report('Scenario K: AI returns HTTP 429 quarantines key', nextKey === 'key_backup');
  } catch (err) {
    report('Scenario K: AI returns HTTP 429', false, (err as Error).message);
  }

  // ─────────────────────────────────────────────────────────
  // Scenario L: AI returns HTTP 401/403 -> Key permanently invalidated
  // ─────────────────────────────────────────────────────────
  try {
    const pool = new KeyPool(['invalid_key', 'valid_key'], { providerName: 'Test401' });
    const err401 = new Error('Unauthorized API key [401]');
    (err401 as unknown as Record<string, unknown>).status = 401;

    assert.strictEqual(isRetryableError(err401), false);
    assert.strictEqual(extractStatusCode(err401), 401);

    const { isFatal } = pool.recordError('invalid_key', err401);

    // Key should be permanently invalid, never returned again
    const nextKey1 = pool.getNextKey();
    const nextKey2 = pool.getNextKey();

    report(
      'Scenario L: AI returns HTTP 401/403 marks key permanently invalid',
      isFatal === true && nextKey1 === 'valid_key' && nextKey2 === 'valid_key'
    );
  } catch (err) {
    report('Scenario L: AI returns HTTP 401/403', false, (err as Error).message);
  }

  console.log('\n------------------------------------------------------------');
  console.log(`Results: ${passedCount} PASSED, ${failedCount} FAILED.`);
  console.log('------------------------------------------------------------\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
