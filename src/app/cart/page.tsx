"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useCart, CartItem, formatCartTotal } from "@/context/CartContext";
import { salePrice, originalPrice, formatRupees } from "@/lib/price";
import { Trash2, Plus, Minus, Check, Image as ImageIcon, MessageCircle, Copy, CheckCircle2 } from "lucide-react";
import { openWhatsApp, getWhatsAppUrls } from "@/lib/whatsapp";

export default function CartPage() {
  const { cart, cartTotal, addToBag, removeFromBag, updateQuantity, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919267943830";
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: number;
    message: string;
    total: number;
    urls: {
      web: string;
      intent: string;
      native: string;
      direct: string;
    };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedReferenceImage, setSelectedReferenceImage] = useState<string | null>(null);
  const [customRequest, setCustomRequest] = useState("");
  const [productsMap, setProductsMap] = useState<Record<number, any>>({});
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  // Load related items
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

  // Fetch product data for all cart items to obtain their complete galleries
  useEffect(() => {
    const productIds = Array.from(
      new Set(
        cart
          .map((item) => {
            if (item.productId) return item.productId;
            const match = String(item.id).match(/^\d+/);
            return match ? Number(match[0]) : null;
          })
          .filter((id): id is number => typeof id === "number" && !isNaN(id))
      )
    );

    const neededIds = productIds.filter((id) => !productsMap[id]);
    if (neededIds.length === 0) return;

    neededIds.forEach((id) => {
      fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((product) => {
          if (product && product.id) {
            setProductsMap((prev) => ({ ...prev, [product.id]: product }));
          }
        })
        .catch((err) => console.error(`Error fetching gallery for product ${id}:`, err));
    });
  }, [cart, productsMap]);

  // Aggregate all gallery photos from products currently in the cart
  const availableGalleryPhotos = useMemo(() => {
    const photos: string[] = [];
    const seen = new Set<string>();

    const addPhoto = (url: unknown) => {
      if (typeof url !== "string") return;
      const clean = url.trim();
      if (!clean || clean.startsWith("data:") || clean.startsWith("[") || seen.has(clean)) return;
      seen.add(clean);
      photos.push(clean);
    };

    // First collect all images from detailed products
    cart.forEach((item) => {
      const match = String(item.id).match(/^\d+/);
      const prodId = item.productId || (match ? Number(match[0]) : null);
      const prod = prodId ? productsMap[prodId] : null;

      if (prod) {
        addPhoto(prod.image);
        let extra = prod.images;
        if (typeof extra === "string") {
          try {
            extra = JSON.parse(extra);
          } catch {
            if (extra.includes(",")) extra = extra.split(",").map((s: string) => s.trim());
            else if (extra && !extra.startsWith("[")) extra = [extra];
          }
        }
        if (Array.isArray(extra)) {
          extra.forEach(addPhoto);
        }
      }

      // Also ensure item.image itself is available
      if (item.image) {
        addPhoto(item.image);
      }
    });

    return photos;
  }, [cart, productsMap]);

  // If selected reference image is no longer in available gallery photos, auto-clear or keep
  useEffect(() => {
    if (selectedReferenceImage && !availableGalleryPhotos.includes(selectedReferenceImage)) {
      setSelectedReferenceImage(null);
    }
  }, [availableGalleryPhotos, selectedReferenceImage]);

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

    // Reference photo chosen from the gallery of products in the cart
    const referenceImage: string | null = selectedReferenceImage || null;

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
            // Photos stored as data: URLs are too big to send and can't go in the WhatsApp message anyway
            image: item.image && !item.image.startsWith("data:") ? item.image : undefined,
          })),
          reference_image: referenceImage,
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

    // Ensure all products are loaded in productsMap so we have full attributes and free delivery flags
    const currentProductsMap: Record<number, any> = { ...productsMap };
    const missingProductIds = cart
      .map((item) => {
        if (item.productId) return item.productId;
        const match = String(item.id).match(/^\d+/);
        return match ? Number(match[0]) : null;
      })
      .filter((id): id is number => typeof id === "number" && !isNaN(id) && !currentProductsMap[id]);

    if (missingProductIds.length > 0) {
      await Promise.all(
        missingProductIds.map(async (id) => {
          try {
            const res = await fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${id}`);
            if (res.ok) {
              const prod = await res.json();
              if (prod && prod.id) {
                currentProductsMap[prod.id] = prod;
              }
            }
          } catch {}
        })
      );
    }

    const itemDetails = (order.items as any[])
      .map((orderItem, idx) => {
        const cartItem = cart[idx] || cart.find((c) => c.productId === orderItem.product_id);
        const prodId =
          orderItem.product_id ||
          cartItem?.productId ||
          (String(cartItem?.id || "").match(/^\d+/) ? Number(String(cartItem?.id || "").match(/^\d+/)![0]) : null);
        const productData = prodId ? currentProductsMap[prodId] : null;

        // 1. Clean Title (no parentheses with attributes in the main title)
        let productTitle = "";
        if (orderItem.product_title && typeof orderItem.product_title === "string") {
          productTitle = orderItem.product_title.trim();
        } else if (cartItem?.productTitle) {
          productTitle = cartItem.productTitle.trim();
        } else if (productData?.title) {
          productTitle = productData.title.trim();
        } else if (orderItem.title) {
          productTitle = orderItem.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
        } else if (cartItem?.title) {
          productTitle = cartItem.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
        } else {
          productTitle = "Product";
        }

        // 2. Attributes breakdown
        const attributeLines: string[] = [];
        if (Array.isArray(orderItem.attributes) && orderItem.attributes.length > 0) {
          orderItem.attributes.forEach((attr: { name: string; value: string }) => {
            if (attr?.name && attr?.value) {
              attributeLines.push(`- ${attr.name}: ${attr.value}`);
            }
          });
        } else if (Array.isArray(cartItem?.selectedOptions) && cartItem.selectedOptions.length > 0) {
          cartItem.selectedOptions.forEach((attr: { name: string; value: string }) => {
            if (attr?.name && attr?.value) {
              attributeLines.push(`- ${attr.name}: ${attr.value}`);
            }
          });
        } else if (productData && Array.isArray(productData.attributes)) {
          const optionIds: number[] = Array.isArray(orderItem.option_ids)
            ? orderItem.option_ids
            : Array.isArray(cartItem?.optionIds)
            ? cartItem.optionIds
            : [];

          productData.attributes.forEach((attr: any) => {
            const matchedValues = (attr.values || []).filter((v: any) => optionIds.includes(v.id));
            if (matchedValues.length > 0) {
              const valStr = matchedValues.map((v: any) => v.value).join(", ");
              attributeLines.push(`- ${attr.name}: ${valStr}`);
            }
          });
        }

        // Fallback: If no attributes were extracted yet, check if title had (attr1, attr2)
        if (attributeLines.length === 0) {
          const rawTitle = orderItem.title || cartItem?.title || "";
          const parenMatch = rawTitle.match(/\(([^)]+)\)/);
          if (parenMatch && parenMatch[1]) {
            const parts = parenMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
            parts.forEach((part: string) => {
              let matchedAttr: string | null = null;
              if (productData?.attributes) {
                for (const attr of productData.attributes) {
                  if ((attr.values || []).some((v: any) => v.value?.toLowerCase() === part.toLowerCase())) {
                    matchedAttr = attr.name;
                    break;
                  }
                }
              }
              if (matchedAttr) {
                attributeLines.push(`- ${matchedAttr}: ${part}`);
              } else {
                attributeLines.push(`- Option: ${part}`);
              }
            });
          }
        }

        // 3. Quantity
        const quantityLine = `- Quantity: ${orderItem.quantity}`;

        // 4. Price
        const priceLine = `- Price: ${orderItem.price_on_request ? "On request" : `₹${orderItem.price * orderItem.quantity}`}`;

        // 5. Photo URL (normalize to absolute URL if relative)
        let rawPhoto: string = orderItem.image || cartItem?.image || productData?.image || "";
        if (rawPhoto.startsWith("data:")) {
          rawPhoto = productData?.image || "";
        }
        let photoUrl = "";
        if (rawPhoto) {
          if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://")) {
            photoUrl = rawPhoto;
          } else if (rawPhoto.startsWith("/media/")) {
            photoUrl = `https://aartcafe-backend-production-rjudvs.laravel.cloud${rawPhoto}`;
          } else if (rawPhoto.startsWith("media/")) {
            photoUrl = `https://aartcafe-backend-production-rjudvs.laravel.cloud/${rawPhoto}`;
          } else if (rawPhoto.startsWith("/")) {
            photoUrl = `https://aartcafe-backend-production-rjudvs.laravel.cloud${rawPhoto}`;
          } else {
            photoUrl = `https://aartcafe-backend-production-rjudvs.laravel.cloud/media/${rawPhoto}`;
          }
        }
        const photoLine = photoUrl ? `- Photo: ${photoUrl}` : "";

        // 6. Free Delivery
        const isFreeDelivery = Boolean(
          orderItem.is_free_delivery ?? cartItem?.isFreeDelivery ?? productData?.is_free_delivery
        );

        const itemLines = [
          `*${idx + 1}. ${productTitle}*`,
          ...attributeLines,
          quantityLine,
          priceLine,
          ...(photoLine ? [photoLine] : []),
        ];

        let itemBlock = itemLines.join("\n");
        if (isFreeDelivery) {
          itemBlock += "\n\n🚛 *Free Delivery*";
        }
        return itemBlock;
      })
      .join("\n\n");

    const messageLines = [
      "🔔*NEW ORDER - AARTCAFE*🔔",
      "",
      "━━━━━━━━━━━━━━━━",
      "",
      `🔸*Order Reference:* #AART-${order.id}`,
      "",
      "🔹*Customer Details:*",
      `* *Name:* ${name.trim() || ""}`,
      `* *Email:* ${email.trim() || ""}`,
      `* *Phone:* ${phone.trim() || ""}`,
      `* *Reference Image:* ${order.reference_image ? order.reference_image : ""}`,
      `* *Custom Request:* ${customRequest.trim() ? customRequest.trim() : ""}`,
      "",
      "━━━━━━━━━━━━━━━━",
      "",
      "🔹*Order Items:*",
      itemDetails,
      "",
      "━━━━━━━━━━━━━━━━",
      `🔹*TOTAL AMOUNT:* ₹${orderTotal}${order.items.some((i: { price_on_request?: boolean }) => i.price_on_request) ? " + items priced on request" : ""}`,
      "━━━━━━━━━━━━━━━━",
      "Hello Aartcafe! I would like to confirm my order. Please share availability & payment details. Thank you! 💐"
    ];

    const message = messageLines.join("\n");
    const urls = getWhatsAppUrls(whatsappNumber, message);

    setConfirmedOrder({
      orderId: order.id,
      message,
      total: orderTotal,
      urls,
    });
    setSubmitting(false);
    clearCart();

    // Trigger WhatsApp launch immediately
    openWhatsApp(whatsappNumber, message);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />

      <main className="cart-main" style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="cart-container">

          {confirmedOrder ? (
            <div
              className="order-success-card"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #EBE5DB",
                borderRadius: "24px",
                padding: "48px 24px",
                maxWidth: "680px",
                margin: "0 auto 60px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "#E8F5E9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 size={44} color="#25D366" />
              </div>

              <span
                className="font-sans"
                style={{
                  display: "inline-block",
                  backgroundColor: "#FAF7F5",
                  border: "1px solid #D9A85C",
                  color: "#3F3B38",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  letterSpacing: "0.5px",
                }}
              >
                ORDER #{confirmedOrder.orderId}
              </span>

              <h2
                className="font-serif"
                style={{
                  fontSize: "32px",
                  color: "#3F3B38",
                  margin: "0 0 12px",
                  fontWeight: 500,
                }}
              >
                Order Placed Successfully!
              </h2>

              <p
                className="font-sans"
                style={{
                  fontSize: "16px",
                  color: "#6E6E6E",
                  lineHeight: "1.6",
                  maxWidth: "520px",
                  margin: "0 auto 28px",
                }}
              >
                Your order of <strong>₹{confirmedOrder.total}</strong> has been created in our system. Send your confirmation message directly to our team on WhatsApp:
              </p>

              {/* Main Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "440px", margin: "0 auto" }}>
                <a
                  href={confirmedOrder.urls.direct}
                  onClick={(e) => {
                    e.preventDefault();
                    openWhatsApp(whatsappNumber, confirmedOrder.message);
                  }}
                  className="whatsapp-launch-btn font-sans"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    backgroundColor: "#25D366",
                    color: "#fff",
                    padding: "16px 28px",
                    borderRadius: "14px",
                    fontSize: "17px",
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "0 8px 24px rgba(37, 211, 102, 0.35)",
                    cursor: "pointer",
                  }}
                >
                  <MessageCircle size={22} fill="#fff" color="#25D366" />
                  <span>Tap to Open WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(confirmedOrder.message);
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="font-sans"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: copied ? "#E8F5E9" : "#FAF7F5",
                    border: `1px solid ${copied ? "#2E7D32" : "#D9A85C"}`,
                    color: copied ? "#2E7D32" : "#3F3B38",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Order Details Copied!" : "Copy Order Message"}</span>
                </button>
              </div>

              {/* In-app Browser / Instagram Tip Box */}
              <div
                style={{
                  backgroundColor: "#FFF8E7",
                  border: "1px solid #F3E0B5",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  textAlign: "left",
                  maxWidth: "480px",
                  margin: "24px auto 0",
                  fontSize: "13px",
                  color: "#6E5B3B",
                  lineHeight: "1.6",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                  📱 Note for Instagram Users:
                </div>
                If WhatsApp doesn’t launch, tap the <strong>three dots (•••)</strong> at the top-right corner of your screen and select <strong>"Open in Chrome"</strong> or <strong>"Open in Safari"</strong>.
              </div>

              {/* Secondary links */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", fontSize: "14px" }}>
                <a
                  href={confirmedOrder.urls.web}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#D9A85C", textDecoration: "underline" }}
                >
                  Open in WhatsApp Web
                </a>
                <span style={{ color: "#BCAEA2" }}>•</span>
                <button
                  type="button"
                  onClick={() => setConfirmedOrder(null)}
                  style={{ background: "none", border: "none", color: "#6E6E6E", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  Start New Order
                </button>
              </div>
            </div>
          ) : (
            <>
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Phone (Required)"
                    value={phone}
                    onChange={(e) => {
                      // Allow only digits (and optional leading '+' for country code)
                      const val = e.target.value;
                      const sanitized = val.startsWith("+")
                        ? "+" + val.slice(1).replace(/\D/g, "")
                        : val.replace(/\D/g, "");
                      setPhone(sanitized);
                    }}
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

              {/* Choose Reference Image from Product Gallery */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="font-sans" style={{ fontSize: "16px", color: "#6E6E6E", fontWeight: 500 }}>
                    Select Reference Image (Optional)
                  </span>
                  {selectedReferenceImage && (
                    <button
                      type="button"
                      onClick={() => setSelectedReferenceImage(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#E05A47",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {availableGalleryPhotos.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
                      gap: "10px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      padding: "8px",
                      backgroundColor: "#FFFDF9",
                      borderRadius: "12px",
                      border: "1.5px solid #F0E6D8",
                    }}
                  >
                    {availableGalleryPhotos.map((imgUrl, idx) => {
                      const isSelected = selectedReferenceImage === imgUrl;
                      return (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() => setSelectedReferenceImage(isSelected ? null : imgUrl)}
                          style={{
                            position: "relative",
                            aspectRatio: "1/1",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: isSelected ? "2.5px solid #D9A85C" : "1.5px solid transparent",
                            boxShadow: isSelected ? "0 0 0 2px rgba(217, 168, 92, 0.3)" : "none",
                            cursor: "pointer",
                            padding: 0,
                            backgroundColor: "#F5EDE8",
                            transition: "all 0.15s ease",
                            transform: isSelected ? "scale(0.96)" : "none",
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery photo ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: "#D9A85C",
                                color: "#fff",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                              }}
                            >
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1.5px dashed #D9A85C",
                      backgroundColor: "#FFFDF9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      color: "#A89F91",
                      fontSize: "14px",
                    }}
                  >
                    <ImageIcon size={16} />
                    <span>Photos from your added products will appear here</span>
                  </div>
                )}

                {selectedReferenceImage ? (
                  <span style={{ fontSize: "12px", color: "#8FB9A8", fontWeight: 500 }}>
                    ✓ Selected photo will be linked with your WhatsApp order as a reference.
                  </span>
                ) : (
                  <span style={{ fontSize: "12px", color: "#A89F91" }}>
                    Tap any photo above to mark it as the reference design for your order.
                  </span>
                )}
              </div>

              {/* Custom Requests (Optional) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                <label
                  htmlFor="custom-requests"
                  className="font-sans"
                  style={{
                    fontSize: "16px",
                    color: "#6E6E6E",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Custom Requests (Optional)
                </label>
                <textarea
                  id="custom-requests"
                  rows={3}
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder="Have any special customizations, names, dates, colors, or notes? Let us know here..."
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1.5px solid #EBE5DB",
                    backgroundColor: "#FFFDF9",
                    padding: "12px 16px",
                    fontSize: "15px",
                    color: "#3F3B38",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#D9A85C";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(217, 168, 92, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#EBE5DB";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                  }}
                />
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
          </>
          )}

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
                        {formatRupees(salePrice(prod))}
                        {originalPrice(prod) !== null && (
                          <span style={{ marginLeft: "8px", fontSize: "14px", color: "#BCAEA2", textDecoration: "line-through" }}>
                            {formatRupees(originalPrice(prod) as number)}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => addToBag({ id: prod.id, title: prod.title, price: salePrice(prod), image: prod.image || "" })}
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
