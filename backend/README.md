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

## API Contract

| Route | Method | Request | Response |
|---|---|---|---|
| `/api/health` | `GET` | _None_ | `{ status, version, uptime, mockMode, providers }` |
| `/api/scan` | `POST` | `multipart/form-data` with `image` file | `{ ingredients: Ingredient[], source: string }` |
| `/api/recipes` | `POST` | `{ ingredients, preferences }` (JSON) | `{ recipes: Recipe[], source: string }` |
| `/api/instructions` | `POST` | `{ recipeId, recipeTitle, servings, ingredients }` | `{ instructions: RecipeStep[], source: string }` |

Provider failures return descriptive error responses with proper HTTP status codes. The mobile app surfaces these failures so backend URL, key, and provider problems can be fixed directly.

Run `npm run build` before a backend pull request.
