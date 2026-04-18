"use client";

/**
 * Kitchen Display Page — /kitchen
 *
 * PIN-protected tablet UI for kitchen staff.
 * Reads from the `kitchen_queue` view (orders with status in ['paid','in_progress','ready']).
 *
 * Features:
 *   - 4-digit PIN lock (KITCHEN_PIN env var, default "1234")
 *   - Real-time updates via Supabase REST long-poll (60 s interval + manual refresh)
 *   - Audio + pulse animation when a new order arrives
 *   - One-tap status progression: paid → in_progress → ready → completed
 *   - Browser Notifications API for background tab alerts
 *   - Large text, colour-coded by status — designed for a kitchen tablet
 *
 * No Navbar or Footer — this is a standalone kiosk view.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, ChefHat, Bell, RefreshCw, LogOut, Lock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  itemId:    string;
  name:      string;
  quantity:  number;
  unitPrice: number;
  size?:     string | null;
  customizations?: Record<string, string> | null;
  specialInstructions?: string | null;
}

type OrderStatus = "paid" | "in_progress" | "ready" | "completed";

interface KitchenOrder {
  id:             string;
  status:         OrderStatus;
  order_type:     "pickup" | "delivery";
  customer_phone: string;
  items:          OrderItem[];
  special_note?:  string | null;
  created_at:     string;
  paid_at?:       string | null;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; border: string; text: string; next: OrderStatus | null; nextLabel: string }> = {
  paid: {
    label:     "New Order",
    bg:        "bg-yellow-50",
    border:    "border-yellow-400",
    text:      "text-yellow-800",
    next:      "in_progress",
    nextLabel: "Start Cooking",
  },
  in_progress: {
    label:     "In Progress",
    bg:        "bg-blue-50",
    border:    "border-blue-400",
    text:      "text-blue-800",
    next:      "ready",
    nextLabel: "Mark Ready",
  },
  ready: {
    label:     "Ready for Pickup",
    bg:        "bg-green-50",
    border:    "border-green-400",
    text:      "text-green-800",
    next:      "completed",
    nextLabel: "Complete",
  },
  completed: {
    label:     "Completed",
    bg:        "bg-gray-50",
    border:    "border-gray-300",
    text:      "text-gray-600",
    next:      null,
    nextLabel: "",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function elapsed(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff === 1) return "1 min ago";
  return `${diff} min ago`;
}

function phoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return phone;
}

// ─── Web Audio: short beep ────────────────────────────────────────────────────

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext not available — silent fail
  }
}

// ─── PIN screen ───────────────────────────────────────────────────────────────

function PINScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin]         = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const checkPin = async (attempt: string) => {
    setChecking(true);
    try {
      const res = await fetch("/api/kitchen/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pin: attempt }),
      });
      if (res.ok) {
        onUnlock();
      } else {
        const data = await res.json();
        setError(data.error ?? "Incorrect PIN");
        setTimeout(() => { setPin(""); setError(null); }, 800);
      }
    } catch {
      setError("Connection error. Try again.");
      setTimeout(() => { setPin(""); setError(null); }, 1000);
    } finally {
      setChecking(false);
    }
  };

  const handleDigit = (d: string) => {
    if (checking) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setError(null);
    if (next.length === 4) checkPin(next);
  };

  const handleClear = () => { setPin(""); setError(null); };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-xs text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <ChefHat className="w-10 h-10 text-[#C41230]" />
          <div>
            <p className="text-white font-black text-2xl leading-none">Kitchen Display</p>
            <p className="text-gray-400 text-sm">Bob&apos;s Steaks &amp; Hoagies</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <p className="text-gray-400 text-sm">
            {checking ? "Checking…" : "Enter PIN to continue"}
          </p>
        </div>

        {/* PIN dots */}
        <div className={`flex justify-center gap-4 mb-6 transition-all ${error ? "animate-bounce" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                i < pin.length
                  ? error ? "bg-red-500 border-red-500" : "bg-[#C41230] border-[#C41230]"
                  : "border-gray-600"
              }`}
            />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
            d === "" ? <div key={i} /> :
            <button
              key={i}
              onClick={() => d === "⌫" ? handleClear() : handleDigit(d)}
              disabled={checking}
              className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 disabled:opacity-40 text-white text-2xl font-bold py-4 rounded-2xl transition-colors select-none"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  isNew,
  onStatusChange,
  updating,
}: {
  order: KitchenOrder;
  isNew: boolean;
  onStatusChange: (id: string, status: OrderStatus) => void;
  updating: boolean;
}) {
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div
      className={`
        rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all duration-300
        ${cfg.bg} ${cfg.border}
        ${isNew ? "ring-4 ring-yellow-400 ring-offset-2 animate-pulse-once" : ""}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 ${cfg.text} mb-1`}>
            {cfg.label}
          </span>
          <p className="font-black text-gray-900 text-2xl leading-none">{order.id}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-gray-500 text-sm">{formatTime(order.paid_at ?? order.created_at)}</p>
          <p className="text-gray-400 text-xs">{elapsed(order.paid_at ?? order.created_at)}</p>
          <span className={`text-xs font-semibold mt-1 inline-block ${order.order_type === "delivery" ? "text-purple-600" : "text-gray-500"}`}>
            {order.order_type === "delivery" ? "🛵 Delivery" : "🏪 Pickup"}
          </span>
        </div>
      </div>

      {/* Customer phone */}
      <p className="text-gray-600 text-sm font-medium">{phoneDisplay(order.customer_phone)}</p>

      {/* Items */}
      <ul className="space-y-1.5">
        {(order.items as OrderItem[]).map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="bg-gray-900 text-white text-xs font-black px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">
              {item.quantity}×
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-gray-900 font-semibold text-base leading-snug">{item.name}</span>
              {item.size && (
                <span className="text-gray-500 text-sm ml-1">· {item.size}</span>
              )}
              {item.specialInstructions && (
                <p className="text-orange-700 text-xs mt-0.5 italic">&ldquo;{item.specialInstructions}&rdquo;</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Special note */}
      {order.special_note && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
          <p className="text-orange-800 text-sm font-semibold">📝 {order.special_note}</p>
        </div>
      )}

      {/* Action button */}
      {cfg.next && (
        <button
          onClick={() => onStatusChange(order.id, cfg.next!)}
          disabled={updating}
          className={`
            w-full py-3 rounded-xl font-black text-white text-base transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${order.status === "paid"        ? "bg-blue-500  hover:bg-blue-600"  : ""}
            ${order.status === "in_progress" ? "bg-green-500 hover:bg-green-600" : ""}
            ${order.status === "ready"       ? "bg-gray-700  hover:bg-gray-800"  : ""}
          `}
        >
          {updating ? "Updating…" : cfg.nextLabel}
        </button>
      )}
      {order.status === "completed" && (
        <p className="text-center text-gray-400 text-sm font-medium flex items-center justify-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> Done
        </p>
      )}
    </div>
  );
}

// ─── Main kitchen display ──────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PUBLISHABLE_KEY   = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const POLL_INTERVAL     = 30_000; // 30 s

export default function KitchenPage() {
  const [unlocked, setUnlocked]     = useState(false);
  const [orders, setOrders]         = useState<KitchenOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newIds, setNewIds]         = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const prevIdsRef                  = useRef<Set<string>>(new Set());
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch active queue ──────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      // Use anon key if available (public read on kitchen_queue view)
      // falls back to service role via server component if configured
      if (PUBLISHABLE_KEY) {
        headers["apikey"] = PUBLISHABLE_KEY;
        headers["Authorization"] = `Bearer ${PUBLISHABLE_KEY}`;
      }

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/kitchen_queue` +
        `?select=id,status,order_type,customer_phone,items,special_note,created_at,paid_at` +
        `&status=in.(paid,in_progress,ready)` +
        `&order=created_at.asc`,
        { headers }
      );

      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      const rows: KitchenOrder[] = await res.json();

      // Detect brand-new orders for notification
      const incoming = new Set(rows.map((r) => r.id));
      const brandNew = rows.filter((r) => !prevIdsRef.current.has(r.id));
      if (brandNew.length > 0 && prevIdsRef.current.size > 0) {
        playNotificationSound();
        const freshIds = new Set(brandNew.map((r) => r.id));
        setNewIds(freshIds);
        setTimeout(() => setNewIds(new Set()), 4000);

        // Browser notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`🔔 ${brandNew.length} new order${brandNew.length > 1 ? "s" : ""}!`, {
            body: brandNew.map((o) => o.id).join(", "),
            tag:  "kitchen-new-order",
          });
        }
      }
      prevIdsRef.current = incoming;
      setOrders(rows);
      setLastRefresh(new Date());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Poll on unlock ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!unlocked) return;
    fetchOrders();

    pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [unlocked, fetchOrders]);

  // ── Request browser notification permission ──────────────────────────────
  useEffect(() => {
    if (unlocked && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [unlocked]);

  // ── Update order status ─────────────────────────────────────────────────────
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Prefer:         "return=minimal",
      };
      if (PUBLISHABLE_KEY) {
        headers["apikey"] = PUBLISHABLE_KEY;
        headers["Authorization"] = `Bearer ${PUBLISHABLE_KEY}`;
      }

      const patch: Record<string, string> = { status: newStatus };
      if (newStatus === "completed") patch["completed_at"] = new Date().toISOString();

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`,
        { method: "PATCH", headers, body: JSON.stringify(patch) }
      );

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);

      // Optimistic update
      setOrders((prev) =>
        newStatus === "completed"
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      setError(`Failed to update ${orderId}: ${String(err)}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── PIN gate ──────────────────────────────────────────────────────────────
  if (!unlocked) {
    return <PINScreen onUnlock={() => setUnlocked(true)} />;
  }

  // ─── Kitchen board ─────────────────────────────────────────────────────────
  const paid       = orders.filter((o) => o.status === "paid");
  const inProgress = orders.filter((o) => o.status === "in_progress");
  const ready      = orders.filter((o) => o.status === "ready");

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* ── Top bar ── */}
      <div className="bg-black border-b border-white/10 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-7 h-7 text-[#C41230]" />
          <div>
            <p className="font-black text-lg leading-none">Kitchen Display</p>
            <p className="text-gray-400 text-xs">Bob&apos;s Steaks &amp; Hoagies</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <p className="text-gray-500 text-xs hidden sm:block">
              Updated {formatTime(lastRefresh.toISOString())}
            </p>
          )}
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setUnlocked(false)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Lock
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-5 py-2 text-red-300 text-sm">
          ⚠️ {error} — <button onClick={() => fetchOrders()} className="underline">Retry</button>
        </div>
      )}

      {/* ── Loading state ── */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C41230] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading orders…</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Bell className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-xl font-semibold">No active orders</p>
            <p className="text-gray-600 text-sm mt-1">New orders will appear automatically</p>
          </div>
        </div>
      ) : (
        /* ── Three-column Kanban board ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 min-h-[calc(100vh-56px)]">

          {/* New Orders */}
          <div className="border-r border-white/10 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <h2 className="font-black text-lg text-yellow-400">New Orders</h2>
              {paid.length > 0 && (
                <span className="ml-auto bg-yellow-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                  {paid.length}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {paid.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  isNew={newIds.has(o.id)}
                  onStatusChange={handleStatusChange}
                  updating={updatingId === o.id}
                />
              ))}
              {paid.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">No new orders</p>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div className="border-r border-white/10 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <h2 className="font-black text-lg text-blue-400">Cooking</h2>
              {inProgress.length > 0 && (
                <span className="ml-auto bg-blue-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                  {inProgress.length}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {inProgress.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  isNew={newIds.has(o.id)}
                  onStatusChange={handleStatusChange}
                  updating={updatingId === o.id}
                />
              ))}
              {inProgress.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">Nothing cooking</p>
              )}
            </div>
          </div>

          {/* Ready */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <h2 className="font-black text-lg text-green-400">Ready for Pickup</h2>
              {ready.length > 0 && (
                <span className="ml-auto bg-green-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                  {ready.length}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {ready.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  isNew={newIds.has(o.id)}
                  onStatusChange={handleStatusChange}
                  updating={updatingId === o.id}
                />
              ))}
              {ready.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">Nothing ready yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
