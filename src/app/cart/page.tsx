"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useCart, CartItem, formatCartTotal } from "@/context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { cart, cartTotal, addToBag, removeFromBag, updateQuantity, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
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

  const handleSendOrder = async () => {
    if (cart.length === 0) {
      alert("Your bag is currently empty!");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your Name before sending the order.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your Phone Number before sending the order.");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    // Save the order first. The server prices every item itself, so the
    // WhatsApp message below uses the saved order, not the cart's prices.
    let order: any;
    try {
      const res = await fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_email: email.trim() || null,
          customer_phone: phone.trim(),
          items: cart.map((item) => ({
            id: item.id,
            product_id: item.productId,
            option_ids: item.optionIds,
            quantity: item.quantity,
            price_on_request: item.priceOnRequest || undefined,
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const firstError = data?.errors ? (Object.values(data.errors)[0] as string[])?.[0] : null;
        alert(firstError || data?.message || "We couldn't place your order. Please try again.");
        setSubmitting(false);
        return;
      }
      order = data.order;
    } catch (err) {
      console.error("Failed to save order:", err);
      alert("We couldn't reach our server to place your order. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    const orderTotal = Number(order.total_amount);
    if (Math.abs(orderTotal - cartTotal) >= 0.01) {
      alert(`Some prices in your bag have been updated. Your order total is ₹${orderTotal}.`);
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919267943830"; // Business WhatsApp Number (+91 9267943830)

    const itemDetails = (order.items as { title: string; price: number; quantity: number; price_on_request?: boolean }[])
      .map((item, idx) => {
        const titleClean = item.title
          .replace(/\b(NA|N\/A|none|null|-)\b,?\s*/gi, "")
          .replace(/,\s*,/g, ", ")
          .replace(/\(\s*,/g, "(")
          .replace(/,\s*\)/g, ")")
          .replace(/\(\s*\)/g, "")
          .trim();

        return `*${idx + 1}. ${titleClean}*\n   ▫️ Quantity: ${item.quantity}\n   ▫️ Price: ${item.price_on_request ? "On request" : `₹${item.price * item.quantity}`}`;
      })
      .join("\n\n");

    const messageLines = [
      "✨ *NEW ORDER - AARTCAFE* ✨",
      "━━━━━━━━━━━━━━━━━━",
      `🧾 *Order Reference:* #AART-${order.id}`,
      "*Customer Details:*",
      `👤 *Name:* ${name.trim() || "Customer"}`,
      `📧 *Email:* ${email.trim() || "N/A"}`,
      `📞 *Phone:* ${phone.trim() || "N/A"}`,
      "━━━━━━━━━━━━━━━━━━",
      "*Order Items:*",
      itemDetails,
      "━━━━━━━━━━━━━━━━━━",
      `💳 *TOTAL AMOUNT:* ₹${orderTotal}${order.items.some((i: { price_on_request?: boolean }) => i.price_on_request) ? " + items priced on request" : ""}`,
      "━━━━━━━━━━━━━━━━━━",
      "Hello Aartcafe! I would like to confirm my order. Please share availability & payment details. Thank you! 💕"
    ];

    const message = messageLines.join("\n");
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

    if (attachedImage) {
      alert("Since WhatsApp web links don't allow automatic image attachments, please attach your image manually once WhatsApp opens, or paste it into the chat!");
    }

    clearCart();
    window.location.href = whatsappUrl;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />

      <main className="cart-main" style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="cart-container">

          <h1 className="font-serif page-title">
            MY BAG
          </h1>

          <div className="cart-grid">

            {/* ═══════════════════════════════════════════════════════
                LEFT COLUMN: CART ITEMS LIST & TOTAL
                (on stacked layouts its children join the grid so the
                send button can follow the customer details form)
                ═══════════════════════════════════════════════════════ */}
            <div className="cart-left" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

              {cart.length === 0 ? (
                <div className="cart-empty" style={{ padding: "40px 0", textAlign: "center", color: "#BCAEA2" }}>
                  <p className="font-sans" style={{ fontSize: "18px" }}>Your bag is empty.</p>
                </div>
              ) : (
                <div className="cart-items" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
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
                      <div className="cart-item-details" style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <h3 className="font-serif cart-item-title" style={{ fontSize: "24px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
                            {item.title}
                          </h3>
                          <button
                            className="cart-item-remove"
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

                        <div className="cart-item-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                          {/* Quantity selector */}
                          <div className="qty-control" style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #D9A85C", borderRadius: "20px", padding: "4px 12px" }}>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ background: "none", border: "none", color: "#3F3B38", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-sans qty-value" style={{ fontSize: "16px", fontWeight: 600, color: "#3F3B38" }}>
                              {item.quantity}
                            </span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ background: "none", border: "none", color: "#3F3B38", cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <span className="font-serif cart-item-price" style={{ fontSize: "28px", color: "#3F3B38" }}>
                            {item.priceOnRequest ? "Price on request" : `₹${item.price * item.quantity}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Green Dashed Line */}
              <div className="cart-divider" style={{ borderTop: "2px dashed #8FB9A8", margin: "20px 0" }} />

              {/* Total Price Section */}
              <div className="cart-total" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="font-serif cart-total-label" style={{ fontSize: "28px", color: "#3F3B38" }}>
                  TOTAL PRICE
                </span>
                <span className="font-serif cart-total-value" style={{ fontSize: "36px", color: "#3F3B38", fontWeight: 700 }}>
                  {formatCartTotal(cart, cartTotal)}
                </span>
              </div>

              {/* Action Button */}
              <div className="cart-send">
                <button
                  onClick={handleSendOrder}
                  disabled={submitting}
                  style={{
                    opacity: submitting ? 0.6 : 1,
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
                >{submitting ? "PLACING ORDER..." : "SEND THE ORDER LIST"}
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
                {/* Each input is kept on one line with the punctuation that follows it */}
                <span className="input-chunk">
                  <input
                    type="text"
                    placeholder="Name (Required)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      border: !name.trim() ? "1.5px solid #D98A9C" : "1.5px solid #8FB9A8",
                      borderRadius: "20px",
                      padding: "0 15px",
                      height: "32px",
                      fontSize: "15px",
                      color: "#3F3B38",
                      outline: "none",
                      width: "160px",
                      textAlign: "center",
                    }}
                  />.
                </span>{" "}
                My email address is{" "}
                <span className="input-chunk">
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      border: "1.5px solid #8FB9A8",
                      borderRadius: "20px",
                      padding: "0 15px",
                      height: "32px",
                      fontSize: "15px",
                      color: "#3F3B38",
                      outline: "none",
                      width: "180px",
                      textAlign: "center",
                    }}
                  />,
                </span>{" "}
                and my number is{" "}
                <span className="input-chunk">
                  <input
                    type="tel"
                    placeholder="Phone (Required)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      border: !phone.trim() ? "1.5px solid #D98A9C" : "1.5px solid #8FB9A8",
                      borderRadius: "20px",
                      padding: "0 15px",
                      height: "32px",
                      fontSize: "15px",
                      color: "#3F3B38",
                      outline: "none",
                      width: "170px",
                      textAlign: "center",
                    }}
                  />.
                </span>
              </p>

              {/* Attach Image Option */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <span className="font-sans" style={{ fontSize: "16px", color: "#6E6E6E", fontWeight: 500 }}>
                  Attach Reference Image (Optional)
                </span>
                <label
                  className="attach-label"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "10px", borderRadius: "10px", border: "1.5px dashed #D9A85C",
                    backgroundColor: "#FFFDF9", cursor: "pointer", color: "#D9A85C", fontSize: "14px", fontWeight: 500
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setAttachedImage(e.target.files[0]);
                      }
                    }}
                  />
                  <Plus size={16} />
                  {attachedImage ? attachedImage.name : "Choose an Image"}
                </label>
                {attachedImage && (
                  <span style={{ fontSize: "12px", color: "#8FB9A8" }}>
                    * Image will need to be manually sent in WhatsApp.
                  </span>
                )}
              </div>

              {/* Order spec list */}
              <div className="order-spec" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "2px solid #D9A85C", paddingLeft: "20px" }}>
                <span className="font-sans order-spec-title" style={{ fontSize: "20px", fontWeight: 600, color: "#3F3B38" }}>
                  This is my order:
                </span>

                {cart.length === 0 ? (
                  <span className="font-sans" style={{ fontSize: "16px", color: "#6E6E6E" }}>
                    No items selected yet.
                  </span>
                ) : (
                  cart.map((item: CartItem, index: number) => (
                    <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="font-sans order-spec-item" style={{ fontSize: "16px", color: "#3F3B38", fontWeight: 500 }}>
                        {index + 1}. {item.title} (x{item.quantity}) — {item.priceOnRequest ? "Price on request" : `₹${item.price * item.quantity}`}
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
          <div className="related-section" style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px" }}>
            <h2 className="font-serif related-title" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
              You may also like:
            </h2>

            <div className="related-grid">
              {relatedItems.map((prod: any) => (
                <div key={prod.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                  <div
                    className="related-image"
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
                  <div className="related-body" style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <Link href={prod.slug ? `/shop/${prod.slug}` : `/shop/${prod.id}`} style={{ textDecoration: 'none' }}>
                      <h4 className="font-serif related-card-title" style={{ fontSize: "22px", lineHeight: "30px", fontWeight: 400, color: "#3F3B38", textAlign: "center", margin: 0 }}>
                        {prod.title}
                      </h4>
                    </Link>
                    <div className="related-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span className="font-sans related-price" style={{ fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
                        ₹{prod.base_price ?? prod.price}
                      </span>
                      <button
                        onClick={() => addToBag({ id: prod.id, title: prod.title, price: prod.base_price ?? prod.price, image: prod.image || "" })}
                        className="font-sans related-add"
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
        .page-title {
          font-size: 36px;
          line-height: 1.2;
          font-weight: 400;
          color: #3F3B38;
          margin: 0 0 40px;
        }
        .cart-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 80px;
          align-items: start;
          margin-bottom: 80px;
        }
        .cart-left {
          min-width: 0;
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
          justify-content: center;
          color: #BCAEA2;
          font-size: 14px;
          flex-shrink: 0;
        }
        .cart-item-details {
          min-width: 0;
        }
        .input-chunk {
          white-space: nowrap;
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
          grid-template-columns: repeat(4, minmax(0, 1fr));
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

        /* Touch screens (phones, tablets, iPad): 40px+ tap targets, 16px inputs */
        @media (max-width: 1024px) {
          .qty-control {
            padding: 0 !important;
            gap: 0 !important;
          }
          .qty-btn {
            width: 40px;
            height: 40px;
            justify-content: center;
          }
          .qty-value {
            min-width: 24px;
            text-align: center;
          }
          .cart-item-remove {
            width: 40px;
            height: 40px;
            padding: 0 !important;
            margin: -8px -8px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .inline-inputs-text input {
            height: 44px !important;
            font-size: 16px !important;
            margin: 4px 0;
          }
          .attach-label {
            min-height: 44px;
          }
          .related-row {
            align-items: flex-end !important;
          }
          .related-add {
            padding-top: 10px !important;
          }
          /* Taller hit area for the product-title links without shifting the layout */
          .related-body > :global(a) {
            display: block;
            padding: 9px 0;
            margin: -9px 0;
          }
        }

        /* Phones & tablets: one column, and the send button moves below the details form */
        @media (max-width: 992px) {
          .cart-grid {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 32px;
            margin-bottom: 64px;
          }
          .cart-left {
            display: contents !important;
          }
          .cart-divider {
            margin: 0 !important;
          }
          .summary-card {
            order: 1;
          }
          .cart-send {
            order: 2;
          }
          .related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          /* Keep price rows lined up across a row of cards when titles wrap differently */
          .related-body {
            flex: 1;
          }
          .related-row {
            margin-top: auto;
          }
        }

        /* Undo the global h1/h2/h3 clamp, which inflates these headings on tablets */
        @media (max-width: 768px) {
          .cart-main {
            padding: 32px 0 64px !important;
          }
          .page-title {
            font-size: 30px !important;
            line-height: 1.2 !important;
            margin-bottom: 28px !important;
          }
          .cart-item-title {
            font-size: 22px !important;
            line-height: 1.3 !important;
          }
          .cart-item-price {
            font-size: 24px !important;
          }
          .cart-total-label {
            font-size: 24px !important;
          }
          .cart-total-value {
            font-size: 30px !important;
          }
          .related-section {
            padding-top: 48px !important;
          }
          .related-title {
            font-size: 26px !important;
            line-height: 1.3 !important;
            margin-bottom: 28px !important;
          }
        }

        /* Phones: compact rows (small thumbnail beside the details) */
        @media (max-width: 600px) {
          .cart-container {
            padding: 0 16px;
          }
          .cart-main {
            padding: 24px 0 48px !important;
          }
          .page-title {
            font-size: 28px !important;
            margin-bottom: 24px !important;
          }
          .cart-grid {
            gap: 28px;
            margin-bottom: 48px;
          }
          .cart-items {
            gap: 24px !important;
          }
          .cart-item {
            gap: 14px;
          }
          .cart-item-image {
            width: 96px;
            height: 128px;
            border-radius: 12px;
            font-size: 12px;
          }
          .cart-item-details {
            gap: 6px !important;
          }
          .cart-item-title {
            font-size: 17px !important;
            line-height: 1.35 !important;
          }
          .cart-item-row {
            margin-top: 6px !important;
            flex-wrap: wrap;
            gap: 8px 12px;
          }
          .cart-item-price {
            font-size: 20px !important;
          }
          .cart-total {
            flex-wrap: wrap;
            gap: 4px 12px;
          }
          .cart-total-label {
            font-size: 20px !important;
          }
          .cart-total-value {
            font-size: 26px !important;
          }
          .summary-card {
            padding: 24px 16px;
            gap: 20px;
            border-radius: 14px;
          }
          .inline-inputs-text {
            font-size: 16px !important;
            line-height: 28px !important;
          }
          /* Full-width inputs, leaving room for the "." / "," that follows each one */
          .inline-inputs-text input {
            width: calc(100% - 10px) !important;
          }
          .order-spec {
            padding-left: 14px !important;
          }
          .order-spec-title {
            font-size: 18px !important;
          }
          .order-spec-item {
            font-size: 15px !important;
          }
          .related-section {
            padding-top: 40px !important;
          }
          .related-title {
            font-size: 24px !important;
            margin-bottom: 20px !important;
          }
          .related-grid {
            gap: 24px 14px;
          }
          .related-image {
            margin-bottom: 10px !important;
            border-radius: 12px !important;
          }
          .related-card-title {
            font-size: 16px !important;
            line-height: 22px !important;
          }
          .related-row {
            flex-wrap: wrap;
            gap: 0 8px;
          }
          .related-price,
          .related-add {
            font-size: 15px !important;
          }
          .related-add {
            padding-top: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
