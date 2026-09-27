# FridgeAI Mobile

Expo / React Native client for FridgeAI.

## Setup

```bash
cd mobile
npm install
npm start
```

For a physical phone, set `EXPO_PUBLIC_API_URL` in `mobile/.env.local` to the computer's LAN address where the backend is running (see `.env.example`). `localhost` on a phone points to the phone itself. Start the backend separately with `cd backend && npm run dev`.

Use Expo Go for the current JavaScript-only dependency set. Run the checks before opening a pull request:

```bash
npm run lint
npm exec tsc --noEmit
```

## Ownership boundaries

- `src/screens/` — screen-specific UI
- `src/components/` — reusable UI
- `src/services/` — API client and local fallbacks
- `src/types/` — shared app types

Coordinate with the backend owner before changing request or response shapes.
