/**
 * WhatsApp Deep Linking Utility
 * 
 * Fixes the issue where users inside in-app browsers (especially Instagram, Facebook)
 * get trapped on api.whatsapp.com web download page instead of directly opening
 * their installed WhatsApp application on Android and iOS.
 */

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|ByteDance|TikTok|Line|Twitter/i.test(ua);
}

export interface WhatsAppUrls {
  web: string;
  intent: string;
  intentGeneric: string;
  native: string;
  direct: string;
}

export function getWhatsAppUrls(phone: string, message: string = ""): WhatsAppUrls {
  const cleanPhone = normalizePhone(phone);
  const encoded = encodeURIComponent(message);

  // Standard HTTPS link (triggers api.whatsapp.com or wa.me)
  const webUrl = `https://wa.me/${cleanPhone}${encoded ? `?text=${encoded}` : ""}`;

  // Android Intent with com.whatsapp package targeting:
  // Forces Android OS package manager to launch WhatsApp directly from WebViews (e.g. Instagram).
  // Falls back to wa.me if WhatsApp is not installed.
  const intentUrl = `intent://send?phone=${cleanPhone}${
    encoded ? `&text=${encoded}` : ""
  }#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(webUrl)};end;`;

  // Generic Android Intent (works for both WhatsApp and WhatsApp Business)
  const intentGeneric = `intent://send?phone=${cleanPhone}${
    encoded ? `&text=${encoded}` : ""
  }#Intent;scheme=whatsapp;S.browser_fallback_url=${encodeURIComponent(webUrl)};end;`;

  // Native custom scheme (best for iOS Safari and iOS Instagram)
  const nativeUrl = `whatsapp://send?phone=${cleanPhone}${encoded ? `&text=${encoded}` : ""}`;

  let directUrl = webUrl;
  if (typeof window !== "undefined") {
    if (isAndroid()) {
      directUrl = intentUrl;
    } else if (isIOS()) {
      directUrl = nativeUrl;
    }
  }

  return {
    web: webUrl,
    intent: intentUrl,
    intentGeneric,
    native: nativeUrl,
    direct: directUrl,
  };
}

/**
 * Returns the most appropriate WhatsApp URL for the current client device
 */
export function getDirectWhatsAppUrl(phone: string, message: string = ""): string {
  return getWhatsAppUrls(phone, message).direct;
}

/**
 * Safely launches WhatsApp on any device with fallback handling
 */
export function openWhatsApp(phone: string, message: string = ""): void {
  if (typeof window === "undefined") return;

  const urls = getWhatsAppUrls(phone, message);

  if (isAndroid()) {
    // On Android (including Instagram/Facebook WebViews), Intent URI breaks out of WebView directly into app
    window.location.href = urls.intent;
    return;
  }

  if (isIOS()) {
    // On iOS, native scheme triggers the OS "Open in WhatsApp" prompt
    const start = Date.now();
    window.location.href = urls.native;

    setTimeout(() => {
      // If user is still on this webpage after 1.5s, fallback to web
      if (Date.now() - start < 2000) {
        window.location.href = urls.web;
      }
    }, 1200);
    return;
  }

  // Desktop or unknown browser
  window.location.href = urls.web;
}
