// First-party storefront analytics: anonymous visitor/session ids in localStorage,
// events posted to the backend's /api/track endpoint.

const TRACK_URL = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/track";
const VISITOR_KEY = "aartcafe-visitor";
const SESSION_KEY = "aartcafe-session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // a new session starts after 30 minutes of inactivity

type TrackEvent = "view" | "add_to_bag" | "ping";

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

function getIds(): { visitorId: string; sessionId: string; isNewSession: boolean } | null {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = randomId();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }

    const now = Date.now();
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as { id: string; last: number } | null;
    const isNewSession = !saved || now - saved.last > SESSION_TIMEOUT_MS;
    const sessionId = isNewSession ? randomId() : saved.id;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: sessionId, last: now }));

    return { visitorId, sessionId, isNewSession };
  } catch {
    // Storage blocked (private mode etc.): skip tracking rather than break the page
    return null;
  }
}

export function trackEvent(event: TrackEvent, path: string, productId?: number) {
  // `next dev` would otherwise send local test visits to the production API
  if (process.env.NODE_ENV !== "production") return;
  if (typeof window === "undefined" || path.startsWith("/dashboard")) return;
  const ids = getIds();
  if (!ids) return;

  // Only an external referrer on the first page of a session counts as a traffic source
  let referrer: string | undefined;
  if (event === "view" && ids.isNewSession && document.referrer) {
    try {
      if (new URL(document.referrer).host !== window.location.host) referrer = document.referrer;
    } catch {}
  }

  fetch(TRACK_URL, {
    method: "POST",
    keepalive: true, // lets the "ping" sent while leaving the page complete
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      visitor_id: ids.visitorId,
      session_id: ids.sessionId,
      event,
      path,
      product_id: productId,
      referrer,
    }),
  }).catch(() => {});
}
