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
 *   CLOVER_MERCHANT_ID=GFR2KHTZKTXX1
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
  { name: "Rib-Eye Steaks"  },
  { name: "Chicken Steaks"  },
  { name: "Hoagies"         },
  { name: "Vegan Hoagies"   },
  { name: "Burgers"         },
  { name: "Sides & Fries"   },
  { name: "Desserts"        },
];

// Price in cents
const ITEMS = [
  // Rib-Eye Steaks
  { name: "Regular Steak",           price: 1400, category: "Rib-Eye Steaks" },
  { name: "Cheese Steak",            price: 1500, category: "Rib-Eye Steaks" },
  { name: "Pepper Steak",            price: 1500, category: "Rib-Eye Steaks" },
  { name: "Pepper Cheese Steak",     price: 1600, category: "Rib-Eye Steaks" },
  { name: "Mushroom Cheese Steak",   price: 1600, category: "Rib-Eye Steaks" },
  { name: "Steak Hoagie",            price: 1500, category: "Rib-Eye Steaks" },
  { name: "Cheese Steak Hoagie",     price: 1600, category: "Rib-Eye Steaks" },
  { name: "Pizza Steak",             price: 1600, category: "Rib-Eye Steaks" },

  // Chicken Steaks
  { name: "Chicken Steak",                  price: 1400, category: "Chicken Steaks" },
  { name: "Chicken Cheese Steak",           price: 1500, category: "Chicken Steaks" },
  { name: "Chicken Pepper Steak",           price: 1500, category: "Chicken Steaks" },
  { name: "Chicken Pepper Cheese Steak",    price: 1600, category: "Chicken Steaks" },
  { name: "Mushroom Chicken Steak",         price: 1500, category: "Chicken Steaks" },
  { name: "Mushroom Chicken Cheese Steak",  price: 1600, category: "Chicken Steaks" },
  { name: "Chicken Steak Hoagie",           price: 1500, category: "Chicken Steaks" },
  { name: "Chicken Cheese Steak Hoagie",    price: 1600, category: "Chicken Steaks" },
  { name: "Chicken Pizza Steak",            price: 1600, category: "Chicken Steaks" },
  { name: "Buffalo Chicken Cheese Steak",   price: 1600, category: "Chicken Steaks" },

  // Hoagies
  { name: "London Roast Beef and Cheese",   price: 1290, category: "Hoagies" },
  { name: "Corn Beef and Cheese",           price: 1290, category: "Hoagies" },
  { name: "Cajun Turkey and Cheese",        price: 1100, category: "Hoagies" },
  { name: "Turkey Ham",                     price: 1015, category: "Hoagies" },
  { name: "Gourmet Turkey",                 price: 1015, category: "Hoagies" },
  { name: "Buffalo Chicken",                price: 1015, category: "Hoagies" },
  { name: "Italian Tuna",                   price: 1120, category: "Hoagies" },
  { name: "Tuna",                           price: 1120, category: "Hoagies" },
  { name: "Chicken Salad",                  price: 1120, category: "Hoagies" },
  { name: "Honey Barbecue Chicken Breast",  price: 1350, category: "Hoagies" },
  { name: "Cheese Hoagie",                  price:  920, category: "Hoagies" },
  { name: "Beef Pastrami",                  price: 1390, category: "Hoagies" },
  { name: "Maple Honey Turkey",             price: 1390, category: "Hoagies" },
  { name: "Pepper Turkey",                  price: 1350, category: "Hoagies" },

  // Vegan Hoagies
  { name: "Vegan Roasted Turkey",  price: 1590, category: "Vegan Hoagies" },
  { name: "Vegan Pepper Turkey",   price: 1590, category: "Vegan Hoagies" },
  { name: "Vegan",                 price: 1490, category: "Vegan Hoagies" },
  { name: "Vegan Smoked Turkey",   price: 1590, category: "Vegan Hoagies" },

  // Burgers
  { name: "Regular Burger",        price:  500, category: "Burgers" },
  { name: "Cheeseburger",          price:  600, category: "Burgers" },
  { name: "Mushroom Burger",       price:  600, category: "Burgers" },
  { name: "Mushroom Cheeseburger", price:  700, category: "Burgers" },
  { name: "Pizza Burger",          price:  600, category: "Burgers" },
  { name: "Pepper Burger",         price:  500, category: "Burgers" },
  { name: "Pepper Cheeseburger",   price:  600, category: "Burgers" },

  // Sides & Fries
  { name: "French Fries", price: 400, category: "Sides & Fries" },
  { name: "Cheese Fries", price: 600, category: "Sides & Fries" },

  // Desserts
  { name: "Pound Cake",           price: 550, category: "Desserts" },
  { name: "Chocolate Cake",       price: 559, category: "Desserts" },
  { name: "Strawberry Cake",      price: 550, category: "Desserts" },
  { name: "Bob's Cheesecake Cups",price: 600, category: "Desserts" },
  { name: "Lemon Cake",           price: 550, category: "Desserts" },
  { name: "Banana Pudding",       price: 650, category: "Desserts" },
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
  console.log(`\nVerify: run the dev server and check /api/menu to confirm live Clover data.`);
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
