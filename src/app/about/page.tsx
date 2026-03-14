import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Phone, Instagram, ExternalLink } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1400&auto=format&fit=crop&q=80"
          alt="About Bob's Steaks & Hoagies"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl font-black mb-2">Our Story</h1>
            <p className="text-gray-300 text-lg">Real Philly. Real Fresh. Always.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-6 leading-tight">
              Philadelphia&apos;s Fastest-Growing Cheesesteak
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Bob&apos;s Steaks &amp; Hoagies was born from a simple belief: food should feed your soul,
                not just your stomach. Located in the heart of North Philadelphia, we&apos;ve built our
                reputation on one thing — the most authentic, freshest Philly cheesesteak you&apos;ll
                ever taste.
              </p>
              <p>
                We use <strong className="text-gray-900">100% grass-fed rib-eye beef</strong>, thinly
                sliced and cooked to order on our flat-top grill. Every sandwich is built on a fresh
                Amoroso roll — the only roll a real Philly cheesesteak deserves.
              </p>
              <p>
                Whether you want Cheez Whiz wit&apos; onions (the classic), provolone witout, or one
                of our loaded hoagies — we make it exactly how you want it, every single time.
              </p>
            </div>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
              alt="Fresh cheesesteak being made"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-[#C41230]/10 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-[#C41230]" />
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-3">Hours</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {RESTAURANT_INFO.hours.weekdays}
              <br />
              {RESTAURANT_INFO.hours.sunday}
            </p>
            <div className="mt-4 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full inline-block">
              AI Voice Ordering Available 24/7
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-[#C41230]/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-[#C41230]" />
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-3">Location</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {RESTAURANT_INFO.address}
              <br />
              {RESTAURANT_INFO.city}
            </p>
            <a
              href={RESTAURANT_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Get Directions
            </a>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-[#C41230]/10 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-[#C41230]" />
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-3">Contact</h3>
            <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-gray-600 text-sm hover:text-[#C41230] transition-colors block mb-2">
              {RESTAURANT_INFO.phone}
            </a>
            <a
              href={RESTAURANT_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-700 font-semibold transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" /> @bobsteakandhoagies
            </a>
          </div>
        </div>

        {/* Google Map embed */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-16">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.2456!2d-75.1791!3d39.9861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6c7d2b3a3b6e5%3A0x123456789!2s1949+W+Norris+St%2C+Philadelphia%2C+PA+19121!5e0!3m2!1sen!2sus!4v1234567890"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bob's Steaks & Hoagies Location"
          />
        </div>

        {/* CTA */}
        <div className="text-center bg-black rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-black mb-4">Ready to Order?</h2>
          <p className="text-gray-400 mb-8">Order online, call our AI assistant, or come visit us in Philly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="bg-[#C41230] hover:bg-[#960E23] text-white px-8 py-3.5 rounded-full font-bold transition-colors">
              Order Online
            </Link>
            <a href={`tel:${RESTAURANT_INFO.phone}`} className="flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full font-semibold transition-colors">
              <Phone className="w-4 h-4" /> {RESTAURANT_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
