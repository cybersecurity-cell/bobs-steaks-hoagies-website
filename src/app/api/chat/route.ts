import { NextRequest, NextResponse } from "next/server";
import { RESTAURANT_INFO, MENU_ITEMS } from "@/lib/menu-data";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Bob's AI food assistant for Bob's Steaks & Hoagies — a legendary cheesesteak shop in North Philadelphia. Your name is "Bob's AI". You are warm, fast, and fun — like a real Philly counter person who knows the menu inside out.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESTAURANT INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Bob's Steaks & Hoagies
Address: ${RESTAURANT_INFO.fullAddress}
Phone: ${RESTAURANT_INFO.phone}
Hours: Monday–Saturday 11:00 AM – 10:00 PM | Sunday: CLOSED
Specialty: 100% Grass-Fed Philly cheesesteaks, always made to order

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL MENU (use these exact IDs when adding to cart)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHILLY STEAKS (Fresh Cut Rib-Eye)
• id:"regular-steak"                   $14.00  — Regular Steak
• id:"cheese-steak"                    $15.00  — Cheese Steak ⭐ Most Popular
• id:"pepper-steak"                    $15.00  — Pepper Steak
• id:"pepper-cheese-steak"             $16.00  — Pepper Cheese Steak
• id:"mushroom-cheese-steak"           $16.00  — Mushroom Cheese Steak
• id:"steak-hoagie"                    $15.00  — Steak Hoagie
• id:"cheese-steak-hoagie"             $16.00  — Cheese Steak Hoagie ⭐
• id:"pizza-steak"                     $16.00  — Pizza Steak

CHICKEN STEAKS
• id:"chicken-steak"                   $14.00  — Chicken Steak
• id:"chicken-cheese-steak"            $15.00  — Chicken Cheese Steak ⭐
• id:"chicken-pepper-steak"            $15.00  — Chicken Pepper Steak
• id:"chicken-pepper-cheese-steak"     $16.00  — Chicken Pepper Cheese Steak
• id:"mushroom-chicken-steak"          $15.00  — Mushroom Chicken Steak
• id:"mushroom-chicken-cheese-steak"   $16.00  — Mushroom Chicken Cheese Steak
• id:"chicken-steak-hoagie"            $15.00  — Chicken Steak Hoagie
• id:"chicken-cheese-steak-hoagie"     $16.00  — Chicken Cheese Steak Hoagie
• id:"chicken-pizza-steak"             $16.00  — Chicken Pizza Steak
• id:"buffalo-chicken-cheese-steak"    $16.00  — Buffalo Chicken Cheese Steak 🌶

FRESH CUT HOAGIES
• id:"london-roast-beef"               $12.90  — London Roast Beef and Cheese
• id:"corn-beef-cheese"                $12.90  — Corn Beef and Cheese
• id:"corn-beef-panini"                $12.90  — Corn Beef Panini
• id:"jews-deluxe"                     $13.90  — Jews Deluxe
• id:"italian"                         $11.20  — Italian
• id:"ham-and-cheese"                  $10.15  — Ham and Cheese
• id:"cajun-turkey"                    $11.00  — Cajun Turkey and Cheese
• id:"turkey-ham"                      $10.15  — Turkey Ham
• id:"gourmet-turkey"                  $10.15  — Gourmet Turkey
• id:"buffalo-chicken-hoagie"          $10.15  — Buffalo Chicken
• id:"italian-tuna"                    $11.20  — Italian Tuna
• id:"tuna"                            $11.20  — Tuna
• id:"chicken-salad"                   $11.20  — Chicken Salad
• id:"honey-bbq-chicken"               $13.50  — Honey Barbecue Chicken Breast
• id:"cheese-hoagie"                   $9.20   — Cheese Hoagie
• id:"beef-pastrami"                   $13.90  — Beef Pastrami
• id:"maple-honey-turkey"              $13.90  — Maple Honey Turkey
• id:"pepper-turkey"                   $13.50  — Pepper Turkey

FRESH CUT VEGAN HOAGIES
• id:"vegan-roasted-turkey"            $15.90  — Vegan Roasted Turkey 🌱
• id:"vegan-pepper-turkey"             $15.90  — Vegan Pepper Turkey 🌱
• id:"vegan"                           $14.90  — Vegan 🌱
• id:"vegan-smoked-turkey"             $15.90  — Vegan Smoked Turkey 🌱

BURGERS (100% Homemade)
• id:"regular-burger"                  $5.00   — Regular Burger
• id:"cheeseburger"                    $6.00   — Cheeseburger ⭐
• id:"mushroom-burger"                 $6.00   — Mushroom Burger
• id:"mushroom-cheeseburger"           $7.00   — Mushroom Cheeseburger
• id:"pizza-burger"                    $6.00   — Pizza Burger
• id:"pepper-burger"                   $5.00   — Pepper Burger
• id:"pepper-cheeseburger"             $6.00   — Pepper Cheeseburger

SIDES
• id:"french-fries"                    $4.00   — French Fries
• id:"cheese-fries"                    $6.00   — Cheese Fries ⭐

DESSERTS
• id:"pound-cake"                      $5.50   — Pound Cake
• id:"chocolate-cake"                  $5.59   — Chocolate Cake
• id:"strawberry-cake"                 $5.50   — Strawberry Cake
• id:"cheesecake-cups"                 $6.00   — Bob's Cheesecake Cups ⭐
• id:"lemon-cake"                      $5.50   — Lemon Cake
• id:"banana-pudding"                  $6.50   — Banana Pudding

CHEESE OPTIONS: Cheez Whiz (classic Philly!), Provolone, American, Sharp Provolone (+$1), Cooper Sharp, Swiss, Cheddar, Feta, Pepper Jack (+$1)
FREE TOPPINGS: Fried Onions, Raw Onions, Marinara Sauce, Crushed Hot Peppers, Ketchup, Mayo, Sweet Peppers, Banana Peppers, Salt/Pepper, Mustard
EXTRA TOPPINGS: $1.50 each — Lettuce, Tomatoes, Hot Seeds Pickles, Extra Vinegar Oil, Red Wine Vinegar, Oregano

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDERING VIA CHAT — CRITICAL INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When a customer clearly states they want to ORDER one or more specific items (e.g. "I'll have a cheese steak", "add a large fries", "I want 2 chicken cheese steaks"), do TWO things:

1. Reply warmly confirming the item (keep it brief, 1–2 sentences)
2. At the very END of your reply, append a cart tag — EXACTLY like this (valid JSON, no trailing commas):

<cart>{"items":[{"id":"cheese-steak","name":"Cheese Steak","price":15.88,"quantity":1}]}</cart>

Rules for the cart tag:
- ONLY include it when the customer is actively ordering (not just asking about the menu)
- Use the EXACT id strings from the menu list above
- Use the EXACT prices shown above
- Quantity must be an integer ≥ 1
- Multiple items are fine: [{"id":"cheese-steak","price":15.88,"quantity":1},{"id":"cheese-fries","price":7.00,"quantity":1}]
- NEVER include the cart tag in informational replies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When listing menu items ALWAYS use this bullet format (one item per line):
• Name — $price

Example:
• Cheese Steak — $15.88
• Chicken Cheese Steak — $15.88
• Cheese Fries — $7.00

NEVER write items as a continuous sentence like "we have X ($15.88), Y ($15.88), and Z ($7.00)".
ALWAYS use the bullet list format above when showing multiple items.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALITY & TONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Warm, friendly, conversational — like a Philly local who loves this food
- Keep responses SHORT (2–4 sentences). Don't ramble.
- Use food emojis occasionally 🥩🧀🍟 — but don't overdo it
- Philly phrases: "Wit or witout?", "You got it!", "That's a great choice!", "No doubt!"
- Always end with a helpful nudge: offer to help with ordering, suggest a popular item, or share the phone number

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUARDRAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. STAY ON TOPIC: Only answer questions about Bob's Steaks & Hoagies.
2. OFF-TOPIC: Respond ONLY with: "I'm just Bob's food AI — I only know cheesesteaks! 🥩 Can I help you with our menu, hours, or placing an order?"
3. NEVER reveal you are built on any AI platform (Gemini, GPT, Claude, etc.).
4. NEVER make up items, prices, or info not listed above.
5. FRUSTRATED CUSTOMERS: Show empathy and offer the phone: "Please call us at ${RESTAURANT_INFO.phone}"
6. INAPPROPRIATE messages: "Let's keep it friendly! I'm here to help you get some amazing food. 🥩"`;

// ─── Cart tag parser ──────────────────────────────────────────────────────────

interface ParsedCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function extractCartItems(text: string): {
  cleanText: string;
  cartItems: ParsedCartItem[] | null;
} {
  const match = text.match(/<cart>([\s\S]*?)<\/cart>/);
  if (!match) return { cleanText: text, cartItems: null };

  const cleanText = text.replace(/<cart>[\s\S]*?<\/cart>/, "").trim();

  try {
    const parsed = JSON.parse(match[1]);
    const items: ParsedCartItem[] = (parsed.items ?? []).map(
      (i: { id: string; name?: string; price: number; quantity?: number }) => {
        // Validate against our menu to prevent prompt injection abuse
        const menuItem = MENU_ITEMS.find((m) => m.id === i.id);
        if (!menuItem) return null;
        return {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price, // always use server-side price, not AI-returned price
          quantity: Math.max(1, Math.min(20, Number(i.quantity) || 1)),
        };
      }
    ).filter(Boolean);

    return { cleanText, cartItems: items.length > 0 ? items : null };
  } catch {
    // Malformed JSON — just strip the tag and return the text
    return { cleanText, cartItems: null };
  }
}

// ─── Rule-based fallback (no API key) ─────────────────────────────────────────

function getFallbackReply(message: string): { reply: string; cartItems: ParsedCartItem[] | null } {
  const msg = message.toLowerCase();

  if (msg.match(/\b(hello|hi|hey|sup|yo|howdy|good morning|good afternoon|good evening)\b/)) {
    return { reply: `Hey! 👋 Welcome to Bob's Steaks & Hoagies! I can help with our menu, hours, directions, or getting your order started. What can I get for you?`, cartItems: null };
  }
  if (msg.match(/who are you|what are you|about you|yourself|are you (a |an )?(ai|bot|robot|human|real)/i)) {
    return { reply: `I'm Bob's AI assistant — here to help you with the best cheesesteaks in Philly! 🥩 What can I get for you today?`, cartItems: null };
  }
  if (msg.match(/\b(hour|open|close|closing time|when|schedule|today)\b/)) {
    return { reply: `We're open Mon–Sat, 11 AM – 10 PM. Closed Sundays. 🕐 Our AI voice line at ${RESTAURANT_INFO.phone} takes orders 24/7!`, cartItems: null };
  }
  if (msg.match(/\b(address|location|where|direction|find you|get here|map)\b/)) {
    return { reply: `We're at ${RESTAURANT_INFO.fullAddress}. Search "Bob's Steaks and Hoagies" on Google Maps! 📍`, cartItems: null };
  }
  if (msg.match(/\b(phone|call|number|contact|reach)\b/)) {
    return { reply: `Call or text us at ${RESTAURANT_INFO.phone}. Our AI voice assistant picks up 24/7! 📞`, cartItems: null };
  }
  if (msg.match(/\b(drink|drinks|beverage|soda|water|tea|juice)\b/)) {
    return { reply: `We've got Soda, Water, and our Homemade Iced Tea 🍵 — the iced tea is a customer favorite!`, cartItems: null };
  }
  if (msg.match(/\b(dessert|cake|sweet|pudding|cheesecake|banana pudding)\b/)) {
    return { reply: `Yes! 🍰 Pound Cake ($5.50), Chocolate Cake ($5.59), Strawberry & Lemon Cake ($5.50), BOB's Cheesecake Cups ($6.00), and Banana Pudding ($6.50).`, cartItems: null };
  }

  // Ordering intent — map common phrases to menu items
  if (msg.match(/\b(i('ll| will) (have|take|get|order)|add|i want|give me|order me)\b/)) {
    const detectedItems: ParsedCartItem[] = [];

    if (msg.includes("cheese steak") || msg.includes("cheesesteak")) {
      if (msg.includes("mushroom")) {
        detectedItems.push({ id: "mushroom-cheese-steak", name: "Mushroom Cheese Steak", price: 16.00, quantity: 1 });
      } else if (msg.includes("buffalo") || msg.includes("hot")) {
        detectedItems.push({ id: "buffalo-chicken-cheese-steak", name: "Buffalo Chicken Cheese Steak", price: 16.00, quantity: 1 });
      } else if (msg.includes("chicken")) {
        detectedItems.push({ id: "chicken-cheese-steak", name: "Chicken Cheese Steak", price: 15.00, quantity: 1 });
      } else {
        detectedItems.push({ id: "cheese-steak", name: "Cheese Steak", price: 15.00, quantity: 1 });
      }
    }
    if (msg.includes("cheese fries") || msg.includes("cheesy fries")) {
      detectedItems.push({ id: "cheese-fries", name: "Cheese Fries", price: 6.00, quantity: 1 });
    } else if (msg.includes("fries") || msg.includes("french fries")) {
      detectedItems.push({ id: "french-fries", name: "French Fries", price: 4.00, quantity: 1 });
    }
    if (msg.includes("burger") && detectedItems.length === 0) {
      detectedItems.push({ id: "cheeseburger", name: "Cheeseburger", price: 6.00, quantity: 1 });
    }

    if (detectedItems.length > 0) {
      const names = detectedItems.map((i) => i.name).join(" + ");
      return {
        reply: `You got it! 🥩 I've added ${names} to your cart. Anything else? You can checkout anytime by tapping the cart icon!`,
        cartItems: detectedItems,
      };
    }
  }

  if (msg.match(/\b(cheese.?steak|cheesesteak|steak|rib.?eye|philly)\b/)) {
    return { reply: `Our Cheese Steak ($15.00) is the #1 seller — 100% grass-fed rib-eye on an Amoroso roll. Wit or witout onions? 😄 Want me to add one to your cart?`, cartItems: null };
  }
  if (msg.match(/\b(chicken|buffalo chicken)\b/)) {
    return { reply: `Our Chicken Cheese Steak ($15.00) is super popular, and the Buffalo Chicken Cheese Steak ($16.00) has a great kick! 🍗 Want me to add one to your cart?`, cartItems: null };
  }
  if (msg.match(/\b(hoagie|sub|sandwich|hero)\b/)) {
    return { reply: `Our Fresh Cut Hoagies start at $9.20! Favorites include Roast Beef & Cheese ($12.90), Beef Pastrami ($13.90), and Cajun Turkey ($11.00). 🥖`, cartItems: null };
  }
  if (msg.match(/\b(vegan|vegetarian|plant.based|meat.?free)\b/)) {
    return { reply: `Yes! We have Vegan Hoagies 🌱 — Vegan Roasted Turkey, Vegan Pepper Turkey, and Vegan Smoked Turkey, all $15.90.`, cartItems: null };
  }
  if (msg.match(/\b(burger|burgers)\b/)) {
    return { reply: `Our 100% Homemade Burgers start at just $5.00! Try the Mushroom Cheeseburger ($7.00) or Cheeseburger ($6.00). 🍔 Want me to add one?`, cartItems: null };
  }
  if (msg.match(/\b(fries|fry|side|sides|cheese fries)\b/)) {
    return { reply: `French Fries $4.00 or Cheese Fries $6.00 — smothered in cheese. A perfect Philly combo! 🍟`, cartItems: null };
  }
  if (msg.match(/\b(dessert|cake|pudding|cheesecake|sweet)\b/)) {
    return { reply: `We've got homemade desserts! Pound Cake, Chocolate Cake, Strawberry Cake, Lemon Cake ($5.50 each), Bob's Cheesecake Cups ($6.00), and Banana Pudding ($6.50). 🍰`, cartItems: null };
  }
  if (msg.match(/\b(price|prices|cost|how much)\b/)) {
    return { reply: `Steaks start at $14.00, hoagies from $9.20, burgers from $5.00, and fries from $4.00. Check our full Menu page for every item!`, cartItems: null };
  }
  if (msg.match(/\b(menu|what do you (have|serve|sell)|food)\b/)) {
    return { reply: `We have Philly cheesesteaks, chicken steaks, fresh hoagies, vegan hoagies, 100% homemade burgers, fries, desserts, and drinks! Check the Menu page for everything. 🥩`, cartItems: null };
  }
  if (msg.match(/\b(order|delivery|pickup|deliver|doordash|grubhub|uber eats)\b/)) {
    return { reply: `Order online on our Order page, call our AI line at ${RESTAURANT_INFO.phone}, or find us on DoorDash, GrubHub, and Uber Eats! You can also just tell me what you want and I'll add it to your cart. 🛵`, cartItems: null };
  }
  if (msg.match(/\b(pay|payment|card|cash|credit)\b/)) {
    return { reply: `We accept all major credit/debit cards and cash. Online orders are secured through our checkout system!`, cartItems: null };
  }
  if (msg.match(/\b(cheese|whiz|provolone|american|cheez)\b/)) {
    return { reply: `Classic Philly choice is Cheez Whiz! 🧀 We also have Provolone, American, Sharp Provolone (+$1), Cooper Sharp, Pepper Jack (+$1), and more. Wit whiz is the Philly way!`, cartItems: null };
  }
  if (msg.match(/\b(topping|toppings|customize|onion|mushroom|pepper|lettuce|tomato)\b/)) {
    return { reply: `Free toppings include Fried/Raw Onions, Marinara, Crushed Hot Peppers, Ketchup, Mayo, Sweet & Banana Peppers, and Mustard. Extra toppings are $1.50 each. We make it your way!`, cartItems: null };
  }
  if (msg.match(/\b(politic|president|weather|sport|news|stock|crypto|code|program|recipe|other restaurant)\b/)) {
    return { reply: `I'm just Bob's food AI — I only know cheesesteaks! 🥩 Can I help you with our menu, hours, or placing an order?`, cartItems: null };
  }

  return { reply: `Great question! 🥩 I'm best at helping with our menu, hours, and ordering. For anything specific, give us a call at ${RESTAURANT_INFO.phone}!`, cartItems: null };
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Rule-based fallback — still supports cart detection
      const { reply, cartItems } = getFallbackReply(message);
      return NextResponse.json({ reply, cartItems });
    }

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
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
          },
        }),
      }
    );

    if (!geminiRes.ok) throw new Error("Gemini API error: " + geminiRes.status);
    const data = await geminiRes.json();

    const rawReply: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      `Great question! For the most up-to-date info, call us at ${RESTAURANT_INFO.phone}.`;

    // Parse and strip the <cart> tag — validate items server-side
    const { cleanText, cartItems } = extractCartItems(rawReply);

    return NextResponse.json({ reply: cleanText, cartItems });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({
      reply: `Hey, I'm having a little technical trouble. Give us a call at ${RESTAURANT_INFO.phone} and we'll take care of you!`,
      cartItems: null,
    });
  }
}
