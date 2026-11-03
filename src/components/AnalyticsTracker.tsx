"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { metaTrack } from "@/lib/metaPixel";

// Records a page view on every storefront navigation, and a "ping" when the visitor
// leaves or hides the tab so session duration includes time on the last page.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // The ref also stops React StrictMode's double effect run from counting twice
    if (!pathname || lastTracked.current === pathname) return;
    // The Meta Pixel counts the first page itself when it loads; pages opened after that (the site
    // moves between pages without reloading) are reported here
    if (lastTracked.current !== null) metaTrack("PageView");
    lastTracked.current = pathname;
    trackEvent("view", pathname);
  }, [pathname]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") trackEvent("ping", window.location.pathname);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  return null;
}
