# FridgeAI

Turn a fridge photo into recipes and a shopping list.

> Photo → ingredient detection → confirmation → recipes → missing ingredients → shopping list

## Repository structure

```
Neurox/
├─ backend/                 Next.js API: ingredient detection and recipes
├─ mobile/                  Expo / React Native app
├─ docs/                    plan, demo, pitch, and submission resources
├─ scripts/git-work.sh      commit, push, and team-log helper
├─ CONTRIBUTING.md          team Git workflow
├─ TEAM_LOG.md              generated collaboration log
└─ AI_Fridge_to_Meal_Planner_Product_Brief.md
```

## Start here

1. Read [the build plan](docs/PLAN.md) and assign file ownership before coding.
2. Set up [the mobile app](mobile/README.md).
3. Set up [the API](backend/README.md).
4. Read [the Git workflow](CONTRIBUTING.md) before your first branch.
5. Use [the submission checklist](docs/submission-checklist.md) before submitting.

## Core flow

1. Capture or select a fridge photo.
2. Detect ingredients and let the user correct them.
3. Collect meal preferences.
4. Generate recipes and show available versus missing ingredients.
5. Build a shopping list from the missing items.

## Team rules

- `main` must stay runnable.
- Work in short-lived `feature/<task>` branches and use pull requests to merge.
- Keep mobile and backend changes separate unless the API contract changes.
- Never commit `.env` files, API keys, or generated dependencies.
