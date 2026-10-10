"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

// Records a page view on every storefront navigation, and a "ping" when the visitor
// leaves or hides the tab so session duration includes time on the last page.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // The ref also stops React StrictMode's double effect run from counting twice
    if (!pathname || lastTracked.current === pathname) return;
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
