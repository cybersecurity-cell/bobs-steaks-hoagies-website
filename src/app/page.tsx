import Hero from "@/components/Hero";
import FeaturedMenu from "@/components/FeaturedMenu";
import MerchSection from "@/components/MerchSection";
import ReviewSection from "@/components/ReviewSection";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Phone } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

export default function HomePage() {
  return (
    <>
      {/* ── Fixed watermark logo ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(300px, 60vw, 720px)",
          height: "clamp(300px, 60vw, 720px)",
          zIndex: 20,
          opacity: 0.07,
          pointerEvents: "none",
          userSelect: "none",
          mixBlendMode: "multiply",
        }}
      >
        <Image
          src="/logo.png"
          alt=""
          fill
          style={{ objectFit: "contain" }}
          priority
          sizes="(max-width: 768px) 300px, 60vw"
        />
      </div>

      <Hero />
      <FeaturedMenu />

      {/* Merch — above reviews */}
      <MerchSection />

      {/* Reviews */}
      <ReviewSection />

      {/* Location strip */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">
                Come Visit Us in{" "}
                <span className="text-[#C41230]">Philadelphia</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C41230] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{RESTAURANT_INFO.address}</p>
                    <p className="text-gray-400 text-sm">{RESTAURANT_INFO.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#C41230] flex-shrink-0" />
                  <p className="text-gray-300">{RESTAURANT_INFO.hours.weekdays}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C41230] flex-shrink-0" />
                  <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-gray-300 hover:text-white transition-colors">
                    {RESTAURANT_INFO.phone}
                  </a>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/menu" className="bg-[#C41230] hover:bg-[#960E23] text-white px-6 py-3 rounded-full font-bold transition-colors">
                  View Menu
                </Link>
                <a
                  href={RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/30 hover:border-white text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="relative h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="/BYB Steaks & Hoagies at twilight.png"
                alt="BYB Steaks & Hoagies at twilight"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/30" />
              <a
                href={RESTAURANT_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 text-center text-white font-semibold text-sm hover:text-[#C41230] transition-colors"
              >
                📍 {RESTAURANT_INFO.fullAddress}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
