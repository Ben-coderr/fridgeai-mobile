# FridgeAI — Repository Architecture & Structure

```
fridgeai-mobile/
├── backend/                        # Next.js 16 Serverless API & AI Dispatcher Engine
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── health/         # GET /api/health (System status, latency & AI KeyPool health)
│   │   │   │   ├── scan/           # POST /api/scan (Vision analysis: Sharp + Gemini/OpenRouter)
│   │   │   │   ├── recipes/        # POST /api/recipes (Recipe generation: Groq Llama-3.3/3.1)
│   │   │   │   └── instructions/   # POST /api/instructions (Step-by-step cooking instructions)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── lib/
│   │       └── ai/
│   │           ├── dispatcher.ts   # Multi-tier fallback & scoring engine
│   │           ├── keyPool.ts      # Multi-key rotation & cooldown quarantine (429/5xx circuit breaker)
│   │           ├── geminiProvider.ts # Google Gemini 2.5 / 1.5 Flash vision client
│   │           ├── openrouterProvider.ts # OpenRouter Qwen 2.5 VL fallback client
│   │           ├── groqProvider.ts # Groq Llama 3.3/3.1 ultra-fast culinary reasoning
│   │           ├── imageResolver.ts # TheMealDB CDN & Unsplash HD image mapping
│   │           ├── schemas.ts      # Strict TypeScript validation schemas (Zod-like)
│   │           ├── prompts.ts      # Structured system prompts for vision & cooking
│   │           └── mockData.ts     # Offline deterministic mock datasets
│   ├── scripts/
│   │   └── test-all-scenarios.ts   # 12-scenario automated failure & failover test suite
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── mobile/                         # React Native (Expo SDK 57) Cross-Platform Client
│   ├── assets/                     # App icons, splash, and adaptive assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # Header, PrimaryButton, Badge, QuantityStepper
│   │   │   ├── ingredients/        # IngredientRow & ingredient cards
│   │   │   ├── preferences/        # MealTypeSelector & PreferenceChips
│   │   │   ├── recipes/            # RecipeCard (Hero and compact variants)
│   │   │   └── shopping/           # ShoppingItemRow with purchase checkboxes
│   │   ├── config/
│   │   │   └── api.ts              # Central API configuration (LAN IP / backend toggle)
│   │   ├── context/
│   │   │   └── AppContext.tsx      # Global state for ingredients, preferences, recipes, shopping
│   │   ├── data/
│   │   │   └── mockData.ts         # High-resolution mock food imagery and initial state
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx    # Native Stack Navigator (10 screens)
│   │   ├── screens/                # App screen flows
│   │   │   ├── HomeScreen.tsx      # Camera / library photo capture launchpad
│   │   │   ├── ScanningScreen.tsx  # Interactive visual scanning animation with real-time steps
│   │   │   ├── IngredientsScreen.tsx # Human-in-the-loop inventory verification & adjustments
│   │   │   ├── PreferencesScreen.tsx # Servings, meal type, and dietary goals selector
│   │   │   ├── RecipesScreen.tsx   # Curated recipe deck & "Plan Ready" celebration view
│   │   │   ├── RecipeDetailScreen.tsx # Ingredient split (Have vs. Missing) & details
│   │   │   ├── CookingInstructionsScreen.tsx # Interactive checkable cooking timeline
│   │   │   ├── ShoppingListScreen.tsx # Missing items grocery checklist with share feature
│   │   │   ├── PdfExportScreen.tsx # Meal plan vector PDF generator & system share sheet
│   │   │   └── SettingsScreen.tsx  # Session controls, metric units, preferences reset
│   │   ├── services/               # API clients with offline mock fallbacks
│   │   │   ├── scanService.ts      # Image upload & preprocessing pipeline
│   │   │   ├── recipeService.ts    # Recipe generation & cooking step loader
│   │   │   ├── shoppingService.ts  # Shopping list generator
│   │   │   ├── ingredientService.ts# Custom ingredient management
│   │   │   └── pdfService.ts       # HTML-to-PDF compilation & native sharing
│   │   ├── theme/                  # Design system tokens (colors, typography, spacing, shadows)
│   │   ├── types/                  # Core TypeScript domain models
│   │   └── utils/
│   │       └── imageHelper.ts      # Image CDN resolution & category matching
│   ├── app.json
│   ├── App.tsx
│   ├── package.json
│   └── README.md
│
├── docs/                           # Documentation, guides, and project specifications
│   ├── architecture.md             # Full architecture & failover pipeline documentation
│   ├── github.md                   # This project structure map
│   └── hackathon-archive/          # Hackathon planning archives & presentation scripts
│
├── .github/                        # Open source community templates & CI workflows
│   ├── workflows/ci.yml            # Automated CI linting, typechecking, and testing
│   ├── ISSUE_TEMPLATE/             # Standard issue reporting templates
│   └── pull_request_template.md    # Pull request submission template
│
├── CODE_OF_CONDUCT.md              # Contributor Covenant Code of Conduct
├── CONTRIBUTING.md                 # Open source contribution guide
├── LICENSE                         # MIT License
├── README.md                       # Main open source project landing page & showcase
└── AGENTS.md                       # AI coding pair programming guidelines
```
