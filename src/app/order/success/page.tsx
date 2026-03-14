import Link from "next/link";
import { CheckCircle, Phone, Home } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you for your order at Bob&apos;s Steaks &amp; Hoagies! We&apos;re making it fresh
          right now. You&apos;ll receive a confirmation shortly.
        </p>
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
          <p className="text-sm font-bold text-gray-700 mb-1">Questions?</p>
          <a href={`tel:${RESTAURANT_INFO.phone}`} className="flex items-center gap-2 text-[#C41230] font-semibold">
            <Phone className="w-4 h-4" /> {RESTAURANT_INFO.phone}
          </a>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-full font-semibold transition-colors text-sm">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/menu" className="flex-1 bg-[#C41230] hover:bg-[#960E23] text-white py-3 rounded-full font-bold transition-colors text-sm">
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
}
