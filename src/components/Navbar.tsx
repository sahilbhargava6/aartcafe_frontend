"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Search, User, ShoppingBag, Heart, X, Menu, Package, ArrowRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Festive Specials", path: "/festive-specials" },
    { name: "Special offers", path: "/special-offers" },
  ];

  // Fetch products once for live search with fallback logic
  // Fetch products once for live search with parallel race
  useEffect(() => {
    let isMounted = true;
    const urls = [
      "http://localhost:8000/api/products",
      process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/products` : null,
      "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products",
    ].filter(Boolean) as string[];

    const fetchProducts = async () => {
      try {
        const data = await Promise.any(
          urls.map(async (url) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout
            try {
              const res = await fetch(url, { signal: controller.signal });
              clearTimeout(timer);
              if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) return json;
              }
            } catch (e) {
              clearTimeout(timer);
            }
            throw new Error("Failed");
          })
        );
        if (isMounted && Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter search results in real time
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = allProducts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 6)); // max 6 preview items
  }, [searchQuery, allProducts]);

  return (
    <>
      <header
        className="site-header"
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
          className="site-header-inner"
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
          <Link href="/" className="site-logo" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img src="/images/logo.webp" alt="Aartcafe" width={279} height={240} className="site-logo-img" />
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
                    fontSize: "22px",
                    lineHeight: "32px",
                    fontWeight: 400,
                    color: isActive ? "#D9A85C" : "#3F3B38",
                    textDecoration: "none",
                    padding: "0 1.5rem",
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
            className="nav-icons"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Search */}
            <button
              className="nav-icon-btn"
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
              <Search size={28} strokeWidth={1.2} />
            </button>

            {/* Wishlist Heart Icon */}
            <Link
              href="/wishlist"
              style={{
                background: pathname === "/wishlist" ? "#D98A9C" : "none",
                border: "none",
                cursor: "pointer",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                color: pathname === "/wishlist" ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/wishlist") e.currentTarget.style.opacity = "0.6";
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/wishlist") e.currentTarget.style.opacity = "1";
              }}
            >
              <Heart size={26} strokeWidth={1.3} color={pathname === "/wishlist" ? "#fff" : "#3F3B38"} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "#D98A9C",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>



            {/* Bag/Cart */}
            <Link
              href="/cart"
              style={{
                background: pathname === "/cart" ? "#D9A85C" : "none",
                border: "none",
                cursor: "pointer",
                width: "44px",
                height: "44px",
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
              <ShoppingBag size={28} strokeWidth={1.2} color={pathname === "/cart" ? "#fff" : "#000"} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "#D98A9C",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
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
              className="mobile-toggle nav-icon-btn"
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
              <Menu size={28} strokeWidth={1.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay (full screen, above the floating WhatsApp button) */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {/* Top bar mirrors the header so the close button sits where the menu button was */}
          <div
            className="mobile-menu-top"
            style={{
              height: "100px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center" }}>
              <img src="/images/logo.webp" alt="Aartcafe" width={279} height={240} className="menu-logo-img" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "44px",
                height: "44px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={32} color="#3F3B38" />
            </button>
          </div>

          <nav
            className="mobile-menu-nav"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 20px 64px",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="font-serif mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "26px",
                    fontWeight: 400,
                    color: isActive ? "#D9A85C" : "#3F3B38",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    padding: "10px 16px",
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/wishlist"
              className="font-serif mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: "26px",
                color: "#D98A9C",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
              }}
            >
              <Heart size={24} /> My Wishlist ({wishlistCount})
            </Link>
          </nav>
        </div>
      )}

      {/* Live Search Overlay/Modal */}
      {searchOpen && (
        <div
          className="search-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 20px 40px",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          <button
            className="search-close"
            aria-label="Close search"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
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

          <div style={{ width: "100%", maxWidth: "680px", textAlign: "center" }}>
            <h2
              className="font-serif search-title"
              style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "#3F3B38", fontWeight: 400 }}
            >
              Search Aartcafe Catalog
            </h2>
            <div style={{ position: "relative", width: "100%", marginBottom: "24px" }}>
              <input
                className="search-input"
                type="text"
                placeholder="Search by product name, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "1.1rem 3.5rem 1.1rem 1.8rem",
                  fontSize: "1.2rem",
                  borderRadius: "35px",
                  border: "1.5px solid #D9A85C",
                  outline: "none",
                  backgroundColor: "#FAF6F0",
                  color: "#3F3B38",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              />
              <Search
                className="search-input-icon"
                size={24}
                color="#D9A85C"
                style={{
                  position: "absolute",
                  right: "1.8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>

            {/* Live Search Results Dropdown */}
            {searchQuery.trim() !== "" && (
              <div
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  border: "1px solid #EBE5DB",
                  overflow: "hidden",
                  textAlign: "left",
                }}
              >
                {searchResults.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#999", fontSize: "15px" }}>
                    No products found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: "14px 20px", backgroundColor: "#FAF6F0", fontSize: "12px", color: "#6E6E6E", textTransform: "uppercase", fontWeight: 600, letterSpacing: "1px", borderBottom: "1px solid #EBE5DB" }}>
                      Found {searchResults.length} Products
                    </div>
                    {searchResults.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/shop/${prod.slug || prod.id}`}
                        className="search-result"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "14px 20px",
                          borderBottom: "1px solid #FAF6F0",
                          textDecoration: "none",
                          color: "#3F3B38",
                          transition: "backgroundColor 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAF6F0")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFF")}
                      >
                        {prod.image ? (
                          <img src={prod.image} alt={prod.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "10px", flexShrink: 0, overflow: "hidden" }} />
                        ) : (
                          <div style={{ width: "50px", height: "50px", backgroundColor: "#EBE5DB", borderRadius: "10px", flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="font-serif" style={{ fontSize: "16px", fontWeight: 500, color: "#3F3B38" }}>
                            {prod.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#8FB9A8", textTransform: "uppercase", fontWeight: 600, marginTop: "2px" }}>
                            {prod.category?.name || "General"}
                          </div>
                        </div>
                        {prod.discount_price && Number(prod.discount_price) > 0 && Number(prod.discount_price) < Number(prod.base_price || 0) ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "#D9A85C" }}>
                              ₹{Number(prod.discount_price).toLocaleString("en-IN")}
                            </div>
                            <div style={{ fontSize: "12px", color: "#999", textDecoration: "line-through", marginTop: "1px" }}>
                              ₹{Number(prod.base_price || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#D9A85C" }}>
                            ₹{Number(prod.discount_price || prod.base_price || 0).toLocaleString("en-IN")}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Global CSS for media queries */}
      <style jsx>{`
        /* Logo: fills most of the 100px bar (70px on phones, see below) */
        .site-logo-img {
          display: block;
          height: 72px;
          width: auto;
        }
        .menu-logo-img {
          display: block;
          height: 48px;
          width: auto;
        }

        @supports (height: 100dvh) {
          .mobile-menu,
          .search-overlay {
            height: 100dvh !important;
          }
        }

        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          /* 44px tap targets for every header icon */
          .nav-icon-btn {
            width: 44px;
            height: 44px;
            padding: 0 !important;
            flex-shrink: 0;
          }
          .nav-icons > :global(a) {
            flex-shrink: 0;
          }
          .site-header-inner > :global(.site-logo) {
            padding: 6px 0;
          }
        }

        @media (max-width: 768px) {
          .site-header {
            height: 70px !important;
          }
          .site-logo-img {
            height: 52px;
          }
          .site-header-inner {
            padding: 0 16px !important;
            gap: 12px;
          }
          .nav-icons {
            gap: 4px !important;
          }
          .mobile-menu-top {
            height: 70px !important;
            padding: 0 16px !important;
          }

          /* Search overlay: keep the close button clear of the title */
          .search-overlay {
            padding: 72px 16px 32px !important;
          }
          .search-close {
            top: 13px !important;
            right: 16px !important;
            width: 44px;
            height: 44px;
            padding: 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .search-title {
            font-size: 28px !important;
            line-height: 1.25 !important;
            margin-bottom: 20px !important;
          }
          .search-overlay :global(.search-result) {
            padding: 12px 16px !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 600px) {
          .search-title {
            font-size: 24px !important;
          }
          .search-input {
            padding: 14px 48px 14px 20px !important;
          }
          .search-overlay :global(.search-input-icon) {
            right: 18px !important;
            width: 22px;
            height: 22px;
          }
          .mobile-menu-nav > :global(.mobile-menu-link) {
            font-size: 24px !important;
          }
        }

        @media (max-width: 360px) {
          .site-logo-img {
            height: 46px;
          }
          .nav-icons {
            gap: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
