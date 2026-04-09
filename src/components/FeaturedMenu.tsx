import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { FEATURED_ITEMS } from "@/lib/menu-data";

export default function FeaturedMenu() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
            Our Best Sellers
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2 mb-4">
            Philly Favorites
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Every sandwich is built from scratch with 100% grass-fed rib-eye and
            fresh ingredients — the authentic Philly way.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_ITEMS.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 border-2 border-[#C41230] text-[#C41230] hover:bg-[#C41230] hover:text-white px-8 py-3 rounded-full font-bold text-base transition-all"
          >
            View Full Menu
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
