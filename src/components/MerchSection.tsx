"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Star, X, ChevronDown } from "lucide-react";
import { MERCH_HATS, MERCH_HOODIES, type MerchItem } from "@/lib/merch-data";

/* ── Star rating helper ── */
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{rating.toFixed(1)} ({count})</span>
    </div>
  );
}

/* ── Size Chart Modal ── */
function SizeChartModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900 text-lg">Size Chart</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <table className="w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-[#C41230] text-white">
              {["Size", "Chest (in)", "Length (in)", "Sleeve (in)"].map((h) => (
                <th key={h} className="py-2 px-3 font-bold first:rounded-tl-lg last:rounded-tr-lg">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["S",   "36–38", "27", "33"],
              ["M",   "39–41", "28", "34"],
              ["L",   "42–44", "29", "35"],
              ["XL",  "45–47", "30", "36"],
              ["2XL", "48–50", "31", "37"],
              ["3XL", "51–53", "32", "38"],
              ["4XL", "54–56", "33", "39"],
              ["5XL", "57–59", "34", "40"],
            ].map(([size, chest, length, sleeve], i) => (
              <tr key={size} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-3 font-bold text-[#C41230]">{size}</td>
                <td className="py-2 px-3 text-gray-700">{chest}</td>
                <td className="py-2 px-3 text-gray-700">{length}</td>
                <td className="py-2 px-3 text-gray-700">{sleeve}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Measurements are approximate. If between sizes, size up.
        </p>
      </div>
    </div>
  );
}

/* ── Single product card ── */
function MerchCard({ item }: { item: MerchItem }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError]       = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [sizeOpen, setSizeOpen]         = useState(false);
  const [hovered, setHovered]           = useState(false);

  const soldOut = item.availability === "sold_out";
  const showBack = hovered && !!item.imageBack;

  const handleBuy = () => {
    if (item.sizes && !selectedSize) { setSizeError(true); return; }
    const url = item.sizes && selectedSize
      ? `${item.shopifyUrl}?variant=${encodeURIComponent(selectedSize)}`
      : item.shopifyUrl;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {showSizeChart && <SizeChartModal onClose={() => setShowSizeChart(false)} />}

      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >

        {/* Image — explicit dimensions prevent layout shift */}
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          <Image
            src={showBack ? item.imageBack! : item.image}
            alt={showBack ? `${item.title} — back` : item.title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
          />
          {item.imageBack && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
              {showBack ? "back" : "hover for back"}
            </span>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {item.badge && (
              <span className="bg-[#C41230] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                {item.badge}
              </span>
            )}
            {soldOut && (
              <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1 gap-3 bg-white">

          {/* Title + price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-gray-900 text-sm leading-snug">{item.title}</h3>
            <span className="text-[#C41230] font-black text-base whitespace-nowrap">${item.price}</span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
          )}

          {/* Rating */}
          {item.rating && item.reviewCount && (
            <StarRating rating={item.rating} count={item.reviewCount} />
          )}

          {/* Size selector (hoodies only) */}
          {item.sizes && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-600">Size</label>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-[10px] text-[#C41230] underline font-semibold"
                >
                  Size Chart
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => { setSizeOpen((v) => !v); setSizeError(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    sizeError
                      ? "border-red-400 bg-red-50 text-red-600"
                      : selectedSize
                      ? "border-[#C41230] bg-[#C41230]/5 text-[#C41230]"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {selectedSize || "Select a size"}
                  <ChevronDown className={`w-4 h-4 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
                </button>

                {sizeOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-px p-1 bg-gray-100">
                      {item.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSelectedSize(s); setSizeOpen(false); setSizeError(false); }}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            selectedSize === s
                              ? "bg-[#C41230] text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {sizeError && <p className="text-red-500 text-xs mt-1">Please select a size</p>}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto">
            <button
              onClick={handleBuy}
              disabled={soldOut}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-all ${
                soldOut
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#C41230] hover:bg-[#960E23] text-white shadow hover:shadow-md"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {soldOut ? "Sold Out" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Merch Section ── */
export default function MerchSection() {
  return (
    <section id="merch" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[#C41230] text-sm font-black uppercase tracking-widest">
            Official Store
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2 mb-3">
            Bob&apos;s <span className="text-[#C41230]">Merch</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Wear the legend. Hats, hoodies, and more — all rocking the Bob&apos;s logo.
            Ships anywhere in the US.
          </p>
        </div>

        {/* Hats */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🧢</span>
            <h3 className="text-xl font-black text-gray-900">Hats</h3>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MERCH_HATS.map((item) => (
              <MerchCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Hoodies */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🧥</span>
            <h3 className="text-xl font-black text-gray-900">Hoodies</h3>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MERCH_HOODIES.map((item) => (
              <MerchCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-xs">
            All merch fulfilled via Shopify. Questions?{" "}
            <a
              href="mailto:merch@bobssteakshoagies.com"
              className="text-[#C41230] hover:underline"
            >
              merch@bobssteakshoagies.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
