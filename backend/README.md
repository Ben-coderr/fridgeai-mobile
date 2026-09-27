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

`MOCK_AI=true` is the default development mode. It provides predictable API responses so the mobile team can build without an API key. Set `MOCK_AI=false` and configure `GEMINI_API_KEY` only when the real provider integration is implemented.

## API contract

| Route | Request | Response |
|---|---|---|
| `POST /api/scan` | multipart form with `image` | `{ ingredients: string[], source: "mock" }` |
| `POST /api/recipes` | `{ ingredients, people, mealType, preference? }` | `{ recipes, source: "mock" }` |

The routes are deliberately mocked at this stage. They establish the stable contract for mobile/backend parallel work; replacing their internals with Gemini must not change the response shapes.

Run `npm run build` before a backend pull request.
