


# AI Fridge-to-Meal Planner — Product Brief

## 1. Product Overview

### Working Name
FridgeAI *(working name; final branding can be decided later)*

### One-Line Description
An AI-powered meal planner that turns a photo of your fridge into practical recipes and a shopping list for the ingredients you're missing.

### Core Concept

The user takes a photo of their fridge or uploads one from their device.

The application uses AI vision to identify the available ingredients. The user can review and correct the detected ingredients before choosing a few simple preferences, such as the number of people and meal type.

A generative AI model then creates recipes specifically around those ingredients.

For every recipe, the system distinguishes between:

- 🟢 Ingredients the user already has
- 🟠 Ingredients the user needs to buy

The application then generates a simple shopping list containing only the missing ingredients.

---

# 2. The Problem

People frequently open their fridge and face the same question:

> "What can I cook with what I have?"

Existing recipe platforms generally work in the opposite direction.

The user must:

1. Think of a dish.
2. Search for a recipe.
3. Check the ingredients.
4. Compare those ingredients against what's in their fridge.
5. Figure out what's missing.
6. Build a shopping list.

This creates unnecessary friction.

At the same time, people often have ingredients available at home that they forget about, eventually leading to:

- Food waste
- Unplanned grocery purchases
- Repetitive meals
- Time spent searching for recipes
- Difficulty deciding what to cook

---

# 3. The Solution

Our application reverses the traditional recipe discovery process.

Instead of:

**Recipe → Ingredients → Shopping**

we do:

**Fridge → Ingredients → Recipes → Missing Ingredients → Shopping**

The fridge becomes the starting point.

### Core Experience

```text
📸 Take a photo
      ↓
👁️ AI Vision
      ↓
🥕 Detect ingredients
      ↓
✏️ User confirms/corrects
      ↓
🤖 Generative AI
      ↓
🍳 Generate recipes
      ↓
🟢 Have / 🟠 Need
      ↓
🛒 Shopping List
```

---

# 4. Target Users

## Primary Audience

### Students and Young Adults

People who:

- Cook at home
- Have limited time
- Don't know what to prepare
- Want to save money
- Don't want to manually plan meals

## Secondary Audience

### Busy Individuals and Families

People who have ingredients at home but don't want to spend time manually planning meals.

---

# 5. Example User Persona

### Adam — 23

Adam gets home after a long day.

He opens his fridge and finds:

- Eggs
- Tomatoes
- Cheese
- Chicken
- Milk
- Vegetables

He doesn't know what to make.

Normally, he would search Google or TikTok for recipes and manually check which ingredients he has.

Instead:

1. Adam takes a picture.
2. AI identifies the ingredients.
3. Adam confirms the detected ingredients.
4. He selects Dinner → 2 people → Quick.
5. The application generates three possible meals.
6. Adam chooses one.
7. The application tells him which ingredients he already has and which ones are missing.
8. The application generates a shopping list containing only the missing ingredients.

---

# 6. Product Goals

The MVP has five major goals:

### Goal 1 — Make meal discovery effortless

The user shouldn't need to know what they want to cook.

### Goal 2 — Demonstrate useful AI

The AI should perform a meaningful real-world task rather than simply generate text.

### Goal 3 — Reduce food waste

The system encourages users to cook with ingredients they already own.

### Goal 4 — Simplify grocery planning

Only missing ingredients should appear in the shopping list.

### Goal 5 — Create a visually impressive hackathon demo

The entire product should be understandable by watching one user journey.

---

# 7. Core Features

## Feature 1 — Fridge Photo Capture

The user can:

- Take a photo using the camera
- Upload an existing photo

### Input

Fridge/refrigerator image.

### Output

Image passed to the AI vision system.

---

# 8. Feature 2 — AI Ingredient Detection

The vision model analyzes the image and identifies visible food ingredients.

Example output:

```json
{
  "ingredients": [
    {
      "name": "eggs",
      "quantity": 6
    },
    {
      "name": "tomatoes",
      "quantity": 3
    },
    {
      "name": "chicken breast",
      "quantity": 2
    }
  ]
}
```

The application should normalize the result into a consistent ingredient format.

---

# 9. Feature 3 — Human Verification

AI vision isn't perfect.

Therefore, the user can verify the result.

They can:

- Add an ingredient
- Remove an ingredient
- Edit an ingredient
- Change quantity

Example:

```text
AI detected:

✓ Eggs — 6
✓ Tomatoes — 3
✓ Chicken — 2
✓ Milk — 1

+ Add ingredient
```

This makes the system more reliable without requiring perfect computer vision.

---

# 10. Feature 4 — Meal Preferences

The user provides minimal information.

### Number of People

A simple +/- quantity selector.

### Meal

- Breakfast
- Lunch
- Dinner

### Optional Preference

- Quick
- Healthy
- High Protein
- Budget

The system should not force the user through a long questionnaire.

---

# 11. Feature 5 — AI Recipe Generation

The confirmed ingredients and preferences are passed to the generative model.

Example input:

```text
Available ingredients:
- Chicken
- Eggs
- Tomatoes
- Onion
- Rice

People:
2

Meal:
Dinner

Preference:
High Protein
```

The model generates 2–3 recipes.

Each recipe should include:

### Recipe Metadata

- Name
- Description
- Cooking time
- Servings

### Ingredients

- Available ingredients
- Missing ingredients

### Instructions

Simple numbered cooking steps.

---

# 12. Feature 6 — Ingredient Availability Analysis

For every recipe, the system compares the recipe ingredients against the user's confirmed fridge inventory.

Example:

## Chicken Tomato Rice

### You Have

🟢 Chicken  
🟢 Rice  
🟢 Tomatoes  
🟢 Onion

### You're Missing

🟠 Soy sauce  
🟠 Spring onions

This is one of the strongest parts of the product because the recommendation is immediately actionable.

---

# 13. Feature 7 — Shopping List

Once the user selects a recipe, the application extracts only the missing ingredients.

Example:

## Shopping List

☐ Soy sauce  
☐ Spring onions

The application does not need supermarket integration in the MVP.

The objective is simply:

> Tell me what I need to buy.

---

# 14. Complete User Journey

## Step 1 — Home

User opens the application.

CTA:

**Scan My Fridge**

## Step 2 — Capture

User takes a photo or uploads one.

## Step 3 — AI Scanning

The application visually communicates:

```text
Image captured ✓

Detecting ingredients...
Identifying food...
Organizing ingredients...
```

## Step 4 — Ingredients

AI returns detected ingredients.

The user verifies and edits the list.

## Step 5 — Preferences

User chooses:

```text
2 people
Dinner
Quick
```

## Step 6 — Generate

User taps:

**Generate Recipes**

## Step 7 — Recipes

Generative AI produces 2–3 recipes.

Example:

```text
Creamy Chicken Pasta
20 min

Spicy Tomato Rice
25 min

Chicken & Vegetable Bowl
15 min
```

## Step 8 — Recipe Detail

User opens a recipe.

Example:

```text
YOU HAVE

✓ Chicken
✓ Tomatoes
✓ Rice

MISSING

○ Soy sauce
○ Spring onions
```

## Step 9 — Shopping List

The application generates:

```text
SHOPPING LIST

☐ Soy sauce
☐ Spring onions
```

The journey is complete.

---

# 15. Screen Architecture

The MVP consists of 5 primary screens.

### 01 — Home / Scan

Purpose: Start the experience.

### 02 — AI Scanning

Purpose: Visualize the AI vision process.

### 03 — Ingredients

Purpose: Verify AI detection and configure basic preferences.

### 04 — Recipes

Purpose: Display AI-generated meal recommendations.

Contains Recipe Detail as a nested view/state.

### 05 — Shopping List

Purpose: Show missing ingredients.

---

# 16. UI Philosophy

The fundamental principle is:

> The AI should feel invisible and effortless.

The user shouldn't feel like they're configuring an AI system.

They should feel like:

> "I showed the app my fridge, and it figured out dinner."

---

# 17. Visual Identity

The product should feel:

- Fresh
- Intelligent
- Friendly
- Modern
- Practical
- Fast

Avoid:

- Corporate dashboards
- Excessive gradients
- Complicated AI interfaces
- Too many colors
- Dense information
- Excessive animations

---

# 18. Color Direction

### Primary

Fresh green.

Represents:

- Food
- Freshness
- Sustainability
- Health

### Secondary

Dark green.

Used for:

- Headers
- Important text
- Major UI elements

### Accent

Warm orange/yellow.

Used for:

- Missing ingredients
- Food highlights
- Secondary actions

### Background

Warm white/light neutral.

### Text

Dark charcoal.

---

# 19. Typography

Use a modern sans-serif font.

The typography hierarchy should be obvious.

### Headings

Large and bold.

Example:

> What's in your fridge?

### Supporting Text

Smaller and muted.

> We'll turn it into something delicious.

### CTA

Bold and immediately recognizable.

---

# 20. Interaction Principles

Every screen should have one primary action.

### Home

**Scan My Fridge**

### Ingredients

**Generate Recipes**

### Recipe

**Add Missing Items**

Avoid multiple competing CTAs.

---

# 21. AI Architecture

The system has two major AI stages.

## Stage 1 — Computer Vision

```text
Image
↓
NVIDIA / Vision Model
↓
Detected Ingredients
```

Its job:

> Understand what's visible.

## Stage 2 — Generative AI

```text
Ingredients
+
Preferences
↓
LLM
↓
Recipes
```

Its job:

> Understand what can be cooked.

---

# 22. Why the Two AI Stages Matter

We are not simply saying:

> "We use AI to generate recipes."

That is generic.

Instead:

> "We combine visual AI with generative AI to transform an image of a real-world environment into an actionable meal plan."

The user doesn't have to describe what's in the fridge.

The camera becomes the interface.

---

# 23. NVIDIA / Brev Role

The NVIDIA component should be clearly visible in the technical architecture.

Conceptually:

```text
USER
 ↓
Fridge Image
 ↓
NVIDIA / Brev Vision Pipeline
 ↓
Ingredient Detection
 ↓
Normalized Ingredients
 ↓
Recipe LLM
 ↓
Meal Recommendations
```

The exact NVIDIA/Brev implementation should follow the official hackathon requirements.

---

# 24. Backend Responsibilities

The backend should remain lightweight.

Potential endpoints:

```text
POST /analyze-fridge
```

Analyzes the uploaded image.

```text
POST /generate-recipes
```

Generates recipes from confirmed ingredients and preferences.

```text
POST /shopping-list
```

Optionally generates/normalizes the missing ingredient list.

Persistent accounts are unnecessary for the MVP.

---

# 25. Core Data Model

### Ingredient

```typescript
{
  id: string
  name: string
  quantity?: number
  unit?: string
}
```

### FridgeAnalysis

```typescript
{
  ingredients: Ingredient[]
}
```

### Recipe

```typescript
{
  id: string
  name: string
  description: string
  cookingTime: number
  servings: number
  ingredients: RecipeIngredient[]
  instructions: string[]
}
```

### RecipeIngredient

```typescript
{
  name: string
  quantity: string
  available: boolean
}
```

---

# 26. MVP Constraints

We deliberately do NOT build:

- Authentication
- User profiles
- Personal history
- Social features
- Payments
- Grocery-store integrations
- Food delivery
- Nutrition tracking
- Full meal calendars
- Advanced dietary tracking
- Complex recommendation systems
- Supermarket pricing

The hackathon MVP should focus entirely on the core experience.

---

# 27. Performance Targets

The application should feel fast.

### Image Analysis

Target: a few seconds.

### Recipe Generation

Target: a few seconds.

### UI

Transitions should feel immediate and smooth.

The user should never wonder whether the application is frozen.

---

# 28. Error States

## Invalid Image

> We couldn't identify enough ingredients.

Action:

**Retake Photo**

## Vision Failure

> Something went wrong analyzing your fridge.

Action:

**Try Again**

## Recipe Generation Failure

> We couldn't generate recipes right now.

Action:

**Try Again**

## Empty Ingredient List

> Add at least one ingredient to continue.

Action:

**Add Ingredient**

Every error should provide a clear recovery action.

---

# 29. Accessibility

The application should provide:

- Large tap targets
- Good text contrast
- Clear button labels
- Screen-reader-friendly controls
- Clear error messages
- Information that does not rely only on color

For example, don't communicate availability only through green/red.

Use:

✓ You have it

and:

+ Need to buy

alongside the colors.

---

# 30. Hackathon Differentiator

The product is not just another AI recipe generator.

The key differentiator is the multimodal workflow.

### Traditional AI Recipe Generator

```text
User types:
"I have chicken, tomatoes and rice"
↓
AI
↓
Recipe
```

### Our Product

```text
Real-world environment
↓
PHOTO
↓
Computer Vision
↓
Food Inventory
↓
Generative AI
↓
Personalized Meals
↓
Missing Ingredients
↓
Shopping List
```

The user doesn't have to describe what's in the fridge.

The camera becomes the interface.

---

# 31. Demo Scenario

For the final presentation, use a carefully prepared fridge image containing recognizable ingredients.

Recommended example ingredients:

- Eggs
- Tomatoes
- Chicken
- Milk
- Cheese
- Pasta
- Vegetables

The demo should deliberately produce recipes where most ingredients are available but 1–3 are missing.

This makes the final shopping-list step meaningful.

---

# 32. The "Wow Moment"

The most important moment is:

### Before

The user sees random ingredients in their fridge.

### After

The application says:

> You can make these 3 meals.

Then:

> You already have 7 of 9 ingredients.

Then:

> You only need 2 more ingredients.

Then:

> Here's your shopping list.

This is the emotional payoff of the entire product.

---

# 33. Pitch

## 10-Second Pitch

> We built an AI meal planner that looks inside your fridge, understands what you already have, creates recipes around it, and tells you exactly what you're missing.

## 30-Second Pitch

> Instead of searching for recipes and manually checking your fridge, you simply take a photo. Our vision AI identifies your ingredients, then a generative AI model creates recipes based on what you already have and your preferences. The system compares each recipe against your fridge inventory and automatically generates a shopping list for the missing ingredients. We turn a photo of your fridge into your next meal.

---

# 34. Product Success Criteria

The product is successful if a judge can understand the entire concept without needing a long explanation.

The ideal demo flow is:

**Photo → Detection → Confirmation → Recipe → Missing Ingredients → Shopping List**

with no dead ends.

---

# 35. Final Product Definition

The product is:

> **A multimodal AI assistant that transforms a photo of a user's fridge into personalized meal recommendations and an actionable shopping list.**

### Core technologies

**Computer Vision**

→ Understand the fridge.

**Generative AI**

→ Understand what can be cooked.

**Structured Application Logic**

→ Compare available vs. missing ingredients.

**Simple UX**

→ Turn all of that complexity into a few taps.

---

# 36. Final Scope Lock

The official MVP scope is:

```text
╔════════════════════════════════════╗
║        AI FRIDGE PLANNER           ║
╠════════════════════════════════════╣
║                                    ║
║  📸 1. CAPTURE                     ║
║       Take fridge photo             ║
║                                    ║
║  👁️ 2. UNDERSTAND                  ║
║       AI detects ingredients        ║
║                                    ║
║  ✏️ 3. CONFIRM                     ║
║       User edits ingredients        ║
║                                    ║
║  🤖 4. GENERATE                    ║
║       AI creates recipes            ║
║                                    ║
║  🍳 5. CHOOSE                      ║
║       User selects a meal           ║
║                                    ║
║  🛒 6. SHOP                        ║
║       Missing ingredients           ║
║                                    ║
╚════════════════════════════════════╝
```

This is the complete hackathon MVP.

Everything else is secondary.

If additional development time is available, prioritize:

1. UI polish
2. Animations
3. AI scanning experience
4. Recipe visuals
5. Loading states
6. Error handling
7. Demo reliability

Do not expand the feature scope until the core loop is flawless.
