"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";

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

  const currentItem = menuItems.find((item) => item.path === pathname) || menuItems[3];

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Sticky Top Navigation Bar */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="mobile-nav-toggle"
            aria-label="Toggle Dashboard Menu"
          >
            {mobileNavOpen ? <X size={24} color="#3F3B38" /> : <Menu size={24} color="#3F3B38" />}
          </button>
          <Link href="/" className="font-serif mobile-brand">
            Aartcafe
          </Link>
        </div>
        <span className="font-sans mobile-page-title">
          {currentItem.name}
        </span>
      </div>

      {/* Backdrop for Mobile Menu Drawer */}
      {mobileNavOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          LEFT SIDEBAR NAVIGATION (Desktop & Mobile Drawer)
          ═══════════════════════════════════════════════════════ */}
      <aside className={`dashboard-sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" className="font-serif brand-link">
            Aartcafe
          </Link>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="mobile-close-btn"
          >
            <X size={22} color="#3F3B38" />
          </button>
        </div>

        {/* Navigation Options List */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className="font-sans nav-item"
                onClick={() => setMobileNavOpen(false)}
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#3F3B38",
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "#FFF" : "transparent",
                  boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{item.name}</span>
                {isActive && <ChevronRight size={16} color="#D98A9C" />}
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
          background-color: #FAF7F5;
          padding: 24px;
          gap: 24px;
        }

        .mobile-header {
          display: none;
        }

        .mobile-backdrop {
          display: none;
        }

        .mobile-close-btn {
          display: none;
        }

        .dashboard-sidebar {
          width: 250px;
          background-color: #F3DDD3;
          border-radius: 16px;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex-shrink: 0;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.03);
        }

        .brand-link {
          font-size: 24px;
          color: #3F3B38;
          text-decoration: none;
          display: block;
          margin-bottom: 4px;
        }

        .dashboard-main {
          flex: 1;
          overflow-x: auto;
          width: 100%;
          min-width: 0;
        }

        @media (max-width: 992px) {
          .dashboard-wrapper {
            flex-direction: column;
            padding: 12px;
            gap: 12px;
          }

          .mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #F3DDD3;
            padding: 12px 16px;
            border-radius: 12px;
            position: sticky;
            top: 10px;
            z-index: 90;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }

          .mobile-brand {
            font-size: 20px;
            color: #3F3B38;
            text-decoration: none;
            font-weight: 500;
          }

          .mobile-page-title {
            font-size: 13px;
            font-weight: 600;
            color: #D98A9C;
            background-color: #FFF;
            padding: 4px 10px;
            border-radius: 12px;
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

          .mobile-backdrop {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.4);
            backdrop-filter: blur(2px);
            z-index: 998;
          }

          .dashboard-sidebar {
            position: fixed;
            top: 0;
            left: -280px;
            height: 100vh;
            width: 260px;
            z-index: 999;
            border-radius: 0 16px 16px 0;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
          }

          .dashboard-sidebar.mobile-open {
            left: 0;
          }

          .mobile-close-btn {
            display: flex;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
          }

          .dashboard-main {
            padding-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
