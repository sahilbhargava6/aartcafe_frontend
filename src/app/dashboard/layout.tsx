"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    <div className="dashboard-wrapper">
      {/* Mobile Top Header Bar */}
      <div className="mobile-header">
        <Link href="/" className="font-serif mobile-brand">
          Aartcafe
        </Link>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="mobile-nav-toggle"
          aria-label="Toggle Dashboard Menu"
        >
          {mobileNavOpen ? <X size={26} color="#3F3B38" /> : <Menu size={26} color="#3F3B38" />}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          LEFT SIDEBAR NAVIGATION (Desktop & Mobile Drawer)
          ═══════════════════════════════════════════════════════ */}
      <aside className={`dashboard-sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <Link href="/" className="font-serif brand-link">
          Aartcafe
        </Link>

        {/* Navigation Options List */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className="font-sans nav-item"
                onClick={() => setMobileNavOpen(false)}
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#3F3B38",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.6)" : "transparent",
                  transition: "background-color 0.2s ease",
                  display: "block",
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
      <main className="dashboard-main">
        {children}
      </main>

      {/* Global CSS for Mobile Responsiveness */}
      <style jsx global>{`
        .dashboard-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: #fff;
          padding: 30px;
        }

        .mobile-header {
          display: none;
        }

        .dashboard-sidebar {
          width: 260px;
          background-color: #F3DDD3;
          border-radius: 20px;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          flex-shrink: 0;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.02);
        }

        .brand-link {
          font-size: 26px;
          color: #3F3B38;
          text-align: center;
          text-decoration: none;
          display: block;
          margin-bottom: 5px;
        }

        .dashboard-main {
          flex: 1;
          padding-left: 30px;
          overflow-x: auto;
          width: 100%;
        }

        @media (max-width: 992px) {
          .dashboard-wrapper {
            flex-direction: column;
            padding: 16px;
          }

          .mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #F3DDD3;
            padding: 14px 20px;
            border-radius: 12px;
            margin-bottom: 16px;
          }

          .mobile-brand {
            font-size: 22px;
            color: #3F3B38;
            text-decoration: none;
            font-weight: 500;
          }

          .mobile-nav-toggle {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dashboard-sidebar {
            display: none;
            width: 100%;
            margin-bottom: 20px;
          }

          .dashboard-sidebar.mobile-open {
            display: flex;
          }

          .brand-link {
            display: none;
          }

          .dashboard-main {
            padding-left: 0;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
