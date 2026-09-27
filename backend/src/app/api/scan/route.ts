import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { dispatchVision } from '@/lib/ai/dispatcher';
import { getIngredientImageUrl } from '@/lib/ai/imageResolver';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'application/octet-stream',
]);

// ─────────────────────────────────────────────────────────────
// POST /api/scan
// Supports both multipart/form-data and application/json (base64)
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();

    let rawBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    if (contentType.includes('application/json')) {
      // JSON body with base64 payload
      let body: { image?: string; base64?: string; mimeType?: string };
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON request body.' },
          { status: 400 }
        );
      }

      const rawImage = body.image || body.base64;
      if (!rawImage || typeof rawImage !== 'string') {
        return NextResponse.json(
          { error: 'An image base64 string is required (field name: "image" or "base64").' },
          { status: 400 }
        );
      }

      const match = rawImage.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1].toLowerCase();
        rawBuffer = Buffer.from(match[2], 'base64');
      } else {
        if (body.mimeType) {
          mimeType = body.mimeType.toLowerCase();
        }
        rawBuffer = Buffer.from(rawImage, 'base64');
      }
    } else {
      // Multipart form data
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch (formError) {
        console.error('[scan] Failed to parse multipart formData:', formError);
        return NextResponse.json(
          { error: 'Failed to read uploaded form data. Please ensure the image is properly sent.' },
          { status: 400 }
        );
      }

      const image = formData.get('image');
      if (!image) {
        return NextResponse.json(
          { error: 'An image file is required (field name: "image").' },
          { status: 400 }
        );
      }

      if (typeof image === 'string') {
        // Base64 string in formData
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1].toLowerCase();
          rawBuffer = Buffer.from(match[2], 'base64');
        } else {
          rawBuffer = Buffer.from(image, 'base64');
        }
      } else if (typeof (image as Blob).arrayBuffer === 'function') {
        const blob = image as Blob;
        mimeType = (blob.type || 'image/jpeg').toLowerCase();
        rawBuffer = Buffer.from(await blob.arrayBuffer());
      } else {
        return NextResponse.json(
          { error: 'Unsupported image upload format.' },
          { status: 400 }
        );
      }
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded image file is empty.' },
        { status: 400 }
      );
    }

    // 1. File size validation
    if (rawBuffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the 15MB limit (received ${(rawBuffer.length / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    // 2. MIME type validation with image/* and magic bytes flexibility
    const isKnownMime =
      ALLOWED_MIME_TYPES.has(mimeType) ||
      mimeType.startsWith('image/');

    // 3. Process image with Sharp (auto-converts HEIC/HEIF, PNG, WebP, GIF, JPEG -> optimized JPEG)
    let processedBuffer: Buffer;
    let targetMimeType = 'image/jpeg';

    try {
      // Validate magic bytes with sharp metadata
      const meta = await sharp(rawBuffer).metadata();
      if (!meta.format && !isKnownMime) {
        return NextResponse.json(
          { error: `Unsupported image format (${mimeType || 'unknown'}). Please upload a valid photo.` },
          { status: 400 }
        );
      }

      processedBuffer = await sharp(rawBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
      targetMimeType = 'image/jpeg';
    } catch (sharpError) {
      console.warn('[scan] Sharp processing failed, evaluating fallback:', (sharpError as Error).message);

      if (!isKnownMime) {
        return NextResponse.json(
          { error: 'Invalid or corrupted image format. Please select another photo.' },
          { status: 400 }
        );
      }

      processedBuffer = rawBuffer;
      targetMimeType = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
    }

    // 4. Dispatch through AI Vision Pipeline (Gemini -> OpenRouter -> Mock)
    const result = await dispatchVision(processedBuffer, targetMimeType);

    const enrichedIngredients = result.ingredients.map((item) => ({
      ...item,
      image: getIngredientImageUrl(item.name),
    }));

    return NextResponse.json({
      source: result.source,
      ingredients: enrichedIngredients,
    });
  } catch (err) {
    console.error('[scan] Unexpected route error:', err);

    return NextResponse.json(
      { error: (err as Error)?.message || 'Image analysis failed.' },
      { status: 502 }
    );
  }
}
