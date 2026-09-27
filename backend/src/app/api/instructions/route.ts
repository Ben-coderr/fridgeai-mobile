import { NextResponse } from 'next/server';
import { dispatchInstructions } from '@/lib/ai/dispatcher';
import { DEFAULT_MOCK_INSTRUCTIONS } from '@/lib/ai/mockData';

interface InstructionsRequestBody {
  recipeId?: string;
  recipeTitle?: string;
  title?: string;
  name?: string;
  servings?: number;
  ingredients?: Array<{ name: string; quantity?: number; unit?: string } | string>;
}

// ─────────────────────────────────────────────────────────────
// POST /api/instructions
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    let body: InstructionsRequestBody;

    try {
      body = (await request.json()) as InstructionsRequestBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const recipeTitle =
      typeof body.recipeTitle === 'string' && body.recipeTitle.trim().length > 0
        ? body.recipeTitle.trim()
        : typeof body.title === 'string' && body.title.trim().length > 0
        ? body.title.trim()
        : typeof body.name === 'string' && body.name.trim().length > 0
        ? body.name.trim()
        : null;

    if (!recipeTitle) {
      return NextResponse.json(
        { error: 'A recipe title is required (field name: "recipeTitle" or "title").' },
        { status: 400 }
      );
    }

    const recipeId = typeof body.recipeId === 'string' ? body.recipeId.trim() : undefined;
    const servings = typeof body.servings === 'number' && body.servings > 0 ? body.servings : 2;

    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients.map((item) => {
          if (typeof item === 'string') {
            return { name: item.trim(), quantity: 1, unit: 'pcs' };
          }
          return {
            name: typeof item.name === 'string' ? item.name.trim() : 'Unknown',
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            unit: typeof item.unit === 'string' ? item.unit.trim() : 'pcs',
          };
        })
      : [];

    // Dispatch through AI Text Pipeline (Groq primary -> Groq backup -> Mock)
    const result = await dispatchInstructions({
      recipeId,
      recipeTitle,
      servings,
      ingredients,
    });

    return NextResponse.json({
      source: result.source,
      recipeId,
      instructions: result.instructions,
    });
  } catch (err) {
    console.error('[instructions] Unexpected route error:', err);

    return NextResponse.json({
      source: 'mock',
      recipeId: undefined,
      instructions: DEFAULT_MOCK_INSTRUCTIONS,
      fallbackReason: (err as Error)?.message || 'Internal server error',
    });
  }
}
