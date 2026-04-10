/**
 * POS Provider factory
 *
 * Reads POS_PROVIDER env var and returns the matching implementation.
 * Default: "stub" — safe for production Phase 1.
 *
 * To switch to Toast:
 *   POS_PROVIDER=toast
 *   TOAST_CLIENT_ID=...
 *   TOAST_CLIENT_SECRET=...
 *   TOAST_RESTAURANT_GUID=...
 *   TOAST_API_BASE=https://ws-api.toasttab.com
 */

import type { POSProvider } from "./types";

let _instance: POSProvider | null = null;

export function getPOSProvider(): POSProvider {
  if (_instance) return _instance;

  const provider = (process.env.POS_PROVIDER ?? "stub").toLowerCase();

  switch (provider) {
    case "clover": {
      const { CloverPOSProvider } = require("./providers/clover") as {
        CloverPOSProvider: new () => POSProvider;
      };
      _instance = new CloverPOSProvider();
      break;
    }

    case "toast": {
      // Lazy import so Toast code is tree-shaken when not in use
      const { ToastPOSProvider } = require("./providers/toast") as {
        ToastPOSProvider: new () => POSProvider;
      };
      _instance = new ToastPOSProvider();
      break;
    }

    case "stub":
    default: {
      const { StubPOSProvider } = require("./providers/stub") as {
        StubPOSProvider: new () => POSProvider;
      };
      _instance = new StubPOSProvider();
      break;
    }
  }

  console.log(`[POS] Provider: ${_instance.name}`);
  return _instance;
}

export type { POSProvider, POSOrderPayload, POSSubmitResult, POSOrderItem } from "./types";
