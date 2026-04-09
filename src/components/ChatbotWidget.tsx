                    "use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Phone, Mic, MicOff, Bot, ShoppingCart, CheckCircle2 } from "lucide-react";
import { RESTAURANT_INFO } from "@/lib/menu-data";
import { useCart } from "@/lib/cart-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** Items the AI added to the cart with this message */
  addedItems?: CartItemPayload[];
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hey! 👋 I'm Bob's AI — your guide to the best cheesesteaks in Philly! Ask me about the menu, hours, or directions. You can even tell me what you want and I'll add it to your cart! 🛒`,
  timestamp: new Date(),
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { addItem, openCart } = useCart();

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Unread badge ──
  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") setUnread((n) => n + 1);
    }
  }, [messages, open]);

  const clearUnread = () => setUnread(0);

  // ── Send message ──
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();
        const cartItems: CartItemPayload[] | null = data.cartItems ?? null;

        // ── Add items to the global cart if the AI detected an order ──
        if (cartItems && cartItems.length > 0) {
          for (const ci of cartItems) {
            addItem({
              id: ci.id,
              name: ci.name,
              price: ci.price,
              quantity: ci.quantity,
            });
          }
        }

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            data.reply ||
            `Sorry, I had trouble with that. Please call us at ${RESTAURANT_INFO.phone}`,
          timestamp: new Date(),
          addedItems: cartItems ?? undefined,
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Sorry, something went wrong. Please call us directly at ${RESTAURANT_INFO.phone} — we're always happy to help!`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, addItem]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Voice input (browser Speech Recognition) ──
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognitionAPI =
      (window as typeof window & { webkitSpeechRecognition: typeof SpeechRecognition })
        .webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => { setOpen(true); clearUnread(); }}
        className={`fixed bottom-6 right-6 z-50 bg-[#C41230] hover:bg-[#960E23] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 ${open ? "hidden" : "flex"}`}
        aria-label="Open chat"
        style={{ width: 60, height: 60 }}
      >
        <MessageCircle className="w-7 h-7" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div
          id="chatbot"
          className="chat-window fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl flex flex-col overflow-hidden fade-in"
          style={{ height: 540 }}
        >
          {/* Header */}
          <div className="bg-[#C41230] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">Bob&apos;s AI</p>
                <p className="text-white/70 text-xs">Ask me — or just tell me what you want!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Open cart button */}
              <button
                onClick={openCart}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                title="View cart"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                title="Call the restaurant"
                aria-label="Call restaurant"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setOpen(false)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-[#C41230] rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="max-w-[78%] space-y-2">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C41230] text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Cart confirmation chip */}
                  {msg.addedItems && msg.addedItems.length > 0 && (
                    <button
                      onClick={openCart}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors w-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Added {msg.addedItems.map((i) => i.name).join(", ")} — tap to view cart
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-[#C41230] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full dot-1" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full dot-2" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full dot-3" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-gray-100">
            {[
              { label: "🥩 Order Steak",    msg: "I'll have a cheese steak" },
              { label: "🍗 Chicken",         msg: "I want a chicken cheese steak" },
              { label: "🍟 Add Fries",       msg: "Add cheese fries to my order" },
              { label: "🍔 Burger",          msg: "I want a cheeseburger" },
              { label: "🕐 Hours",           msg: "What are your hours?" },
              { label: "📍 Location",        msg: "Where are you located?" },
              { label: "🌱 Vegan",           msg: "Do you have vegan options?" },
              { label: "📞 Call",            msg: "__call__" },
            ].map((q) => (
              <button
                key={q.label}
                onClick={() =>
                  q.msg === "__call__"
                    ? window.open(`tel:${RESTAURANT_INFO.phone}`)
                    : sendMessage(q.msg)
                }
                className="whitespace-nowrap text-xs bg-gray-100 hover:bg-[#C41230] hover:text-white text-gray-700 px-3 py-1.5 rounded-full transition-colors font-medium flex-shrink-0"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask me or say your order…"}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#C41230]/40"
              disabled={loading}
              maxLength={500}
            />
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              className={`p-2.5 rounded-full transition-colors ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title="Voice input"
              aria-label="Voice input"
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#C41230] hover:bg-[#960E23] disabled:opacity-40 text-white p-2.5 rounded-full transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
