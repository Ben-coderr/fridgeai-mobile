# FridgeAI Backend

Next.js API for ingredient detection and recipe generation.

## Setup

```bash
cd backend
copy .env.example .env.local
npm install
npm run dev
```

Next.js requires Node.js 20.9 or later.

Set `MOCK_AI=false` and configure the server-side Gemini, OpenRouter, and Groq key pools in `.env.local`. The mobile app sends photos and recipe requests to this backend; provider keys must never be placed in the mobile app.

## API contract

| Route | Request | Response |
|---|---|---|
| `POST /api/scan` | multipart form with `image` | `{ ingredients, source }` |
| `POST /api/recipes` | `{ ingredients, preferences }` | `{ recipes, source }` |

Provider failures return an error response instead of invented fallback data. The mobile app shows these failures so backend URL, key, and provider problems can be fixed directly.

Run `npm run build` before a backend pull request.
