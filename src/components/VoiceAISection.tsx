import { Phone, Mic, Brain, CreditCard, ArrowRight } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";
import MerchSection from "@/components/MerchSection";

const STEPS = [
  {
    icon: Phone,
    step: "01",
    title: "Call Bob's AI",
    description: `Dial ${RESTAURANT_INFO.phone} any time — day or night. Bob's AI assistant answers instantly.`,
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Mic,
    step: "02",
    title: "Speak Your Order",
    description:
      "Just talk naturally: \"I'll take a cheese steak with whiz and onions, and a cheese fries.\" Bob's got it.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Brain,
    step: "03",
    title: "AI Confirms Order",
    description:
      "Powered by Gemini 2.5 Flash, Bob reads back your order, catches mistakes, and suggests add-ons.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: CreditCard,
    step: "04",
    title: "Order Confirmed",
    description:
      "Bob reads back your full order, confirms your pickup time, and lets the kitchen know. Easy as that.",
    color: "bg-green-50 text-green-600",
  },
];

export default function VoiceAISection() {
  return (
    <>
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <span className="text-[#C41230] text-sm font-bold uppercase tracking-widest">
              Powered by Gemini AI + Twilio
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2 mb-6 leading-tight">
              Order by Voice.
              <br />
              <span className="text-[#C41230]">24 / 7.</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Bob&apos;s AI assistant takes your order over the phone just like a real person —
              no hold times, no apps, no menus to scroll. Speak naturally and your
              food is on its way.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="inline-flex items-center gap-3 bg-[#C41230] hover:bg-[#960E23] text-white px-7 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                Call {RESTAURANT_INFO.phone}
              </a>
              <a
                href="#chatbot"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold py-4 transition-colors"
              >
                Or chat on the website <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Live badge */}
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              AI assistant is live and accepting orders now
            </div>
          </div>

          {/* Right: Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STEPS.map(({ icon: Icon, step, title, description, color }) => (
              <div
                key={step}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-gray-300 tracking-widest">
                    STEP {step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Merch ── */}
    <MerchSection />
    </>
  );
}
