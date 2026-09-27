import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Recipe, ShoppingItem, Ingredient } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function escape(str: string | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function today(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── HTML template ───────────────────────────────────────────────────────────

function buildHtml(recipes: Recipe[], shoppingList: ShoppingItem[], ingredients: Ingredient[]): string {
  const toBuy = shoppingList.filter((item) => !item.isPurchased);
  const itemRows = (items: Ingredient[] | ShoppingItem[], variant: 'have' | 'buy') =>
    items.length
      ? items.map((item) => `
          <div class="item-row">
            <span class="item-dot ${variant}">${variant === 'have' ? '✓' : '•'}</span>
            <span class="item-name">${escape(item.name)}</span>
            <span class="item-quantity">${item.quantity} ${escape(item.unit)}</span>
          </div>`).join('')
      : '<p class="empty">Nothing to add.</p>';

  const mealCards = recipes.map((recipe) => `
    <div class="meal-card">
      ${recipe.image ? `<img class="meal-image" src="${escape(recipe.image)}" />` : '<div class="meal-image placeholder"></div>'}
      <div class="meal-copy">
        <div class="meal-title">${escape(recipe.title)}</div>
        <div class="meal-meta">◷ ${recipe.cookingTime} min &nbsp; · &nbsp; ♙ ${recipe.servings} servings</div>
      </div>
    </div>`).join('') || '<p class="empty">No meals selected.</p>';

  const recipeSections = recipes.map((recipe, recipeIndex) => `
    <section class="recipe-detail ${recipeIndex > 0 ? 'page-break' : ''}">
      <div class="recipe-heading">
        ${recipe.image ? `<img class="recipe-image" src="${escape(recipe.image)}" />` : ''}
        <div>
          <h2>${escape(recipe.title)}</h2>
          <p>◷ ${recipe.cookingTime} min &nbsp; · &nbsp; ♙ ${recipe.servings} servings <span class="difficulty">${escape(recipe.difficulty)}</span></p>
        </div>
      </div>
      <div class="recipe-columns">
        <div class="recipe-panel ingredients-panel">
          <h3>Ingredients</h3>
          <ul>${recipe.availableIngredients.map((item) => `<li>${escape(item.name)} <span>${item.quantity} ${escape(item.unit)}</span></li>`).join('')}</ul>
          ${recipe.missingIngredients.length ? `<h4>Also buy</h4><ul>${recipe.missingIngredients.map((item) => `<li>${escape(item.name)} <span>${item.quantity} ${escape(item.unit)}</span></li>`).join('')}</ul>` : ''}
        </div>
        <div class="recipe-panel instruction-panel">
          <h3>Instructions</h3>
          ${recipe.instructions.map((step, index) => `
            <div class="instruction"><span>${step.step || index + 1}</span><div><strong>${escape(step.title)}</strong><p>${escape(step.description)}</p></div></div>`).join('') || '<p class="empty">Instructions are not available yet.</p>'}
        </div>
      </div>
    </section>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>FridgeAI Meal Plan Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { margin: 18mm 14mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #102A36; background: #fff; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:2px solid #DFF4E5; }
    .brand { display:flex; align-items:center; gap:9px; } .brand-mark { width:30px; height:30px; border-radius:9px; background:#0E923F; color:#fff; text-align:center; line-height:30px; font-size:17px; }
    .brand-name { font-size:22px; font-weight:800; letter-spacing:-.5px; } .brand-green { color:#0E923F; } .brand-sub { color:#687780; font-size:10px; margin-top:2px; }
    .report-meta { text-align:right; font-size:10px; color:#687780; line-height:1.55; } .report-meta strong { display:block; color:#102A36; font-size:12px; }
    .section-title { font-size:16px; font-weight:800; margin:24px 0 11px; color:#102A36; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; } .summary-card { border-radius:12px; padding:14px; min-height:142px; }
    .have-card { background:#F0FAF2; } .buy-card { background:#FFF6ED; } .card-title { font-size:12px; font-weight:800; margin-bottom:8px; } .have-card .card-title { color:#167A37; } .buy-card .card-title { color:#B45309; }
    .item-row { display:flex; align-items:center; padding:4px 0; font-size:10px; } .item-dot { width:15px; height:15px; border-radius:50%; text-align:center; line-height:15px; margin-right:7px; font-size:9px; font-weight:800; } .item-dot.have { background:#32B656; color:#fff; } .item-dot.buy { background:#F59E0B; color:#fff; }
    .item-name { flex:1; font-weight:600; } .item-quantity { color:#687780; } .empty { font-size:10px; color:#94A3B8; }
    .meal-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; } .meal-card { border:1px solid #E6ECE8; border-radius:10px; overflow:hidden; background:#fff; } .meal-image { width:100%; height:84px; object-fit:cover; display:block; background:#EDF4EF; } .meal-copy { padding:7px; } .meal-title { font-weight:800; font-size:10px; line-height:1.25; } .meal-meta { color:#687780; font-size:8px; margin-top:5px; }
    .recipe-detail { margin-top:24px; } .recipe-heading { display:flex; gap:12px; align-items:center; border-bottom:1px solid #E6ECE8; padding-bottom:12px; margin-bottom:12px; } .recipe-image { width:76px; height:60px; object-fit:cover; border-radius:9px; background:#EDF4EF; } h2 { font-size:17px; margin-bottom:5px; } .recipe-heading p { color:#687780; font-size:10px; } .difficulty { display:inline-block; color:#167A37; background:#EAF7E8; border-radius:8px; padding:3px 6px; font-weight:800; }
    .recipe-columns { display:grid; grid-template-columns:.8fr 1.35fr; gap:12px; } .recipe-panel { border-radius:11px; padding:12px; } .ingredients-panel { background:#F1FAF3; } .instruction-panel { background:#F7FBF8; } h3 { font-size:11px; margin-bottom:8px; color:#145D2F; } h4 { color:#B45309; font-size:10px; margin:10px 0 5px; } ul { padding:0; list-style:none; } li { font-size:10px; padding:3px 0; border-bottom:1px solid rgba(16,42,54,.07); } li span { float:right; color:#687780; }
    .instruction { display:flex; gap:7px; padding:4px 0; } .instruction > span { flex:0 0 16px; width:16px; height:16px; border-radius:50%; background:#32B656; color:#fff; text-align:center; line-height:16px; font-size:8px; font-weight:800; } .instruction strong { font-size:9px; } .instruction p { color:#536571; font-size:9px; line-height:1.35; margin-top:1px; }
    .footer { margin-top:30px; padding-top:12px; border-top:1px solid #E6ECE8; color:#94A3B8; text-align:center; font-size:9px; } .page-break { page-break-before:always; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-mark">♨</div><div><div class="brand-name"><span class="brand-green">Fridge</span>AI</div>
      <div class="brand-sub">Personalized meals from your fridge</div>
    </div></div>
    <div class="report-meta">
      <div style="font-weight:700;font-size:14px;">Meal Plan Report</div>
      <div>${today()}</div>
    </div>
  </div>

  <!-- 1. Ingredients Overview -->
  <div class="section-title">1. Ingredients Overview</div>
  <div class="two-col">
    <div class="summary-card have-card">
      <div class="card-title">✓ &nbsp;Items you had (${ingredients.length})</div>
      ${itemRows(ingredients, 'have')}
    </div>
    <div class="summary-card buy-card">
      <div class="card-title">🛒 &nbsp;Items to purchase (${toBuy.length})</div>
      ${itemRows(toBuy, 'buy')}
    </div>
  </div>

  <!-- 2. Selected Meals -->
  <div class="section-title">2. Selected Meals (${recipes.length})</div>
  <div class="meal-grid">${mealCards}</div>

  <div class="section-title">3. Recipes &amp; Instructions</div>
  ${recipeSections}

  <div class="footer">Generated by FridgeAI · ${today()}</div>
</body>
</html>`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface PdfResult {
  uri: string;
}

export const pdfService = {
  /** Generate a PDF file from the meal plan data and return the local file URI. */
  generatePdf: async (
    recipes: Recipe[],
    shoppingList: ShoppingItem[],
    ingredients: Ingredient[]
  ): Promise<PdfResult> => {
    const html = buildHtml(recipes, shoppingList, ingredients);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    return { uri };
  },

  /** Download / save the PDF (iOS: share sheet; Android: saves to Downloads then shares). */
  savePdf: async (uri: string): Promise<void> => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save your Meal Plan PDF',
        UTI: 'com.adobe.pdf',
      });
    }
  },

  /** Share the PDF via the system share sheet. */
  sharePdf: async (uri: string): Promise<void> => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share your Meal Plan',
        UTI: 'com.adobe.pdf',
      });
    }
  },
};
