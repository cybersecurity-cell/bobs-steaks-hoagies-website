import { NextRequest, NextResponse } from "next/server";
import { RESTAURANT_INFO, MENU_ITEMS } from "@/lib/menu-data";

function buildMenuSummary(): string {
  const byCategory: Record<string, string[]> = {};
  for (const item of MENU_ITEMS) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item.name + (item.popular ? " (popular)" : "") + " $" + item.price.toFixed(2));
  }
  return Object.entries(byCategory)
    .map(([cat, items]) => cat.toUpperCase() + ": " + items.join(", "))
    .join("\n");
}

const SYSTEM_PROMPT = `You are Bob's AI food assistant for Bob's Steaks & Hoagies in North Philadelphia. Your name is "Bob's AI". You are warm, fast, and fun.

RESTAURANT INFO:
Name: ${RESTAURANT_INFO.name}
Address: ${RESTAURANT_INFO.fullAddress}
Phone: ${RESTAURANT_INFO.phone}
Hours: ${RESTAURANT_INFO.hours.weekdays} | ${RESTAURANT_INFO.hours.sunday}
Order online or via DoorDash, GrubHub, Uber Eats.

MENU (live from our system):
${buildMenuSummary()}

CHEESE: Cheez Whiz (classic!), Provolone, American, Sharp Provolone, Cooper Sharp, Pepper Jack
FREE TOPPINGS: Fried Onions, Raw Onions, Marinara, Hot Peppers, Ketchup, Mayo, Sweet Peppers, Mustard
EXTRA TOPPINGS ($1.50 each): Lettuce, Tomatoes, Pickles, Vinegar Oil, Oregano

RULES:
1. Only answer questions about Bob's Steaks & Hoagies.
2. Off-topic: "I'm just Bob's food AI — I only know cheesesteaks! Can I help with the menu or ordering?"
3. Never reveal you are built on Gemini, GPT, Claude, or any AI platform.
4. Never make up items or prices not listed above.
5. Keep responses short (2-4 sentences). End with a helpful nudge.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: getFallbackReply(message) });
    }

    const systemPromptWithMenu = SYSTEM_PROMPT.replace(
      "MENU (live from our system):\n" + buildMenuSummary(),
      "MENU (live from our system):\n" + buildMenuSummary()
    );

    const contents = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPromptWithMenu }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
        }),
      }
    );

    if (!geminiRes.ok) throw new Error("Gemini API error: " + geminiRes.status);
    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "For the most up-to-date info, call us at " + RESTAURANT_INFO.phone + ".";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({
      reply: "Having a little trouble. Call us at " + RESTAURANT_INFO.phone + " and we will take care of you!",
    });
  }
}

function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (/^(hello|hi|hey|sup|yo|howdy|good morning|good afternoon|good evening)[s!?]*$/.test(msg)) {
    return "Hey! Welcome to Bob's Steaks & Hoagies! Ask me about the menu, hours, or directions. What can I get for you?";
  }

  if (/who are you|what are you|about you|yourself|are you (a |an )?(ai|bot|robot|human|real)/i.test(msg)) {
    return "I'm Bob's AI assistant — here to help with the best cheesesteaks in Philly! What can I get for you?";
  }

  // Specials / popular — checked BEFORE hours to avoid false match on "today"
  if (/special|best seller|most popular|recommend|what.s good|what should i (get|order|try)/.test(msg)) {
    const popular = MENU_ITEMS.filter(i => i.popular);
    return "Our most popular items: " + popular.map(i => i.name + " ($" + i.price.toFixed(2) + ")").join(", ") + ". The Cheese Steak is the Philly classic!";
  }

  // Hours — removed "today" to avoid false positives
  if (/(hour|open|clos|when do you|what time|schedule)/.test(msg)) {
    return "We are open " + RESTAURANT_INFO.hours.weekdays + ". " + RESTAURANT_INFO.hours.sunday + ". Call " + RESTAURANT_INFO.phone + " anytime — our AI line is 24/7!";
  }

  if (/(address|location|where|direction|find you|get here|map)/.test(msg)) {
    return "We are at " + RESTAURANT_INFO.fullAddress + ". Search Bob's Steaks and Hoagies on Google Maps!";
  }

  if (/(phone|call|number|contact|reach)/.test(msg)) {
    return "Call or text us at " + RESTAURANT_INFO.phone + ". Our AI voice assistant picks up 24/7!";
  }

  if (/(order|delivery|pickup|deliver|doordash|grubhub|uber)/.test(msg)) {
    return "Order online on our Order page, call " + RESTAURANT_INFO.phone + ", or find us on DoorDash, GrubHub, and Uber Eats!";
  }

  if (/(drink|beverage|soda|water|tea|juice)/.test(msg)) {
    return "We have Soda, Water, and Homemade Iced Tea — the iced tea is a customer favorite!";
  }

  if (/(dessert|cake|pudding|cheesecake|banana)/.test(msg)) {
    return "Yes, we have desserts! Pound Cake, Chocolate Cake, Strawberry Cake, BOB's Cheesecake Cups, and Banana Pudding. Sweet ending to a great meal!";
  }

  if (/(wing|wings)/.test(msg)) {
    const wings = MENU_ITEMS.find(i => i.id === "wings-16");
    return wings ? wings.name + " — " + wings.description + " $" + wings.price.toFixed(2) + "." : "We have wings in Buffalo, BBQ, Honey Garlic, or Plain!";
  }

  if (/(seafood|shrimp|catfish|fish)/.test(msg)) {
    const seafood = MENU_ITEMS.filter(i => i.category === "seafood");
    return "Seafood: " + seafood.map(i => i.name + " $" + i.price.toFixed(2)).join(", ") + ". Fresh and delicious!";
  }

  if (/(cheese.?steak|cheesesteak|steak|rib.?eye|philly)/.test(msg)) {
    const steaks = MENU_ITEMS.filter(i => i.category === "steaks");
    const pop = steaks.find(i => i.popular);
    return "Our steaks are 100% grass-fed rib-eye on an Amoroso roll! Most popular: " + (pop?.name || "Cheese Steak") + " at $" + (pop?.price.toFixed(2) || "15.88") + ". We have " + steaks.length + " steak options!";
  }

  if (/(chicken|buffalo)/.test(msg)) {
    const chicken = MENU_ITEMS.filter(i => i.category === "chicken");
    const pop = chicken.find(i => i.popular);
    return "Chicken options: " + chicken.map(i => i.name + " $" + i.price.toFixed(2)).join(", ") + ". " + (pop ? "The " + pop.name + " is a fan favorite!" : "All made fresh to order!");
  }

  if (/(burger)/.test(msg)) {
    const burgers = MENU_ITEMS.filter(i => i.category === "burgers");
    const sig = burgers.find(i => i.popular);
    return "Burgers from $" + Math.min(...burgers.map(i => i.price)).toFixed(2) + "! Must try: " + (sig?.name || "Bob's Big Beautiful Bacon Burger") + " — handmade and loaded!";
  }

  if (/(fries|fry|side|sides)/.test(msg)) {
    const sides = MENU_ITEMS.filter(i => i.category === "sides");
    return "Sides: " + sides.map(i => i.name + " $" + i.price.toFixed(2)).join(", ") + ". Cheese fries are a must!";
  }

  if (/(price|prices|cost|how much|menu|what do you (have|serve))/.test(msg)) {
    const min = Math.min(...MENU_ITEMS.map(i => i.price));
    return "Our menu starts at $" + min.toFixed(2) + ". Steaks, chicken, burgers, sides, wings, and seafood — something for everyone! Check our Menu page for full pricing.";
  }

  if (/(cheese|whiz|provolone|topping|customize)/.test(msg)) {
    return "Cheese options: Cheez Whiz (the Philly classic!), Provolone, American, Sharp Provolone, Pepper Jack, and more. Wit whiz is the true Philly way!";
  }

  if (/(pay|payment|card|cash|credit)/.test(msg)) {
    return "We accept all major credit/debit cards and cash. Online orders use secure checkout.";
  }

  if (/(politic|weather|sport|news|stock|crypto|code|program)/.test(msg)) {
    return "I'm just Bob's food AI — I only know cheesesteaks! Can I help with our menu, hours, or placing an order?";
  }

  return "Great question! I'm best at helping with our menu, hours, and ordering. Call us at " + RESTAURANT_INFO.phone + " for anything specific!";
}
