"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, ExternalLink, ShoppingCart, ArrowRight } from "lucide-react";
import { MENU_CATEGORIES, RESTAURANT_INFO, type MenuItem } from "@/lib/menu-data";
import { useCart } from "@/lib/cart-context";
import MenuCard from "@/components/MenuCard";
import VoiceAISection from "@/components/VoiceAISection";

const DELIVERY_APPS = [
  {
    name: "DoorDash",
    url: RESTAURANT_INFO.social.doordash,
    bg: "bg-red-500 hover:bg-red-600",
    description: "Fast delivery · Track your order",
  },
  {
    name: "GrubHub",
    url: RESTAURANT_INFO.social.grubhub,
    bg: "bg-orange-500 hover:bg-orange-600",
    description: "Easy ordering · Rewards points",
  },
  {
    name: "Uber Eats",
    url: RESTAURANT_INFO.social.ubereats,
    bg: "bg-green-600 hover:bg-green-700",
    description: "Quick delivery · Great deals",
  },
];

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState("steaks");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSource, setMenuSource] = useState<"loading" | "clover" | "static">("loading");
  const { addItem, count, openCart } = useCart();

  // ── Fetch live menu from /api/menu (Clover → static fallback) ──
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data: { items: MenuItem[]; source: string }) => {
        if (data.items?.length) {
          setMenuItems(data.items);
          setMenuSource(data.source === "clover" ? "clover" : "static");
        } else {
          setMenuSource("static");
        }
      })
      .catch(() => setMenuSource("static"));
  }, []);

  const filteredItems = menuItems.filter((i) => i.category === activeCategory);

  const handleAdd = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* ── Hero strip ── */}
      <div className="bg-black text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-black mb-2">Order Bob&apos;s</h1>
        <p className="text-gray-400 text-lg">
          Build your order below, call us, or use a delivery app.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Sticky cart summary bar (shown when cart has items) ── */}
        {count > 0 && (
          <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 bg-[#C41230] text-white px-6 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">
                {count} item{count !== 1 ? "s" : ""} in your cart
              </span>
            </div>
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 bg-white text-[#C41230] font-bold px-4 py-1.5 rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Browse & add to cart ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900">Build Your Order</h2>
              {menuSource === "clover" && (
                <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                  Live prices
                </span>
              )}
            </div>
            <Link href="/menu" className="text-[#C41230] text-sm font-semibold hover:underline">
              Full menu →
            </Link>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#C41230] text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                <span>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>

          {/* Menu grid or skeleton */}
          {menuSource === "loading" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-36 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={handleAdd} compact />
              ))}
              {filteredItems.length === 0 && (
                <p className="col-span-3 text-center text-gray-400 py-12 text-sm">
                  No items in this category right now.
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium">or order another way</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── Call to Order ── */}
        <section className="bg-black rounded-2xl p-8 text-white text-center shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-green-400 text-sm font-semibold">AI Assistant Live &middot; 24/7</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Call to Order</h2>
          <p className="text-gray-400 text-sm mb-6">
            Talk to Bob&apos;s AI voice assistant — just say your order naturally.
            No hold times, no menus to navigate.
          </p>
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="inline-flex items-center gap-3 bg-[#C41230] hover:bg-[#960E23] text-white px-8 py-4 rounded-full font-black text-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Phone className="w-6 h-6" />
            {RESTAURANT_INFO.phone}
          </a>
          <p className="text-gray-500 text-xs mt-4">Mon–Sat 11 AM – 10 PM · Sunday Closed</p>
        </section>

        {/* ── Delivery apps ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-black text-gray-900 text-lg mb-1">Order for Delivery</h2>
          <p className="text-gray-500 text-sm mb-5">Available on your favorite delivery platforms</p>
          <div className="space-y-3">
            {DELIVERY_APPS.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between ${app.bg} text-white px-5 py-4 rounded-xl transition-colors`}
              >
                <div>
                  <p className="font-bold">{app.name}</p>
                  <p className="text-white/70 text-xs">{app.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-white/70" />
              </a>
            ))}
          </div>
        </section>

        <p className="text-center text-gray-400 text-xs pb-4">
          Questions? Call us at {RESTAURANT_INFO.phone}
        </p>
      </div>

      {/* ── Voice AI + Merch ── */}
      <VoiceAISection />
    </div>
  );
}
