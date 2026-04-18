/**
 * Clover Inventory → Website Menu
 *
 * Fetches live items from your Clover merchant inventory and normalises
 * them into the site's MenuItem shape so the menu page and orders API
 * always reflect your current Clover catalogue.
 *
 * Clover API used:
 *   GET /v3/merchants/{mId}/items?expand=categories
 *
 * The `available` flag in Clover controls whether an item appears.
 * Toggle items on/off in your Clover dashboard — the site updates instantly.
 */

import { cloverFetch, getMerchantId } from "./client";
import type { MenuItem } from "@/lib/menu-data";

// ─── Clover API types ─────────────────────────────────────────────────────────

interface CloverCategory {
  id: string;
  name: string;
  sortOrder?: number;
}

interface CloverItem {
  id: string;
  name: string;
  /** Price in cents */
  price: number;
  priceType?: "FIXED" | "VARIABLE" | "PER_UNIT";
  available?: boolean;
  hidden?: boolean;
  description?: string;
  imageUrl?: string;
  categories?: { elements: CloverCategory[] };
}

interface CloverItemsResponse {
  elements: CloverItem[];
  href?: string;
}

// ─── Category name → internal category ID mapping ────────────────────────────
//
// Adjust this map to match the exact category names you use in Clover.
// Lower-case partial matches — first match wins.

const CATEGORY_MAP: [string, string][] = [
  ["philly steak", "steaks"],
  ["rib-eye",      "steaks"],
  ["steak",        "steaks"],
  ["chicken",      "chicken"],
  ["burger",       "burgers"],
  ["vegan",        "vegan"],
  ["plant-based",  "vegan"],
  ["side",         "sides"],
  ["fries",        "sides"],
  ["drink",        "sides"],
  ["beverage",     "sides"],
  ["soda",         "sides"],
  ["dessert",      "desserts"],
  ["cake",         "desserts"],
  ["pudding",      "desserts"],
  ["hoagie",       "hoagies"],
];

function mapCloverCategory(cloverName: string): string {
  const lower = cloverName.toLowerCase();
  for (const [keyword, category] of CATEGORY_MAP) {
    if (lower.includes(keyword)) return category;
  }
  return "other";
}

// ─── Fallback image per category ─────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  steaks:   "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&auto=format&fit=crop&q=80",
  chicken:  "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80",
  burgers:  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  seafood:  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  wings:    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80",
  sides:    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
  drinks:   "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=80",
  desserts: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80",
  hoagies:  "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
  other:    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop&q=80",
};

function fallbackImage(category: string): string {
  return CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.other;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert an item name to a URL/cart-friendly slug.
 * e.g. "Cheese Steak Hoagie" → "cheese-steak-hoagie"
 * This keeps Clover item IDs consistent with the static menu-data.ts slugs
 * so the cart and order validation work regardless of which data source is used.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Normalise a Clover item into our MenuItem shape ──────────────────────────

function normalizeItem(item: CloverItem): MenuItem {
  const cloverCategory = item.categories?.elements?.[0]?.name ?? "";
  const category = mapCloverCategory(cloverCategory);

  return {
    id:          slugify(item.name),   // slug-based ID matches static menu & cart
    name:        item.name,
    description: item.description ?? "",
    price:       item.price / 100,     // cents → dollars
    category,
    image:       item.imageUrl ?? fallbackImage(category),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all available menu items from Clover inventory.
 * Items hidden or marked unavailable in Clover are excluded.
 */
export async function getCloverMenuItems(): Promise<MenuItem[]> {
  const mId = getMerchantId();

  // Fetch all items with their categories expanded.
  // Clover paginates at 100 items by default; 1000 covers most menus.
  const res = await cloverFetch(
    `/v3/merchants/${mId}/items` +
      `?expand=categories` +
      `&limit=1000`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Clover] Failed to fetch items: ${res.status} ${text}`);
  }

  const data: CloverItemsResponse = await res.json();

  return (data.elements ?? [])
    .filter((item) => item.available !== false && !item.hidden)
    .map(normalizeItem);
}

/**
 * Fetch a single menu item from Clover by its item ID.
 * Returns null if the item does not exist or is not available.
 */
export async function getCloverMenuItemById(
  itemId: string
): Promise<MenuItem | null> {
  const mId = getMerchantId();

  const res = await cloverFetch(
    `/v3/merchants/${mId}/items/${itemId}?expand=categories`
  );

  if (!res.ok) return null;

  const item: CloverItem = await res.json();

  if (item.hidden || item.available === false) return null;

  return normalizeItem(item);
}

/**
 * Fetch all available items and group them by category.
 * Useful for the menu page category tabs.
 */
export async function getCloverMenuByCategory(): Promise<
  Record<string, MenuItem[]>
> {
  const items = await getCloverMenuItems();
  const grouped: Record<string, MenuItem[]> = {};

  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  return grouped;
}
