import { VISION_SYSTEM_PROMPT } from './prompts';
import { extractAndParseJson, validateDetectedIngredients, DetectedIngredientItem } from './schemas';

export interface OpenRouterVisionOptions {
  model?: string;
  timeoutMs?: number;
}

export async function callOpenRouterVision(
  apiKey: string,
  imageBuffer: Buffer,
  mimeType: string,
  options?: OpenRouterVisionOptions
): Promise<DetectedIngredientItem[]> {
  const modelName = options?.model || process.env.OPENROUTER_MODEL || 'qwen/qwen2.5-vl-72b-instruct:free';
  const timeoutMs = options?.timeoutMs || 25_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const base64Data = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fridgeai.local',
        'X-Title': 'FridgeAI',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: VISION_SYSTEM_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const err = new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      (err as unknown as Record<string, unknown>).status = response.status;
      throw err;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned empty completion content.');
    }

    return extractAndParseJson(content, validateDetectedIngredients);
  } finally {
    clearTimeout(timer);
  }
}
