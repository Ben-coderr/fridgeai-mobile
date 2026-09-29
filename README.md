<div align="center">

# 🍳 FridgeAI

### Turn a photo of your fridge into personalized recipes and an instant shopping list.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?logo=expo)](https://expo.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg?logo=next.js)](https://nextjs.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB.svg?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<p align="center">
  <strong>FridgeAI inverts traditional recipe search:</strong><br />
  Instead of asking <em>"What recipe do I want to cook and what do I need to buy?"</em>,<br />
  it answers <strong>"What can I cook right now with what I already have?"</strong>
</p>

```
📸 Fridge Photo ➔ 🔍 AI Vision Detection ➔ ✏️ Verify Ingredients ➔ 🍲 Generate Recipes ➔ 🛒 Missing Items Shopping List ➔ 📄 PDF Export
```

</div>

---

## 🌟 Key Features

- **📸 Multimodal AI Vision Scanning:** Snap or upload a photo of your fridge. Deep computer vision automatically detects vegetables, fruits, proteins, dairy, condiments, and staples.
- **✏️ Human-in-the-Loop Inventory Verification:** Food detection isn't always 100% perfect. Users can review recognized items, adjust quantities, delete items, and manually add custom pantry staples.
- **🎯 Dynamic Meal Preferences:** Customize serving size (1 to 12 people), meal type (*Breakfast, Lunch, Dinner*), and dietary preferences (*Quick, Healthy, High Protein, Budget*).
- **🍲 Algorithmic Recipe Ranking & Best-Match Score:** Generates up to 3 culinary recipes. The backend calculates an ingredient coverage ratio (`available / total`) to award the **"Best Match"** badge.
- **⚖️ Visual Ingredient Gap Analysis:** Clear color-coded split between **Ingredients You Have** (green) and **Ingredients You Need to Buy** (orange).
- **⏱️ Interactive Cooking Timeline:** Step-by-step numbered cooking instructions with visual check-off boxes to guide your meal prep in real-time.
- **🛒 Smart Missing-Ingredients Shopping List:** Automatically isolates only the missing ingredients into a checklist with quantity controls and one-tap purchase toggles.
- **📄 Vector PDF Export & Native Sharing:** Compiles your meal plan, ingredients overview, and grocery list into a publication-quality PDF report ready to save or share via system share sheets.
- **🛡️ Multi-Provider AI Failover Engine:** Fault-tolerant multi-key KeyPool circuit breaker:
  - **Vision:** Google Gemini 2.5 Flash → OpenRouter Qwen 2.5 VL → Deterministic Mock
  - **Recipes & Steps:** Groq LPUs (Llama 3.3 70B) → Groq Backup (Llama 3.1 8B) → Deterministic Mock

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Mobile Client (Expo / React Native)         │
│  • Camera & Photo Library Picker                            │
│  • Interactive 10-Screen Navigation & Global Context        │
│  • Client-side Vector PDF Generation & Sharing Engine       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (Multipart / JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Next.js 16)                  │
│  • Image Preprocessing (Sharp: 1024px downsample & JPEG)    │
│  • Multi-Tier KeyPool Manager & Cooldown Quarantine         │
│  • AI Vision & Text Dispatchers + Strict JSON Validation    │
│  • Automated Recipe Coverage & Best-Match Ranking           │
└────────────────┬───────────────────────────┬────────────────┘
                 │ Vision Pipeline           │ Text Pipeline
                 ▼                           ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │ Primary: Google Gemini    │ │ Primary: Groq LPU         │
   │ (gemini-2.5-flash)        │ │ (llama-3.3-70b-versatile) │
   └─────────────┬─────────────┘ └─────────────┬─────────────┘
                 │ Failover                    │ Failover
                 ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │ Secondary: OpenRouter     │ │ Secondary: Groq Backup    │
   │ (qwen/qwen2.5-vl-72b)     │ │ (llama-3.1-8b-instant)    │
   └─────────────┬─────────────┘ └─────────────┬─────────────┘
                 │ Failover                    │ Failover
                 ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │ Offline Deterministic     │ │ Offline Deterministic     │
   │ Mock Vision Data          │ │ Mock Recipes & Steps      │
   └───────────────────────────┘ └───────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v20.9.0` or higher
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app installed on your iOS or Android phone (if running on a physical device)

---

### 1. Backend Setup

The backend is a Next.js serverless API providing image processing and AI orchestration.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your local environment configuration
cp .env.example .env.local
```

#### Environment Variables (`backend/.env.local`)

| Variable | Description | Required? | Example |
|---|---|---|---|
| `GEMINI_API_KEYS` | Comma-separated Google Gemini API keys for vision analysis | Recommended | `AIzaSy...1,AIzaSy...2` |
| `GROQ_API_KEYS` | Comma-separated Groq API keys for fast recipe reasoning | Recommended | `gsk_...1,gsk_...2` |
| `OPENROUTER_API_KEYS` | Comma-separated OpenRouter keys for secondary vision failover | Optional | `sk-or-v1-...` |
| `MOCK_AI` | Set to `true` to skip external API calls and use mock data | Optional | `false` |
| `GEMINI_MODEL` | Override vision model name | Optional | `gemini-2.5-flash` |
| `GROQ_MODEL` | Override text model name | Optional | `llama-3.3-70b-versatile` |

```bash
# 4. Start the backend development server
npm run dev
```

The API will be running locally at `http://localhost:3000`.

---

### 2. Mobile App Setup

The mobile application runs on iOS, Android, and Web using Expo.

```bash
# 1. Open a new terminal and navigate to the mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Start Expo development server
npm run start
```

#### Connecting the Mobile App to the Backend:

Depending on where you run the mobile app, adjust the backend URL in `mobile/src/config/api.ts` or set an environment variable:

- **iOS Simulator / Web:** Connects directly to `http://localhost:3000` (default).
- **Android Emulator:** Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` (since `localhost` refers to the emulator itself).
- **Physical Device (via Expo Go on same Wi-Fi):** Set `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3000` (e.g. `http://192.168.1.42:3000`).
- **Offline / Pure Demo Mode:** Set `EXPO_PUBLIC_USE_BACKEND=false` to test the entire client experience with rich offline mock data.

---

## 📡 API Reference

### 1. `POST /api/scan`
Analyzes a fridge photo and returns recognized food items with image thumbnails.
- **Request:** `multipart/form-data` with field `image` (binary or base64) OR `application/json` with `{ "image": "data:image/jpeg;base64,..." }`.
- **Response:**
  ```json
  {
    "source": "gemini",
    "ingredients": [
      { "name": "Eggs", "quantity": 6, "unit": "pcs", "image": "https://..." },
      { "name": "Tomatoes", "quantity": 3, "unit": "pcs", "image": "https://..." }
    ]
  }
  ```

### 2. `POST /api/recipes`
Generates recipes based on confirmed fridge ingredients and user preferences.
- **Request (`application/json`):**
  ```json
  {
    "ingredients": [
      { "name": "Chicken breast", "quantity": 2, "unit": "pcs" },
      { "name": "Tomatoes", "quantity": 3, "unit": "pcs" }
    ],
    "preferences": {
      "peopleCount": 2,
      "mealType": "Dinner",
      "preference": "Quick"
    }
  }
  ```
- **Response:** Array of recipes with cooking times, difficulty, best match ranking, and available vs. missing ingredient breakdown.

### 3. `POST /api/instructions`
Returns step-by-step numbered cooking instructions for a chosen dish.
- **Request (`application/json`):**
  ```json
  {
    "recipeTitle": "Creamy Chicken Pasta",
    "servings": 2,
    "ingredients": [...]
  }
  ```
- **Response:** Array of cooking steps with titles and descriptions.

---

## 🧪 Verification & Testing

Both workspaces have strict linting, typechecking, and automated test coverage:

```bash
# Backend checks & 12-scenario failover test suite
cd backend
npm run lint          # ESLint Next.js rules
npx tsc --noEmit      # TypeScript strict compilation
npm run test          # 12-scenario KeyPool failover test suite
npm run build         # Next.js Turbopack production build

# Mobile checks
cd ../mobile
npm run lint          # Expo ESLint
npx tsc --noEmit      # TypeScript strict compilation
```

---

## 📁 Repository Structure

```
fridgeai-mobile/
├── backend/                  # Next.js 16 Serverless API
│   ├── src/app/api/          # API Route handlers (/scan, /recipes, /instructions)
│   ├── src/lib/ai/           # Multi-provider KeyPool, dispatchers & schemas
│   ├── scripts/              # 12-scenario failure test harness
│   └── package.json
│
├── mobile/                   # React Native Expo Application
│   ├── src/components/       # Modular UI components
│   ├── src/context/          # AppContext global state manager
│   ├── src/navigation/       # React Navigation Native Stack
│   ├── src/screens/          # 10 full application screens
│   ├── src/services/         # API services with offline fallbacks
│   ├── src/theme/            # Colors, spacing, typography & shadows
│   └── package.json
│
├── docs/                     # Technical documentation & architecture
│   ├── architecture.md       # Detailed system architecture
│   └── github.md             # Project structure map
│
├── .github/                  # Open source community templates & CI
│   ├── workflows/ci.yml      # Automated GitHub Actions pipeline
│   ├── ISSUE_TEMPLATE/       # Bug report & feature request templates
│   └── pull_request_template.md
│
├── CODE_OF_CONDUCT.md        # Contributor Covenant Code of Conduct
├── CONTRIBUTING.md           # Open source contributing guidelines
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Multi-Angle & Multi-Shelf Capture:** Snap the fridge door, produce drawer, and freezer in a single scanning session.
- [ ] **Dietary Allergen Profiles:** Persistent settings for Vegan, Gluten-Free, Halal, Kosher, and Nut Allergies.
- [ ] **Expiry Date & Spoilage Prediction:** AI estimation of ingredient shelf-life to prioritize items before they spoil.
- [ ] **1-Click Grocery Cart Integration:** Export missing items directly to grocery delivery platforms (Instacart, Amazon Fresh, local supermarkets).
- [ ] **Lightweight On-Device Vision:** Run local quantized vision models directly on mobile for zero-latency offline ingredient scanning.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details on our code of conduct, development workflow, and pull request process.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  Made with ❤️ by the FridgeAI Open Source Community.
</div>
