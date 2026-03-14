import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerPhone, customerName, source } = body as {
      items: OrderItem[];
      customerPhone?: string;
      customerName?: string;
      source?: "voice" | "web";
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey);

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          metadata: { itemId: item.id },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderSummary = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bobs-website.vercel.app"}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bobs-website.vercel.app"}/order`,
      metadata: {
        customerPhone: customerPhone || "",
        customerName: customerName || "",
        source: source || "web",
        orderSummary,
      },
      phone_number_collection: { enabled: true },
      custom_text: {
        submit: {
          message: `Thank you for ordering from Bob's Steaks & Hoagies! Your order: ${orderSummary}`,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      total: total.toFixed(2),
    });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Order API running" });
}
