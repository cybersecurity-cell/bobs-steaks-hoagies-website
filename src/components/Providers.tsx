"use client";

/**
 * Providers — client-side wrapper for all React context providers.
 *
 * layout.tsx is a Server Component and cannot use React context directly,
 * so all context providers live here and are imported into the layout.
 */

import { type ReactNode } from "react";
import { CartProvider } from "@/lib/cart-context";
import CartDrawer, { CartFab } from "@/components/CartDrawer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      {/* Global cart drawer — accessible from every page */}
      <CartDrawer />
      {/* Floating cart button — visible whenever cart has items */}
      <CartFab />
    </CartProvider>
  );
}
