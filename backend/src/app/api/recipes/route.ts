import { NextResponse } from 'next/server';
import { dispatchRecipes } from '@/lib/ai/dispatcher';

interface RecipeRequestBody {
  ingredients?: Array<{ name: string; quantity?: number; unit?: string } | string>;
  preferences?: {
    peopleCount?: number;
    mealType?: string;
    preference?: string;
  };
  people?: number;
  mealType?: string;
  preference?: string;
}

// ─────────────────────────────────────────────────────────────
// POST /api/recipes
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    let body: RecipeRequestBody;

    try {
      body = (await request.json()) as RecipeRequestBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    // Normalize ingredients list
    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required in the "ingredients" array.' },
        { status: 400 }
      );
    }

    const normalizedIngredients = body.ingredients.map((item) => {
      if (typeof item === 'string') {
        return { name: item.trim(), quantity: 1, unit: 'pcs' };
      }
      return {
        name: typeof item.name === 'string' ? item.name.trim() : 'Unknown',
        quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1,
        unit: typeof item.unit === 'string' && item.unit.trim().length > 0 ? item.unit.trim() : 'pcs',
      };
    }).filter((i) => i.name.length > 0);

    // Normalize preferences (support both nested body.preferences and top-level fields)
    const prefs = body.preferences || {};
    const peopleCount =
      typeof prefs.peopleCount === 'number'
        ? prefs.peopleCount
        : typeof body.people === 'number'
        ? body.people
        : 2;

    const mealType =
      typeof prefs.mealType === 'string'
        ? prefs.mealType
        : typeof body.mealType === 'string'
        ? body.mealType
        : 'Dinner';

    const preference =
      typeof prefs.preference === 'string'
        ? prefs.preference
        : typeof body.preference === 'string'
        ? body.preference
        : 'Quick';

    // Dispatch through AI Text Pipeline (Groq primary -> Groq backup -> Mock)
    const result = await dispatchRecipes(normalizedIngredients, {
      peopleCount,
      mealType,
      preference,
    });

    return NextResponse.json({
      source: result.source,
      recipes: result.recipes,
    });
  } catch (err) {
    console.error('[recipes] Unexpected route error:', err);

    return NextResponse.json(
      { error: (err as Error)?.message || 'Recipe generation failed.' },
      { status: 502 }
    );
  }
}
