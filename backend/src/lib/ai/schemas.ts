/**
 * Strict schema validation for AI responses.
 *
 * Every AI response must pass:
 * JSON.parse() -> schema validation -> accepted/rejected.
 *
 * Invalid AI output throws a ValidationError so the caller can trigger
 * retry with the next key, next provider, or fallback to mock data.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(`[Schema ValidationError] ${message}`);
    this.name = 'ValidationError';
  }
}

// ─────────────────────────────────────────────────────────────
// 1. Vision: Detected Ingredients
// ─────────────────────────────────────────────────────────────
export interface DetectedIngredientItem {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

export function validateDetectedIngredients(data: unknown): DetectedIngredientItem[] {
  let list: unknown[] = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object' && 'ingredients' in data && Array.isArray((data as { ingredients: unknown }).ingredients)) {
    list = (data as { ingredients: unknown[] }).ingredients;
  } else {
    throw new ValidationError('Expected an array of detected ingredients or an object with an "ingredients" array.');
  }

  if (list.length === 0) {
    throw new ValidationError('Ingredient list cannot be empty.');
  }

  return list.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(`Item at index ${idx} is not an object.`);
    }

    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === 'string' && obj.name.trim().length > 0 ? obj.name.trim() : null;
    if (!name) {
      throw new ValidationError(`Item at index ${idx} is missing a valid 'name'.`);
    }

    const quantity = typeof obj.quantity === 'number' && !isNaN(obj.quantity) && obj.quantity > 0
      ? obj.quantity
      : 1;

    const unit = typeof obj.unit === 'string' && obj.unit.trim().length > 0
      ? obj.unit.trim()
      : 'pcs';

    const category = typeof obj.category === 'string' && obj.category.trim().length > 0
      ? obj.category.trim()
      : undefined;

    return { name, quantity, unit, category };
  });
}

// ─────────────────────────────────────────────────────────────
// 2. Text: Generated Recipes
// ─────────────────────────────────────────────────────────────
export interface GeneratedIngredientSummary {
  name: string;
  quantity: number;
  unit: string;
}

export interface GeneratedInstructionStep {
  id: string;
  step: number;
  title: string;
  description: string;
  image?: string;
}

export interface GeneratedRecipe {
  id: string;
  name: string;
  title: string;
  description: string;
  cookingTime: number;
  prepTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  availableIngredients: GeneratedIngredientSummary[];
  missingIngredients: GeneratedIngredientSummary[];
  instructions?: GeneratedInstructionStep[];
  isBestMatch?: boolean;
  image?: string;
}

function parseIngredientList(raw: unknown, label: string): GeneratedIngredientSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(`${label} at index ${idx} is not an object.`);
    }
    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === 'string' && obj.name.trim().length > 0 ? obj.name.trim() : null;
    if (!name) {
      throw new ValidationError(`${label} at index ${idx} is missing 'name'.`);
    }
    const quantity = typeof obj.quantity === 'number' && !isNaN(obj.quantity) ? obj.quantity : 1;
    const unit = typeof obj.unit === 'string' && obj.unit.trim().length > 0 ? obj.unit.trim() : 'pcs';
    return { name, quantity, unit };
  });
}

export function validateRecipesResponse(data: unknown): GeneratedRecipe[] {
  let list: unknown[] = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object' && 'recipes' in data && Array.isArray((data as { recipes: unknown }).recipes)) {
    list = (data as { recipes: unknown[] }).recipes;
  } else {
    throw new ValidationError('Expected an array of recipes or an object with a "recipes" array.');
  }

  if (list.length === 0) {
    throw new ValidationError('Generated recipes list cannot be empty.');
  }

  // Cap at 3 recipes maximum
  const capped = list.slice(0, 3);

  return capped.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(`Recipe at index ${idx} is not an object.`);
    }

    const obj = item as Record<string, unknown>;
    const title = typeof obj.title === 'string' && obj.title.trim().length > 0
      ? obj.title.trim()
      : typeof obj.name === 'string' && obj.name.trim().length > 0
      ? obj.name.trim()
      : null;

    if (!title) {
      throw new ValidationError(`Recipe at index ${idx} is missing a title.`);
    }

    const id = typeof obj.id === 'string' && obj.id.trim().length > 0
      ? obj.id.trim()
      : `recipe_${idx + 1}_${Date.now()}`;

    const description = typeof obj.description === 'string' && obj.description.trim().length > 0
      ? obj.description.trim()
      : `A delicious dish made with fresh ingredients.`;

    const cookingTime = typeof obj.cookingTime === 'number' && obj.cookingTime > 0 ? Math.round(obj.cookingTime) : 25;
    const prepTime = typeof obj.prepTime === 'number' && obj.prepTime > 0 ? Math.round(obj.prepTime) : 10;
    const servings = typeof obj.servings === 'number' && obj.servings > 0 ? Math.round(obj.servings) : 2;

    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (typeof obj.difficulty === 'string') {
      const d = obj.difficulty.trim().toLowerCase();
      if (d === 'easy') difficulty = 'Easy';
      else if (d === 'hard') difficulty = 'Hard';
      else difficulty = 'Medium';
    }

    const availableIngredients = parseIngredientList(obj.availableIngredients, `Recipe ${idx} availableIngredients`);
    const missingIngredients = parseIngredientList(obj.missingIngredients, `Recipe ${idx} missingIngredients`);

    let instructions: GeneratedInstructionStep[] | undefined = undefined;
    if (Array.isArray(obj.instructions)) {
      instructions = obj.instructions.map((stepItem, stepIdx) => {
        const stepObj = (stepItem && typeof stepItem === 'object') ? stepItem as Record<string, unknown> : {};
        return {
          id: typeof stepObj.id === 'string' ? stepObj.id : `step_${stepIdx + 1}`,
          step: typeof stepObj.step === 'number' ? stepObj.step : stepIdx + 1,
          title: typeof stepObj.title === 'string' ? stepObj.title : `Step ${stepIdx + 1}`,
          description: typeof stepObj.description === 'string' ? stepObj.description : String(stepItem),
        };
      });
    }

    return {
      id,
      name: title,
      title,
      description,
      cookingTime,
      prepTime,
      servings,
      difficulty,
      availableIngredients,
      missingIngredients,
      instructions,
      image: typeof obj.image === 'string' ? obj.image : undefined,
      isBestMatch: typeof obj.isBestMatch === 'boolean' ? obj.isBestMatch : false,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 3. Text: Cooking Instructions
// ─────────────────────────────────────────────────────────────
export function validateInstructionsResponse(data: unknown): GeneratedInstructionStep[] {
  let list: unknown[] = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object' && 'instructions' in data && Array.isArray((data as { instructions: unknown }).instructions)) {
    list = (data as { instructions: unknown[] }).instructions;
  } else if (data && typeof data === 'object' && 'steps' in data && Array.isArray((data as { steps: unknown }).steps)) {
    list = (data as { steps: unknown[] }).steps;
  } else {
    throw new ValidationError('Expected an array of instructions or an object with an "instructions" or "steps" array.');
  }

  if (list.length === 0) {
    throw new ValidationError('Instructions list cannot be empty.');
  }

  return list.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(`Instruction at index ${idx} is not an object.`);
    }

    const obj = item as Record<string, unknown>;
    const step = typeof obj.step === 'number' ? obj.step : idx + 1;
    const title = typeof obj.title === 'string' && obj.title.trim().length > 0 ? obj.title.trim() : `Step ${step}`;
    const description = typeof obj.description === 'string' && obj.description.trim().length > 0
      ? obj.description.trim()
      : null;

    if (!description) {
      throw new ValidationError(`Instruction at index ${idx} is missing a description.`);
    }

    return {
      id: typeof obj.id === 'string' ? obj.id : `step_${step}`,
      step,
      title,
      description,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Clean JSON Extraction & Parsing
// ─────────────────────────────────────────────────────────────
export function extractAndParseJson<T>(rawText: string, validator: (data: unknown) => T): T {
  if (!rawText || typeof rawText !== 'string') {
    throw new ValidationError('AI response text is empty or invalid.');
  }

  // 1. Strip markdown code fences if present
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

  // 2. If text still contains non-JSON prefix or suffix, locate the first '{' or '[' and matching '}' or ']'
  const firstCurly = cleaned.indexOf('{');
  const firstSquare = cleaned.indexOf('[');

  let startIdx = -1;
  let isObject = false;

  if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
    startIdx = firstCurly;
    isObject = true;
  } else if (firstSquare !== -1) {
    startIdx = firstSquare;
    isObject = false;
  }

  if (startIdx !== -1) {
    const endChar = isObject ? '}' : ']';
    const lastIdx = cleaned.lastIndexOf(endChar);
    if (lastIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, lastIdx + 1);
    }
  }

  // 3. JSON Parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ValidationError(`Failed to parse AI output as JSON: ${(err as Error).message}`);
  }

  // 4. Schema validation
  return validator(parsed);
}
