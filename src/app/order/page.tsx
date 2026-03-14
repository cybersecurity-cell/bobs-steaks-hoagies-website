import Link from "next/link";
import { Phone, ArrowLeft, ExternalLink } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

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
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Order Bob&apos;s</h1>
          <p className="text-gray-500 text-lg">Choose how you&apos;d like to order today</p>
        </div>

        {/* Call to Order — primary */}
        <div className="bg-black rounded-2xl p-8 text-white text-center mb-6 shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-green-400 text-sm font-semibold">AI Assistant Live &middot; 24/7</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Call to Order</h2>
          <p className="text-gray-400 text-sm mb-6">
            Talk to Bob&apos;s AI voice assistant &mdash; just say your order naturally.
            No hold times, no menus to navigate.
          </p>
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="inline-flex items-center gap-3 bg-[#C41230] hover:bg-[#960E23] text-white px-8 py-4 rounded-full font-black text-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Phone className="w-6 h-6" />
            {RESTAURANT_INFO.phone}
          </a>
          <p className="text-gray-500 text-xs mt-4">Mon&ndash;Sat 11 AM &ndash; 10 PM &middot; Sunday Closed</p>
        </div>

        {/* Delivery apps */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          Online payment coming soon &middot; Questions? Call us at {RESTAURANT_INFO.phone}
        </p>
      </div>
    </div>
  );
}
