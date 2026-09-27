import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────
// Mock fallback used when MOCK_AI=true or no key
// ─────────────────────────────────────────────
const MOCK_INGREDIENTS = [
  { name: 'Eggs',          quantity: 6, unit: 'pcs' },
  { name: 'Tomatoes',      quantity: 3, unit: 'pcs' },
  { name: 'Chicken breast',quantity: 2, unit: 'pcs' },
  { name: 'Milk',          quantity: 1, unit: 'bottle' },
  { name: 'Cheese',        quantity: 1, unit: 'block' },
  { name: 'Broccoli',      quantity: 1, unit: 'head' },
  { name: 'Carrots',       quantity: 3, unit: 'pcs' },
  { name: 'Bell pepper',   quantity: 1, unit: 'pc' },
];

// ─────────────────────────────────────────────
// Gemini Vision prompt
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a fridge ingredient detector.
The user sends a photo of the inside of their fridge or food items.
Return a JSON array of ingredients you can see. Each item must have:
  - "name": string  (common English name, e.g. "Eggs", "Milk", "Tomatoes")
  - "quantity": number (best estimate, e.g. 6)
  - "unit": string  (e.g. "pcs", "g", "ml", "bottle", "block", "head", "pc", "bunch")

Respond with ONLY the raw JSON array. No markdown, no explanation.
Example: [{"name":"Eggs","quantity":6,"unit":"pcs"},{"name":"Milk","quantity":1,"unit":"bottle"}]`;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function fileToBase64Part(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

interface DetectedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

function parseGeminiResponse(text: string): DetectedIngredient[] {
  // Strip potential markdown code fences
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned) as unknown;

  if (!Array.isArray(parsed)) throw new Error('Expected an array');

  return (parsed as Record<string, unknown>[]).map((item) => ({
    name:     typeof item.name     === 'string' ? item.name     : 'Unknown',
    quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    unit:     typeof item.unit     === 'string' ? item.unit     : 'pcs',
  }));
}

// ─────────────────────────────────────────────
// POST /api/scan
// Body: multipart/form-data with field "image" (File)
// ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: 'An image file is required (field name: "image").' },
        { status: 400 }
      );
    }

    // ── Use mock if flag is set or no API key ───────────────────────────────
    const useMock = process.env.MOCK_AI === 'true' || !process.env.GEMINI_API_KEY;

    if (useMock) {
      // Simulate a small delay so the UI animation feels real
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ ingredients: MOCK_INGREDIENTS, source: 'mock' });
    }

    // ── Real Gemini Vision call ─────────────────────────────────────────────
    const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const buffer   = Buffer.from(await image.arrayBuffer());
    const mimeType = (image.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
    const imagePart = fileToBase64Part(buffer, mimeType);

    const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
    const text   = result.response.text();
    const ingredients = parseGeminiResponse(text);

    return NextResponse.json({ ingredients, source: 'gemini' });

  } catch (err) {
    console.error('[scan] Error:', err);

    // Graceful fallback: return mock so the app never crashes
    return NextResponse.json({ ingredients: MOCK_INGREDIENTS, source: 'fallback' });
  }
}
