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
  const modelName = options?.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const timeoutMs = options?.timeoutMs || 20_000;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
    },
  };

  const apiPromise = (async () => {
    const result = await model.generateContent([VISION_SYSTEM_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text();
    return extractAndParseJson(text, validateDetectedIngredients);
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Gemini request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([apiPromise, timeoutPromise]);
}
