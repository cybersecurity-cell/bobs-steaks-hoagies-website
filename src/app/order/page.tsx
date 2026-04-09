"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, ExternalLink, ShoppingCart, ArrowRight } from "lucide-react";
import { MENU_ITEMS, MENU_CATEGORIES, RESTAURANT_INFO, type MenuItem } from "@/lib/menu-data";
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
  const { addItem, count, openCart } = useCart();

  const filteredItems = MENU_ITEMS.filter((i) => i.category === activeCategory);

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
            <h2 className="text-2xl font-black text-gray-900">Build Your Order</h2>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAdd} compact />
            ))}
          </div>
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
