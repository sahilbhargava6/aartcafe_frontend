"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, CartItem } from "@/context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { cart, cartTotal, addToBag, removeFromBag, updateQuantity } = useCart();
  
  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRelatedItems(data.slice(0, 4));
        } else {
          setRelatedItems([
            { id: "rel-1", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
            { id: "rel-2", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
            { id: "rel-3", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
            { id: "rel-4", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
          ]);
        }
      })
      .catch((err) => console.error("Error loading related products:", err));
  }, []);

  const handleSendOrder = () => {
    if (cart.length === 0) {
      alert("Your bag is currently empty!");
      return;
    }
    const itemNames = cart.map((i) => `${i.title} (x${i.quantity})`).join(", ");
    alert(`Order List sent to Creator!\nName: ${name || "Guest"}\nEmail: ${email || "N/A"}\nPhone: ${phone || "N/A"}\nItems: ${itemNames}\nTotal: ₹${cartTotal}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="cart-container">
          
          <h1 className="font-serif page-title">
            MY BAG
          </h1>

          <div className="cart-grid">
            
            {/* ═══════════════════════════════════════════════════════
                LEFT COLUMN: CART ITEMS LIST & TOTAL
                ═══════════════════════════════════════════════════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              
              {cart.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#BCAEA2" }}>
                  <p className="font-sans" style={{ fontSize: "18px" }}>Your bag is empty.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                  {cart.map((item: CartItem) => (
                    <div key={item.id} className="cart-item">
                      {/* Product image */}
                      <div className="cart-item-image" style={{ overflow: "hidden" }}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "Image"
                        )}
                      </div>

                      {/* Details & Controls */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <h3 className="font-serif" style={{ fontSize: "24px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
                            {item.title}
                          </h3>
                          <button
                            onClick={() => removeFromBag(item.id)}
                            style={{ background: "none", border: "none", color: "#E05A47", cursor: "pointer", padding: "4px" }}
                            title="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {item.description && (
                          <p className="font-sans" style={{ fontSize: "14px", color: "#8FB9A8", margin: 0 }}>
                            {item.description}
                          </p>
                        )}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                          {/* Quantity selector */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #D9A85C", borderRadius: "20px", padding: "4px 12px" }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ background: "none", border: "none", color: "#3F3B38", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-sans" style={{ fontSize: "16px", fontWeight: 600, color: "#3F3B38" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ background: "none", border: "none", color: "#3F3B38", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <span className="font-serif" style={{ fontSize: "28px", color: "#3F3B38" }}>
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Green Dashed Line */}
              <div style={{ borderTop: "2px dashed #8FB9A8", margin: "20px 0" }} />

              {/* Total Price Section */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="font-serif" style={{ fontSize: "28px", color: "#3F3B38" }}>
                  TOTAL PRICE
                </span>
                <span className="font-serif" style={{ fontSize: "36px", color: "#3F3B38", fontWeight: 700 }}>
                  ₹{cartTotal}
                </span>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={handleSendOrder}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "24px",
                    border: "1px solid #D9A85C",
                    backgroundColor: "transparent",
                    color: "#D98A9C",
                    fontSize: "16px",
                    fontWeight: 600,
                    letterSpacing: "1px",
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
                  SEND THE ORDER LIST TO CREATOR
                </button>
              </div>

            </div>

            {/* ═══════════════════════════════════════════════════════
                RIGHT COLUMN: CONTACT FORM & SPECIFICATIONS CARD
                ═══════════════════════════════════════════════════════ */}
            <div className="summary-card">
              {/* Form text with inline green pill inputs */}
              <p
                className="font-sans inline-inputs-text"
                style={{
                  fontSize: "20px",
                  lineHeight: "36px",
                  color: "#3F3B38",
                  margin: 0,
                }}
              >
                Hello, I'm{" "}
                <input
                  type="text"
                  placeholder="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    border: "1.5px solid #8FB9A8",
                    borderRadius: "20px",
                    padding: "0 15px",
                    height: "32px",
                    fontSize: "16px",
                    color: "#3F3B38",
                    outline: "none",
                    width: "160px",
                    textAlign: "center",
                  }}
                />
                . My email address is{" "}
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    border: "1.5px solid #8FB9A8",
                    borderRadius: "20px",
                    padding: "0 15px",
                    height: "32px",
                    fontSize: "16px",
                    color: "#3F3B38",
                    outline: "none",
                    width: "200px",
                    textAlign: "center",
                  }}
                />
                , and my number is{" "}
                <input
                  type="tel"
                  placeholder="phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    border: "1.5px solid #8FB9A8",
                    borderRadius: "20px",
                    padding: "0 15px",
                    height: "32px",
                    fontSize: "16px",
                    color: "#3F3B38",
                    outline: "none",
                    width: "160px",
                    textAlign: "center",
                  }}
                />
                .
              </p>

              {/* Order spec list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "2px solid #D9A85C", paddingLeft: "20px" }}>
                <span className="font-sans" style={{ fontSize: "20px", fontWeight: 600, color: "#3F3B38" }}>
                  This is my order:
                </span>
                
                {cart.length === 0 ? (
                  <span className="font-sans" style={{ fontSize: "16px", color: "#6E6E6E" }}>
                    No items selected yet.
                  </span>
                ) : (
                  cart.map((item: CartItem, index: number) => (
                    <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="font-sans" style={{ fontSize: "16px", color: "#3F3B38", fontWeight: 500 }}>
                        {index + 1}. {item.title} (x{item.quantity}) — ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════
              "You may also like:" SECTION
              ═══════════════════════════════════════════════════════ */}
          <div style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px" }}>
            <h2 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
              You may also like:
            </h2>

            <div className="related-grid">
              {relatedItems.map((prod: any) => (
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
                      overflow: "hidden",
                    }}
                  >
                    {prod.image ? (
                      <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "Product Image"
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <h4 className="font-serif" style={{ fontSize: "22px", lineHeight: "30px", fontWeight: 400, color: "#3F3B38", textAlign: "center", margin: 0 }}>
                      {prod.title}
                    </h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span className="font-sans" style={{ fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
                        ₹{prod.base_price ?? prod.price}
                      </span>
                      <button
                        onClick={() => addToBag({ id: prod.id, title: prod.title, price: prod.base_price ?? prod.price, image: prod.image || "" })}
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
        .cart-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 120px;
        }
        .cart-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 80px;
          align-items: start;
          margin-bottom: 80px;
        }
        .cart-item {
          display: flex;
          gap: 30px;
          align-items: flex-start;
        }
        .cart-item-image {
          width: 160px;
          height: 213px;
          background-color: #F5EDE8;
          border-radius: 15px;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justifyContent: center;
          color: #BCAEA2;
          font-size: 14px;
          flex-shrink: 0;
        }
        .summary-card {
          border: 1.5px solid #D98A9C;
          border-radius: 15px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          background-color: #fff;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.02);
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        @media (max-width: 1200px) {
          .cart-container {
            padding: 0 40px;
          }
          .cart-grid {
            gap: 40px;
          }
        }
        @media (max-width: 992px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .cart-container {
            padding: 0 16px;
          }
          .page-title {
            font-size: 28px !important;
            margin-bottom: 24px !important;
          }
          .cart-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .cart-item-image {
            width: 100%;
            max-width: 240px;
            aspect-ratio: 160/213;
            height: auto;
          }
          .summary-card {
            padding: 24px 16px;
          }
          .inline-inputs-text {
            font-size: 16px !important;
            line-height: 28px !important;
          }
          .inline-inputs-text input {
            margin: 4px 0;
            width: 100% !important;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
