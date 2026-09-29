# FridgeAI — Build Day Plan

All times Tunis (UTC+1), per the official schedule. Fill in names where marked.

## Roles (assign before 09:00)

Adjust to your actual team size — merge roles if you're fewer than 4.

| Role | Person | Owns |
|---|---|---|
| Mobile | _______ | `mobile/` — screens, camera capture, API wiring |
| Backend / AI | _______ | `backend/` — API routes, Gemini prompts, mock-mode fallback |
| Demo & submission | _______ | demo fridge photo, 90-second video, slides, the Google Form itself |
| Testing & polish | _______ | runs the app on a real phone constantly, files what's broken, drives the polish pass |

One person should also be the **git point of contact** — not doing all the pushing, just the one who resolves a merge conflict if two people hit one at the same time.

## Timeline

| Time | Event (official) | What we do |
|---|---|---|
| 08:30–09:00 | Check-in | Confirm everyone's laptop has Node 20.9+, phone has Expo Go installed, and `npm install` succeeds in both `backend/` and `mobile/`. |
| 09:00–09:45 | Opening + hackathon history | Listen. Meanwhile, one person can get a Gemini API key at aistudio.google.com/app/apikey so it's ready. |
| 09:45–10:00 | Attendance / roster check | Verify attendance as required. Not a build task. |
| 10:15–11:15 | NVIDIA/Brev workshop | We're not using Brev — skip or listen passively. Use this slot to finalize roles above and confirm everyone can push to the repo (`./scripts/git-work.sh` once each, even with a trivial change, just to test access). |
| 11:15–11:30 | **Build sprint 1** | Backend: add the real `GEMINI_API_KEY` to `.env.local`, confirm live mode works (not mock) with one manual test image. Mobile: confirm the app launches in Expo Go and reaches Home screen. |
| 11:30–11:45 | Mentor checkpoint | Show whatever runs so far, even if ugly. Ask about anything blocking. |
| 11:45–13:00 | **Build sprint 2** | Core loop, end to end: photo → real ingredient detection → editable list → preferences → real recipe generation → recipe detail with have/missing → shopping list. Get it *working*, not pretty. This is the single most important block of the day — the whole MVP is this loop (brief §36). |
| 13:00–13:45 | Lunch | Also a good time for someone to prep the **demo fridge photo** (see `docs/demo-script.md`) so testing later uses a real, representative shot. |
| 13:45–14:00 | Submission briefing | Listen. Cross-check against `docs/submission-checklist.md`. |
| 14:00–15:30 | **Build sprint 3** | Polish the core loop with real data. Start recording rough demo video takes. Start the slides (`docs/pitch-outline.md`) — don't wait until 17:00. |
| 15:30–15:45 | Technical + submission checkpoint | Full run-through on an actual phone, on whatever Wi-Fi you'll demo on. Click every link that will go in the form (repo, slides, video) exactly as a reviewer would. |
| 15:45–17:00 | **Final build sprint** | Only now, if the core loop is solid, work down the brief's polish priority list (§36): UI polish → animations → scanning-screen experience → recipe visuals → loading states → error handling → demo reliability. Do not add new features here. |
| 17:00–17:30 | Submission workshop | Fill out the Google Form. One person does this, using the same final team name and lead email as your Final Team Confirmation. Save the confirmation. |
| 17:45–19:15 | Country judging | Nothing to do but wait. |
| 19:15–19:45 | Live demos (winners only) | If selected, this uses the same video/demo you already prepared. |

## Definition of "core loop done" (don't move past sprint 2 until this is true)

Per the product brief's final scope lock:

1. Take/upload a fridge photo.
2. See AI-detected ingredients, and can add/edit/remove them.
3. Pick people count, meal type, optional preference.
4. Get 2–3 real generated recipes.
5. Open one, see 🟢 have / 🟠 missing split correctly.
6. Get a shopping list containing only the missing items.

No dead ends anywhere in that chain. If any step is mocked/fake by 15:30, that's fine — flag it honestly in the AI-disclosure field — but the *click path* must never break.

## Merge discipline today

- Feature branches, short-lived: `feature/scanning-ui`, `feature/backend-prompts`, etc.
- Merge into `main` every 30–60 minutes, not once at the end.
- Whoever finishes a merge runs the app once before moving on, so `main` never sits broken for long.
