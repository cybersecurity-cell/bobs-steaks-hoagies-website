"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, CreditCard, Phone, Trash2, ArrowLeft } from "lucide-react";
import { MENU_ITEMS, FEATURED_ITEMS, RESTAURANT_INFO, type MenuItem } from "@/lib/menu-data";

interface CartItem extends MenuItem { quantity: number }

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const itemsParam = searchParams.get("items");
    if (itemsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(itemsParam)) as CartItem[];
        setCart(parsed);
      } catch { /* ignore */ }
    }
  }, [searchParams]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addItem = (item: MenuItem) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      return ex ? prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.flatMap((i) => {
      if (i.id !== id) return [i];
      const qty = i.quantity + delta;
      return qty <= 0 ? [] : [{ ...i, quantity: qty }];
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, source: "web" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please call us at " + RESTAURANT_INFO.phone);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/menu" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-8">Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart */}
          <div className="lg:col-span-2">
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <ShoppingCart className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
                <Link href="/menu" className="bg-[#C41230] hover:bg-[#960E23] text-white px-6 py-3 rounded-full font-bold transition-colors">
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {cart.map((item) => (
                  <div key={item.id} className="p-5 flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-[#C41230] font-semibold text-sm">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="font-bold w-5 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-black text-base w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick-add popular items */}
            <div className="mt-8">
              <h2 className="font-bold text-gray-700 mb-4">Popular Add-ons</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FEATURED_ITEMS.filter((f) => !cart.find((c) => c.id === f.id)).slice(0, 4).map((item) => (
                  <button key={item.id} onClick={() => addItem(item)}
                    className="bg-white border border-gray-100 rounded-xl p-3 text-left hover:border-[#C41230] hover:shadow-sm transition-all group">
                    <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2">
                      <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-xs text-[#C41230] font-semibold mt-0.5">${item.price.toFixed(2)}</p>
                    <span className="text-xs text-gray-400 group-hover:text-[#C41230] transition-colors">+ Add</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-black text-xl mb-6">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.quantity}× {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Subtotal ({cartCount} items)</span>
                      <span className="font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Tax &amp; delivery calculated at checkout</p>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-3">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={loading || cart.length === 0}
                    className="mt-6 w-full bg-[#C41230] hover:bg-[#960E23] disabled:opacity-60 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors text-lg shadow-lg"
                  >
                    <CreditCard className="w-5 h-5" />
                    {loading ? "Processing…" : `Pay $${cartTotal.toFixed(2)}`}
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    Secured by Stripe · All major cards accepted
                  </p>
                </>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 my-5" />

              {/* Voice order option */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-2 font-medium">Prefer to order by phone?</p>
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-2.5 px-4 rounded-full text-sm font-bold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Bob&apos;s AI · {RESTAURANT_INFO.phone}
                </a>
                <p className="text-xs text-gray-400 mt-2">Available 24/7 · Voice ordering</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center"><p className="text-gray-500">Loading order...</p></div>}>
      <OrderPageContent />
    </Suspense>
  );
}
