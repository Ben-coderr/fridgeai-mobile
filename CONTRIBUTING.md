# Contributing to FridgeAI

Thank you for your interest in contributing to **FridgeAI**! We welcome contributions from developers, designers, foodies, and open-source enthusiasts of all skill levels.

Whether you're fixing a bug, adding support for new AI models, improving recipe generation algorithms, or refining the mobile UI, this guide explains how to get started.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please keep all interactions respectful, constructive, and inclusive.

---

## Getting Started

### 1. Prerequisites

Before setting up the project locally, ensure you have:

- **Node.js**: `v20.9.0` or higher
- **npm** or **bun**
- **Git**
- Optional for mobile testing:
  - [Expo Go](https://expo.dev/go) on your iOS or Android physical device, OR
  - iOS Simulator (macOS / Xcode) / Android Emulator (Android Studio)

### 2. Fork and Clone

1. Fork the repository on GitHub: [`https://github.com/Ben-coderr/fridgeai-mobile`](https://github.com/Ben-coderr/fridgeai-mobile)
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/fridgeai-mobile.git
   cd fridgeai-mobile
   ```
3. Set the upstream remote:
   ```bash
   git remote add upstream https://github.com/Ben-coderr/fridgeai-mobile.git
   ```

---

## Development Setup

FridgeAI is structured as a two-part monorepo:
- `backend/`: Next.js 16 API with multi-provider AI vision & text pipelines.
- `mobile/`: Expo SDK 57 React Native application.

### Setting up the Backend

```bash
cd backend
npm install
cp .env.example .env.local
```

Configure your API keys in `backend/.env.local`. You can configure one or multiple keys for failover:
- `GEMINI_API_KEYS` (Google Gemini AI Studio)
- `OPENROUTER_API_KEYS` (OpenRouter API)
- `GROQ_API_KEYS` (Groq API)

*Tip:* You can also set `MOCK_AI=true` to test the backend locally without making outbound network calls to AI APIs.

Start the Next.js development server:
```bash
npm run dev
# The backend will be live at http://localhost:3000
```

### Setting up the Mobile App

In a separate terminal:
```bash
cd mobile
npm install
```

Configure your environment if needed:
```bash
# Optional: Point to your backend or run in mock mode
# Copy and edit .env
```

Start Expo:
```bash
npm run start
```

Press `i` for iOS Simulator, `a` for Android Emulator, `w` for Web, or scan the QR code with your camera/Expo Go app on a physical device.

*Note for physical devices / Android emulator:*
- Android Emulator: Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`
- Physical phone on Wi-Fi: Set `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3000`

---

## Development Workflow & Standards

### Branch Naming Conventions

Create a new branch from `main` using descriptive prefixes:
- `feat/add-barcode-scanner` (New feature)
- `fix/image-upload-orientation` (Bug fix)
- `docs/update-readme` (Documentation update)
- `refactor/clean-key-pool` (Code refactoring)
- `test/add-vision-scenarios` (Testing improvements)

```bash
git checkout -b feat/your-feature-name
```

### Code Style & Guidelines

- **TypeScript**: Strict type checking is enabled across both workspaces. Avoid using `any`; define explicit interfaces in `types/`.
- **Linting**: Keep code clean and lint-free.
- **Commit Messages**: Follow conventional commit guidelines:
  - `feat: add recipe calorie estimation`
  - `fix: handle corrupted image uploads in scan route`
  - `docs: update API route documentation`

### Verification Before Submitting

Always run typecheck, lint, and backend test suites locally before pushing your branch:

```bash
# Backend checks
cd backend
npm run lint
npx tsc --noEmit
npm run test
npm run build

# Mobile checks
cd ../mobile
npm run lint
npx tsc --noEmit
```

---

## Submitting a Pull Request (PR)

1. Commit your changes:
   ```bash
   git commit -m "feat: your concise commit message"
   ```
2. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
3. Open a Pull Request from your branch to `Ben-coderr/fridgeai-mobile:main`.
4. Fill in the Pull Request template describing:
   - What changes were made and why.
   - Any testing performed (include screenshots for UI changes).
   - Any breaking changes or dependency additions.
5. Address any review comments or CI test failures promptly.

---

## How to Help

Not sure where to begin? Check out the GitHub issues labeled:
- `good first issue` — Great for newcomers.
- `help wanted` — High-priority enhancements we'd love assistance with.
- `bug` — Verified bugs that need fixes.

Ideas for contribution:
- Adding ingredient shelf-life and expiration warnings.
- Multi-photo capture (uploading photos of door + shelves).
- Dietary preference filters (Vegan, Gluten-Free, Halal, Kosher, Nut-Free).
- Local supermarket price estimation and 1-click cart exports.
- Multi-language support (i18n).

Thank you for helping make FridgeAI better for everyone! 🍳
