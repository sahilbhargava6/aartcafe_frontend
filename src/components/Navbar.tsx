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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
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
              <Menu size={28} strokeWidth={1.2} />
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
              gap: "24px",
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
                    fontSize: "26px",
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
            <Link
              href="/wishlist"
              className="font-serif"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: "26px",
                color: "#D98A9C",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
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
            padding: "60px 20px 40px",
            overflowY: "auto",
          }}
        >
          <button
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
              className="font-serif"
              style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "#3F3B38", fontWeight: 400 }}
            >
              Search Aartcafe Catalog
            </h2>
            <div style={{ position: "relative", width: "100%", marginBottom: "24px" }}>
              <input
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
                        href={prod.slug ? `/shop/${prod.slug}` : "/shop"}
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
                          <img src={prod.image} alt={prod.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "10px" }} />
                        ) : (
                          <div style={{ width: "50px", height: "50px", backgroundColor: "#EBE5DB", borderRadius: "10px" }} />
                        )}
                        <div style={{ flex: 1 }}>
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
