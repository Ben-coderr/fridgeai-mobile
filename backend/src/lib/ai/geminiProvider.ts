import { GoogleGenerativeAI } from '@google/generative-ai';
import { VISION_SYSTEM_PROMPT } from './prompts';
import { extractAndParseJson, validateDetectedIngredients, DetectedIngredientItem } from './schemas';

export interface GeminiVisionOptions {
  model?: string;
  timeoutMs?: number;
}

export async function callGeminiVision(
  apiKey: string,
  imageBuffer: Buffer,
  mimeType: string,
  options?: GeminiVisionOptions
): Promise<DetectedIngredientItem[]> {
  const primaryModel = options?.model || process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const candidateModels = Array.from(new Set([primaryModel, 'gemini-3.7-flash', 'gemini-flash-lite-latest']));
  const timeoutMs = options?.timeoutMs || 25_000;

  const genAI = new GoogleGenerativeAI(apiKey);

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
    },
  };

  const tryModel = async (m: string) => {
    const model = genAI.getGenerativeModel({ model: m });
    const contentPromise = (async () => {
      const result = await model.generateContent([VISION_SYSTEM_PROMPT, imagePart]);
      const response = await result.response;
      const text = response.text();
      return extractAndParseJson(text, validateDetectedIngredients);
    })();

    const singleTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Model ${m} timed out after 15000ms`)), 15_000);
    });

    return Promise.race([contentPromise, singleTimeout]);
  };

  const apiPromise = (async () => {
    let lastErr: unknown = null;
    for (const m of candidateModels) {
      try {
        return await tryModel(m);
      } catch (err) {
        lastErr = err;
        console.warn(`[geminiProvider] Model ${m} failed (${(err as Error).message}). Trying next candidate...`);
      }
    }
    throw lastErr;
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Gemini request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([apiPromise, timeoutPromise]);
}
