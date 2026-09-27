import { NextResponse } from 'next/server';

type RecipeRequest = {
  ingredients?: unknown;
  people?: unknown;
  mealType?: unknown;
  preference?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RecipeRequest;

  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    return NextResponse.json({ error: 'At least one ingredient is required.' }, { status: 400 });
  }

  return NextResponse.json({
    source: 'mock',
    recipes: [
      {
        id: 'creamy-chicken-pasta',
        title: 'Creamy Chicken Pasta',
        servings: typeof body.people === 'number' ? body.people : 2,
        availableIngredients: body.ingredients,
        missingIngredients: ['garlic', 'olive oil'],
      },
    ],
  });
}
