"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Website Analytics", path: "/dashboard" },
    { name: "Product Analytics", path: "/dashboard/product-analytics" },
    { name: "Categories", path: "/dashboard/categories" },
    { name: "Products", path: "/dashboard/products" },
    { name: "Banners", path: "/dashboard/banners" },
    { name: "Pages", path: "/dashboard/pages" },
    { name: "Reviews", path: "/dashboard/reviews" },
    { name: "New Discovers", path: "/dashboard/new-discovers" },
    { name: "Wedding Specials", path: "/dashboard/wedding-specials" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff", padding: "40px" }}>
      {/* ═══════════════════════════════════════════════════════
          LEFT SIDEBAR NAVIGATION
          ═══════════════════════════════════════════════════════ */}
      <aside
        style={{
          width: "280px",
          backgroundColor: "#F3DDD3", // Soft peach/pink background
          borderRadius: "20px",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "36px",
          flexShrink: 0,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
        }}
      >
        {/* Brand Header */}
        <Link
          href="/"
          className="font-serif"
          style={{
            fontSize: "26px",
            color: "#3F3B38",
            textAlign: "center",
            textDecoration: "none",
            display: "block",
            marginBottom: "10px",
          }}
        >
          Aartcafe
        </Link>

        {/* Navigation Options List */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className="font-sans"
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#3F3B38",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.45)" : "transparent",
                  transition: "background-color 0.2s ease",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT PANEL
          ═══════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, paddingLeft: "40px", overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
