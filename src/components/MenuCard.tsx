import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { MenuItem } from "@/lib/menu-data";

interface MenuCardProps {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  compact?: boolean;
}

export default function MenuCard({ item, onAdd, compact = false }: MenuCardProps) {
  return (
    <div className="menu-card bg-white rounded-2xl overflow-hidden border border-gray-100 group">
      {/* Image */}
      <div className={`relative overflow-hidden ${compact ? "h-44" : "h-52"}`}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          loading="lazy"
          className="menu-card-img object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.popular && (
            <span className="bg-[#C41230] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
              Popular
            </span>
          )}
          {item.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-black/70 text-white text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 ${compact ? "" : "p-5"}`}>
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-base leading-snug">{item.name}</h3>
          <span className="text-[#C41230] font-black text-lg whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {!compact && (
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        {onAdd && (
          <button
            onClick={() => onAdd(item)}
            className="w-full flex items-center justify-center gap-2 bg-[#C41230] hover:bg-[#960E23] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors mt-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Order
          </button>
        )}
      </div>
    </div>
  );
}
