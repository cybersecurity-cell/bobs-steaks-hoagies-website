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
                      src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&auto=format&fit=crop&q=80"
          alt="About Bob's Steaks & Hoagies"
          fill
          className="object-cover"
          unoptimized
        />h
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl font-black mb-2">About Us</h1>
            <p className="text-gray-300 text-lg">Real Philly. Real Fresh. Always.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* About text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-6 leading-tight">
              Welcome to BOB&apos;S STEAKS AND HOAGIES
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Welcome to BOB&apos;S STEAKS AND HOAGIES, the ultimate destination for cheesesteak lovers! Located in the heart of North Philadelphia, we pride ourselves on serving authentic, mouth-watering cheesesteaks made from the finest quality ingredients. We proudly serve <strong className="text-gray-900">100% grass-fed beef</strong> cooked to perfection and topped with your choice of melty cheeses and fresh, flavorful toppings.
              </p>
              <p>
                At BOB&apos;S STEAKS AND HOAGIES, every cheesesteak is crafted with passion and served with a side of our signature sauces. Whether you prefer the classic Philly cheesesteak or want to try our unique variations like the BBQ Bacon Cheesesteak or the Veggie Delight, we&apos;ve got something for everyone!
              </p>
              <p>
                We believe in a welcoming atmosphere where friends and family can gather to enjoy delicious food. Our friendly staff is dedicated to providing top-notch service and ensuring every visit is a memorable one.
              </p>
              <p>
                Join us for lunch or dinner, and don&apos;t forget to pair your cheesesteak with our crispy fries or refreshing beverages. Stop by BOB&apos;S STEAKS AND HOAGIES today and experience the best cheesesteaks in Philadelphia&mdash;where every bite is a taste of happiness!
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
              <ExternalLink className="w-3.5 h-3.5" />
              Get Directions
            </a>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-[#C41230]/10 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-[#C41230]" />
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-3">Contact</h3>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="text-gray-600 text-sm hover:text-[#C41230] transition-colors block mb-2"
            >
              {RESTAURANT_INFO.phone}
            </a>
            <a
              href={RESTAURANT_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-700 font-semibold transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              @bobsteakandhoagies
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
            <Link
              href="/menu"
              className="bg-[#C41230] hover:bg-[#960E23] text-white px-8 py-3.5 rounded-full font-bold transition-colors"
            >
              View Menu
            </Link>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-full font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              {RESTAURANT_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
