import { NextResponse } from 'next/server';

const mockIngredients = ['eggs', 'tomatoes', 'chicken', 'milk', 'cheese', 'pasta'];

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');

  if (!(image instanceof File)) {
    return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
  }

  return NextResponse.json({ ingredients: mockIngredients, source: 'mock' });
}
