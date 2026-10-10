"use client";

import React, { useRef, useEffect } from "react";
import { useCart, formatCartTotal } from "@/context/CartContext";
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
      {/* Background Overlay (above the floating WhatsApp button, which would otherwise cover the checkout button) */}
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
          zIndex: 10000,
          transition: "opacity 0.3s ease",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Cart Drawer Content */}
      <div
        ref={drawerRef}
        className="cart-drawer"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          // Slide by its own width so it is fully off-screen at any width (it goes full-width on phones)
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          width: "450px",
          maxWidth: "100%",
          height: "100%",
          backgroundColor: "#FCFAF7",
          // Shadow only while open, otherwise it bleeds in from off-screen as a strip on the right edge
          boxShadow: isOpen ? "-5px 0 25px rgba(0, 0, 0, 0.15)" : "none",
          visibility: isOpen ? "visible" : "hidden",
          zIndex: 10001,
          display: "flex",
          flexDirection: "column",
          transition: isOpen
            ? "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0.3s",
          borderLeft: "1px solid #EBE5DB",
        }}
      >
        {/* Header */}
        <div
          className="cart-drawer-header"
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
              className="font-serif cart-drawer-title"
              style={{ fontSize: "1.5rem", fontWeight: 500, color: "#2A2A2A" }}
            >
              Your Bag
            </h2>
          </div>
          <button
            className="cart-drawer-close"
            aria-label="Close bag"
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
        <div className="cart-drawer-body" style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", padding: "1.5rem" }}>
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
                      flexShrink: 0,
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
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3
                        className="font-serif cart-drawer-item-title"
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

                    <div className="cart-drawer-item-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {/* Quantity Controls */}
                      <div
                        className="cart-drawer-qty"
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
                          className="cart-drawer-qty-btn"
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
                          className="cart-drawer-qty-btn"
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
                          {item.priceOnRequest ? "Price on request" : `₹${item.price * item.quantity}`}
                        </span>
                        <button
                          className="cart-drawer-remove"
                          aria-label="Remove item"
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
            className="cart-drawer-footer"
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
                {formatCartTotal(cart, cartTotal)}
              </span>
            </div>
            <a
              href="/cart"
              onClick={() => closeCart()}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Proceed to Checkout
            </a>
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

      <style jsx>{`
        @supports (height: 100dvh) {
          .cart-drawer {
            height: 100dvh !important;
          }
        }
        .cart-drawer-footer {
          padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px)) !important;
        }

        /* Touch screens: 40px+ tap targets */
        @media (max-width: 1024px) {
          .cart-drawer-close {
            width: 44px;
            height: 44px;
            padding: 0 !important;
            margin-right: -10px;
          }
          .cart-drawer-qty-btn {
            width: 40px !important;
            height: 40px !important;
          }
          .cart-drawer-qty {
            border-radius: 6px !important;
          }
          .cart-drawer-remove {
            width: 40px;
            height: 40px;
            padding: 0 !important;
            margin-right: -10px;
          }
          .cart-drawer-item-row {
            margin-top: 0.5rem;
            gap: 0.5rem;
          }
        }

        /* Undo the global h2/h3 clamp, which blows these up to 38px/29px on tablets */
        @media (max-width: 768px) {
          .cart-drawer-title {
            font-size: 1.5rem !important;
            line-height: 1.3 !important;
          }
          .cart-drawer-item-title {
            font-size: 1.05rem !important;
            line-height: 1.35 !important;
          }
        }

        /* Phones: full-width sheet with slightly tighter padding */
        @media (max-width: 600px) {
          .cart-drawer {
            width: 100% !important;
            border-left: none !important;
          }
          .cart-drawer-header {
            padding: 0.75rem 1rem 0.75rem 1.25rem !important;
          }
          .cart-drawer-body {
            padding: 1.25rem 1rem !important;
          }
          .cart-drawer-footer {
            padding: 1.25rem 1rem calc(1.25rem + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
      `}</style>
    </>
  );
}
