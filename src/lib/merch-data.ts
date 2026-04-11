export type MerchCategory = "hat" | "hoodie";

export interface MerchItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: MerchCategory;
  image: string;
  /** Optional second image shown on hover (e.g. back of hoodie) */
  imageBack?: string;
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
    id: "hat-trucker",
    title: "Bob's Trucker Hat",
    description: "Blue mesh-back trucker with woven patch logo — Est. Philadelphia.",
    price: 28,
    category: "hat",
    image: "/merch/blue_trucker_hat.PNG",
    availability: "in_stock",
    rating: 4.9,
    reviewCount: 47,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/trucker-hat",
    badge: "Best Seller",
  },
  {
    id: "hat-dad",
    title: "Bob's Dad Hat",
    description: "Unstructured cotton dad cap with circular embroidered logo, Phila PA.",
    price: 24,
    category: "hat",
    image: "/merch/bobs_white_dad_hat.png",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 31,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/dad-hat",
    badge: "New",
  },
  {
    id: "hat-green-beanie",
    title: "Bob's Green Beanie",
    description: "Green knit beanie with Bob's embroidered logo patch.",
    price: 22,
    category: "hat",
    image: "/merch/bobs_green_beanie.png",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 23,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/green-beanie",
  },
  {
    id: "hat-beanie",
    title: "Bob's Beanie",
    description: "Blue knit beanie with white stripes and a sewn leather patch logo.",
    price: 22,
    category: "hat",
    image: "/merch/hat-beanie.jpg",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 18,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/beanie",
    badge: "Seasonal",
  },

  // ── Hoodies ───────────────────────────────────────────────────────
  {
    id: "hoodie-pullover",
    title: "Bob's Classic Pullover Hoodie",
    description: "Crimson pullover with vintage \"Bob's Est. 1974\" front graphic. Back reads \"Philly's Own Since 1974\" with longhorn and star sleeves.",
    price: 65,
    category: "hoodie",
    image: "/merch/hoodie-pullover-front.png",
    imageBack: "/merch/hoodie-pullover-back.png",
    availability: "in_stock",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    rating: 5.0,
    reviewCount: 64,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/classic-pullover-hoodie",
    badge: "Fan Favorite",
  },
  {
    id: "hoodie-zip-classic",
    title: "Bob's Zip Hoodie",
    description: "Clean crimson zip-up hoodie with a small circular Bob's logo on the chest.",
    price: 72,
    category: "hoodie",
    image: "/merch/hoodie-zip-classic.png",
    availability: "in_stock",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    rating: 4.9,
    reviewCount: 38,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/zip-hoodie-classic",
  },
  {
    id: "hoodie-zip-phillys-best",
    title: "Philly's Best Zip Hoodie",
    description: "Full-front graphic zip hoodie featuring the Philly skyline, Liberty Bell, and Bob's longhorn bull. Varsity-stripe cuffs.",
    price: 78,
    category: "hoodie",
    image: "/merch/bobs_green_hoodie.png",
    availability: "in_stock",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    rating: 4.9,
    reviewCount: 22,
    shopifyUrl: "https://shop.bobssteakshoagies.com/products/phillys-best-zip-hoodie",
    badge: "New",
  },
];

export const MERCH_HATS = MERCH_ITEMS.filter((m) => m.category === "hat");
export const MERCH_HOODIES = MERCH_ITEMS.filter((m) => m.category === "hoodie");
