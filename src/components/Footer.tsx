"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

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
          <Link
            href="/"
            className="font-serif"
            style={{ fontSize: "1.8rem", fontWeight: 500, color: "#2A2A2A" }}
          >
            Aartcafe
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
            <li>
              <Link href="/shop" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                Personalized Frames
              </Link>
            </li>
            <li>
              <Link href="/shop" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                Handmade Rakhis
              </Link>
            </li>
            <li>
              <Link href="/shop" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                Gift Hampers
              </Link>
            </li>
            <li>
              <Link href="/shop" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                Home &amp; Living Decor
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column - Company */}
        <div className="footer-col" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif footer-heading" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
            Company
          </h3>
          <ul className="footer-links" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#6E6E6E" }}>
            <li>
              <Link href="/" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                About Our Craft
              </Link>
            </li>
            <li>
              <Link href="/" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                Shipping &amp; Returns
              </Link>
            </li>
            <li>
              <Link href="/" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#C88E56")} onMouseLeave={(e) => (e.currentTarget.style.color = "#6E6E6E")}>
                Contact Us
              </Link>
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
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing!");
            }}
            className="footer-form"
            style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
          >
            <input
              className="footer-input"
              type="email"
              placeholder="Your email address"
              required
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
              style={{
                padding: "0.6rem 1.2rem",
                fontSize: "0.85rem",
                boxShadow: "none",
              }}
            >
              Join
            </button>
          </form>
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
