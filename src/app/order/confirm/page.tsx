import Link from "next/link";
import { CheckCircle2, Phone, ArrowLeft, Store } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

interface PageProps {
  searchParams: Promise<{ orderId?: string; method?: string; total?: string }>;
}

export default async function OrderConfirmPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params.orderId ?? "—";
  const method = params.method ?? "cash";
  const total = params.total ? `$${Number(params.total).toFixed(2)}` : null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-7">
            Thanks for ordering from Bob&apos;s Steaks &amp; Hoagies.
          </p>

          {/* Order details */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Order ID</span>
              <span className="font-black text-gray-900 text-sm tracking-wide">{orderId}</span>
            </div>
            {total && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total</span>
                <span className="font-black text-[#C41230] text-lg">{total}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Payment</span>
              <span className="font-semibold text-gray-800 text-sm capitalize">
                {method === "cash" ? "Pay at Pickup" : method}
              </span>
            </div>
          </div>

          {/* Pay at pickup instructions */}
          {method === "cash" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm">Pay When You Arrive</p>
                  <p className="text-amber-700 text-sm mt-0.5">
                    We&apos;ll have your order ready. Please come to{" "}
                    <strong>{RESTAURANT_INFO.address}</strong> and pay at the counter.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hours reminder */}
          <p className="text-gray-400 text-xs mb-6">
            {RESTAURANT_INFO.hours.weekdays} &middot; {RESTAURANT_INFO.hours.sunday}
          </p>

          {/* CTA */}
          <a
            href={`tel:${RESTAURANT_INFO.phone}`}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white py-3.5 rounded-2xl font-bold transition-colors"
          >
            <Phone className="w-4 h-4" /> {RESTAURANT_INFO.phone}
          </a>

          <Link
            href="/menu"
            className="mt-3 block text-gray-400 hover:text-gray-600 text-sm transition-colors py-2"
          >
            Order more →
          </Link>
        </div>
      </div>
    </div>
  );
}
