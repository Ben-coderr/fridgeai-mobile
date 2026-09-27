# SLIDES_INFO.md — Hackathon Submission & Presentation Deck Materials

---

## 1. Project Identity
- **Project Title:** FridgeAI
- **One-Sentence Tagline:** Turn a photo of your fridge into personalized recipes and an instant shopping list for missing ingredients.

---

## 2. Pitch Summary (max 150 words)
> **Word count:** 114 words

People open their fridge daily asking, "What can I cook with what I have?" Traditional recipe apps work backwards—forcing users to search recipes, inspect ingredients, check the fridge, and manually list missing items, leading to decision fatigue and food waste. 

FridgeAI inverts this workflow: **Fridge → Ingredients → Recipes → Missing Ingredients → Shopping**. 

The user snaps a fridge photo. Multimodal AI identifies visible food items, allowing quick human-in-the-loop adjustments and preference selection (servings, meal type, diet). Generative AI crafts customized recipes, automatically calculates ingredient coverage, highlights what you have versus what you need, and compiles missing items into a checkable shopping list with one-tap PDF export.

---

## 3. Problem & User Value
- **Target Users:** 
  - Students and young adults cooking on a budget with limited time.
  - Busy professionals and families who have food at home but struggle with meal planning.
- **Example Persona (from Product Brief):** 
  - *Adam (23):* Returns home tired with random ingredients (eggs, tomatoes, chicken, milk, vegetables). Instead of scrolling social media or Google, he snaps a photo, confirms his items, and gets dinner planned in under a minute.
- **Core Pain Point:** "Fridge paralysis"—having food at home but not knowing how to combine it into a meal.
- **Why It Matters:** 
  - Reverses traditional recipe search friction (no manual typing of pantry contents).
  - Reduces household food waste by prioritizing ingredients before they spoil.
  - Cuts unnecessary grocery spending by isolating *only* what is missing.

---

## 4. Solution & Key Features
### Actual Implemented Features (Verified in Codebase):
- **Camera & Gallery Photo Capture:** Real device camera snapping and photo library selection via `expo-image-picker` (`HomeScreen.tsx`).
- **AI Vision Scanning with Real-Time Feedback:** Multipart image upload with visual 4-step analysis timeline (`ScanningScreen.tsx` → `POST /api/scan`).
- **Human-in-the-Loop Ingredient Verification:** Editable food inventory enabling users to add custom items, delete items, and adjust quantities with steppers (`IngredientsScreen.tsx`).
- **Meal Preferences Customization:** Dynamic selectors for servings count (1–12), meal type (Breakfast, Lunch, Dinner), and dietary goals (Quick, Healthy, High Protein, Budget) (`PreferencesScreen.tsx`).
- **Multi-Recipe Generation & Ingredient Gap Analysis:** Up to 3 curated recipes detailing prep time, cook time, difficulty, and nutritional tags (`RecipesScreen.tsx`, `RecipeDetailScreen.tsx` → `POST /api/recipes`).
- **Algorithmic Best-Match Ranking:** Backend calculates actual ingredient coverage ratio `available / (available + missing)` to assign `isBestMatch` independently of LLM bias (`dispatcher.ts`).
- **Dual Presentation Views:** Toggle between visual "Hero Cards" and a "Meal Plan Ready" celebration layout with value metrics (`RecipesScreen.tsx`).
- **Recipe Favoriting:** Persistent in-session toggle for bookmarking preferred recipes (`AppContext.tsx`).
- **Interactive Step-by-Step Cooking Guide:** Numbered instructions with visual completion checkboxes (`CookingInstructionsScreen.tsx` → `POST /api/instructions`).
- **Smart Missing-Ingredients Shopping List:** Automatically filters out available items, presenting only needed groceries with interactive purchase checkoffs (`ShoppingListScreen.tsx`).
- **Vector PDF Generation & Native Sharing:** Converts meal plans and shopping lists into printable, shareable HTML/PDF documents via `expo-print` and `expo-sharing` (`PdfExportScreen.tsx`).
- **Multi-Tier AI KeyPool & Failover Engine:** Intelligent key rotation with 429/5xx quarantine cooldowns and provider-level fallback (`keyPool.ts`, `dispatcher.ts`).

### Planned in Brief but NOT Implemented (To Avoid Overclaiming):
- **Supermarket catalog & real-time pricing integration:** Intentionally scoped out for MVP; shopping list remains a self-managed checklist.
- **User accounts & cloud authentication:** Intentionally stateless for zero-friction hackathon demos.
- **Full weekly meal planning calendar:** Only single-session meal plans are generated.
- **Nutritional macro tracking & barcode scanner:** Focus kept on visual fridge-to-meal generation.

---

## 5. Tech Stack / AI Contribution
### Mobile Client:
- **Framework:** React Native (0.86.3) with Expo (SDK 57) and TypeScript 6.
- **Navigation:** `@react-navigation/native-stack` (10 distinct screen flows).
- **Native Modules:** `expo-image-picker`, `expo-print`, `expo-sharing`, `expo-linear-gradient`.

### Backend:
- **Framework:** Next.js 16 (App Router / Turbopack serverless API routes) running Node.js 22.
- **Image Preprocessing:** `sharp` (downsamples and compresses uploads to max 1280×1280 JPEG at 80% quality to eliminate payload bottlenecks).

### AI Models & Providers Actually Used:
1. **Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`):**
   - *Role:* Primary Vision Pipeline (`POST /api/scan`).
   - *Why Chosen:* Ultra-low latency, native multimodal image comprehension, structured JSON output.
2. **OpenRouter (`qwen/qwen2.5-vl-72b-instruct:free`):**
   - *Role:* Secondary Vision Failover Pipeline.
   - *Why Chosen:* High-capacity open vision-language model providing free, reliable redundancy when Gemini hits quota.
3. **Groq (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`):**
   - *Role:* Primary & Backup Text Pipeline (`POST /api/recipes` & `POST /api/instructions`).
   - *Why Chosen:* Sub-second inference speeds via Groq LPUs, complex culinary reasoning, and strict JSON instruction following.

### Third-Party Data Sources:
- **Unsplash Food Imagery:** Curated high-resolution image mappings used for ingredient badges and recipe presentation.
- **External Recipe Databases (Spoonacular, Open Food Facts):** NOT USED. All recipes and instructions are generated dynamically by the AI models.

### NVIDIA Brev / NIM Status:
- **NOT USED:** Explicitly bypassed in architecture (`docs/PLAN.md` line 25: *"We're not using Brev"*). All AI orchestration runs directly through Gemini, OpenRouter, and Groq APIs with custom KeyPool failover.

---

## 6. Testing & Reliability
- **Automated Test Suite:** Custom 12-scenario test harness in `backend/scripts/test-all-scenarios.ts` covering Scenarios A through L (verified **12 Passed, 0 Failed**):
  - Scenario A: Gemini vision success.
  - Scenario B: Gemini key 1 rate limit (429) → key 2 success.
  - Scenario C: Gemini exhaustion → OpenRouter failover success.
  - Scenario D: Complete vision outage → safe mock fallback.
  - Scenario E: Groq recipe generation + algorithmic ranking success.
  - Scenario F: Groq key 1 server error (500) → key 2 success.
  - Scenario G: Groq primary model rate limit → backup model success.
  - Scenario H: Complete text outage → safe mock recipe/instruction fallback.
  - Scenario I: Malformed AI JSON → caught by schema validator (`ValidationError`), preventing UI corruption.
  - Scenario J: Request timeout abort controller handling.
  - Scenario K: HTTP 429 quarantine circuit breaker (60-second cooldown).
  - Scenario L: HTTP 401/403 permanent key invalidation.
- **Fail-Safe Client Architecture:** Mobile `recipeService.ts` and `scanService.ts` wrap all network calls in try/catch fallbacks to local data, guaranteeing the app never crashes or displays a blank screen during a live demo.
- **Known Limitations:**
  - Single-photo vision cannot detect ingredients hidden behind opaque containers, deep in drawers, or obscured by poor lighting.
  - Best-match scoring depends on accurate identification of pantry staples.

---

## 7. Responsible AI & Data
- **Zero Photo Retention:** Uploaded fridge images are processed strictly in-memory as temporary buffers, downsampled with `sharp`, streamed over HTTPS to the vision provider, and immediately discarded. No images are saved to disk or cloud buckets.
- **No PII Collected:** The application requires no login, no email, no user tracking, and stores no personal user data.
- **Human-in-the-Loop by Design:** Recognizes that computer vision is imperfect. The user is presented with the raw detected ingredient list (`IngredientsScreen.tsx`) to verify, edit, add, or remove items *before* any generative recipe model is invoked.
- **Schema Validation & Content Sanitization:** AI responses are strictly parsed and validated against TypeScript schemas (`schemas.ts`), stripping prompt injections and ensuring only valid food data reaches the client.

---

## 8. Screenshots to Capture (In User Flow Order)
1. **`01_HomeScreen`:** Hero camera launchpad with "Scan My Fridge" and "Upload Photo" CTAs.
2. **`02_ScanningScreen`:** Visual scanning animation showing multi-stage AI detection progress.
3. **`03_IngredientsScreen`:** Human-in-the-loop review screen displaying detected badges with quantity steppers and "+ Add Ingredient" modal.
4. **`04_PreferencesScreen`:** Clean preferences form (people count stepper, Breakfast/Lunch/Dinner selector, and Quick/Healthy/High Protein chips).
5. **`05_RecipesScreen`:** Generated meal cards featuring the "Best Match" badge, prep times, and the "Meal Plan Ready" celebration layout.
6. **`06_RecipeDetailScreen`:** Detailed recipe view showing green (Ingredients You Have) vs. orange (Ingredients You Need) visual split.
7. **`07_CookingInstructionsScreen`:** Sequential cooking steps with interactive checkoff timeline.
8. **`08_ShoppingListScreen`:** Consolidated shopping list isolating only missing ingredients with purchase checkboxes.
9. **`09_PdfExportScreen`:** PDF export screen with preview carousel, "Download PDF", and "Share PDF" action buttons.

---

## 9. Next Steps & Future Work
- **Multi-Photo & Multi-Angle Capture:** Allow users to snap photos of fridge shelves, door compartments, freezer, and dry pantry simultaneously for a unified inventory.
- **Dietary Restriction & Allergen Profiles:** Add persistent filters for vegetarian, vegan, gluten-free, dairy-free, keto, and nut-free diets.
- **Supermarket & Delivery API Integration:** 1-click cart export to grocery delivery platforms (e.g., Instacart, local supermarket APIs) for missing shopping list items.
- **Expiry Date & Shelf-Life Estimation:** AI estimation of ingredient shelf-life to prioritize meals using items that will spoil first.
- **On-Device Vision Model:** Explore lightweight on-device vision models for zero-latency, offline ingredient scanning.
