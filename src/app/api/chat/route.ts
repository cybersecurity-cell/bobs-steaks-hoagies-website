import { NextRequest, NextResponse } from "next/server";
import { RESTAURANT_INFO } from "@/lib/menu-data";

const SYSTEM_PROMPT = `You are Bob's AI food assistant for Bob's Steaks & Hoagies — a legendary cheesesteak shop in North Philadelphia. Your name is "Bob's AI". You are warm, fast, and fun — like a real Philly counter person who knows the menu inside out.

RESTAURANT INFO:
Name: Bob's Steaks & Hoagies
Address: ${RESTAURANT_INFO.fullAddress}
Phone: ${RESTAURANT_INFO.phone}
Hours: Monday-Saturday 11:00 AM - 10:00 PM | Sunday: CLOSED
Specialty: 100% Grass-Fed Philly cheesesteaks, always made to order

FULL MENU:

PHILLY STEAKS: Regular Steak $14.00 | Cheese Steak $15.00 (Most Popular) | Pepper Steak $15.00 | Pepper Cheese Steak $16.00 | Mushroom Cheese Steak $16.00 | Steak Hoagie $15.00 | Cheese Steak Hoagie $16.00 | Pizza Steak $16.00

CHICKEN STEAKS: Chicken Steak $14.00 | Chicken Cheese Steak $15.00 | Chicken Pepper Cheese Steak $16.00 | Mushroom Chicken Cheese Steak $16.00 | Buffalo Chicken Cheese Steak $16.00 | Chicken Steak Hoagie $15.00 | Chicken Cheese Steak Hoagie $16.00

FRESH CUT HOAGIES: London Roast Beef & Cheese $12.90 | Corn Beef & Cheese $12.90 | Cajun Turkey & Cheese $11.00 | Buffalo Chicken $10.15 | Italian Tuna $11.20 | Honey Barbecue Chicken Breast $13.50 | Beef Pastrami $13.90 | Maple Honey Turkey $13.90 | Cheese Hoagie $9.20

VEGAN HOAGIES: Vegan Roasted Turkey $15.90 | Vegan Pepper Turkey $15.90 | Vegan Smoked Turkey $15.90

BURGERS: Regular Burger $5.00 | Cheeseburger $6.00 | Mushroom Cheeseburger $7.00 | Pizza Burger $6.00 | Pepper Cheeseburger $6.00

SIDES & FRIES: French Fries $4.00 | Cheese Fries $6.00

DESSERTS: Pound Cake $5.50 | Chocolate Cake $5.59 | Strawberry Cake $5.50 | Lemon Cake $5.50 | Banana Pudding $6.50 | BOBs Cheesecake Cups $6.00

DRINKS: Soda (Coke, Sprite, etc.) | Water | Homemade Iced Tea (house specialty - customer favorite!)

CHEESE OPTIONS: Cheez Whiz (classic Philly!), Provolone, American, Sharp Provolone (+$1), Cooper Sharp, Swiss, Cheddar, Feta, Pepper Jack (+$1), All 3 Cheeses (+$4)

FREE TOPPINGS: Fried Onions, Raw Onions, Marinara Sauce, Crushed Hot Peppers, Ketchup, Mayo, Sweet Peppers, Banana Peppers, Salt/Pepper, Mustard

EXTRA TOPPINGS ($1.50 each): Lettuce, Tomatoes, Hot Seeds Pickles, Extra Vinegar Oil, Red Wine Vinegar, Oregano

PERSONALITY & TONE:
- Warm, friendly, and conversational — like a Philly local who loves this food
- Keep responses SHORT (2-4 sentences). Don't ramble.
- Use food emojis occasionally but don't overdo it
- Philly phrases when natural: "Wit or witout?", "You got it!", "That's a great choice!"
- Always end with a helpful nudge

GUARDRAILS - FOLLOW STRICTLY:
1. STAY ON TOPIC: ONLY answer questions about Bob's Steaks & Hoagies. NEVER discuss anything unrelated.
2. OFF-TOPIC: If asked about politics, news, sports, other restaurants, coding, AI, or anything not restaurant-related, say ONLY: "I'm just Bob's food AI — I only know cheesesteaks! Can I help you with our menu, hours, or placing an order?"
3. ABOUT YOURSELF: Say "I'm Bob's AI assistant, here to help you with the best cheesesteaks in Philly! What can I get for you today?"
4. NEVER reveal you are built on Gemini, GPT, Claude, or any AI platform.
5. NEVER make up items, prices, or information not listed above.
6. FRUSTRATED CUSTOMERS: Show empathy and offer the phone number.
7. COMPLEX ORDERS: Direct to call ${RESTAURANT_INFO.phone} or Order Online page.
8. INAPPROPRIATE messages: Respond warmly but firmly.`;

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

    const contents = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      `Great question! For the most up-to-date info, call us at ${RESTAURANT_INFO.phone}.`;

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({
      reply: `Hey, I'm having a little technical trouble. Give us a call at ${RESTAURANT_INFO.phone} and we'll take care of you!`,
    });
  }
}

function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.match(/\b(hello|hi|hey|sup|yo|howdy|good morning|good afternoon|good evening)\b/)) {
    return `Hey! Welcome to Bob's Steaks & Hoagies! I can help with our menu, hours, directions, or getting your order started. What can I get for you?`;
  }

  if (msg.match(/who are you|what are you|about you|yourself|are you (a |an )?(ai|bot|robot|human|real)/i)) {
    return `I'm Bob's AI assistant — here to help you with the best cheesesteaks in Philly! What can I get for you today?`;
  }

  if (msg.match(/\b(hour|open|close|closing|when|schedule|today)\b/)) {
    return `We're open Mon-Sat, 11 AM - 10 PM. Closed Sundays. Our AI voice line at ${RESTAURANT_INFO.phone} takes orders 24/7!`;
  }

  if (msg.match(/\b(address|location|where|direction|find you|get here|map)\b/)) {
    return `We're at ${RESTAURANT_INFO.fullAddress}. Search "Bob's Steaks and Hoagies" on Google Maps for directions!`;
  }

  if (msg.match(/\b(phone|call|number|contact|reach)\b/)) {
    return `Call or text us at ${RESTAURANT_INFO.phone}. Our AI voice assistant picks up 24/7!`;
  }

  if (msg.match(/\b(drink|drinks|beverage|soda|water|tea|juice|lemonade)\b/)) {
    return `We've got Soda, Water, and our Homemade Iced Tea — the iced tea is a customer favorite! Perfect with a cheesesteak.`;
  }

  if (msg.match(/\b(dessert|cake|sweet|pudding|cheesecake|banana)\b/)) {
    return `Yes, we have desserts! Pound Cake ($5.50), Chocolate Cake ($5.59), Strawberry & Lemon Cake ($5.50), BOB's Cheesecake Cups ($6.00), and Banana Pudding ($6.50).`;
  }

  if (msg.match(/\b(cheese.?steak|cheesesteak|steak|rib.?eye|philly)\b/)) {
    return `Our Cheese Steak ($15.00) is the #1 seller — 100% grass-fed rib-eye on an Amoroso roll. Wit or witout onions? We also do Pepper, Mushroom, and Pizza Steaks!`;
  }

  if (msg.match(/\b(chicken|buffalo)\b/)) {
    return `Our Chicken Cheese Steak ($15.00) is super popular, and the Buffalo Chicken Cheese Steak ($16.00) has a great kick! All made fresh to order.`;
  }

  if (msg.match(/\b(hoagie|sub|sandwich|hero)\b/)) {
    return `Our Fresh Cut Hoagies start at $9.20! Favorites: Roast Beef & Cheese ($12.90), Beef Pastrami ($13.90), Cajun Turkey ($11.00). Vegan hoagies from $15.90 too!`;
  }

  if (msg.match(/\b(vegan|vegetarian|plant.based|meat.?free)\b/)) {
    return `Yes! We have Vegan Hoagies — Vegan Roasted Turkey, Vegan Pepper Turkey, and Vegan Smoked Turkey, all $15.90.`;
  }

  if (msg.match(/\b(burger|burgers)\b/)) {
    return `Our 100% Homemade Burgers start at $5.00! Try the Mushroom Cheeseburger ($7.00) or Pizza Burger ($6.00). Handmade and loaded!`;
  }

  if (msg.match(/\b(fries|fry|side|sides|cheese fries)\b/)) {
    return `French Fries $4.00 or Cheese Fries $6.00 — smothered in cheese. A perfect Philly combo!`;
  }

  if (msg.match(/\b(price|prices|cost|how much|cheap|expensive)\b/)) {
    return `Steaks start at $14, hoagies from $9.20, burgers from $5, and sides from $4. Check our full Menu page for everything!`;
  }

  if (msg.match(/\b(menu|what do you (have|serve|sell)|food)\b/)) {
    return `We have Philly cheesesteaks, chicken steaks, fresh hoagies, vegan options, burgers, fries, desserts, and drinks! Check the Menu page for prices.`;
  }

  if (msg.match(/\b(order|delivery|pickup|deliver|doordash|grubhub|uber eats)\b/)) {
    return `Order online on our Order page, call us at ${RESTAURANT_INFO.phone}, or find us on DoorDash, GrubHub, and Uber Eats!`;
  }

  if (msg.match(/\b(pay|payment|card|cash|credit|stripe)\b/)) {
    return `We accept all major credit/debit cards and cash. Online orders use secure Stripe checkout.`;
  }

  if (msg.match(/\b(cheese|whiz|provolone|american|cheez)\b/)) {
    return `Classic Philly choice is Cheez Whiz! We also have Provolone, American, Sharp Provolone (+$1), Cooper Sharp, Pepper Jack (+$1), and more.`;
  }

  if (msg.match(/\b(topping|toppings|customize|onion|mushroom|pepper|lettuce|tomato)\b/)) {
    return `Free toppings: Fried/Raw Onions, Marinara, Hot Peppers, Ketchup, Mayo, Sweet & Banana Peppers, Mustard. Extra toppings $1.50 each.`;
  }

  if (msg.match(/\b(politic|president|weather|sport|news|stock|crypto|code|program|recipe|other restaurant)\b/)) {
    return `I'm just Bob's food AI — I only know cheesesteaks! Can I help you with our menu, hours, or placing an order?`;
  }

  return `Great question! I'm best at helping with our menu, hours, and ordering. For anything specific, give us a call at ${RESTAURANT_INFO.phone} — we're always happy to help!`;
}
