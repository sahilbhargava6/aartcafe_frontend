"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Search, User, ShoppingBag, X, Menu } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Festival Specials", path: "/festival-specials" },
    { name: "Special offers", path: "/special-offers" },
  ];

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          zIndex: 99,
          height: "100px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1920px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Brand/Logo */}
          <Link
            href="/"
            className="font-serif"
            style={{
              fontSize: "24px",
              fontWeight: 400,
              color: "#3F3B38",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Aartcafe
          </Link>

          {/* Navigation Links - Desktop Only */}
          <nav
            className="desktop-nav"
            style={{
              display: "flex",
              gap: "0",
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="font-serif"
                  style={{
                    fontSize: "24px",
                    lineHeight: "32px",
                    fontWeight: 400,
                    color: isActive ? "#D9A85C" : "#3F3B38",
                    textDecoration: "none",
                    padding: "0 2rem",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#D9A85C";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#3F3B38";
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Utility Icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Search size={30} strokeWidth={1.2} />
            </button>

            {/* Profile/User */}
            <button
              onClick={() => setUserMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <User size={30} strokeWidth={1.2} />
            </button>

            {/* Bag/Cart */}
            <Link
              href="/cart"
              style={{
                background: pathname === "/cart" ? "#D9A85C" : "none",
                border: "none",
                cursor: "pointer",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                color: pathname === "/cart" ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/cart") e.currentTarget.style.opacity = "0.6";
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/cart") e.currentTarget.style.opacity = "1";
              }}
            >
              <ShoppingBag size={30} strokeWidth={1.2} color={pathname === "/cart" ? "#fff" : "#000"} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    backgroundColor: "#D98A9C",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#000",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={30} strokeWidth={1.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "absolute",
              top: "30px",
              right: "30px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={32} color="#3F3B38" />
          </button>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              alignItems: "center",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="font-serif"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "28px",
                    fontWeight: 400,
                    color: isActive ? "#D9A85C" : "#3F3B38",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Search Overlay/Modal */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
          }}
        >
          <button
            onClick={() => setSearchOpen(false)}
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            <X size={28} color="#3F3B38" />
          </button>
          <div style={{ width: "100%", maxWidth: "600px", textAlign: "center" }}>
            <h2
              className="font-serif"
              style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#3F3B38" }}
            >
              Search Aartcafe
            </h2>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                placeholder="Search for frames, gifts, collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "1rem 3rem 1rem 1.5rem",
                  fontSize: "1.2rem",
                  borderRadius: "30px",
                  border: "1.5px solid #8FB9A8",
                  outline: "none",
                  color: "#3F3B38",
                }}
              />
              <Search
                size={22}
                color="#8FB9A8"
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Menu Modal */}
      {userMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setUserMenuOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFF",
              padding: "30px",
              borderRadius: "15px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif" style={{ fontSize: "24px", color: "#3F3B38", marginBottom: "20px" }}>My Account</h3>
            <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px", marginBottom: "24px" }}>
              Log in to track orders, save favorites, and manage your custom requests.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                href="/signin"
                onClick={() => setUserMenuOpen(false)}
                style={{
                  height: "40px",
                  borderRadius: "20px",
                  border: "1px solid #D9A85C",
                  backgroundColor: "transparent",
                  color: "#D98A9C",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                SIGN IN
              </Link>
              <Link
                href="/signup"
                onClick={() => setUserMenuOpen(false)}
                style={{
                  height: "40px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: "#D9A85C",
                  color: "#FFF",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                CREATE ACCOUNT
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for media queries */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
