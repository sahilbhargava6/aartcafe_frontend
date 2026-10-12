"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919267943830";

// "Shop Collections" links: the categories chosen in Dashboard → Footer Collections, or else the
// main categories with the most products. These are shown until the live list loads (and kept
// for the rest of the visit).
let collectionsCache: string[] = ["Varmala Preservation", "Bouquet Preservation", "Resin Nameplates", "Lamps"];
let collectionsLoaded = false;

type FooterCategory = { name: string; parent_id: number | null; products_count: number; footer_order?: number | null };

const linkHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#C88E56"),
  onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#6E6E6E"),
};

export default function Footer() {
  const pathname = usePathname();
  const [collections, setCollections] = useState<string[]>(collectionsCache);
  const [email, setEmail] = useState("");
  const [signup, setSignup] = useState<{ state: "idle" | "sending" | "done" | "error"; message: string }>({ state: "idle", message: "" });

  useEffect(() => {
    if (collectionsLoaded) return;
    fetch(`${API}/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((categories: FooterCategory[]) => {
        if (!Array.isArray(categories)) return;
        const chosen = categories
          .filter((c) => c.footer_order)
          .sort((a, b) => Number(a.footer_order) - Number(b.footer_order));
        const top = (chosen.length > 0
          ? chosen
          : categories
              .filter((c) => !c.parent_id && c.products_count > 0 && c.name.trim().toLowerCase() !== "all")
              .sort((a, b) => b.products_count - a.products_count)
        )
          .slice(0, 4)
          .map((c) => c.name);
        if (top.length === 0) return;
        collectionsCache = top;
        collectionsLoaded = true;
        setCollections(top);
      })
      .catch(() => {});
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signup.state === "sending") return;
    setSignup({ state: "sending", message: "" });
    try {
      const res = await fetch(`${API}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = data?.errors?.email?.[0] || (res.status === 429 ? "Too many tries. Please wait a minute." : "We couldn't sign you up. Please try again.");
        setSignup({ state: "error", message });
        return;
      }
      setEmail("");
      setSignup({ state: "done", message: data?.message === "Already subscribed" ? "You're already on our list. Thank you!" : "Thank you for subscribing!" });
    } catch {
      setSignup({ state: "error", message: "We couldn't reach our server. Please check your connection." });
    }
  };

  // Determine gradient color based on the current active page
  const isGoldPage =
    pathname?.startsWith("/shop") || pathname === "/special-offers";
  
  const footerGradient = isGoldPage
    ? "linear-gradient(180deg, #FFFFFF 0%, #FBF3E6 35%, #F3DDB8 75%, #EBCB98 100%)" // Gold
    : "linear-gradient(180deg, #FFFFFF 0%, #FBEFF1 35%, #F3D3DB 75%, #ECC0CB 100%)"; // Pink

  return (
    <footer
      style={{
        // One continuous gradient from the page above down through the copyright bar
        background: footerGradient,
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >

      {/* Footer Content */}
      <div
        className="container footer-grid"
        style={{
          paddingTop: "4rem",
          paddingBottom: "5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "3rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand Column */}
        <div className="footer-col footer-col--wide" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <Link href="/" style={{ alignSelf: "flex-start" }}>
            <img src="/images/logo.webp" alt="Aartcafe" width={279} height={240} style={{ display: "block", height: "96px", width: "auto" }} />
          </Link>
          <p style={{ color: "#6E6E6E", fontSize: "0.9rem", lineHeight: "1.6" }}>
            Personalized handmade frames and keepsakes that tell your story. Handcrafted with love, meant for the heart.
          </p>
          <span className="footer-tagline" style={{ fontSize: "0.85rem", color: "#C88E56", fontWeight: 500 }}>
            Made by Hands. Meant for the Heart.
          </span>
        </div>

        {/* Links Column - Shop */}
        <div className="footer-col" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif footer-heading" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
            Shop Collections
          </h3>
          <ul className="footer-links" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#6E6E6E" }}>
            {collections.map((name) => (
              <li key={name}>
                <Link
                  href={`/shop?category=${encodeURIComponent(name)}`}
                  style={{ transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column - Company */}
        <div className="footer-col" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif footer-heading" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
            Company
          </h3>
          <ul className="footer-links" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#6E6E6E" }}>
            <li>
              <Link href="/" style={{ transition: "color 0.2s" }} {...linkHover}>
                About Our Craft
              </Link>
            </li>
            <li>
              <Link href="/faqs" style={{ transition: "color 0.2s" }} {...linkHover}>
                FAQs
              </Link>
            </li>
            <li>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Aartcafe! I have a question.")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ transition: "color 0.2s" }}
                {...linkHover}
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="footer-col footer-col--wide" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif footer-heading" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
            Stay Connected
          </h3>
          <p style={{ color: "#6E6E6E", fontSize: "0.9rem", lineHeight: "1.6" }}>
            Subscribe to receive details on special offers, new launches, and festive specials.
          </p>
          <form
            onSubmit={subscribe}
            className="footer-form"
            style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
          >
            <input
              className="footer-input"
              type="email"
              placeholder="Your email address"
              aria-label="Your email address"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (signup.state !== "sending") setSignup({ state: "idle", message: "" });
              }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.6rem 1rem",
                borderRadius: "20px",
                border: "1px solid #EBE5DB",
                fontSize: "0.85rem",
                backgroundColor: "#fff",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-primary footer-join"
              disabled={signup.state === "sending"}
              style={{
                padding: "0.6rem 1.2rem",
                fontSize: "0.85rem",
                boxShadow: "none",
                opacity: signup.state === "sending" ? 0.7 : 1,
              }}
            >
              {signup.state === "sending" ? "Joining…" : "Join"}
            </button>
          </form>
          {signup.message && (
            <p role="status" style={{ margin: 0, fontSize: "0.85rem", color: signup.state === "error" ? "#C0392B" : "#4E8E76" }}>
              {signup.message}
            </p>
          )}
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div
        className="footer-bottom"
        style={{
          padding: "1.5rem 0",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#6E6E6E",
          position: "relative",
          zIndex: 2,
        }}
      >
        <p>&copy; {new Date().getFullYear()} Aartcafe. All rights reserved.</p>
      </div>

      <style jsx>{`
        /* Small laptops / iPad landscape: keep all four columns on one row */
        @media (max-width: 1199px) and (min-width: 993px) {
          .footer-grid {
            grid-template-columns: 1.3fr 1fr 1fr 1.3fr !important;
            gap: 2rem !important;
          }
        }

        /* Touch screens (incl. iPad Pro portrait): 16px input so iOS doesn't zoom, ~40px tap targets */
        @media (max-width: 1024px) {
          .footer-input {
            font-size: 16px !important;
            height: 44px;
          }
          .footer-join {
            height: 44px;
            flex-shrink: 0;
          }
          .footer-links {
            gap: 0 !important;
          }
          .footer-links :global(a) {
            display: inline-block;
            padding: 9px 0;
          }
          .footer-col {
            gap: 0.75rem !important;
          }
        }

        /* Tablets: 2 x 2 grid. The global .container rule wipes the vertical padding here, so restore it */
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 2.5rem 2rem !important;
            padding-top: 3.5rem !important;
            padding-bottom: 3rem !important;
          }
        }

        /* Undo the global h3 clamp (it inflates these to ~29px on tablets) */
        @media (max-width: 768px) {
          .footer-heading {
            font-size: 1.15rem !important;
            line-height: 1.4 !important;
          }
          /* Leave room under the copyright line for the floating WhatsApp button */
          .footer-bottom {
            padding-bottom: calc(1.5rem + 72px) !important;
          }
        }

        /* Phones: brand + newsletter full width, the two link lists side by side */
        @media (max-width: 600px) {
          .footer-grid {
            gap: 2rem 1.25rem !important;
            padding-top: 3rem !important;
            padding-bottom: 2rem !important;
          }
          .footer-col--wide {
            grid-column: 1 / -1;
          }
          .footer-tagline {
            font-size: 0.875rem !important;
          }
          .footer-bottom {
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
