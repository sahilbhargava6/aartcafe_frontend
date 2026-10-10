"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";

const CARD_LAYOUTS = [
  { width: 364, height: 455 }, // Aspect ratio 364/455
  { width: 364, height: 364 }, // Aspect ratio 1:1
  { width: 364, height: 455 },
  { width: 364, height: 364 },
  { width: 364, height: 455 },
  { width: 364, height: 364 },
  { width: 364, height: 455 },
  { width: 364, height: 364 },
];

export default function Shop() {
  const { addToBag } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) setSelectedCategory(cat);
    }
  }, []);

  const handleCategoryClick = (cat: string) => {
    const newCat = selectedCategory === cat ? null : cat;
    setSelectedCategory(newCat);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newCat) url.searchParams.set("category", newCat);
      else url.searchParams.delete("category");
      window.history.pushState({}, "", url.toString());
    }
  };
  
  const [categories, setCategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and products with ultra-fast parallel race
  useEffect(() => {
    let isMounted = true;

    const fetchFast = async (endpoint: string) => {
      const urls = [
        "http://localhost:8000/api/" + endpoint,
        process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}` : null,
        "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/" + endpoint,
      ].filter(Boolean) as string[];

      try {
        const data = await Promise.any(
          urls.map(async (url) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout for cold start
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
            throw new Error("Endpoint failed");
          })
        );
        return data;
      } catch (e) {
        return [];
      }
    };

    const loadData = async () => {
      const [catData, prodData] = await Promise.all([
        fetchFast("categories"),
        fetchFast("products"),
      ]);

      if (isMounted) {
        if (Array.isArray(catData) && catData.length > 0) {
          const names = catData.map((c: any) => c.name).filter(Boolean);
          names.sort((a: string, b: string) => a.localeCompare(b));
          setCategories(names);
        }

        if (Array.isArray(prodData) && prodData.length > 0) {
          const formatted = prodData.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.base_price),
            basePrice: parseFloat(p.base_price),
            discountPrice: p.discount_price ? parseFloat(p.discount_price) : null,
            category: p.category?.name || "Uncategorized",
            categories: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories.map((c: any) => c.name) : [p.category?.name || "Uncategorized"],
            image: p.image || "",
            description: p.description || "",
            isFreeDelivery: !!p.is_free_delivery
          }));
          setAllProducts(formatted);
          setFilteredProducts(formatted);
        }
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const priceRanges = [
    { label: "Under ₹1,000", value: "under-1000" },
    { label: "₹1,000 - ₹2,000", value: "1000-2000" },
    { label: "₹2,000 - ₹5,000", value: "2000-5000" },
    { label: "Over ₹5,000", value: "over-5000" },
  ];

  useEffect(() => {
    let result = allProducts;

    if (selectedCategory) {
      result = result.filter((p) => (p.categories && Array.isArray(p.categories)) ? p.categories.includes(selectedCategory) : p.category === selectedCategory);
    }

    if (selectedPriceRange) {
      result = result.filter((p) => {
        if (selectedPriceRange === "under-1000") return p.price < 1000;
        if (selectedPriceRange === "1000-2000") return p.price >= 1000 && p.price <= 2000;
        if (selectedPriceRange === "2000-5000") return p.price >= 2000 && p.price <= 5000;
        if (selectedPriceRange === "over-5000") return p.price > 5000;
        return true;
      });
    }

    setFilteredProducts(result);
  }, [selectedCategory, selectedPriceRange, allProducts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="shop-container">
          
          {/* Main Grid Wrapper with responsive styling */}
          <div className="shop-layout">
            
            {/* ═══════════════════════════════════════════════════════
                LEFT SIDEBAR: FILTERS
                ═══════════════════════════════════════════════════════ */}
            <aside className="shop-sidebar">
              <h2
                className="font-serif"
                style={{
                  fontSize: "24px",
                  lineHeight: "32px",
                  fontWeight: 400,
                  color: "#3F3B38",
                  margin: "0 0 16px 0",
                  paddingLeft: "10px",
                }}
              >
                Filter
              </h2>

              {/* Categories Box */}
              <div className="filter-box">
                <h3 className="font-serif filter-box-title">
                  Categories
                </h3>
                <div style={{ flex: 1 }}>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", padding: 0, margin: 0 }}>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryClick(cat)}
                          className="font-sans"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "20px",
                            lineHeight: "30px",
                            color: selectedCategory === cat ? "#D9A85C" : "#3F3B38",
                            fontWeight: 400,
                            textAlign: "left",
                            width: "100%",
                            padding: 0,
                            transition: "color 0.2s ease",
                          }}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prices Box */}
              <div className="filter-box">
                <h3 className="font-serif filter-box-title">
                  Prices
                </h3>
                <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {priceRanges.map((range) => (
                      <li key={range.value}>
                        <button
                          onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? null : range.value)}
                          className="font-sans"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "20px",
                            lineHeight: "30px",
                            color: selectedPriceRange === range.value ? "#D9A85C" : "#3F3B38",
                            fontWeight: 400,
                            textAlign: "left",
                            width: "100%",
                            padding: 0,
                            transition: "color 0.2s ease",
                          }}
                        >
                          {range.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </aside>

            {/* ═══════════════════════════════════════════════════════
                RIGHT PRODUCTS PANEL
                ═══════════════════════════════════════════════════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              
              {/* Header Title & Active Filter Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <h1
                  className="font-serif"
                  style={{
                    fontSize: "36px",
                    lineHeight: "48px",
                    fontWeight: 400,
                    color: "#3F3B38",
                    margin: 0,
                  }}
                >
                  {selectedCategory && selectedCategory !== "All" ? selectedCategory.toUpperCase() : "SHOP"}
                </h1>

                {(selectedCategory || selectedPriceRange) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedPriceRange(null);
                      if (typeof window !== "undefined") {
                        const url = new URL(window.location.href);
                        url.searchParams.delete("category");
                        window.history.pushState({}, "", url.toString());
                      }
                    }}
                    className="font-sans"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#D98A9C",
                      fontSize: "18px",
                      cursor: "pointer",
                      fontWeight: 400,
                      textDecoration: "underline",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="shop-products-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shop-product-card-wrapper" style={{ opacity: 0.6 }}>
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "364/455",
                          backgroundColor: "#FAF6F0",
                          borderRadius: "15px",
                        }}
                      />
                      <div style={{ marginTop: "14px", height: "22px", backgroundColor: "#FAF6F0", borderRadius: "6px", width: "75%" }} />
                      <div style={{ marginTop: "8px", height: "18px", backgroundColor: "#FAF6F0", borderRadius: "6px", width: "40%" }} />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ padding: "80px 0", textAlign: "center", color: "#6E6E6E" }}>
                  <p className="font-sans" style={{ fontSize: "22px" }}>No products match the selected filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedPriceRange(null);
                    }}
                    className="underline-link"
                    style={{ marginTop: "16px" }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="shop-products-grid">
                  {filteredProducts.map((prod, index) => {
                    const layout = CARD_LAYOUTS[index % CARD_LAYOUTS.length];
                    const aspectRatioStr = `${layout.width}/${layout.height}`;

                    return (
                        <div key={prod.id} className="shop-product-card-wrapper" style={{ position: "relative" }}>
                          {/* Wishlist Heart Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist({
                                id: prod.id,
                                title: prod.title,
                                price: prod.price,
                                image: prod.image,
                                category: prod.category,
                                slug: prod.slug,
                              });
                            }}
                            title={isInWishlist(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            style={{
                              position: "absolute",
                              top: "14px",
                              right: "14px",
                              zIndex: 10,
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              border: "none",
                              borderRadius: "50%",
                              width: "36px",
                              height: "36px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <Heart
                              size={18}
                              color={isInWishlist(prod.id) ? "#D98A9C" : "#3F3B38"}
                              fill={isInWishlist(prod.id) ? "#D98A9C" : "none"}
                            />
                          </button>

                          {/* Product Card Container */}
                          <Link
                            href={prod.slug ? `/shop/${prod.slug}` : "/shop/wedding-frames"}
                            className="product-card"
                            style={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: aspectRatioStr,
                              backgroundColor: "#FAF6F0",
                              borderRadius: "15px",
                              overflow: "hidden",
                              display: "block",
                              boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
                            }}
                          >
                          {/* Product Image */}

                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.title}
                              loading="lazy"
                              decoding="async"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>
                              Product Image
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <div
                            className="hover-overlay"
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              zIndex: 2,
                            }}
                          >
                            <span
                              className="font-serif"
                              style={{
                                color: "#fff",
                                fontSize: "20px",
                                borderBottom: "1.5px solid #fff",
                                paddingBottom: "2px",
                                letterSpacing: "1px",
                              }}
                            >
                              View Details
                            </span>
                          </div>
                        </Link>

                        {/* Details below card */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "14px", width: "100%" }}>
                          <Link href={prod.slug ? `/shop/${prod.slug}` : `/shop/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h4
                              className="font-serif"
                              style={{
                                fontSize: "22px",
                                lineHeight: "30px",
                                fontWeight: 400,
                                color: "#3F3B38",
                                margin: 0,
                                cursor: "pointer",
                              }}
                            >
                              {prod.title}
                            </h4>
                          </Link>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                              <span className="font-sans" style={{ fontSize: "20px", color: "#3F3B38", fontWeight: 500 }}>
                                ₹{prod.price.toLocaleString("en-IN")}
                              </span>
                              {prod.discountPrice && (
                                <span className="font-sans" style={{ fontSize: "14px", textDecoration: "line-through", color: "#999" }}>
                                  ₹{prod.basePrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToBag(prod);
                              }}
                              className="font-sans"
                              style={{
                                background: "none",
                                border: "none",
                                borderBottom: "1px solid #3F3B38",
                                fontSize: "20px",
                                lineHeight: "30px",
                                color: "#3F3B38",
                                cursor: "pointer",
                                padding: "0 0 2px 0",
                              }}
                            >
                              Add to bag
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* CSS Styles for responsiveness and overlay hover state */}
      <style jsx global>{`
        .product-card:hover .hover-overlay {
          opacity: 1 !important;
        }
      `}</style>

      <style jsx>{`
        .shop-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .shop-layout {
          display: grid;
          grid-template-columns: 294px 1fr;
          gap: 47px;
        }
        .shop-sidebar {
          display: flex;
          flex-direction: column;
          gap: 27px;
        }
        .filter-box {
          box-sizing: border-box;
          width: 100%;
          min-height: 220px;
          height: auto;
          border: 2px solid #D98A9C;
          border-radius: 15px;
          padding: 24px 22px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
        }
        .filter-box-title {
          font-size: 32px;
          line-height: 43px;
          font-weight: 700;
          color: #3F3B38;
          margin: 0 0 12px 0;
        }
        .shop-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 60px 24px;
          justify-content: center;
        }
        .shop-product-card-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        @media (max-width: 992px) {
          .shop-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .shop-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .filter-box {
            min-height: 200px;
            height: auto;
          }
        }
        @media (max-width: 600px) {
          .shop-container {
            padding: 0 16px;
          }
          .shop-sidebar {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .filter-box {
            min-height: 180px;
            height: auto;
          }
          .filter-box-title {
            font-size: 26px;
            line-height: 34px;
          }
        }
      `}</style>
    </div>
  );
}
