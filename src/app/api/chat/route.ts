import { NextRequest, NextResponse } from "next/server";
import { RESTAURANT_INFO, MENU_ITEMS } from "@/lib/menu-data";

const SYSTEM_PROMPT = `You are Bob's AI assistant for Bob's Steaks & Hoagies restaurant in Philadelphia.

RESTAURANT INFO:
- Name: Bob's Steaks & Hoagies
- Address: ${RESTAURANT_INFO.fullAddress}
- Phone: ${RESTAURANT_INFO.phone}
- Hours: Mon–Sat 11:00 AM – 10:00 PM, Closed Sunday
- Specialty: 100% Grass-Fed Philly cheesesteaks & hoagies, always made to order

MENU HIGHLIGHTS (key items):
- Cheese Steak: $15.88 (Most Popular) — rib-eye with Cheez Whiz, provolone, or American on Amoroso roll
- Cheese Steak Hoagie: $17.00 — steak + cheese on hoagie roll with lettuce, tomato, onion
- Pizza Steak: $17.00 — steak with marinara and provolone
- Chicken Cheese Steak: $15.88
- Buffalo Chicken Cheese Steak: $16.88
- Bob's Big Beautiful Bacon Burger: $12.00
- Cheese Fries: $7.00 | French Fries: $5.00
- 16 Wings: $19.60 (Buffalo, BBQ, Honey Garlic, or Plain)
- Catfish Hoagie: $18.50 | Fried Shrimp Platter: $12.00

CHEESE OPTIONS: Cheez Whiz (classic Philly), Provolone, American
TOPPINGS: Onions, Mushrooms, Peppers, Lettuce, Tomato, Hot Peppers

PERSONALITY: Friendly, helpful, quick — like a real Philly counter person. Keep responses concise (2-4 sentences max). Use phrases like "You got it!", "Great choice!", "Wit or witout?" when appropriate.

IMPORTANT RULES:
1. If a customer is upset or frustrated, show empathy and offer to transfer to a human: "I'm sorry about that! Let me connect you with our team at ${RESTAURANT_INFO.phone} or you can call us directly."
2. For complex custom orders, say: "For the most accurate order, give us a call at ${RESTAURANT_INFO.phone} or use our Order Online page!"
3. Always encourage online ordering or calling the AI voice line.
4. Never make up prices or items not on the menu.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback rule-based response when no API key
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

// Rule-based fallback (no API key needed)
function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.match(/hour|open|close|time/)) {
    return `We're open Mon–Sat, 11 AM – 10 PM. Closed Sundays. Our AI voice ordering is available 24/7 at ${RESTAURANT_INFO.phone}!`;
  }
  if (msg.match(/address|location|where|direction/)) {
    return `We're at ${RESTAURANT_INFO.fullAddress}. You can get directions at Google Maps!`;
  }
  if (msg.match(/phone|call|number/)) {
    return `Call or text us at ${RESTAURANT_INFO.phone}. Our AI voice assistant answers 24/7!`;
  }
  if (msg.match(/cheese.?steak|cheesesteak|steak/)) {
    return `Our Cheese Steak ($15.88) is the most popular — 100% grass-fed rib-eye with your choice of Cheez Whiz, provolone, or American on an Amoroso roll. Wit or witout onions? 😄`;
  }
  if (msg.match(/hoagie|sub/)) {
    return `Our Cheese Steak Hoagie ($17.00) is a fan favorite — steak and cheese on a long hoagie roll with lettuce, tomato, and onion. Fresh and loaded!`;
  }
  if (msg.match(/burger/)) {
    return `Bob's Big Beautiful Bacon Burger ($12.00) is our signature — double-stacked beef with bacon, cheddar, and Bob's special sauce. A must-try!`;
  }
  if (msg.match(/wing/)) {
    return `16 Wings for $19.60! Choose from Buffalo, BBQ, Honey Garlic, or Plain. Great for sharing (or not 😄).`;
  }
  if (msg.match(/fries|side/)) {
    return `French Fries $5.00 or Cheese Fries $7.00 — smothered in Cheez Whiz. A perfect Philly combo!`;
  }
  if (msg.match(/price|cost|how much/)) {
    return `Our steaks start at $15.50, burgers from $8.50, and sides from $5.00. Check our full menu at the Menu page for all prices!`;
  }
  if (msg.match(/menu/)) {
    return `We've got Philly cheesesteaks, chicken steaks, burgers, seafood, wings, and sides. Head to our Menu page to see everything with prices!`;
  }
  if (msg.match(/order|delivery|pickup/)) {
    return `You can order online on our Order page, call our AI at ${RESTAURANT_INFO.phone}, or order via DoorDash, GrubHub, or Uber Eats!`;
  }
  if (msg.match(/pay|payment|stripe|credit/)) {
    return `We accept all major cards! After ordering by phone, you'll get a secure payment link via text. Online orders use Stripe checkout.`;
  }
  if (msg.match(/hello|hi|hey|sup|yo/)) {
    return `Hey! 👋 Welcome to Bob's Steaks & Hoagies! What can I help you with — menu, hours, or are you ready to order?`;
  }

  return `Great question! For the full answer, check our Menu page or give us a call at ${RESTAURANT_INFO.phone}. We're happy to help!`;
}
