import Link from "next/link";
import Image from "next/image";
import { Phone, ChevronDown } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

      {/* ── Background: storefront photo, desaturated to true B&W ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/storefront-hero.png"
          alt="Bob's Steaks & Hoagies — North Philadelphia storefront"
          fill
          className="object-cover object-center"
          style={{ filter: "grayscale(100%) contrast(1.12) brightness(0.82)" }}
          priority
          sizes="100vw"
        />
        {/* Multi-stop overlay: deep black left + soft vignette edges */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(
              to right,
              rgba(0,0,0,0.78) 0%,
              rgba(0,0,0,0.42) 45%,
              rgba(0,0,0,0.18) 75%,
              rgba(0,0,0,0.48) 100%
            )
          `
        }} />
        {/* Bottom vignette so stats strip sits cleanly */}
        <div className="absolute bottom-0 left-0 right-0 h-48"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)" }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto fade-up">

        {/* Badge — white border, no red */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-lg tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          Philadelphia&apos;s Finest Cheesesteak
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
        </div>

        {/* Headline — pure white, no red accent */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white leading-none mb-5 tracking-tight drop-shadow-2xl">
          Bob&apos;s
          <br />
          <span className="text-white/80 font-black">Steaks &amp; Hoagies</span>
        </h1>

        {/* Sub-line */}
        <p className="text-lg sm:text-xl text-white/70 font-light mb-3 tracking-wide">
          100% Grass-Fed &nbsp;·&nbsp; Always Made to Order
        </p>
        <p className="text-sm sm:text-base text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
          The real Philly cheesesteak experience. Fresh rib-eye, your choice of
          cheese, served on a toasted Amoroso roll — just the way it&apos;s meant to be.
        </p>

        {/* CTAs — white primary, ghost secondary */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/menu"
            className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full text-base font-black transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 tracking-wide"
          >
            View Menu →
          </Link>
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="flex items-center gap-2 bg-transparent hover:bg-white/10 border border-white/40 hover:border-white/70 text-white px-8 py-4 rounded-full text-base font-semibold transition-all tracking-wide"
          >
            <Phone className="w-4 h-4" />
            Call to Order
          </a>
        </div>

        {/* Voice AI badge */}
        <div className="mt-8 inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/15 text-white/60 text-xs px-5 py-2.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          AI Voice Assistant live — call anytime to order
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-white/30 animate-bounce">
        <ChevronDown className="w-6 h-6" />
      </div>

      {/* ── Stats strip — white on near-black ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "100%", label: "Grass-Fed Beef" },
            { value: "24/7",  label: "AI Voice Ordering" },
            { value: "#1",    label: "Philly Cheesesteak" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-white font-black text-xl sm:text-2xl">{s.value}</div>
              <div className="text-white/40 text-xs sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
