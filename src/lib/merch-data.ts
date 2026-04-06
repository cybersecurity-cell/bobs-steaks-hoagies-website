export type MerchCategory = "hat" | "hoodie";

export interface MerchItem {
  id: string;
  title: string;
  price: number;
  category: MerchCategory;
  image: string;
  availability: "in_stock" | "sold_out";
  sizes?: string[];          // only for hoodies
  rating?: number;           // 1–5
  reviewCount?: number;
  shopifyUrl: string;        // swap in real Shopify product URL
  badge?: string;            // e.g. "Best Seller"
}

export const MERCH_ITEMS: MerchItem[] = [
  // ── Hats ──────────────────────────────────────────────────────────
  {
    id: "hat-snapback",
    title: "Bob's Classic Snapback",
    price: 28,
    category: "hat",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
    availability: "in_stock",
    rating: 4.9,
    reviewCount: 47,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/classic-snapback",
    badge: "Best Seller",
  },
  {
    id: "hat-fitted",
    title: "Bob's Fitted Cap",
    price: 34,
    category: "hat",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 31,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/fitted-cap",
  },
  {
    id: "hat-dad",
    title: "Bob's Dad Hat",
    price: 24,
    category: "hat",
    image:
      "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&auto=format&fit=crop&q=80",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 23,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/dad-hat",
    badge: "New",
  },
  {
    id: "hat-trucker",
    title: "Bob's Trucker Hat",
    price: 26,
    category: "hat",
    image:
      "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600&auto=format&fit=crop&q=80",
    availability: "sold_out",
    rating: 4.6,
    reviewCount: 18,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/trucker-hat",
  },
  {
    id: "hat-beanie",
    title: "Bob's Winter Beanie",
    price: 22,
    category: "hat",
    image:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 12,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/winter-beanie",
  },

  // ── Hoodies ───────────────────────────────────────────────────────
  {
    id: "hoodie-pullover",
    title: "Bob's Logo Hoodie",
    price: 65,
    category: "hoodie",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop&q=80",
    availability: "in_stock",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    rating: 5.0,
    reviewCount: 64,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/logo-hoodie",
    badge: "Fan Favorite",
  },
  {
    id: "hoodie-zipup",
    title: "Bob's Zip-Up Hoodie",
    price: 72,
    category: "hoodie",
    image:
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop&q=80",
    availability: "in_stock",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    rating: 4.9,
    reviewCount: 38,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/zipup-hoodie",
  },
];

export const MERCH_HATS = MERCH_ITEMS.filter((m) => m.category === "hat");
export const MERCH_HOODIES = MERCH_ITEMS.filter((m) => m.category === "hoodie");
