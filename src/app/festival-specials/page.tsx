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
  
  const [activeCollection, setActiveCollection] = useState<"festive" | "wedding" | "new" | "bestsellers">("festive");
  
  const [festiveProducts, setFestiveProducts] = useState<any[]>([]);
  const [weddingProducts, setWeddingProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [bestsellers, setBestsellers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Banners
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeBanners = data.filter((b: any) => b.is_active && (!b.position || b.position === 'all' || b.position === 'festival-specials'));
          setBanners(activeBanners.length > 0 ? activeBanners : [data[0]]);
        }
      })
      .catch((err) => console.error("Error loading banners:", err));

    // Fetch All Collections
    Promise.all([
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/festive-specials").then(res => res.json()),
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/wedding-specials").then(res => res.json()),
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/new-discoveries").then(res => res.json()),
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/bestsellers").then(res => res.json())
    ]).then(([festive, wedding, newDisc, best]) => {
      setFestiveProducts(Array.isArray(festive) ? festive : []);
      setWeddingProducts(Array.isArray(wedding) ? wedding : []);
      setNewProducts(Array.isArray(newDisc) ? newDisc : []);
      setBestsellers(Array.isArray(best) ? best : []);
    }).catch(err => console.error("Error fetching collections", err));

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

  // Helper to get active collection data
  const getActiveData = () => {
    switch (activeCollection) {
      case "wedding": return { title: "Wedding Specials", data: weddingProducts };
      case "new": return { title: "New Discoveries", data: newProducts };
      case "bestsellers": return { title: "Best Sellers", data: bestsellers };
      case "festive":
      default: return { title: "Festive Specials", data: festiveProducts };
    }
  };

  const { title: displayTitle, data: displayProducts } = getActiveData();

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
                <span className="font-serif banner-sub">SPECIAL COLLECTIONS</span>
                <h1 className="font-serif banner-title">
                  {activeBanner?.title || "Celebrate The Bond"}
                </h1>
                <p className="font-sans banner-desc" style={{ fontSize: "24px", lineHeight: "34px", color: "#BCAEA2", margin: 0 }}>
                  {activeBanner?.subtitle || "Explore our handcrafted collections."}
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
              MAIN LAYOUT: Navigation Sidebar (Left) + Collection Products (Right)
              ═══════════════════════════════════════════════════════ */}
          <div className="layout-grid">
            
            {/* Left Column: Navigation Sidebar */}
            <aside className="sidebar-nav">
              <h3 className="font-serif sidebar-nav-title">Collections</h3>
              <ul className="sidebar-menu">
                <li 
                  className={`sidebar-item ${activeCollection === 'festive' ? 'active' : ''}`}
                  onClick={() => setActiveCollection('festive')}
                >
                  <span className="sidebar-icon">✨</span> Festive Specials
                </li>
                <li 
                  className={`sidebar-item ${activeCollection === 'wedding' ? 'active' : ''}`}
                  onClick={() => setActiveCollection('wedding')}
                >
                  <span className="sidebar-icon">💍</span> Wedding Specials
                </li>
                <li 
                  className={`sidebar-item ${activeCollection === 'bestsellers' ? 'active' : ''}`}
                  onClick={() => setActiveCollection('bestsellers')}
                >
                  <span className="sidebar-icon">🌟</span> Best Sellers
                </li>
                <li 
                  className={`sidebar-item ${activeCollection === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveCollection('new')}
                >
                  <span className="sidebar-icon">🌿</span> New Discoveries
                </li>
              </ul>

              {/* Keep a small mini-showcase of 3 top bestsellers below navigation */}
              <div className="sidebar-bestseller-mini">
                <h4 className="font-serif" style={{ fontSize: "18px", color: "#3F3B38", marginBottom: "16px", marginTop: "40px", borderBottom: "1px solid #EBE5DB", paddingBottom: "8px" }}>
                  Trending Now
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {bestsellers.slice(0, 3).map((prod) => (
                    <div key={prod.id} style={{ display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }} onClick={() => addToBag(prod)}>
                      <div style={{ width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#F5EDE8", flexShrink: 0 }}>
                        {prod.image && <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div>
                        <h5 className="font-serif" style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#3F3B38" }}>{prod.title}</h5>
                        <span className="font-sans" style={{ fontSize: "14px", color: "#D98A9C", fontWeight: 600 }}>₹{prod.discount_price || prod.base_price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Column: Active Collection Products */}
            <div className="main-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px", borderBottom: "1px solid #EBE5DB", paddingBottom: "16px" }}>
                <h2 className="font-serif" style={{ fontSize: "36px", color: "#3F3B38", margin: 0 }}>
                  {displayTitle}
                </h2>
                <span className="font-sans" style={{ color: "#8FB9A8", fontSize: "16px", fontWeight: 600 }}>
                  {displayProducts.length} Products
                </span>
              </div>

              {displayProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", backgroundColor: "#FCFAF7", borderRadius: "15px", border: "1px dashed #D9A85C" }}>
                  <span style={{ fontSize: "40px" }}>🍃</span>
                  <p className="font-sans" style={{ color: "#8FB9A8", fontSize: "18px", marginTop: "16px" }}>
                    We are currently crafting new pieces for {displayTitle}.<br/>Please check back soon!
                  </p>
                </div>
              ) : (
                <div className="collection-products-grid">
                  {displayProducts.map((prod) => (
                    <div key={prod.id} className="collection-product-card">
                      {/* Image Column */}
                      <div className="collection-product-image">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.title} />
                        ) : (
                          <span>Product Image</span>
                        )}
                        
                        {/* Tags over image */}
                        <div className="product-tags">
                          {activeCollection === 'festive' && <span className="tag tag-festive">Festive Special</span>}
                          {activeCollection === 'wedding' && <span className="tag tag-wedding">Wedding Special</span>}
                          {activeCollection === 'new' && <span className="tag tag-new">New Discovery</span>}
                          {activeCollection === 'bestsellers' && <span className="tag tag-bestseller">Best Seller</span>}
                        </div>
                      </div>

                      {/* Details Column */}
                      <div className="collection-product-details">
                        <h3 className="font-serif detail-title">{prod.title}</h3>

                        <p className="font-sans detail-desc">
                          {prod.description || "A beautiful piece handcrafted with love and care."}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto", paddingTop: "20px" }}>
                          {prod.discount_price ? (
                            <>
                              <span className="font-serif detail-price">₹{prod.discount_price}</span>
                              <span className="font-sans detail-strike">₹{prod.base_price}</span>
                            </>
                          ) : (
                            <span className="font-serif detail-price">₹{prod.base_price}</span>
                          )}
                        </div>

                        <div style={{ marginTop: "20px" }}>
                          <button onClick={() => addToBag(prod)} className="font-sans cart-button">
                            ADD TO CART
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
          margin-bottom: 80px;
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
          grid-template-columns: 280px 1fr;
          gap: 60px;
          align-items: start;
        }

        /* Sidebar Navigation */
        .sidebar-nav {
          position: sticky;
          top: 40px;
          background-color: #FCFAF7;
          border-radius: 20px;
          padding: 30px;
          border: 1px solid #EBE5DB;
        }
        .sidebar-nav-title {
          font-size: 24px;
          color: #3F3B38;
          margin: 0 0 20px 0;
          padding-bottom: 16px;
          border-bottom: 2px dashed #EBE5DB;
        }
        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          font-family: sans-serif;
          font-size: 16px;
          font-weight: 500;
          color: #6E6E6E;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .sidebar-item:hover {
          background-color: rgba(217, 168, 92, 0.05);
          color: #D9A85C;
        }
        .sidebar-item.active {
          background-color: #fff;
          border: 1px solid #D9A85C;
          color: #D9A85C;
          box-shadow: 0 4px 10px rgba(217, 168, 92, 0.1);
        }
        .sidebar-icon {
          font-size: 18px;
        }

        /* Collection Products List */
        .collection-products-grid {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }
        .collection-product-card {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
          background-color: #fff;
          border-radius: 15px;
          border: 1px solid #F5EDE8;
          padding: 24px;
          transition: box-shadow 0.3s ease;
        }
        .collection-product-card:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        
        .collection-product-image {
          width: 100%;
          aspect-ratio: 4/5;
          background-color: #F5EDE8;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #BCAEA2;
          overflow: hidden;
          position: relative;
        }
        .collection-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .collection-product-card:hover .collection-product-image img {
          transform: scale(1.05);
        }

        .product-tags {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          font-family: sans-serif;
        }
        .tag-festive { background-color: #FFF0F4; color: #D946EF; }
        .tag-wedding { background-color: #F0F4FF; color: #3B82F6; }
        .tag-new { background-color: #F0FFF4; color: #10B981; }
        .tag-bestseller { background-color: #FFF9F0; color: #F59E0B; }

        .collection-product-details {
          display: flex;
          flex-direction: column;
        }
        
        .detail-title {
          font-size: 32px;
          line-height: 40px;
          color: #3F3B38;
          margin: 0 0 16px 0;
          font-weight: 400;
        }
        .detail-desc {
          font-size: 16px;
          line-height: 26px;
          color: #8FB9A8;
          margin: 0;
        }
        .detail-price {
          font-size: 32px;
          color: #3F3B38;
        }
        .detail-strike {
          text-decoration: line-through;
          color: #BCAEA2;
          font-size: 20px;
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
          background-color: #D9A85C;
          color: #fff;
        }

        @media (max-width: 1200px) {
          .fest-container { padding: 0 40px; }
          .layout-grid { grid-template-columns: 240px 1fr; gap: 40px; }
          .collection-product-card { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 992px) {
          .layout-grid { grid-template-columns: 1fr; gap: 60px; }
          .sidebar-nav { position: static; display: flex; flex-direction: column; }
          .sidebar-menu { flex-direction: row; flex-wrap: wrap; }
          .sidebar-item { flex: 1; min-width: 200px; justify-content: center; }
          .sidebar-bestseller-mini { display: none; }
          
          .rakhi-banner { aspect-ratio: auto; padding: 60px 40px; text-align: center; justify-content: center; }
          .banner-content { align-items: center; }
          .banner-svg-medallion { display: none; }
          .collection-product-card { grid-template-columns: 1fr; }
          .collection-product-image { max-width: 400px; margin: 0 auto; }
        }
        @media (max-width: 600px) {
          .fest-container { padding: 0 20px; }
          .banner-title { font-size: 42px; }
          .banner-desc { font-size: 18px !important; }
          .detail-title { font-size: 28px; }
          .sidebar-nav { padding: 20px 16px; }
          .sidebar-item { min-width: 100%; }
        }
      `}</style>
    </div>
  );
}
