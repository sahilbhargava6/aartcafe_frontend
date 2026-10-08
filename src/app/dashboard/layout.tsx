"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      const loginTime = localStorage.getItem("admin_login_time");
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      if (!token) {
        window.location.href = "/signin";
        return;
      }

      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > SEVEN_DAYS_MS) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          localStorage.removeItem("admin_login_time");
          window.location.href = "/signin?expired=1";
          return;
        }
      } else {
        localStorage.setItem("admin_login_time", Date.now().toString());
      }

      setIsAuthenticated(true);
    }
  }, []);

  const handleSignOut = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (token) {
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {});
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_login_time");
    window.location.href = "/signin";
  };

  const menuItems = [
    { name: "Website Analytics", path: "/dashboard" },
    { name: "Product Analytics", path: "/dashboard/product-analytics" },
    { name: "Orders", path: "/dashboard/orders" },
    { name: "Categories", path: "/dashboard/categories" },
    { name: "Products", path: "/dashboard/products" },
    { name: "Banners", path: "/dashboard/banners" },
    { name: "Pages", path: "/dashboard/pages" },
    { name: "Reviews", path: "/dashboard/reviews" },
    { name: "New Discoveries", path: "/dashboard/new-discovers" },
    { name: "Wedding Specials", path: "/dashboard/wedding-specials" },
    { name: "Hero Banner", path: "/dashboard/hero-featured" },
    { name: "Bestsellers", path: "/dashboard/best-sellers" },
    { name: "Special Offers", path: "/dashboard/special-offers" },
    { name: "Festive Specials", path: "/dashboard/festive-specials" },
  ];

  const currentItem = menuItems.find((item) => item.path === pathname) || menuItems[3];

  if (isAuthenticated === null) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF7F5", color: "#D9A85C", fontSize: "16px", fontWeight: 600 }}>
        Verifying Security Session...
      </div>
    );
  }

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
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
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

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "rgba(224, 90, 71, 0.1)",
            color: "#E05A47",
            border: "1px solid rgba(224, 90, 71, 0.3)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E05A47";
            e.currentTarget.style.color = "#FFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(224, 90, 71, 0.1)";
            e.currentTarget.style.color = "#E05A47";
          }}
        >
          <span>Sign Out</span>
          <LogOut size={16} />
        </button>
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

        /* ════════════════════════════════════════════════════════════════════
           DASHBOARD MOBILE RESPONSIVE OVERRIDES
           Covers tables, modals, grids, analytics charts, buttons, typography
           for all dashboard sub-pages on phones (≤768px) and compact (≤480px)
           ════════════════════════════════════════════════════════════════════ */

        /* --- Dashboard Page Titles --- */
        @media (max-width: 768px) {
          .dashboard-main h1 {
            font-size: 22px !important;
            letter-spacing: 0.5px !important;
          }
        }

        /* --- Dashboard Tables: Compact cells, allow text wrapping --- */
        @media (max-width: 992px) {
          .dashboard-main table th,
          .dashboard-main table td {
            padding: 10px 12px !important;
            font-size: 13px !important;
          }
          .dashboard-main table th:first-child,
          .dashboard-main table td:first-child {
            padding-left: 14px !important;
          }
          .dashboard-main table th:last-child,
          .dashboard-main table td:last-child {
            padding-right: 14px !important;
          }
          /* Compact thumbnails */
          .dashboard-main table img {
            width: 40px !important;
            height: 40px !important;
          }
        }

        @media (max-width: 600px) {
          .dashboard-main table th,
          .dashboard-main table td {
            padding: 8px 8px !important;
            font-size: 12px !important;
          }
          .dashboard-main table th:first-child,
          .dashboard-main table td:first-child {
            padding-left: 10px !important;
          }
          /* Smaller thumbnails on phones */
          .dashboard-main table img {
            width: 34px !important;
            height: 34px !important;
            border-radius: 6px !important;
          }
          /* Hide non-essential columns on phones */
          .dashboard-main table th.hide-mobile,
          .dashboard-main table td.hide-mobile {
            display: none !important;
          }
        }

        /* --- Dashboard Grids: Stack on Mobile --- */
        @media (max-width: 768px) {
          .dashboard-main > div > div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }

        /* --- Dashboard Header Rows (title + button): stack vertically --- */
        @media (max-width: 600px) {
          .dashboard-main > div > div[style*="justifyContent"][style*="space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }

        /* --- Dashboard Buttons: Full width on small screens --- */
        @media (max-width: 480px) {
          .dashboard-main button[style*="borderRadius: \"10px\""] {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px 16px !important;
          }
        }

        /* --- Stat Cards (Pink box, analytics): Compact padding --- */
        @media (max-width: 768px) {
          .dashboard-main > div > div > div[style*="backgroundColor: \"#D98A9C\""] {
            padding: 24px 20px !important;
            gap: 24px !important;
          }
          .dashboard-main > div > div > div[style*="backgroundColor: \"#D98A9C\""] h3 {
            font-size: 16px !important;
          }
          .dashboard-main > div > div > div[style*="backgroundColor: \"#D98A9C\""] span {
            font-size: 32px !important;
          }
        }

        /* --- Chart area: Prevent overflow --- */
        @media (max-width: 768px) {
          .dashboard-main svg {
            max-width: 100%;
            height: auto;
          }
        }

        /* --- Metric pills and Date range tabs: scrollable horizontal --- */
        @media (max-width: 768px) {
          .dashboard-main div[style*="gap: \"10px\""] {
            flex-wrap: wrap !important;
          }
          .dashboard-main div[style*="gap: \"16px\""] {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </div>
  );
}
