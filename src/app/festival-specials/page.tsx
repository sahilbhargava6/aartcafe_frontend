"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronRight, ChevronLeft } from "lucide-react";

export default function FestivalSpecials() {
  const { addToBag } = useCart();
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  const [products, setProducts] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch All Active Banners
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeBanners = data.filter((b: any) => b.is_active);
          setBanners(activeBanners.length > 0 ? activeBanners : [data[0]]);
        }
      })
      .catch((err) => console.error("Error loading banners:", err));

    // 2. Fetch Festive Specials Products
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/festive-specials")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => console.error("Error loading festive products:", err));

    // 3. Fetch Bestsellers for Sidebar
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/bestsellers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setBestsellers(data);
        }
      })
      .catch((err) => console.error("Error loading bestsellers:", err));
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };
  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const activeBanner = banners[currentBannerIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="fest-container">
          
          {/* ═══════════════════════════════════════════════════════
              HERO CAROUSEL SECTION
              ═══════════════════════════════════════════════════════ */}
          <div className="carousel-wrapper">
            {banners.length > 1 && (
              <button onClick={prevBanner} className="carousel-btn left-btn">
                <ChevronLeft size={24} />
              </button>
            )}
            
            <div
              className="rakhi-banner"
              style={
                activeBanner?.image_url
                  ? {
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${activeBanner.image_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : { backgroundColor: "#3F3B38" }
              }
            >
              {!activeBanner?.image_url && (
                <svg className="banner-svg-medallion" width="300" height="300" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="#EFD3C7" opacity="0.1" />
                  <path d="M5 100 Q 50 80, 100 100 T 195 100" stroke="#D9A85C" strokeWidth="3" fill="none" />
                  <path d="M5 100 Q 50 120, 100 100 T 195 100" stroke="#D98A9C" strokeWidth="2" strokeDasharray="4,4" fill="none" />
                  <circle cx="100" cy="100" r="45" fill="#D98A9C" stroke="#D9A85C" strokeWidth="4" />
                  <circle cx="100" cy="100" r="30" fill="#D9A85C" />
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i * 360) / 16;
                    return (
                      <circle
                        key={i}
                        cx={100 + 38 * Math.cos((angle * Math.PI) / 180)}
                        cy={100 + 38 * Math.sin((angle * Math.PI) / 180)}
                        r="4"
                        fill="#FFF"
                      />
                    );
                  })}
                </svg>
              )}

              <div className="banner-content">
                <span className="font-serif banner-sub">FESTIVAL SPECIALS</span>
                <h1 className="font-serif banner-title">
                  {activeBanner?.title || "Celebrate The Bond"}
                </h1>
                <p className="font-sans banner-desc" style={{ fontSize: "24px", lineHeight: "34px", color: "#BCAEA2", margin: 0 }}>
                  {activeBanner?.subtitle || "Explore our handcrafted collection."}
                </p>
                {activeBanner?.button_url && activeBanner?.button_text && (
                  <a href={activeBanner.button_url} style={{ marginTop: "16px", padding: "12px 30px", backgroundColor: "#D9A85C", color: "#fff", borderRadius: "30px", fontSize: "18px", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
                    {activeBanner.button_text}
                  </a>
                )}
              </div>
            </div>

            {banners.length > 1 && (
              <button onClick={nextBanner} className="carousel-btn right-btn">
                <ChevronRight size={24} />
              </button>
            )}

            {/* Carousel Dots */}
            {banners.length > 1 && (
              <div className="carousel-dots">
                {banners.map((_, idx) => (
                  <div
                    key={idx}
                    className={`dot ${idx === currentBannerIndex ? "active" : ""}`}
                    onClick={() => setCurrentBannerIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
              MAIN LAYOUT: Festive Specials (Left) + Bestsellers Sidebar (Right)
              ═══════════════════════════════════════════════════════ */}
          <div className="layout-grid">
            
            {/* Left Column: Festive Specials Products */}
            <div className="main-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px", borderBottom: "1px solid #EBE5DB", paddingBottom: "16px" }}>
                <h2 className="font-serif" style={{ fontSize: "32px", color: "#3F3B38", margin: 0 }}>
                  Festive Specials
                </h2>
                <span className="font-sans" style={{ color: "#8FB9A8", fontSize: "16px", fontWeight: 600 }}>
                  {products.length} Products
                </span>
              </div>

              {products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#BCAEA2", fontSize: "18px" }}>
                  No festive specials available at the moment. Please check back later!
                </div>
              ) : (
                <div className="festive-products-list">
                  {products.map((prod, index) => {
                    const isEven = index % 2 === 0;
                    return (
                      <div key={prod.id} className={`product-row ${isEven ? 'row-align-left' : 'row-align-right'}`}>
                        {/* Image Column */}
                        <div className={`product-image-container ${!isEven ? 'detail-order-second' : ''}`}>
                          {prod.image ? (
                            <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            "Product Image"
                          )}
                        </div>

                        {/* Details Column */}
                        <div className={`product-details-container ${!isEven ? 'detail-order-first' : ''}`}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <span className="font-sans" style={{ fontSize: "14px", color: "#D98A9C", letterSpacing: "2px", fontWeight: 600 }}>
                              FESTIVAL COLLECTION
                            </span>
                            <h2 className="font-serif detail-title">{prod.title}</h2>
                          </div>

                          <p className="font-sans detail-desc">
                            {prod.description || "A beautiful piece for your celebrations."}
                          </p>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {prod.discount_price ? (
                              <>
                                <span className="font-serif detail-price">₹{prod.discount_price}</span>
                                <span className="font-sans" style={{ textDecoration: "line-through", color: "#BCAEA2", fontSize: "20px" }}>₹{prod.base_price}</span>
                              </>
                            ) : (
                              <span className="font-serif detail-price">₹{prod.base_price}</span>
                            )}
                          </div>

                          <div>
                            <button onClick={() => addToBag(prod)} className="font-sans cart-button">
                              ADD TO CART
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Bestsellers Sidebar */}
            <aside className="sidebar">
              <h3 className="font-serif sidebar-title">Best Sellers</h3>
              
              {bestsellers.length === 0 ? (
                <p style={{ color: "#BCAEA2", fontSize: "14px" }}>No bestsellers found.</p>
              ) : (
                <div className="sidebar-products">
                  {bestsellers.map((prod) => (
                    <div key={prod.id} className="sidebar-product-card">
                      <div className="sidebar-img-wrapper">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.title} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundColor: '#F5EDE8' }} />
                        )}
                      </div>
                      <div className="sidebar-info">
                        <h4 className="font-serif">{prod.title}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          {prod.discount_price ? (
                            <>
                              <span className="price-active">₹{prod.discount_price}</span>
                              <span className="price-strike">₹{prod.base_price}</span>
                            </>
                          ) : (
                            <span className="price-active">₹{prod.base_price}</span>
                          )}
                        </div>
                        <button onClick={() => addToBag(prod)} className="sidebar-add-btn">
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .fest-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 80px;
        }

        /* Carousel Styles */
        .carousel-wrapper {
          position: relative;
          margin-bottom: 60px;
        }
        .rakhi-banner {
          position: relative;
          width: 100%;
          aspect-ratio: 1781/723;
          border-radius: 15px;
          display: flex;
          align-items: center;
          padding: 80px 100px;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: background-image 0.5s ease-in-out;
        }
        .banner-svg-medallion {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .banner-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 2;
          align-items: flex-start;
        }
        .banner-sub {
          font-size: 20px;
          color: #D9A85C;
          letter-spacing: 2px;
        }
        .banner-title {
          font-size: 64px;
          color: #fff;
          margin: 0;
          font-weight: 400;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 25px;
          background-color: rgba(255,255,255,0.8);
          border: none;
          color: #3F3B38;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .carousel-btn:hover {
          background-color: #fff;
          color: #D98A9C;
        }
        .left-btn { left: -25px; }
        .right-btn { right: -25px; }
        .carousel-dots {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.3s;
        }
        .dot.active {
          background-color: #D9A85C;
          transform: scale(1.2);
        }

        /* Layout Grid */
        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 60px;
          align-items: start;
        }

        /* Festive Products List */
        .festive-products-list {
          display: flex;
          flex-direction: column;
          gap: 80px;
        }
        .product-row {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: center;
        }
        .row-align-right {
          grid-template-columns: 1.2fr 1fr;
        }
        .product-image-container {
          width: 100%;
          aspect-ratio: 4/5;
          background-color: #F5EDE8;
          border-radius: 15px;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #BCAEA2;
          overflow: hidden;
        }
        .row-align-left .product-image-container {
          justify-self: end;
        }
        .row-align-right .product-image-container {
          justify-self: start;
        }
        .product-details-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .row-align-right .product-details-container {
          justify-self: end;
          text-align: right;
          align-items: flex-end;
        }
        .detail-title {
          font-size: 32px;
          line-height: 40px;
          color: #3F3B38;
          margin: 0;
          font-weight: 400;
        }
        .detail-desc {
          font-size: 18px;
          line-height: 28px;
          color: #8FB9A8;
          margin: 0;
        }
        .detail-price {
          font-size: 32px;
          color: #3F3B38;
        }
        .cart-button {
          width: 220px;
          height: 50px;
          border-radius: 25px;
          border: 1.5px solid #D9A85C;
          background-color: transparent;
          color: #D98A9C;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-button:hover {
          background-color: rgba(217, 138, 156, 0.05);
        }

        /* Sidebar Styles */
        .sidebar {
          background-color: #FCFAF7;
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #EBE5DB;
        }
        .sidebar-title {
          font-size: 24px;
          color: #3F3B38;
          margin: 0 0 24px 0;
          padding-bottom: 16px;
          border-bottom: 2px dashed #EBE5DB;
          text-align: center;
        }
        .sidebar-products {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .sidebar-product-card {
          display: flex;
          gap: 16px;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #EBE5DB;
        }
        .sidebar-product-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .sidebar-img-wrapper {
          width: 90px;
          height: 110px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .sidebar-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sidebar-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sidebar-info h4 {
          margin: 0;
          font-size: 16px;
          color: #3F3B38;
          line-height: 22px;
        }
        .price-active {
          font-family: sans-serif;
          font-size: 16px;
          color: #D98A9C;
          font-weight: 600;
        }
        .price-strike {
          font-family: sans-serif;
          font-size: 12px;
          color: #BCAEA2;
          text-decoration: line-through;
        }
        .sidebar-add-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: #8FB9A8;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 0;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .sidebar-add-btn:hover {
          color: #4E8E76;
          border-bottom: 1px solid #4E8E76;
        }

        @media (max-width: 1200px) {
          .fest-container { padding: 0 40px; }
          .layout-grid { grid-template-columns: 1fr 300px; gap: 40px; }
        }
        @media (max-width: 992px) {
          .layout-grid { grid-template-columns: 1fr; gap: 60px; }
          .rakhi-banner { aspect-ratio: auto; padding: 60px 40px; text-align: center; justify-content: center; }
          .banner-content { align-items: center; }
          .banner-svg-medallion { display: none; }
          .product-row { grid-template-columns: 1fr !important; gap: 30px; }
          .detail-order-first { order: 2; }
          .detail-order-second { order: 1; }
          .product-image-container { max-width: 400px; margin: 0 auto; }
          .product-details-container { align-items: center !important; text-align: center !important; }
        }
        @media (max-width: 600px) {
          .fest-container { padding: 0 20px; }
          .banner-title { font-size: 42px; }
          .banner-desc { font-size: 18px !important; }
          .detail-title { font-size: 28px; }
          .sidebar { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}
