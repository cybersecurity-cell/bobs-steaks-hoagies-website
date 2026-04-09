"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, ShoppingCart } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";
import { useCart } from "@/lib/cart-context";

function getStoreStatus(): { open: boolean; label: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  const openTime = 11 * 60;   // 11:00 AM
  const closeTime = 22 * 60;  // 10:00 PM

  // Sunday = closed
  if (day === 0) return { open: false, label: "Closed Today" };

  const isOpen = timeInMinutes >= openTime && timeInMinutes < closeTime;
  if (isOpen) {
    const minsLeft = closeTime - timeInMinutes;
    if (minsLeft <= 30) return { open: true, label: "Closing Soon" };
    return { open: true, label: "Open Now" };
  }
  if (timeInMinutes < openTime) return { open: false, label: "Opens 11 AM" };
  return { open: false, label: "Closed" };
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order Online" },
  { href: "/#merch", label: "Merch" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/about", label: "About & Location" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [storeStatus, setStoreStatus] = useState<{ open: boolean; label: string } | null>(null);

  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setStoreStatus(getStoreStatus());
    const interval = setInterval(() => setStoreStatus(getStoreStatus()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Bob's Steaks & Hoagies Home">
          <Image src="/logo.png" alt="Bob's Steaks & Hoagies" width={130} height={52} className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {storeStatus && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                storeStatus.open
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${storeStatus.open ? "bg-green-500" : "bg-red-500"}`} />
              {storeStatus.label}
            </span>
          )}
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Phone className="w-4 h-4 text-[#C41230]" />
            {RESTAURANT_INFO.phone}
          </a>

          {/* Cart icon button */}
          <button
            onClick={openCart}
            aria-label={`Cart — ${count} items`}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C41230] text-white text-[10px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-0.5">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          <Link
            href="/order"
            className="bg-[#C41230] hover:bg-[#960E23] text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-md"
          >
            Order Now
          </Link>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={openCart}
            aria-label={`Cart — ${count} items`}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C41230] text-white text-[10px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-0.5">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
          <button
            className="text-gray-700 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-6">
          <nav className="flex flex-col gap-1 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-gray-700 hover:text-gray-900 py-3 px-3 text-base font-medium border-b border-gray-100 hover:bg-gray-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {storeStatus && (
              <span
                className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-full w-fit ${
                  storeStatus.open
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${storeStatus.open ? "bg-green-500" : "bg-red-500"}`} />
                {storeStatus.label}
              </span>
            )}
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center gap-2 text-gray-600 text-sm"
            >
              <Phone className="w-4 h-4 text-[#C41230]" />
              {RESTAURANT_INFO.phone}
            </a>
            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="bg-[#C41230] hover:bg-[#960E23] text-white px-5 py-3 rounded-full text-center font-semibold transition-colors"
            >
              Order Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
