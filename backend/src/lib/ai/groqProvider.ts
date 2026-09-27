import { RECIPES_SYSTEM_PROMPT, INSTRUCTIONS_SYSTEM_PROMPT } from './prompts';
import {
  extractAndParseJson,
  validateRecipesResponse,
  validateInstructionsResponse,
  GeneratedRecipe,
  GeneratedInstructionStep,
} from './schemas';

export interface GroqTextOptions {
  model?: string;
  timeoutMs?: number;
  useBackupModel?: boolean;
}

export async function callGroqRecipes(
  apiKey: string,
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  preferences: { peopleCount: number; mealType: string; preference: string },
  options?: GroqTextOptions
): Promise<GeneratedRecipe[]> {
  const primaryModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const backupModel = process.env.GROQ_BACKUP_MODEL || 'llama-3.1-8b-instant';
  const modelName = options?.model || (options?.useBackupModel ? backupModel : primaryModel);
  const timeoutMs = options?.timeoutMs || 20_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const userPrompt = `Here are the available fridge ingredients:
${JSON.stringify(ingredients, null, 2)}

User preferences:
- Servings/People: ${preferences.peopleCount}
- Meal Type: ${preferences.mealType}
- Dietary/Goal Preference: ${preferences.preference}

Generate at most 3 recipes using these ingredients.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: RECIPES_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const err = new Error(`Groq API error ${response.status}: ${errorText}`);
      (err as unknown as Record<string, unknown>).status = response.status;
      throw err;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty completion content.');
    }

    return extractAndParseJson(content, validateRecipesResponse);
  } finally {
    clearTimeout(timer);
  }
}

export async function callGroqInstructions(
  apiKey: string,
  recipeDetails: {
    recipeTitle: string;
    servings: number;
    ingredients: Array<{ name: string; quantity: number; unit: string }>;
  },
  options?: GroqTextOptions
): Promise<GeneratedInstructionStep[]> {
  const primaryModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const backupModel = process.env.GROQ_BACKUP_MODEL || 'llama-3.1-8b-instant';
  const modelName = options?.model || (options?.useBackupModel ? backupModel : primaryModel);
  const timeoutMs = options?.timeoutMs || 20_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const userPrompt = `Recipe: ${recipeDetails.recipeTitle}
Servings: ${recipeDetails.servings}
Ingredients:
${JSON.stringify(recipeDetails.ingredients, null, 2)}

Provide clear numbered cooking instructions for this meal.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: INSTRUCTIONS_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const err = new Error(`Groq API error ${response.status}: ${errorText}`);
      (err as unknown as Record<string, unknown>).status = response.status;
      throw err;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty completion content.');
    }

    return extractAndParseJson(content, validateInstructionsResponse);
  } finally {
    clearTimeout(timer);
  }
}
