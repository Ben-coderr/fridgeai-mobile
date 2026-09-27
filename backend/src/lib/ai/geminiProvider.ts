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
  const fallbackModel = 'gemini-3.8-flash';
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
    const result = await model.generateContent([VISION_SYSTEM_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();
    return extractAndParseJson(text, validateDetectedIngredients);
  };

  const apiPromise = (async () => {
    try {
      return await tryModel(primaryModel);
    } catch (err) {
      if (primaryModel !== fallbackModel) {
        console.warn(
          `[geminiProvider] Model ${primaryModel} failed (${(err as Error).message}). Retrying with ${fallbackModel}...`
        );
        return await tryModel(fallbackModel);
      }
      throw err;
    }
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Gemini request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([apiPromise, timeoutPromise]);
}
