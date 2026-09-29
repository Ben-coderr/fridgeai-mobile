import { NextResponse } from 'next/server';
import { getGeminiPool, getOpenRouterPool, getGroqPool } from '@/lib/ai/dispatcher';

// ─────────────────────────────────────────────────────────────
// GET /api/health
// Diagnostic health check endpoint for mobile clients & monitoring
// ─────────────────────────────────────────────────────────────
export async function GET() {
  const isMock = process.env.MOCK_AI === 'true';

  let geminiKeys = 0;
  let groqKeys = 0;
  let openRouterKeys = 0;

  try {
    geminiKeys = getGeminiPool().size();
    groqKeys = getGroqPool().size();
    openRouterKeys = getOpenRouterPool().size();
  } catch {
    // Gracefully handle if pools are uninitialized
  }

  return NextResponse.json(
    {
      status: 'ok',
      service: 'FridgeAI Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      mockMode: isMock,
      providers: {
        gemini: { configured: geminiKeys > 0, keyCount: geminiKeys },
        groq: { configured: groqKeys > 0, keyCount: groqKeys },
        openrouter: { configured: openRouterKeys > 0, keyCount: openRouterKeys },
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
