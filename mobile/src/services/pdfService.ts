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
  const purchased  = shoppingList.filter((i) => i.isPurchased);
  const toBuy      = shoppingList.filter((i) => !i.isPurchased);

  const ingredientsRows = ingredients
    .map(
      (i) => `
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #eee;">
            <span style="font-weight:600;color:#1a1a1a;">${escape(i.name)}</span>
          </td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;color:#555;">
            ${i.quantity} ${escape(i.unit)}
          </td>
        </tr>`
    )
    .join('');

  const toBuyRows = toBuy
    .map(
      (i) => `
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #eee;">
            <span style="font-weight:600;color:#1a1a1a;">${escape(i.name)}</span>
          </td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;color:#e67e22;">
            ${i.quantity} ${escape(i.unit)}
          </td>
        </tr>`
    )
    .join('');

  const purchasedRows = purchased
    .map(
      (i) => `
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #eee;">
            <span style="font-weight:600;color:#888;text-decoration:line-through;">${escape(i.name)}</span>
          </td>
          <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;color:#aaa;">
            ${i.quantity} ${escape(i.unit)}
          </td>
        </tr>`
    )
    .join('');

  const mealCards = recipes
    .map(
      (r) => `
      <div style="margin-bottom:28px;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;">
        <div style="background:#f9f9f9;padding:14px 16px;border-bottom:1px solid #e8e8e8;">
          <div style="font-size:17px;font-weight:700;color:#1a1a1a;">${escape(r.title)}</div>
          <div style="font-size:12px;color:#888;margin-top:2px;">
            ⏱ ${r.cookingTime} min &nbsp;·&nbsp; 👤 ${r.servings} servings &nbsp;·&nbsp; 📊 ${escape(r.difficulty)}
          </div>
        </div>
        <div style="padding:14px 16px;">
          <div style="margin-bottom:12px;">
            <div style="font-size:13px;font-weight:700;color:#22C55E;margin-bottom:6px;">Ingredients</div>
            <ul style="margin:0;padding-left:18px;color:#333;font-size:13px;">
              ${r.availableIngredients.map((i) => `<li style="margin-bottom:3px;">${escape(i.name)} — ${i.quantity} ${escape(i.unit)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:6px;">Instructions</div>
            <ol style="margin:0;padding-left:18px;color:#333;font-size:13px;">
              ${r.instructions.map((s) => `<li style="margin-bottom:5px;">${escape(s.description)}</li>`).join('')}
            </ol>
          </div>
        </div>
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>FridgeAI Meal Plan Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #22C55E; }
    .brand-name { font-size: 22px; font-weight: 800; }
    .brand-green { color: #22C55E; }
    .brand-sub  { font-size: 11px; color: #888; margin-top: 2px; }
    .report-meta { text-align: right; font-size: 12px; color: #555; }
    .section-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; border-left: 4px solid #22C55E; padding-left: 10px; }
    .section { margin-bottom: 28px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 14px 16px; }
    .card-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .green-title { color: #22C55E; }
    .orange-title { color: #e67e22; }
    table { width: 100%; border-collapse: collapse; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; text-align: center; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">🌿 <span class="brand-green">Fridge</span>AI</div>
      <div class="brand-sub">Personalized meals from your fridge</div>
    </div>
    <div class="report-meta">
      <div style="font-weight:700;font-size:14px;">Meal Plan Report</div>
      <div>${today()}</div>
    </div>
  </div>

  <!-- 1. Ingredients Overview -->
  <div class="section-title">1. Ingredients Overview</div>
  <div class="two-col">
    <div class="card">
      <div class="card-title green-title">✅ Items you had (${ingredients.length})</div>
      <table>${ingredientsRows || '<tr><td style="color:#aaa;font-size:13px;">No items</td></tr>'}</table>
    </div>
    <div class="card">
      <div class="card-title orange-title">🛒 Items to purchase (${toBuy.length})</div>
      <table>${toBuyRows || '<tr><td style="color:#aaa;font-size:13px;">Nothing to buy!</td></tr>'}</table>
      ${purchasedRows ? `<div style="margin-top:10px;"><div class="card-title" style="color:#aaa;font-size:12px;">✓ Already purchased</div><table>${purchasedRows}</table></div>` : ''}
    </div>
  </div>

  <!-- 2. Selected Meals -->
  <div class="section-title">2. Selected Meals (${recipes.length})</div>
  <div class="section">
    ${mealCards}
  </div>

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
