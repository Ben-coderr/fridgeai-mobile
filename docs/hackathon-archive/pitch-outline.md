# Pitch Deck Outline

Suggested structure from the hackathon FAQ: **problem → solution → working demo → AI contribution → testing/results → limitations and next steps.** No mandatory slide count — this is a reasonable default for ~6 slides.

## 1. Problem
"What can I cook with what I have?" — existing recipe apps work backwards (recipe → check fridge → shop), creating friction and food waste. (Brief §2.)

## 2. Solution
Flip the flow: **Fridge → Ingredients → Recipes → Missing Ingredients → Shopping.** One line: *"We turn a photo of your fridge into your next meal."* (Brief §33, 30-second pitch — paraphrase in your own words for the slide, don't just copy verbatim.)

## 3. Working demo
Embed or link the screen recording / GIF of the actual app running the full loop. This slide should need almost no narration — let the product speak.

## 4. AI contribution (why this isn't "just another AI recipe generator")
Two real AI stages, not one:
- **Computer vision** — understands what's in the fridge from a photo.
- **Generative AI** — understands what can be cooked from those ingredients + preferences.

Name the actual model(s) used (e.g. Gemini 2.0 Flash) and be specific about what each stage does.

## 5. Testing, results, responsible AI
- What you actually tested (e.g. "tested against 5 real fridge photos, correctly identified X/Y ingredients").
- Any failure modes you found and how you handled them (e.g. human verification step exists *because* vision isn't perfect — that's a feature, not a gap).
- One line on responsible AI: no personal data stored, user confirms/corrects AI output before it's acted on.

## 6. Limitations + next steps
Be honest about 1–2 real limitations (matches what you say in the video). Then 1–2 concrete next steps if you had more time (e.g. dietary restrictions, multi-photo fridges, nutrition info).

---

**Summary field for the form (max 150 words)** — template from the brief:

> We help [user] solve [problem]. Our prototype [core feature]. We use [model/tool] for [actual AI contribution]. We tested it with [data/test] and observed [result]. Current limitations: [limits]. Next step: [improvement].

Fill in the brackets with what you actually built and tested — not aspirational claims.
