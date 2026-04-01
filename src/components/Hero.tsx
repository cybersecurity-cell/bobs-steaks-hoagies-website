import Link from "next/link";
import Image from "next/image";
import { Phone, ChevronDown, Star } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1553909489-cd47e0907980?w=1920&auto=format&fit=crop&q=85"
          alt="Philly Cheesesteak - Bob's Steaks & Hoagies"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto fade-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#C41230]/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-lg">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          Philadelphia&apos;s Fastest-Growing Cheesesteak
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-4">
          <span className="text-[#C41230]">Bob&apos;s</span>{" "}
          Steaks
          <br />
          <span className="text-white/90">&amp; Hoagies</span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-200 font-light mb-3">
          100% Grass-Fed · Always Made to Order
        </p>
        <p className="text-base text-gray-300 mb-10 max-w-xl mx-auto">
          The real Philly cheesesteak experience. Fresh rib-eye, your choice of
          cheese, served on a toasted Amoroso roll — just the way it&apos;s meant to be.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/menu"
            className="bg-[#C41230] hover:bg-[#960E23] text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            View Menu →
          </Link>
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
          >
            <Phone className="w-5 h-5" />
            Call to Order
          </a>
        </div>

        {/* Voice AI badge */}
        <div className="mt-8 inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/20 text-white/80 text-sm px-5 py-2.5 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          Bob&apos;s AI Voice Assistant is live — call anytime to order!
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/50 animate-bounce">
        <ChevronDown className="w-7 h-7" />
      </div>

      {/* Stats strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "100%", label: "Grass-Fed Beef" },
            { value: "24/7", label: "AI Voice Ordering" },
            { value: "#1", label: "Philly Cheesesteak" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[#C41230] font-black text-xl sm:text-2xl">{s.value}</div>
              <div className="text-gray-400 text-xs sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
