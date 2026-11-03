// Meta (Facebook) Pixel events for Meta ads. The pixel itself is loaded in app/layout.tsx; this
// sends the standard events Meta uses to measure and optimise ads. Does nothing until the pixel
// script is there (or if an ad blocker removed it).

type MetaEvent = "PageView" | "ViewContent" | "AddToCart" | "Purchase" | "Contact";

declare global {
  interface Window {
    fbq?: (command: "track", event: MetaEvent, params?: Record<string, unknown>) => void;
  }
}

export function metaTrack(event: MetaEvent, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      if (params) window.fbq("track", event, params);
      else window.fbq("track", event);
    }
  } catch {
    // never let tracking break the shop
  }
}

/** Product details in the shape Meta expects, prices in rupees. */
export const metaProduct = (productId: number | string, value: number, name?: string) => ({
  content_ids: [String(productId)],
  content_type: "product",
  ...(name ? { content_name: name } : {}),
  value: Math.round(value * 100) / 100,
  currency: "INR",
});
