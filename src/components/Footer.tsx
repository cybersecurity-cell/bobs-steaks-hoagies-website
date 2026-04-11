import Link from "next/link";
import { Phone, MapPin, Clock, Instagram, ExternalLink } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🥩</span>
              <div>
                <span className="text-white font-black text-xl block leading-none">
                  Bob&apos;s
                </span>
                <span className="text-[#C41230] text-xs font-semibold tracking-widest uppercase">
                  Steaks &amp; Hoagies
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Philadelphia&apos;s finest 100% grass-fed cheesesteaks &amp; hoagies.
              Always made to order, always made with love.
            </p>
            <a
              href={RESTAURANT_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @bobsteakandhoagies
            </a>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C41230]" /> Hours
            </h3>
            <p className="text-sm text-gray-400">{RESTAURANT_INFO.hours.weekdays}</p>
            <p className="text-sm text-gray-500 mt-1">{RESTAURANT_INFO.hours.sunday}</p>
            <div className="mt-4 inline-block bg-green-900/40 border border-green-700/50 text-green-400 text-xs px-3 py-1 rounded-full">
              Voice AI Ordering 24/7
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C41230]" /> Find Us
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {RESTAURANT_INFO.address}
              <br />
              {RESTAURANT_INFO.city}
            </p>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-2"
            >
              <Phone className="w-4 h-4 text-[#C41230]" />
              {RESTAURANT_INFO.phone}
            </a>
            <a
              href={RESTAURANT_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Get Directions
            </a>
          </div>

          {/* Order Online */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Order Online</h3>
            <div className="flex flex-col gap-2">
              <a
                href={RESTAURANT_INFO.social.doordash}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                DoorDash
              </a>
              <a
                href={RESTAURANT_INFO.social.grubhub}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                GrubHub
              </a>
              <a
                href={RESTAURANT_INFO.social.ubereats}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Uber Eats
              </a>
            </div>
            <div className="mt-6">
              <p className="text-xs text-gray-600 mb-2">Quick Links</p>
              <div className="flex flex-col gap-1">
                {[
                  { href: "/menu", label: "Full Menu" },
                  { href: "/order", label: "Order & Pay" },
                  { href: "/about", label: "About Us" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Bob&apos;s Steaks &amp; Hoagies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Powered by{" "}
            <span className="text-[#C41230] font-medium">Bob&apos;s Voice AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
