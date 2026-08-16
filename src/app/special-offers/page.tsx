"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function SpecialOffers() {
  const { addToBag } = useCart();

  const products = [
    {
      id: "so-1",
      title: "HANDMADE RAKHI",
      price: 2000,
      image: "",
      description: "Handcrafted with love, designed to celebrate the timeless bond between siblings.",
    },
    {
      id: "so-2",
      title: "HANDMADE RAKHI",
      price: 2000,
      image: "",
      description: "Handcrafted with love, designed to celebrate the timeless bond between siblings.",
    },
    {
      id: "so-3",
      title: "HANDMADE RAKHI",
      price: 2000,
      image: "",
      description: "Handcrafted with love, designed to celebrate the timeless bond between siblings.",
    },
    {
      id: "so-4",
      title: "HANDMADE RAKHI",
      price: 2000,
      image: "",
      description: "Handcrafted with love, designed to celebrate the timeless bond between siblings.",
    },
  ];

  const relatedItems = [
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
        <div className="offers-container">
          
          {/* ═══════════════════════════════════════════════════════
              HEADER SECTION: SPRING SALE BANNER + 2 SIDE CARDS
              ═══════════════════════════════════════════════════════ */}
          <div className="banner-grid">
            
            {/* Left Box: Spring Sale Banner */}
            <div className="spring-banner">
              {/* Corner Floral SVGs */}
              <svg className="floral-svg-left" width="120" height="120" viewBox="0 0 100 100">
                <path d="M10 90 Q30 60 40 40 T90 10" stroke="#8FB9A8" strokeWidth="2" fill="none" />
                <circle cx="30" cy="70" r="10" fill="#D98A9C" opacity="0.8" />
                <circle cx="45" cy="55" r="8" fill="#D98A9C" opacity="0.8" />
                <circle cx="20" cy="80" r="12" fill="#D98A9C" opacity="0.8" />
              </svg>
              <svg className="floral-svg-right" width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="25" fill="#EFD3C7" opacity="0.75" />
                <circle cx="65" cy="35" r="15" fill="#D98A9C" opacity="0.7" />
                <path d="M20 80 Q40 50 60 40" stroke="#8FB9A8" strokeWidth="2" fill="none" />
              </svg>

              <span className="font-sans font-bold" style={{ fontSize: "16px", letterSpacing: "3px", color: "#3F3B38", marginBottom: "16px" }}>
                SPECIAL OFFER
              </span>
              <h1 className="font-serif spring-title">
                SPRING SALE
              </h1>
              <p className="font-sans banner-desc" style={{ fontSize: "16px", color: "#8FB9A8", maxWidth: "600px", lineHeight: "26px", margin: "0 0 24px 0" }}>
                Spring has arrived when you can stand on three daisies. Put a discount in your shopping basket.
              </p>
              <div
                style={{
                  border: "1px solid #D9A85C",
                  borderRadius: "4px",
                  padding: "8px 24px",
                  fontSize: "16px",
                  color: "#D9A85C",
                  display: "inline-block",
                  marginBottom: "20px",
                }}
              >
                23 September - 22 December
              </div>
              <span className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", opacity: 0.7 }}>
                @reallygreatsite
              </span>
            </div>

            {/* Right Column: Stacked 2 Cards */}
            <div className="cards-stack">
              
              {/* Card 1: Gold 50% OFF */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#D9A85C",
                  borderRadius: "15px",
                  padding: "20px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}
              >
                {/* Background Text "Offer" */}
                <span className="font-serif" style={{ position: "absolute", left: "12px", top: "12px", fontSize: "48px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                  Offer
                </span>
                
                {/* Right Top 50% OFF */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%" }}>
                  <span className="font-serif" style={{ fontSize: "40px", fontWeight: 700, color: "#fff", lineHeight: "40px" }}>50%</span>
                  <span className="font-sans" style={{ fontSize: "14px", color: "#fff", letterSpacing: "2px" }}>OFF</span>
                </div>

                {/* Center Shoes Image placeholder */}
                <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                  <div style={{ width: "120px", height: "90px", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#D9A85C", fontSize: "12px" }}>
                    Image
                  </div>
                </div>

                {/* Bottom Shop Now action */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span className="font-sans" style={{ fontSize: "12px", color: "#fff", borderBottom: "1.5px solid #fff", paddingBottom: "2px", letterSpacing: "2px", cursor: "pointer", fontWeight: 600 }}>
                    SHOP NOW
                  </span>
                </div>
              </div>

              {/* Card 2: Green Special Offer */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#8FB9A8",
                  borderRadius: "15px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    border: "2px solid #D9A85C",
                    borderRadius: "8px",
                    padding: "24px 20px",
                    backgroundColor: "#fff",
                    textAlign: "center",
                    width: "90%",
                  }}
                >
                  <span className="font-sans" style={{ fontSize: "10px", color: "#3F3B38", borderBottom: "1px solid #3F3B38", paddingBottom: "2px", letterSpacing: "2px", fontWeight: 700, display: "inline-block", marginBottom: "12px" }}>
                    SHOP NOW
                  </span>
                  <h4 className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: "0 0 6px 0", letterSpacing: "1px" }}>
                    SPECIAL OFFER
                  </h4>
                  <p className="font-sans" style={{ fontSize: "12px", color: "#8FB9A8", fontWeight: 600, margin: 0, letterSpacing: "1px" }}>
                    SAVE UP TO 40%
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════
              PRODUCT GRID SECTION: 2x2 HANDMADE RAKHIS
              ═══════════════════════════════════════════════════════ */}
          <div className="products-grid">
            {products.map((prod) => (
              <div key={prod.id} className="prod-card">
                
                {/* Left side: Small Image Frame */}
                <div className="prod-image-box">
                  Image
                </div>

                {/* Right side: Product details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h3 className="font-serif" style={{ fontSize: "24px", color: "#3F3B38", margin: 0 }}>
                    {prod.title}
                  </h3>
                  <p className="font-sans" style={{ fontSize: "14px", color: "#8FB9A8", lineHeight: "20px", margin: 0 }}>
                    {prod.description}
                  </p>
                  <span className="font-serif" style={{ fontSize: "28px", color: "#3F3B38" }}>
                    ₹{prod.price}
                  </span>
                  
                  {/* Add to Cart Button */}
                  <div>
                    <button
                      onClick={() => addToBag(prod)}
                      style={{
                        width: "100%",
                        height: "36px",
                        borderRadius: "18px",
                        border: "1px solid #D9A85C",
                        backgroundColor: "transparent",
                        color: "#D98A9C",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(217, 138, 156, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════
              WEDDING SPECIALS SECTION
              ═══════════════════════════════════════════════════════ */}
          <div className="wedding-section">
            
            {/* Left side: Wedding Mandala Vector */}
            <div className="mandala-container">
              <svg className="mandala-svg" width="550" height="550" viewBox="0 0 400 400" fill="none">
                <circle cx="200" cy="200" r="180" stroke="#8FB9A8" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="200" cy="200" r="160" stroke="#8FB9A8" strokeWidth="1.5" />
                <circle cx="200" cy="200" r="130" stroke="#8FB9A8" strokeWidth="1" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  return (
                    <path
                      key={i}
                      d="M200 200 C230 140, 230 260, 200 200"
                      stroke="#8FB9A8"
                      strokeWidth="1"
                      transform={`rotate(${angle} 200 200)`}
                    />
                  );
                })}
                <circle cx="200" cy="200" r="70" stroke="#D9A85C" strokeWidth="2" />
                <g transform="translate(140, 140)" stroke="#3F3B38" strokeWidth="1.5" fill="none" strokeLinecap="round">
                  <path d="M 40 40 C 30 20, 90 20, 80 40 Z" fill="#EFD3C7" />
                  <path d="M 20 80 Q 60 50 100 80" stroke="#D98A9C" strokeWidth="2" />
                  <circle cx="60" cy="30" r="8" fill="#FFF" />
                </g>
              </svg>
            </div>

            {/* Right side: Wedding Frames details */}
            <div className="wedding-details" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <span className="font-serif" style={{ fontSize: "28px", color: "#D9A85C", letterSpacing: "1px", margin: 0 }}>
                WEDDING SPECIALS
              </span>
              <h3 className="font-serif" style={{ fontSize: "36px", color: "#3F3B38", margin: 0 }}>
                WEDDING FRAMES
              </h3>

              {/* Row of 3 square couple thumbnails */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      backgroundColor: "#F5EDE8",
                      borderRadius: "15px",
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#BCAEA2",
                      fontSize: "12px",
                    }}
                  >
                    Couple Frame
                  </div>
                ))}
              </div>

              <p className="font-sans" style={{ fontSize: "16px", color: "#8FB9A8", lineHeight: "26px", margin: 0 }}>
                Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs, and sterling silver anniversary frames that track a couple's journey over time.
              </p>

              <span className="font-serif" style={{ fontSize: "36px", color: "#3F3B38" }}>
                ₹2000
              </span>

              <div>
                <button
                  style={{
                    height: "44px",
                    padding: "0 40px",
                    borderRadius: "22px",
                    border: "1px solid #D9A85C",
                    backgroundColor: "transparent",
                    color: "#D98A9C",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(217, 138, 156, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  MORE DETAILS
                </button>
              </div>

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
              {relatedItems.map((prod) => (
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
        .offers-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 120px;
        }
        .banner-grid {
          display: grid;
          grid-template-columns: 2.4fr 1fr;
          gap: 30px;
          margin-bottom: 80px;
        }
        .spring-banner {
          position: relative;
          width: 100%;
          aspect-ratio: 1150/460;
          background-color: #fff;
          border: 6px solid #D98A9C;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          overflow: hidden;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
        }
        .spring-title {
          font-size: 72px;
          line-height: 80px;
          color: #3F3B38;
          margin: 0 0 16px 0;
          letter-spacing: 2px;
        }
        .floral-svg-left {
          position: absolute;
          left: -10px;
          bottom: -10px;
          opacity: 0.9;
        }
        .floral-svg-right {
          position: absolute;
          right: 10px;
          top: 10px;
          opacity: 0.9;
        }
        .cards-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px 40px;
          margin-bottom: 80px;
        }
        .prod-card {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 30px;
          align-items: center;
        }
        .prod-image-box {
          width: 100%;
          aspect-ratio: 216/288;
          background-color: #F5EDE8;
          border-radius: 15px;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #BCAEA2;
          font-size: 14px;
        }
        .wedding-section {
          border-top: 1px solid #EBE5DB;
          padding-top: 60px;
          margin-bottom: 80px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .mandala-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .mandala-svg {
          max-width: 100%;
          height: auto;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        @media (max-width: 1200px) {
          .offers-container {
            padding: 0 40px;
          }
          .spring-title {
            font-size: 48px;
            line-height: 56px;
          }
          .wedding-section {
            gap: 40px;
          }
        }
        @media (max-width: 992px) {
          .banner-grid {
            grid-template-columns: 1fr;
          }
          .spring-banner {
            aspect-ratio: auto;
            padding: 60px 20px;
          }
          .products-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .wedding-section {
            grid-template-columns: 1fr;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .offers-container {
            padding: 0 16px;
          }
          .spring-title {
            font-size: 32px;
            line-height: 40px;
          }
          .banner-desc {
            font-size: 14px !important;
            line-height: 22px !important;
          }
          .floral-svg-left, .floral-svg-right {
            width: 80px;
            height: 80px;
          }
          .prod-card {
            grid-template-columns: 1fr;
          }
          .prod-image-box {
            max-width: 240px;
            margin: 0 auto;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
