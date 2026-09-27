import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { dispatchVision } from '@/lib/ai/dispatcher';
import { MOCK_DETECTED_INGREDIENTS } from '@/lib/ai/mockData';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

// ─────────────────────────────────────────────────────────────
// POST /api/scan
// Body: multipart/form-data with field "image"
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image');

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: 'An image file is required (field name: "image").' },
        { status: 400 }
      );
    }

    // 1. File size validation
    if (image.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (received ${(image.size / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    // 2. MIME type validation
    const mimeType = (image.type || 'image/jpeg').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image type "${mimeType}". Allowed: JPEG, PNG, WebP.` },
        { status: 400 }
      );
    }

    // 3. Read buffer and compress/resize with sharp
    const rawBuffer = Buffer.from(await image.arrayBuffer());
    let processedBuffer: Buffer;
    let targetMimeType = 'image/jpeg';

    try {
      processedBuffer = await sharp(rawBuffer)
        .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (sharpError) {
      console.warn('[scan] Sharp compression failed, using original buffer:', (sharpError as Error).message);
      processedBuffer = rawBuffer;
      targetMimeType = mimeType;
    }

    // 4. Dispatch through AI Vision Pipeline (Gemini -> OpenRouter -> Mock)
    const result = await dispatchVision(processedBuffer, targetMimeType);

    return NextResponse.json({
      source: result.source,
      ingredients: result.ingredients,
    });
  } catch (err) {
    console.error('[scan] Unexpected route error:', err);

    // Guaranteed safe fallback: never crash or return empty
    return NextResponse.json({
      source: 'mock',
      ingredients: MOCK_DETECTED_INGREDIENTS,
      fallbackReason: (err as Error)?.message || 'Internal server error',
    });
  }
}
