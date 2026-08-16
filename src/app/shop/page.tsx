"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<string[]>([
    "Personalized Frames",
    "Handmade Rakhis",
    "Gift Hampers"
  ]);

  const [allProducts, setAllProducts] = useState<any[]>([
    { id: 1, title: "Wedding Frame", price: 2000, category: "Personalized Frames", image: "" },
    { id: 2, title: "Baby Keepsake", price: 1500, category: "Personalized Frames", image: "" },
    { id: 3, title: "Handmade Rakhi Set", price: 600, category: "Handmade Rakhis", image: "" },
    { id: 4, title: "Lumba Rakhi", price: 400, category: "Handmade Rakhis", image: "" },
    { id: 5, title: "Luxury Gift Hamper", price: 4500, category: "Gift Hampers", image: "" },
    { id: 6, title: "Festive Joy Hamper", price: 3200, category: "Gift Hampers", image: "" }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  // Fetch categories and products from Laravel API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.map((c: any) => c.name));
        }
      })
      .catch((err) => console.error("Error loading categories:", err));

    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: parseFloat(p.base_price),
            category: p.category?.name || "Uncategorized",
            image: p.image || ""
          }));
          setAllProducts(formatted);
          setFilteredProducts(formatted);
        }
      })
      .catch((err) => console.error("Error loading products:", err));
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
      result = result.filter((p) => p.category === selectedCategory);
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
                <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
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
                  SHOP
                </h1>

                {(selectedCategory || selectedPriceRange) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedPriceRange(null);
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
              {filteredProducts.length === 0 ? (
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
                      <div key={prod.id} className="shop-product-card-wrapper">
                        {/* Product Card Container */}
                        <Link
                          href="/shop/wedding-frames"
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
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>
                            Product Image
                          </div>

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
                          <h4
                            className="font-serif"
                            style={{
                              fontSize: "22px",
                              lineHeight: "30px",
                              fontWeight: 400,
                              color: "#3F3B38",
                              margin: 0,
                            }}
                          >
                            {prod.title}
                          </h4>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="font-sans" style={{ fontSize: "20px", color: "#3F3B38" }}>
                              ₹{prod.price}
                            </span>
                            
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
          height: 300px;
          border: 2px solid #D98A9C;
          border-radius: 15px;
          padding: 24px 22px;
          backgroundColor: #fff;
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
            height: 260px;
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
            height: 240px;
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
