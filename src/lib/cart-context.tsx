"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Menu item id — used as the cart key (extend to cartId when customizations UI is added) */
  id: string;
  name: string;
  /** Unit price in dollars */
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  customizations?: Record<string, string>;
  specialInstructions?: string;
}

export type OrderType = "pickup" | "delivery";

export type CheckoutStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

export interface OrderResult {
  orderId: string;
  paymentUrl: string;
  paymentProvider: string;
  subtotal: number;
  tax: number;
  total: number;
}

interface CartContextValue {
  // ── State ──
  items: CartItem[];
  orderType: OrderType;
  customerPhone: string;
  specialNote: string;
  isOpen: boolean;
  checkoutStatus: CheckoutStatus;
  lastOrder: OrderResult | null;
  checkoutError: string | null;

  // ── Derived ──
  count: number;
  subtotal: number;
  tax: number;
  total: number;

  // ── Actions ──
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setCustomerPhone: (phone: string) => void;
  setSpecialNote: (note: string) => void;
  openCart: () => void;
  closeCart: () => void;
  placeOrder: () => Promise<void>;
  resetCheckout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAX_RATE = 0.08; // 8% Pennsylvania prepared-food sales tax
const STORAGE_KEY = "bobs_cart_v1";

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [lastOrder, setLastOrder] = useState<OrderResult | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ── Rehydrate from localStorage ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.orderType) setOrderType(parsed.orderType);
        if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // ── Persist to localStorage whenever cart changes ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, orderType, customerPhone })
      );
    } catch {
      // ignore quota errors
    }
  }, [items, orderType, customerPhone, hydrated]);

  // ── Item actions ──

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...item, quantity: item.quantity ?? 1 }];
      });
      setIsOpen(true); // auto-open drawer on add
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return [i];
        const qty = i.quantity + delta;
        return qty <= 0 ? [] : [{ ...i, quantity: qty }];
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomerPhone("");
    setSpecialNote("");
  }, []);

  const resetCheckout = useCallback(() => {
    setCheckoutStatus("idle");
    setLastOrder(null);
    setCheckoutError(null);
  }, []);

  // ── Derived totals ──
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // ── Place order ──
  const placeOrder = useCallback(async () => {
    if (items.length === 0) return;
    setCheckoutStatus("submitting");
    setCheckoutError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            size: i.size,
            customizations: i.customizations,
            specialInstructions: i.specialInstructions,
          })),
          orderType,
          customerPhone,
          specialNote,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      setLastOrder({
        orderId: data.orderId,
        paymentUrl: data.paymentUrl,
        paymentProvider: data.paymentProvider,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
      });
      setCheckoutStatus("success");
      clearCart();
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong. Please call us."
      );
      setCheckoutStatus("error");
    }
  }, [items, orderType, customerPhone, specialNote, clearCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        customerPhone,
        specialNote,
        isOpen,
        checkoutStatus,
        lastOrder,
        checkoutError,
        count,
        subtotal,
        tax,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setOrderType,
        setCustomerPhone,
        setSpecialNote,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        placeOrder,
        resetCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
