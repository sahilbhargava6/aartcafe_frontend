"use client";

import React, { useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeFromBag, cartTotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Background Overlay */}
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={closeCart}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1000,
          transition: "opacity 0.3s ease",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Cart Drawer Content */}
      <div
        ref={drawerRef}
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : "-450px",
          width: "450px",
          maxWidth: "100%",
          height: "100%",
          backgroundColor: "#FCFAF7",
          boxShadow: "-5px 0 25px rgba(0, 0, 0, 0.15)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          transition: "right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          borderLeft: "1px solid #EBE5DB",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #EBE5DB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={20} color="#2A2A2A" />
            <h2
              className="font-serif"
              style={{ fontSize: "1.5rem", fontWeight: 500, color: "#2A2A2A" }}
            >
              Your Bag
            </h2>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EBE5DB")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X size={20} color="#2A2A2A" />
          </button>
        </div>

        {/* Item List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {cart.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                color: "#6E6E6E",
              }}
            >
              <ShoppingBag size={48} strokeWidth={1} />
              <p style={{ fontSize: "1.1rem" }}>Your bag is empty.</p>
              <button
                onClick={closeCart}
                className="underline-link"
                style={{ fontSize: "0.95rem" }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    paddingBottom: "1.5rem",
                    borderBottom: "1px solid #EBE5DB",
                  }}
                >
                  {/* Image Placeholder */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#FAF6F0",
                      border: "1px solid #EBE5DB",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#C88E56",
                      fontWeight: 500,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "Frame"
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3
                        className="font-serif"
                        style={{ fontSize: "1.1rem", color: "#2A2A2A", marginBottom: "0.25rem" }}
                      >
                        {item.title}
                      </h3>
                      {item.category && (
                        <p style={{ fontSize: "0.8rem", color: "#6E6E6E", textTransform: "capitalize" }}>
                          {item.category}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #EBE5DB",
                          borderRadius: "4px",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            border: "none",
                            background: "none",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ width: "24px", textAlign: "center", fontSize: "0.85rem", fontWeight: 500 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            border: "none",
                            background: "none",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "1rem", color: "#2A2A2A" }}>
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromBag(item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#D98A8A",
                            padding: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Subtotal */}
        {cart.length > 0 && (
          <div
            style={{
              padding: "1.5rem",
              borderTop: "1px solid #EBE5DB",
              backgroundColor: "#FAF6F0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#6E6E6E" }}>Subtotal</span>
              <span className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 600, color: "#2A2A2A" }}>
                ₹{cartTotal}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onClick={() => alert("Checkout flow is simulated! Thank you.")}
            >
              Proceed to Checkout
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#6E6E6E",
                marginTop: "0.75rem",
              }}
            >
              Shipping and taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
