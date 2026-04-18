/**
 * seed-clover-inventory.mjs
 *
 * Seeds Bob's full menu into Clover sandbox inventory.
 * Run once to create categories and items via the Clover REST API.
 *
 * Usage:
 *   node scripts/seed-clover-inventory.mjs
 *
 * Requires .env.local to have:
 *   CLOVER_MERCHANT_ID=<your merchant id>
 *   CLOVER_API_TOKEN=<your token>
 *   CLOVER_SANDBOX=true
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch {
  console.log("No .env.local found — using existing environment variables.");
}

const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const API_TOKEN   = process.env.CLOVER_API_TOKEN;
const SANDBOX     = process.env.CLOVER_SANDBOX === "true";
const API_BASE    = SANDBOX
  ? "https://apisandbox.dev.clover.com"
  : "https://api.clover.com";

if (!MERCHANT_ID || !API_TOKEN) {
  console.error("❌  CLOVER_MERCHANT_ID and CLOVER_API_TOKEN must be set in .env.local");
  process.exit(1);
}

console.log(`\n🌿  Seeding Clover inventory`);
console.log(`   Merchant: ${MERCHANT_ID}`);
console.log(`   API Base: ${API_BASE}\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function cloverPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function cloverGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ─── Menu data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Philly Steaks" },
  { name: "Chicken"       },
  { name: "Burgers"       },
  { name: "Seafood"       },
  { name: "Sides"         },
  { name: "Wings"         },
];

// Price in cents
const ITEMS = [
  // Philly Steaks
  { name: "Plain Steak",              price: 1550, category: "Philly Steaks" },
  { name: "Cheese Steak",             price: 1588, category: "Philly Steaks" },
  { name: "Mushroom Cheese Steak",    price: 1688, category: "Philly Steaks" },
  { name: "Cheese Steak Hoagie",      price: 1700, category: "Philly Steaks" },
  { name: "Pizza Steak",              price: 1700, category: "Philly Steaks" },

  // Chicken
  { name: "Chicken Steak",                    price: 1550, category: "Chicken" },
  { name: "Chicken Cheese Steak",             price: 1588, category: "Chicken" },
  { name: "Mushroom Chicken Cheese Steak",    price: 1688, category: "Chicken" },
  { name: "Chicken Parm Steak",               price: 1700, category: "Chicken" },
  { name: "Buffalo Chicken Cheese Steak",     price: 1688, category: "Chicken" },

  // Burgers
  { name: "Cheese Burger",                      price: 850,  category: "Burgers" },
  { name: "Pizza Burger",                       price: 950,  category: "Burgers" },
  { name: "Mushroom Cheese Burger",             price: 875,  category: "Burgers" },
  { name: "Bob's Big Beautiful Bacon Burger",   price: 1200, category: "Burgers" },

  // Seafood
  { name: "Fried Shrimp Platter",  price: 1200, category: "Seafood" },
  { name: "Catfish Hoagie",        price: 1850, category: "Seafood" },

  // Sides
  { name: "French Fries",  price: 500, category: "Sides" },
  { name: "Cheese Fries",  price: 700, category: "Sides" },

  // Wings
  { name: "16 Wings", price: 1960, category: "Wings" },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  // 1. Check for existing categories so we don't duplicate
  console.log("📂  Fetching existing categories...");
  const existingCats = await cloverGet(`/v3/merchants/${MERCHANT_ID}/categories?limit=200`);
  const catMap = {}; // name → id
  for (const c of existingCats.elements ?? []) {
    catMap[c.name] = c.id;
  }

  // 2. Create missing categories
  console.log("📂  Creating categories...");
  for (const cat of CATEGORIES) {
    if (catMap[cat.name]) {
      console.log(`   ✓ "${cat.name}" already exists (${catMap[cat.name]})`);
      continue;
    }
    const created = await cloverPost(`/v3/merchants/${MERCHANT_ID}/categories`, { name: cat.name });
    catMap[cat.name] = created.id;
    console.log(`   + "${cat.name}" created (${created.id})`);
    await sleep(600);
  }

  // 3. Check existing items to avoid duplicates
  console.log("\n🍔  Fetching existing items...");
  const existingItems = await cloverGet(`/v3/merchants/${MERCHANT_ID}/items?limit=500`);
  const existingNames = new Set((existingItems.elements ?? []).map(i => i.name));

  // 4. Create items and associate with categories
  console.log("🍔  Creating items...\n");
  let created = 0;
  let skipped = 0;

  for (const item of ITEMS) {
    if (existingNames.has(item.name)) {
      console.log(`   ✓ "${item.name}" already exists — skipping`);
      skipped++;
      continue;
    }

    // Create the item
    const newItem = await cloverPost(`/v3/merchants/${MERCHANT_ID}/items`, {
      name:      item.name,
      price:     item.price,
      available: true,
      hidden:    false,
      defaultTaxRates: true,
    });

    // Associate with category
    const catId = catMap[item.category];
    if (catId) {
      await cloverPost(
        `/v3/merchants/${MERCHANT_ID}/category_items`,
        { elements: [{ category: { id: catId }, item: { id: newItem.id } }] }
      );
    }

    const dollars = (item.price / 100).toFixed(2);
    console.log(`   + "${item.name}" $${dollars} → ${item.category} (${newItem.id})`);
    created++;
    await sleep(600);
  }

  console.log(`\n✅  Done! Created ${created} items, skipped ${skipped} duplicates.`);
  console.log(`\nVisit https://www.woodbridgecg.com/api/menu to verify live Clover data.`);
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
