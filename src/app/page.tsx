import Hero from "@/components/Hero";
import FeaturedMenu from "@/components/FeaturedMenu";
import VoiceAISection from "@/components/VoiceAISection";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Phone, Star } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

const REVIEWS = [
  {
    name: "Marcus T.",
    stars: 5,
    text: "Best cheesesteak in Philly. Period. The rib-eye is fire and the whiz is perfect.",
  },
  {
    name: "Destiny W.",
    stars: 5,
    text: "The AI ordering is actually wild — called at midnight and had my order in by the time I pulled up!",
  },
  {
    name: "James K.",
    stars: 5,
    text: "Bob's Big Beautiful Bacon Burger is no joke. Come hungry.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedMenu />
      <VoiceAISection />

      {/* Reviews */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
              What Philly Says
            </span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Real Reviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                <Link href="/order" className="bg-[#C41230] hover:bg-[#960E23] text-white px-6 py-3 rounded-full font-bold transition-colors">
                  Order Online
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
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
                alt="Restaurant interior"
                fill
                className="object-cover"
                unoptimized
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
