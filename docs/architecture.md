# FridgeAI System Architecture & AI Pipeline

FridgeAI connects a cross-platform mobile client with a resilient, multi-provider AI backend designed to prevent outages, rate limits, and parsing errors.

---

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Mobile Client (Expo)                 │
│   • Camera & Photo Picker (expo-image-picker)          │
│   • Interactive UI & State (React Navigation, Context) │
│   • Vector PDF Generator (expo-print, expo-sharing)    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / Multipart & JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend API (Next.js 16)                 │
│   • Image Preprocessing (Sharp: resize & compress)     │
│   • Multi-tier KeyPool Manager                         │
│   • AI Vision & Text Dispatchers                       │
│   • Algorithmic Ingredient Gap & Coverage Ranking      │
└──────────────┬────────────────────────────┬────────────┘
               │ Vision                     │ Text (Recipes & Steps)
               ▼                            ▼
   ┌───────────────────────┐    ┌───────────────────────┐
   │ Tier 1: Google Gemini │    │ Tier 1: Groq LPUs     │
   │ (gemini-2.5-flash)    │    │ (llama-3.3-70b-vers.) │
   └───────────┬───────────┘    └───────────┬───────────┘
               │ Failover                   │ Failover
               ▼                            ▼
   ┌───────────────────────┐    ┌───────────────────────┐
   │ Tier 2: OpenRouter    │    │ Tier 2: Groq Backup   │
   │ (Qwen 2.5 VL 72B)     │    │ (llama-3.1-8b-inst.)  │
   └───────────┬───────────┘    └───────────┬───────────┘
               │ Failover                   │ Failover
               ▼                            ▼
   ┌───────────────────────┐    ┌───────────────────────┐
   │ Tier 3: Mock Vision   │    │ Tier 3: Mock Recipes  │
   │ (Deterministic)       │    │ (Deterministic)       │
   └───────────────────────┘    └───────────────────────┘
```

---

## 2. Core User & Data Flow

1. **Capture & Preprocess (`mobile/src/screens/HomeScreen.tsx`):**
   - User snaps or uploads a fridge photo.
   - Converted to JPEG via `expo-image-manipulator` and uploaded as multipart form data.
2. **Vision Analysis (`backend/src/app/api/scan/route.ts`):**
   - Downsamples image with `sharp` to a maximum of 1024×1024 to minimize upload latency and tokens.
   - Dispatches through `dispatchVision` (Gemini → OpenRouter → Mock).
   - Generates normalized ingredient list with CDN thumbnail images from TheMealDB.
3. **Human-in-the-Loop Verification (`mobile/src/screens/IngredientsScreen.tsx`):**
   - User reviews detected food items, edits quantities, deletes false positives, or adds missing staples.
4. **Preference Selection (`mobile/src/screens/PreferencesScreen.tsx`):**
   - User chooses serving size (1–12), meal type (Breakfast, Lunch, Dinner), and dietary goal (Quick, Healthy, High Protein, Budget).
5. **Recipe Generation & Ranking (`backend/src/app/api/recipes/route.ts`):**
   - Dispatches prompt to Groq LPUs (`llama-3.3-70b-versatile`).
   - Computes backend ingredient coverage: `ratio = available / (available + missing)`.
   - Highest ratio recipe is awarded `isBestMatch: true`.
   - Resolves HD recipe imagery via Unsplash category mapping.
6. **Cooking Guide & Gap Checklist (`mobile/src/screens/RecipeDetailScreen.tsx`):**
   - Splits ingredients into **Have** (green) and **Missing** (orange).
   - Fetches numbered cooking instructions from `/api/instructions`.
7. **Consolidated Shopping List & Export (`mobile/src/screens/PdfExportScreen.tsx`):**
   - Missing ingredients automatically populate an interactive grocery checklist.
   - Vector HTML-to-PDF export creates an offline, printable report with system sharing.

---

## 3. Resilience & Failure Modes

### Multi-Key KeyPool Rotation
The `KeyPool` system (`backend/src/lib/ai/keyPool.ts`) accepts comma-separated lists of API keys for each provider:
- **Round-Robin Rotation:** Distributes traffic evenly across all healthy keys.
- **429 Rate Limit Cooldown:** Automatically quarantines any key returning HTTP 429 for 60 seconds, switching immediately to the next key.
- **401/403 Invalidation:** Permanently removes revoked or invalid keys from the active pool.
- **Transient Error Retry:** Automatically retries 5xx server drops or network timeouts.

### Strict Schema Validation
All AI completions are passed through `extractAndParseJson` (`backend/src/lib/ai/schemas.ts`), which:
1. Strips markdown fences (` ```json `).
2. Performs balanced bracket extraction to isolate raw JSON.
3. Validates structures and field types against TypeScript schemas, preventing runtime crashes from hallucinated keys.

---

## 4. Privacy & Responsible AI

- **Ephemeral Image Buffers:** Uploaded photos exist purely in memory during processing and are immediately garbage-collected. No photos are written to disk or third-party buckets.
- **Zero PII:** No user accounts, credentials, or tracking identifiers are collected or stored.
