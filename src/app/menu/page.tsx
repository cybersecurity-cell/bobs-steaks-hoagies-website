"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus, Phone } from "lucide-react";
import { MENU_ITEMS, MENU_CATEGORIES, RESTAURANT_INFO, type MenuItem } from "@/lib/menu-data";
import MenuCard from "@/components/MenuCard";

interface CartItem extends MenuItem {
  quantity: number;
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("steaks");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredItems = MENU_ITEMS.filter((i) => i.category === activeCategory);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const qty = i.quantity + delta;
        return qty <= 0 ? [] : [{ ...i, quantity: qty }];
      })
    );
  };

  const clearCart = () => setCart([]);

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero banner */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1400&auto=format&fit=crop&q=80"
          alt="Menu"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Our Menu</h1>
            <p className="text-gray-300 text-base">100% Grass-Fed · Always Made to Order</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#C41230] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={addToCart} />
          ))}
        </div>

        {/* Delivery links */}
        <div className="mt-16 border-t border-gray-100 pt-12 text-center">
          <p className="text-gray-500 mb-4 font-medium">Also order from your favorite delivery app</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { name: "DoorDash", url: RESTAURANT_INFO.social.doordash, color: "bg-red-500" },
              { name: "GrubHub", url: RESTAURANT_INFO.social.grubhub, color: "bg-orange-500" },
              { name: "Uber Eats", url: RESTAURANT_INFO.social.ubereats, color: "bg-green-600" },
            ].map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${app.color} text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity`}
              >
                {app.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-[#C41230] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold hover:bg-[#960E23] transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">${cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full flex flex-col fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-xl">Your Order</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                    <p className="text-[#C41230] font-bold text-sm">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-black text-xl">${cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium text-center mb-3">Order via</p>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="flex items-center justify-center gap-2 w-full bg-[#C41230] hover:bg-[#960E23] text-white py-4 rounded-full font-bold text-lg transition-colors mb-3"
              >
                <Phone className="w-5 h-5" /> Call to Order
              </a>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { name: "DoorDash", url: RESTAURANT_INFO.social.doordash, bg: "bg-red-500" },
                  { name: "GrubHub", url: RESTAURANT_INFO.social.grubhub, bg: "bg-orange-500" },
                  { name: "Uber Eats", url: RESTAURANT_INFO.social.ubereats, bg: "bg-green-600" },
                ].map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${app.bg} text-white py-2 rounded-full text-xs font-semibold text-center hover:opacity-90 transition-opacity`}
                  >
                    {app.name}
                  </a>
                ))}
              </div>
              <button onClick={clearCart} className="w-full text-gray-400 hover:text-gray-600 text-xs mt-1 py-1 transition-colors">
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
