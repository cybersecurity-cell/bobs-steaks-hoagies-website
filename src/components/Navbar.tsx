"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order Online" },
  { href: "/about", label: "About & Location" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 shadow-lg backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Bob's Steaks & Hoagies Home">
         <Image src="/logo.png" alt="Bob's Steaks & Hoagies" width={130} height={52} className="h-12 w-auto object-contain brightness-0 invert" priority />
        </Link>
      
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-200 hover:text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4 text-[#C41230]" />
            {RESTAURANT_INFO.phone}
          </a>
          <Link
            href="/order"
            className="bg-[#C41230] hover:bg-[#960E23] text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-md"
          >
            Order Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
       
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-gray-200 hover:text-white py-3 px-3 text-base font-medium border-b border-white/5 hover:bg-white/5 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center gap-2 text-white/80 text-sm"
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
