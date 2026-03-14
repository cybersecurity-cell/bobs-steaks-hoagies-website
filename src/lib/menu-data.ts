export const RESTAURANT_INFO = {
  name: "Bob's Steaks & Hoagies",
  tagline: "100% Grass-Fed • Always Made to Order • Philly's Finest",
  phone: "(445) 223-4891",
  twilioPhone: process.env.NEXT_PUBLIC_TWILIO_PHONE || "(445) 223-4891",
  address: "1949 W Norris St",
  city: "Philadelphia, PA 19121",
  fullAddress: "1949 W Norris St, Philadelphia, PA 19121",
  hours: {
    weekdays: "Mon – Sat: 11:00 AM – 10:00 PM",
    sunday: "Sunday: Closed",
  },
  social: {
    instagram: "https://www.instagram.com/bobsteakandhoagies/",
    grubhub:
      "https://www.grubhub.com/restaurant/bobs-steaks-and-hoagies-1949-w-norris-st-philadelphia/11956928",
    doordash:
      "https://www.doordash.com/store/bob%E2%80%99s-steaks-and-hoagies---1949-w-norris-st-philadelphia-34686493/",
    ubereats:
      "https://www.ubereats.com/store/bobs-steaks-and-hoagies/EIAlzoWdS7acY67iNkmXaw",
  },
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.2!2d-75.179!3d39.986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s1949+W+Norris+St%2C+Philadelphia%2C+PA+19121!5e0!3m2!1sen!2sus!4v1",
  googleMapsUrl:
    "https://maps.google.com/?q=1949+W+Norris+St,+Philadelphia,+PA+19121",
};

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  tags?: string[];
}

export const MENU_CATEGORIES = [
  { id: "steaks", label: "Philly Steaks", icon: "🥩" },
  { id: "chicken", label: "Chicken", icon: "🍗" },
  { id: "burgers", label: "Burgers", icon: "🍔" },
  { id: "seafood", label: "Seafood", icon: "🦐" },
  { id: "sides", label: "Sides", icon: "🍟" },
  { id: "wings", label: "Wings", icon: "🍖" },
];

export const MENU_ITEMS: MenuItem[] = [
  // ── PHILLY STEAKS ──────────────────────────────────────────────
  {
    id: "plain-steak",
    name: "Plain Steak",
    description:
      "100% grass-fed rib-eye steak, thinly sliced and grilled to perfection on a fresh Amoroso roll.",
    price: 15.50,
    category: "steaks",
    image:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "cheese-steak",
    name: "Cheese Steak",
    description:
      "Our signature rib-eye steak loaded with your choice of Cheez Whiz, provolone, or American on a toasted Amoroso roll.",
    price: 15.88,
    category: "steaks",
    image:
      "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&auto=format&fit=crop&q=80",
    popular: true,
    tags: ["Most Popular", "Philly Classic"],
  },
  {
    id: "mushroom-cheese-steak",
    name: "Mushroom Cheese Steak",
    description:
      "Rib-eye steak with sautéed mushrooms, grilled onions, and melted cheese on an Amoroso roll.",
    price: 16.88,
    category: "steaks",
    image:
      "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "cheese-steak-hoagie",
    name: "Cheese Steak Hoagie",
    description:
      "The best of both worlds — rib-eye steak and cheese piled high on a long hoagie roll with fresh lettuce, tomato, and onion.",
    price: 17.00,
    category: "steaks",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    popular: true,
    tags: ["Fan Favorite"],
  },
  {
    id: "pizza-steak",
    name: "Pizza Steak",
    description:
      "Rib-eye steak topped with marinara sauce and melted provolone cheese on a toasted roll.",
    price: 17.00,
    category: "steaks",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80",
  },

  // ── CHICKEN ────────────────────────────────────────────────────
  {
    id: "chicken-steak",
    name: "Chicken Steak",
    description:
      "Tender grilled chicken breast, thinly sliced and served on a fresh Amoroso roll.",
    price: 15.50,
    category: "chicken",
    image:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "chicken-cheese-steak",
    name: "Chicken Cheese Steak",
    description:
      "Juicy grilled chicken with your choice of Cheez Whiz, provolone, or American cheese on an Amoroso roll.",
    price: 15.88,
    category: "chicken",
    image:
      "https://images.unsplash.com/photo-1585325701165-92b0bc6a8a56?w=600&auto=format&fit=crop&q=80",
    popular: true,
  },
  {
    id: "mushroom-chicken-cheese-steak",
    name: "Mushroom Chicken Cheese Steak",
    description:
      "Grilled chicken, sautéed mushrooms, and melted cheese on a toasted roll.",
    price: 16.88,
    category: "chicken",
    image:
      "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "chicken-parm-steak",
    name: "Chicken Parm Steak",
    description:
      "Grilled chicken smothered in marinara sauce and provolone cheese, served on a toasted roll.",
    price: 17.00,
    category: "chicken",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "buffalo-chicken-cheese-steak",
    name: "Buffalo Chicken Cheese Steak",
    description:
      "Spicy Buffalo chicken tossed in tangy hot sauce, topped with cheese and served with a side of ranch.",
    price: 16.88,
    category: "chicken",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80",
    tags: ["Spicy"],
  },

  // ── BURGERS ────────────────────────────────────────────────────
  {
    id: "cheese-burger",
    name: "Cheese Burger",
    description:
      "Juicy hand-formed beef patty with American cheese, lettuce, tomato, and onion on a toasted brioche bun.",
    price: 8.50,
    category: "burgers",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "pizza-burger",
    name: "Pizza Burger",
    description:
      "Beef patty topped with marinara sauce and melted provolone on a toasted bun.",
    price: 9.50,
    category: "burgers",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "mushroom-cheese-burger",
    name: "Mushroom Cheese Burger",
    description:
      "Beef patty with sautéed mushrooms, Swiss cheese, and caramelized onions on a brioche bun.",
    price: 8.75,
    category: "burgers",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "bobs-big-burger",
    name: "Bob's Big Beautiful Bacon Burger",
    description:
      "Our signature double-stacked beef patty with crispy bacon, cheddar, lettuce, tomato, pickles, and Bob's special sauce.",
    price: 12.00,
    category: "burgers",
    image:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    popular: true,
    tags: ["Signature", "Must Try"],
  },

  // ── SEAFOOD ────────────────────────────────────────────────────
  {
    id: "fried-shrimp-platter",
    name: "Fried Shrimp Platter",
    description:
      "Golden fried jumbo shrimp served with cocktail sauce, coleslaw, and your choice of side.",
    price: 12.00,
    category: "seafood",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "catfish-hoagie",
    name: "Catfish Hoagie",
    description:
      "Crispy Southern-style fried catfish on a hoagie roll with lettuce, tomato, and tartar sauce.",
    price: 18.50,
    category: "seafood",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80",
  },

  // ── SIDES ──────────────────────────────────────────────────────
  {
    id: "french-fries",
    name: "French Fries",
    description:
      "Crispy golden fries seasoned with our house blend of spices.",
    price: 5.00,
    category: "sides",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "cheese-fries",
    name: "Cheese Fries",
    description:
      "Golden fries smothered in warm Cheez Whiz or your choice of cheese.",
    price: 7.00,
    category: "sides",
    image:
      "https://images.unsplash.com/photo-1585296851837-f8b4cb0fbcfe?w=600&auto=format&fit=crop&q=80",
    popular: true,
  },

  // ── WINGS ──────────────────────────────────────────────────────
  {
    id: "wings-16",
    name: "16 Wings",
    description:
      "Crispy chicken wings tossed in your choice of sauce: Buffalo, BBQ, Honey Garlic, or Plain. Served with celery and your choice of dipping sauce.",
    price: 19.60,
    category: "wings",
    image:
      "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80",
    popular: true,
    tags: ["Great for Sharing"],
  },
];

export const FEATURED_ITEMS = MENU_ITEMS.filter((item) => item.popular).slice(0, 4);
