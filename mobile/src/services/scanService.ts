import { Ingredient, ScanningStep } from '../types';
import { API_BASE_URL, USE_BACKEND } from '../config/api';
import { foodImages } from '../data/mockData';

// ─────────────────────────────────────────────────────────────
// Image URL lookup by ingredient name (keyword matching)
// ─────────────────────────────────────────────────────────────
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80';

const NAME_TO_IMAGE: Record<string, string> = {
  egg:           foodImages.eggs,
  eggs:          foodImages.eggs,
  tomato:        foodImages.tomatoes,
  tomatoes:      foodImages.tomatoes,
  chicken:       foodImages.chickenBreast,
  'chicken breast': foodImages.chickenBreast,
  milk:          foodImages.milk,
  cream:         foodImages.milk,
  cheese:        foodImages.cheese,
  broccoli:      foodImages.broccoli,
  carrot:        foodImages.carrots,
  carrots:       foodImages.carrots,
  pepper:        foodImages.bellPepper,
  'bell pepper': foodImages.bellPepper,
  pasta:         foodImages.pasta,
  garlic:        foodImages.garlic,
  onion:         foodImages.onion,
  'olive oil':   foodImages.oliveOil,
  oil:           foodImages.oliveOil,
  parmesan:      foodImages.parmesan,
  basil:         foodImages.freshBasil,
};

function imageForIngredient(name: string): string {
  const key = name.toLowerCase().trim();
  // Try exact match first
  if (NAME_TO_IMAGE[key]) return NAME_TO_IMAGE[key];
  // Try substring match
  for (const [k, url] of Object.entries(NAME_TO_IMAGE)) {
    if (key.includes(k) || k.includes(key)) return url;
  }
  return FALLBACK_IMAGE;
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface RawDetected {
  name: string;
  quantity: number;
  unit: string;
}

// ─────────────────────────────────────────────────────────────
// Upload image to /api/scan and get back detected ingredients
// ─────────────────────────────────────────────────────────────
async function analyzeImageWithBackend(imageUri: string): Promise<Ingredient[]> {
  // Build a multipart FormData payload
  const formData = new FormData();

  if (typeof window !== 'undefined') {
    // Browsers require a Blob or File. The React Native URI object is not a
    // valid web FormData file and causes the backend to receive no image.
    const imageResponse = await fetch(imageUri);
    if (!imageResponse.ok) {
      throw new Error('Could not read the selected image before upload.');
    }
    const imageBlob = await imageResponse.blob();
    formData.append('image', imageBlob, 'fridge.jpg');
  } else {
    // React Native accepts this URI-backed file representation.
    formData.append('image', {
      uri: imageUri,
      name: 'fridge.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }

  const response = await fetch(`${API_BASE_URL}/api/scan`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type manually — fetch sets the correct multipart boundary
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errorBody?.error || `Backend returned ${response.status}`);
  }

  const data = (await response.json()) as { ingredients: RawDetected[]; source: string };

  return data.ingredients.map((item, idx) => ({
    id: `ai_${idx}_${Date.now()}`,
    name: item.name,
    quantity: item.quantity ?? 1,
    unit: item.unit ?? 'pcs',
    image: imageForIngredient(item.name),
  }));
}

// ─────────────────────────────────────────────────────────────
// Public service API
// ─────────────────────────────────────────────────────────────
export const scanService = {
  /**
   * Drives both the visual scanning animation and the real/mock AI call.
   *
 * @param imageUri   – URI of the captured/selected photo.
   * @param onStepUpdate – callback fired as each scanning step completes
   * @param onComplete   – called with detected ingredients when everything is done
   * @param onError callback when the real backend cannot analyze the image
   * @returns cleanup function to cancel pending timers
   */
  startScan: (
    imageUri: string | undefined,
    onStepUpdate: (steps: ScanningStep[]) => void,
    onComplete: (ingredients: Ingredient[]) => void,
    onError: (error: Error) => void
  ): (() => void) => {
    let cancelled = false;

    // ── Step state ────────────────────────────────────────────────────────
    const makeSteps = (
      s1: ScanningStep['status'],
      s2: ScanningStep['status'],
      s3: ScanningStep['status'],
      s4: ScanningStep['status']
    ): ScanningStep[] => [
      { id: 1, title: 'Image captured',       subtitle: 'Photo ready for upload',                  status: s1 },
      { id: 2, title: 'Detecting ingredients', subtitle: 'Finding food items in the image',         status: s2 },
      { id: 3, title: 'Identifying food items',subtitle: 'Using AI vision to recognize ingredients',status: s3 },
      { id: 4, title: 'Organizing ingredients',subtitle: 'Preparing your results',                  status: s4 },
    ];

    // Emit initial state immediately
    onStepUpdate(makeSteps('completed', 'active', 'pending', 'pending'));

    if (!imageUri) {
      onError(new Error('Take a photo or choose an image before starting a scan.'));
      return () => { cancelled = true; };
    }
    if (!USE_BACKEND) {
      onError(new Error('AI scanning is disabled. Set EXPO_PUBLIC_USE_BACKEND=true in the mobile environment.'));
      return () => { cancelled = true; };
    }

    const t1 = setTimeout(() => {
      if (!cancelled) onStepUpdate(makeSteps('completed', 'completed', 'active', 'pending'));
    }, 700);
    const t2 = setTimeout(() => {
      if (!cancelled) onStepUpdate(makeSteps('completed', 'completed', 'completed', 'active'));
    }, 1400);

    analyzeImageWithBackend(imageUri).then((ingredients) => {
      if (cancelled) return;
      onStepUpdate(makeSteps('completed', 'completed', 'completed', 'completed'));
      setTimeout(() => {
        if (!cancelled) onComplete(ingredients);
      }, 400);
    }).catch((error: unknown) => {
      if (!cancelled) onError(error instanceof Error ? error : new Error('Image analysis failed.'));
    });

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  },

  // ── Legacy simulate-only method (kept for backward compat) ────────────
  simulateScanning: (
    onStepUpdate: (steps: ScanningStep[]) => void,
    onComplete: () => void
  ): (() => void) => {
    return scanService.startScan(undefined, onStepUpdate, () => onComplete(), () => {});
  },
};
