"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Truck,
  Store,
  ExternalLink,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { RESTAURANT_INFO } from "@/lib/menu-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    count,
    subtotal,
    tax,
    total,
    orderType,
    setOrderType,
    customerPhone,
    setCustomerPhone,
    specialNote,
    setSpecialNote,
    updateQuantity,
    removeItem,
    clearCart,
    placeOrder,
    checkoutStatus,
    checkoutError,
    lastOrder,
    resetCheckout,
  } = useCart();

  // ── Close on Escape ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeCart]);

  // ── Lock body scroll when open ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const phoneRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const canSubmit =
    items.length > 0 &&
    customerPhone.replace(/\D/g, "").length >= 7 &&
    checkoutStatus !== "submitting";

  // ── Success screen ──
  if (checkoutStatus === "success" && lastOrder) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={closeCart}
          aria-hidden
        />
        <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-xl">Order Placed! 🎉</h2>
            <button
              onClick={() => { resetCheckout(); closeCart(); }}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Order ID</p>
              <p className="font-black text-lg text-gray-900">{lastOrder.orderId}</p>
            </div>

            <div className="w-full bg-gray-50 rounded-2xl p-5 text-left space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{fmt(lastOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (8%)</span><span>{fmt(lastOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span><span>{fmt(lastOrder.total)}</span>
              </div>
            </div>

            {lastOrder.paymentProvider === "stub" ? (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left">
                <p className="font-bold text-amber-800 mb-1">Pay at Pickup</p>
                <p className="text-amber-700 text-sm">
                  We&apos;ll have your order ready! Please pay when you arrive at{" "}
                  <strong>{RESTAURANT_INFO.address}</strong>.
                </p>
              </div>
            ) : (
              <a
                href={lastOrder.paymentUrl}
                className="w-full bg-[#C41230] hover:bg-[#960E23] text-white py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 transition-colors"
              >
                Complete Payment <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <p className="text-gray-500 text-sm">
              Questions? Call us at{" "}
              <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-[#C41230] font-semibold">
                {RESTAURANT_INFO.phone}
              </a>
            </p>
          </div>

          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={() => { resetCheckout(); closeCart(); }}
              className="w-full py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </aside>
      </>
    );
  }

  // ── Main cart ──
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#C41230]" />
            <h2 className="font-black text-xl">Your Order</h2>
            {count > 0 && (
              <span className="bg-[#C41230] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
            <div className="text-6xl">🛒</div>
            <h3 className="font-black text-xl text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 text-sm">
              Browse the menu, chat with Bob&apos;s AI, or call us to add items.
            </p>
            <button
              onClick={closeCart}
              className="mt-2 bg-[#C41230] hover:bg-[#960E23] text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors"
            >
              Browse Menu
            </button>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-800 transition-colors"
            >
              <Phone className="w-4 h-4" /> {RESTAURANT_INFO.phone}
            </a>
          </div>
        ) : (
          <>
            {/* ── Cart items ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start group">
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    {item.size && (
                      <p className="text-xs text-gray-400">{item.size}</p>
                    )}
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <p className="text-xs text-gray-400">
                        {Object.values(item.customizations).join(", ")}
                      </p>
                    )}
                    <p className="text-[#C41230] font-bold text-sm mt-0.5">
                      {fmt(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-sm tabular-nums">
                      {fmt(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="w-full text-gray-400 hover:text-gray-600 text-xs py-1 transition-colors"
              >
                Clear all items
              </button>
            </div>

            {/* ── Checkout panel ── */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">

              {/* Order type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    orderType === "pickup"
                      ? "border-[#C41230] bg-[#C41230]/5 text-[#C41230]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Store className="w-4 h-4" /> Pickup
                </button>
                <button
                  onClick={() => setOrderType("delivery")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    orderType === "delivery"
                      ? "border-[#C41230] bg-[#C41230]/5 text-[#C41230]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Truck className="w-4 h-4" /> Delivery
                </button>
              </div>

              {orderType === "delivery" && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                  For delivery, use{" "}
                  <a href={RESTAURANT_INFO.social.doordash} target="_blank" rel="noopener noreferrer" className="underline font-semibold">DoorDash</a>,{" "}
                  <a href={RESTAURANT_INFO.social.grubhub} target="_blank" rel="noopener noreferrer" className="underline font-semibold">GrubHub</a>, or{" "}
                  <a href={RESTAURANT_INFO.social.ubereats} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Uber Eats</a>.
                </p>
              )}

              {/* Phone */}
              <input
                ref={phoneRef}
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Your phone number *"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#C41230]/40 focus:border-[#C41230]"
              />

              {/* Special note */}
              <textarea
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="Special instructions (optional)"
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#C41230]/40 focus:border-[#C41230] resize-none"
              />

              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax (8%)</span>
                  <span className="tabular-nums">{fmt(tax)}</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-lg pt-1.5 border-t border-gray-100">
                  <span>Total</span>
                  <span className="tabular-nums">{fmt(total)}</span>
                </div>
              </div>

              {/* Error */}
              {checkoutStatus === "error" && checkoutError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-xs">{checkoutError}</p>
                </div>
              )}

              {/* Place order */}
              <button
                onClick={placeOrder}
                disabled={!canSubmit}
                className="w-full bg-[#C41230] hover:bg-[#960E23] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                {checkoutStatus === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Placing Order…
                  </>
                ) : (
                  <>
                    Place Order · {fmt(total)} <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {!customerPhone.trim() && (
                <p className="text-xs text-center text-gray-400">
                  * Phone number required so we can reach you about your order
                </p>
              )}

              {/* Fallback call option */}
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Prefer to call? {RESTAURANT_INFO.phone}
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ─── Cart FAB (floating action button) ────────────────────────────────────────
// Shown on all pages so the cart is always accessible.

export function CartFab() {
  const { count, total, openCart } = useCart();

  if (count === 0) return null;

  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 left-6 z-40 bg-[#C41230] hover:bg-[#960E23] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold hover:scale-105 transition-all"
      aria-label={`Open cart — ${count} items`}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>
        {count} item{count !== 1 ? "s" : ""}
      </span>
      <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm tabular-nums">
        {fmt(total)}
      </span>
    </button>
  );
}
