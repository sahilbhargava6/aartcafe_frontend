"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown } from "lucide-react";

export default function FestivalSpecials() {
  const { addToBag } = useCart();
  const [reviewsExpanded1, setReviewsExpanded1] = useState(false);
  const [reviewsExpanded2, setReviewsExpanded2] = useState(false);

  const product1 = {
    id: "fest-1",
    title: "HANDMADE RAKHI",
    price: 2000,
    image: "",
    category: "Handmade Rakhis",
    description: "Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs, and sterling silver anniversary frames that track a couple's journey over time.",
  };

  const product2 = {
    id: "fest-2",
    title: "HANDMADE RAKHI",
    price: 2000,
    image: "",
    category: "Handmade Rakhis",
    description: "Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs, and sterling silver anniversary frames that track a couple's journey over time.",
  };

  const relatedProducts = [
    { id: "rel-1", title: "Wedding Frame", price: 2000, image: "" },
    { id: "rel-2", title: "Wedding Frame", price: 2000, image: "" },
    { id: "rel-3", title: "Wedding Frame", price: 2000, image: "" },
    { id: "rel-4", title: "Wedding Frame", price: 2000, image: "" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="fest-container">
          
          {/* ═══════════════════════════════════════════════════════
              HERO BANNER SECTION
              ═══════════════════════════════════════════════════════ */}
          <div className="rakhi-banner">
            {/* Banner Drop Shadow settings: X: 4, Y: 4, Blur: 4, Spread: 0, Color: #000 (Opacity 50%) */}
            
            {/* Rakhi medallion visual graphic sketch with gold braid lines */}
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
              <path d="M 90 90 L 110 110 M 110 90 L 90 110" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
            </svg>

            {/* Content box */}
            <div className="banner-content">
              <span className="font-serif banner-sub">FESTIVAL SPECIALS</span>
              <h1 className="font-serif banner-title">Raksha Bandhan</h1>
              <p
                className="font-sans banner-desc"
                style={{
                  fontSize: "24px",
                  lineHeight: "34px",
                  fontWeight: 400,
                  color: "#BCAEA2",
                  margin: 0,
                }}
              >
                Celebrating the Bond of Siblings
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              PRODUCT ROW 1: Image Left, Details Right
              ═══════════════════════════════════════════════════════ */}
          <div className="product-row row-align-left">
            {/* Left Column: Product Image */}
            <div className="product-image-container">
              Rakhi Product Image
            </div>

            {/* Right Column: Details & Reviews */}
            <div className="product-details-container">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span className="font-sans" style={{ fontSize: "16px", color: "#D98A9C", letterSpacing: "2px", fontWeight: 600 }}>
                  FESTIVAL SPECIALS
                </span>
                <h2 className="font-serif detail-title">
                  {product1.title}
                </h2>
              </div>

              <p className="font-sans detail-desc">
                {product1.description}
              </p>

              <span className="font-serif detail-price">
                ₹{product1.price}
              </span>

              <div>
                <button
                  onClick={() => addToBag(product1)}
                  className="font-sans cart-button"
                >
                  ADD TO CART
                </button>
              </div>

              {/* Collapsible Reviews block */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                <span className="font-serif review-section-label">Reviews</span>

                <div className="review-box">
                  <span className="font-serif reviewer-name">Ayush Sharma</span>
                  <p className="font-sans review-text">
                    Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs.
                  </p>
                  <div style={{ display: "flex", gap: "6px", color: "#D98A9C" }}>
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} color="#3F3B38" />
                  </div>
                </div>

                {reviewsExpanded1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="review-box">
                      <span className="font-serif reviewer-name">Aditi Roy</span>
                      <p className="font-sans review-text">
                        A beautiful Rakhi frame that will remind my brother of our bond forever. The details are absolutely stunning.
                      </p>
                      <div style={{ display: "flex", gap: "6px", color: "#D98A9C" }}>
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => setReviewsExpanded1(!reviewsExpanded1)}
                    className="review-toggle"
                  >
                    <ChevronDown size={22} style={{ transform: reviewsExpanded1 ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              PRODUCT ROW 2: Details Left (Right aligned), Image Right
              ═══════════════════════════════════════════════════════ */}
          <div className="product-row row-align-right">
            {/* Left Column: Details & Reviews (renders first in desktop DOM but placed on left) */}
            <div className="product-details-container detail-order-first">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span className="font-sans" style={{ fontSize: "16px", color: "#D98A9C", letterSpacing: "2px", fontWeight: 600 }}>
                  FESTIVAL SPECIALS
                </span>
                <h2 className="font-serif detail-title">
                  {product2.title}
                </h2>
              </div>

              <p className="font-sans detail-desc">
                {product2.description}
              </p>

              <span className="font-serif detail-price">
                ₹{product2.price}
              </span>

              <div>
                <button
                  onClick={() => addToBag(product2)}
                  className="font-sans cart-button"
                >
                  ADD TO CART
                </button>
              </div>

              {/* Collapsible Reviews block */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                <span className="font-serif review-section-label">Reviews</span>

                <div className="review-box">
                  <span className="font-serif reviewer-name">Ayush Sharma</span>
                  <p className="font-sans review-text">
                    Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs.
                  </p>
                  <div style={{ display: "flex", gap: "6px", color: "#D98A9C" }}>
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} fill="#D98A9C" />
                    <Heart size={26} color="#3F3B38" />
                  </div>
                </div>

                {reviewsExpanded2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="review-box">
                      <span className="font-serif reviewer-name">Aditi Roy</span>
                      <p className="font-sans review-text">
                        A beautiful Rakhi frame that will remind my brother of our bond forever. The details are absolutely stunning.
                      </p>
                      <div style={{ display: "flex", gap: "6px", color: "#D98A9C" }}>
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                        <Heart size={26} fill="#D98A9C" />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => setReviewsExpanded2(!reviewsExpanded2)}
                    className="review-toggle"
                  >
                    <ChevronDown size={22} style={{ transform: reviewsExpanded2 ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Product Image */}
            <div className="product-image-container detail-order-second">
              Rakhi Product Image
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              "You may also Like:" SECTION
              ═══════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px" }}>
            <h2 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
              You may also Like:
            </h2>

            <div className="related-grid">
              {relatedProducts.map((prod) => (
                <div key={prod.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "338/422",
                      backgroundColor: "#F5EDE8",
                      borderRadius: "15px",
                      boxShadow: "0px 4px 4px rgba(0,0,0,0.15)",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#BCAEA2",
                      fontSize: "14px",
                    }}
                  >
                    Product Image
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <h4 className="font-serif" style={{ fontSize: "22px", lineHeight: "30px", fontWeight: 400, color: "#3F3B38", textAlign: "center", margin: 0 }}>
                      {prod.title}
                    </h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span className="font-sans" style={{ fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
                        ₹{prod.price}
                      </span>
                      <button
                        onClick={() => addToBag({ id: prod.id, title: prod.title, price: prod.price, image: "" })}
                        className="font-sans"
                        style={{
                          background: "none",
                          border: "none",
                          borderBottom: "1px solid #3F3B38",
                          fontSize: "20px",
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
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <style jsx>{`
        .fest-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 120px;
        }
        .rakhi-banner {
          position: relative;
          width: 100%;
          aspect-ratio: 1781/723;
          background-color: #3F3B38;
          border-radius: 15px;
          display: flex;
          align-items: center;
          padding: 80px 100px;
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.5);
          margin-bottom: 80px;
          overflow: hidden;
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
        }
        .banner-sub {
          fontSize: 22px;
          color: #D9A85C;
          letterSpacing: 2px;
        }
        .banner-title {
          font-size: 72px;
          color: #fff;
          margin: 0;
          font-weight: 400;
        }
        .product-row {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 100px;
          align-items: start;
          margin-bottom: 80px;
        }
        .row-align-right {
          grid-template-columns: 1.2fr 1fr;
        }
        .product-image-container {
          width: 100%;
          max-width: 536px;
          aspect-ratio: 536/715;
          background-color: #F5EDE8;
          border-radius: 15px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #BCAEA2;
          font-size: 16px;
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
          gap: 24px;
          max-width: 600px;
          width: 100%;
        }
        .row-align-right .product-details-container {
          justify-self: end;
          text-align: right;
          align-items: flex-end;
        }
        .detail-title {
          font-size: 36px;
          line-height: 44px;
          color: #3F3B38;
          margin: 0;
          font-weight: 400;
        }
        .detail-desc {
          font-size: 22px;
          line-height: 32px;
          color: #8FB9A8;
          margin: 0;
        }
        .detail-price {
          font-size: 40px;
          line-height: 48px;
          color: #3F3B38;
        }
        .cart-button {
          width: 100%;
          height: 56px;
          border-radius: 28px;
          border: 1.5px solid #D9A85C;
          background-color: transparent;
          color: #D98A9C;
          font-size: 20px;
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
        .review-section-label {
          font-size: 22px;
          color: #3F3B38;
        }
        .review-box {
          border: 1px solid #D9A85C;
          border-radius: 15px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .row-align-right .review-box {
          align-items: flex-end;
          text-align: right;
        }
        .reviewer-name {
          font-size: 24px;
          color: #D98A9C;
          font-weight: 500;
        }
        .review-text {
          font-size: 20px;
          line-height: 30px;
          color: #8FB9A8;
          margin: 0;
        }
        .review-toggle {
          background: none;
          border: 1px solid #EBE5DB;
          width: 100%;
          height: 44px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8FB9A8;
          cursor: pointer;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        @media (max-width: 1200px) {
          .fest-container {
            padding: 0 40px;
          }
          .rakhi-banner {
            padding: 60px;
          }
          .banner-title {
            font-size: 56px;
          }
          .product-row {
            gap: 40px;
          }
        }
        @media (max-width: 992px) {
          .rakhi-banner {
            aspect-ratio: auto;
            padding: 80px 40px;
            justify-content: center;
            text-align: center;
          }
          .banner-svg-medallion {
            position: relative;
            right: 0;
            top: 0;
            transform: none;
            margin-bottom: 20px;
            width: 160px;
            height: 160px;
          }
          .banner-content {
            align-items: center;
          }
          .product-row {
            grid-template-columns: 1fr !important;
            gap: 30px;
          }
          .detail-order-first {
            order: 2;
          }
          .detail-order-second {
            order: 1;
          }
          .product-image-container {
            max-width: 320px;
            margin: 0 auto !important;
            justify-self: center !important;
          }
          .product-details-container {
            max-width: 100%;
            text-align: center !important;
            align-items: center !important;
          }
          .row-align-right .review-box {
            align-items: center;
            text-align: center;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .fest-container {
            padding: 0 16px;
          }
          .banner-title {
            font-size: 38px;
          }
          .banner-desc {
            font-size: 18px !important;
            line-height: 26px !important;
          }
          .detail-title {
            font-size: 28px !important;
          }
          .detail-desc {
            font-size: 18px !important;
            line-height: 26px !important;
          }
          .review-text {
            font-size: 16px !important;
            line-height: 24px !important;
          }
          .reviewer-name {
            font-size: 20px !important;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
