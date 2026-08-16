"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Determine gradient color based on the current active page
  const isGoldPage =
    pathname?.startsWith("/shop") || pathname === "/special-offers";
  
  const gradientColor = isGoldPage
    ? "rgba(217, 168, 92, 0.5)"  // Gold
    : "rgba(217, 138, 156, 0.5)"; // Pink

  return (
    <footer
      style={{
        backgroundColor: "#FCFAF7",
        borderTop: "1px solid #EBE5DB",
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Absolute background gradient stretching perfectly inside the footer boundary with no overflow */}
      <div
        style={{
          width: "100%",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          background: `linear-gradient(180deg, rgba(255, 255, 255, 0.5) 25%, ${gradientColor} 99.52%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Footer Content */}
      <div
        className="container"
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
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
          <span style={{ fontSize: "0.85rem", color: "#C88E56", fontWeight: 500 }}>
            Made by Hands. Meant for the Heart.
          </span>
        </div>

        {/* Links Column - Shop */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
            Shop Collections
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#6E6E6E" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
            Company
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#6E6E6E" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2A2A2A" }}>
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
            style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
          >
            <input
              type="email"
              placeholder="Your email address"
              required
              style={{
                flex: 1,
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
              className="btn-primary"
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
        style={{
          borderTop: "1px solid #EBE5DB",
          padding: "1.5rem 0",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#9E9E9E",
          position: "relative",
          zIndex: 2,
          backgroundColor: "#FCFAF7", // Solid background to cover the gradient behind
        }}
      >
        <p>&copy; {new Date().getFullYear()} Aartcafe. All rights reserved.</p>
      </div>
    </footer>
  );
}
