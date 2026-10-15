"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MessageCircle, AlertCircle } from "lucide-react";

const STAGES = [
  { key: "pending", label: "Order Received", desc: "Order details received in system", icon: Clock },
  { key: "flowers_received", label: "Flowers Received", desc: "Flowers inspected & drying prepared", icon: ShieldCheck },
  { key: "payment_received", label: "Payment Received", desc: "Payment verified & order queued", icon: CheckCircle2 },
  { key: "processing", label: "Processing & Crafting", desc: "Handcrafted design in progress", icon: Package },
  { key: "shipped", label: "Shipped (Dispatched)", desc: "Packed safely with care guide", icon: Truck },
  { key: "completed", label: "Delivered", desc: "Handed over to customer", icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    const params = new URLSearchParams({ order_id: orderId.trim(), phone: phone.trim() });
    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders/track?${params}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404 || res.status === 422) {
            throw new Error("No order found for this Order ID and Phone Number. Please check both and try again.");
          }
          if (res.status === 429) {
            throw new Error("Too many attempts. Please wait a minute and try again.");
          }
          throw new Error("Failed to look up order. Please try again.");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : [data]);
      })
      .catch((err) => {
        setOrders([]);
        setErrorMsg(err.message || "No order found.");
      })
      .finally(() => setLoading(false));
  };

  const getStageIndex = (status: string) => {
    const s = status ? status.toLowerCase() : "pending";
    if (s === "completed" || s === "delivered") return 5;
    if (s === "shipped" || s === "dispatched") return 4;
    if (s === "processing" || s === "preserving" || s === "casting") return 3;
    if (s === "payment_received") return 2;
    if (s === "flowers_received") return 1;
    return 0; // pending
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FAF6F0" }}>
      <Navbar />

      <main className="track-main" style={{ flex: 1, maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "50px 20px 80px" }}>
        {/* Page Header */}
        <div className="track-header" style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            className="track-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(217, 168, 92, 0.15)",
              color: "#D9A85C",
              padding: "6px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            <Package size={16} /> Order Tracking Portal
          </div>
          <h1 className="font-serif track-title" style={{ fontSize: "36px", color: "#3F3B38", margin: "0 0 12px", fontWeight: 400 }}>
            Track Your Artisanal Order
          </h1>
          <p className="track-intro" style={{ color: "#6E6E6E", fontSize: "16px", maxWidth: "540px", margin: "0 auto", lineHeight: "24px" }}>
            Enter your <strong>Order ID</strong> (e.g. #AART-12) and the <strong>Phone Number</strong> you ordered with to view real-time preservation and shipping progress.
          </p>
        </div>

        {/* Search Box */}
        <div
          className="track-search-card"
          style={{
            backgroundColor: "#FFF",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            border: "1px solid #EBE5DB",
            marginBottom: "40px",
          }}
        >
          <form onSubmit={handleSearch} className="track-form" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div className="track-field" style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <input
                type="text"
                aria-label="Order ID"
                placeholder="Order ID (e.g. AART-12)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "26px",
                  border: "1.5px solid #D9A85C",
                  padding: "0 20px 0 48px",
                  fontSize: "16px",
                  outline: "none",
                  backgroundColor: "#FAF6F0",
                  color: "#3F3B38",
                }}
              />
              <Search
                size={20}
                color="#D9A85C"
                style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <div className="track-field" style={{ flex: 1, minWidth: "200px" }}>
              <input
                type="tel"
                aria-label="Phone Number"
                placeholder="Phone used for the order"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "26px",
                  border: "1.5px solid #D9A85C",
                  padding: "0 20px",
                  fontSize: "16px",
                  outline: "none",
                  backgroundColor: "#FAF6F0",
                  color: "#3F3B38",
                }}
              />
            </div>
            <button
              type="submit"
              className="track-submit"
              disabled={loading}
              style={{
                height: "52px",
                padding: "0 32px",
                borderRadius: "26px",
                backgroundColor: "#D9A85C",
                color: "#FFF",
                border: "none",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(217, 168, 92, 0.3)",
              }}
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Results Area */}
        {errorMsg && (
          <div
            className="track-error"
            style={{
              backgroundColor: "rgba(224, 90, 71, 0.1)",
              border: "1px solid #E05A47",
              color: "#E05A47",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontSize: "15px",
            }}
          >
            <AlertCircle size={20} />
            {errorMsg}
          </div>
        )}

        {searched && !loading && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {orders.map((ord) => {
              const currentStep = getStageIndex(ord.status);
              const itemsList = Array.isArray(ord.items) ? ord.items : [];

              return (
                <div
                  key={ord.id}
                  className="track-order-card"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: "20px",
                    padding: "32px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    border: "1px solid #EBE5DB",
                  }}
                >
                  {/* Order Top Bar */}
                  <div
                    className="track-topbar"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                      paddingBottom: "24px",
                      borderBottom: "1px solid #F0EAE1",
                      marginBottom: "30px",
                    }}
                  >
                    <div className="track-ref">
                      <div style={{ fontSize: "14px", color: "#6E6E6E" }}>Order Reference</div>
                      <h2 className="font-serif track-ref-id" style={{ fontSize: "24px", color: "#3F3B38", margin: 0 }}>
                        #AART-{ord.id}
                      </h2>
                    </div>

                    <div className="track-meta track-customer">
                      <div className="track-meta-label" style={{ fontSize: "13px", color: "#6E6E6E", textAlign: "right" }}>Customer Name</div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#3F3B38" }}>{ord.customer_name}</div>
                    </div>

                    <div className="track-meta track-date">
                      <div className="track-meta-label" style={{ fontSize: "13px", color: "#6E6E6E", textAlign: "right" }}>Order Date</div>
                      <div style={{ fontSize: "15px", color: "#3F3B38" }}>
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div
                      className="track-status"
                      style={{
                        backgroundColor:
                          ord.status === "completed"
                            ? "rgba(143, 185, 168, 0.2)"
                            : ord.status === "shipped"
                            ? "rgba(217, 168, 92, 0.2)"
                            : ord.status === "on_hold"
                            ? "rgba(245, 127, 23, 0.15)"
                            : ord.status === "processing"
                            ? "rgba(0, 121, 107, 0.15)"
                            : ord.status === "payment_received"
                            ? "rgba(81, 45, 168, 0.15)"
                            : ord.status === "flowers_received"
                            ? "rgba(2, 119, 189, 0.15)"
                            : ord.status === "cancelled"
                            ? "rgba(224, 90, 71, 0.2)"
                            : "rgba(217, 138, 156, 0.2)",
                        color:
                          ord.status === "completed"
                            ? "#4E8E76"
                            : ord.status === "shipped"
                            ? "#B88330"
                            : ord.status === "on_hold"
                            ? "#F57F17"
                            : ord.status === "processing"
                            ? "#00796B"
                            : ord.status === "payment_received"
                            ? "#512DA8"
                            : ord.status === "flowers_received"
                            ? "#0277BD"
                            : ord.status === "cancelled"
                            ? "#C62828"
                            : "#D98A9C",
                        padding: "8px 18px",
                        borderRadius: "20px",
                        fontWeight: 700,
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      {ord.status === "on_hold"
                        ? "On Hold"
                        : ord.status === "flowers_received"
                        ? "Flowers Received"
                        : ord.status === "payment_received"
                        ? "Payment Received"
                        : ord.status || "Pending"}
                    </div>
                  </div>

                  {/* On Hold Notice if paused */}
                  {ord.status === "on_hold" && (
                    <div
                      style={{
                        backgroundColor: "#FFFDE7",
                        border: "1.5px solid #FFF59D",
                        borderRadius: "14px",
                        padding: "16px 20px",
                        marginBottom: "28px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        color: "#F57F17",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      <AlertCircle size={20} color="#F57F17" />
                      <span>
                        Your order is temporarily on hold while we verify design details or pause processing. Our team will reach out to you directly if any action is needed.
                      </span>
                    </div>
                  )}

                  {/* Stepper Timeline */}
                  <div className="track-progress" style={{ marginBottom: "40px" }}>
                    <h3 className="font-serif track-progress-title" style={{ fontSize: "18px", color: "#3F3B38", marginBottom: "24px" }}>
                      Handcrafting & Delivery Progress
                    </h3>

                    <div className="stepper" style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                      {/* Connecting Line */}
                      <div
                        className="stepper-line"
                        style={{
                          position: "absolute",
                          top: "22px",
                          left: "5%",
                          right: "5%",
                          height: "3px",
                          backgroundColor: "#EBE5DB",
                          zIndex: 0,
                        }}
                      />
                      <div
                        className="stepper-line"
                        style={{
                          position: "absolute",
                          top: "22px",
                          left: "5%",
                          width: `${(currentStep / (STAGES.length - 1)) * 90}%`,
                          height: "3px",
                          backgroundColor: "#D9A85C",
                          zIndex: 0,
                          transition: "width 0.4s ease",
                        }}
                      />

                      {STAGES.map((stage, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        const IconComponent = stage.icon;

                        return (
                          <div
                            key={stage.key}
                            className={`stepper-step${isDone ? " is-done" : ""}${idx < currentStep ? " line-done" : ""}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                              position: "relative",
                              zIndex: 1,
                              flex: 1,
                            }}
                          >
                            <div
                              className="stepper-dot"
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "50%",
                                backgroundColor: isDone ? "#D9A85C" : "#FFF",
                                border: isDone ? "2px solid #D9A85C" : "2px solid #EBE5DB",
                                color: isDone ? "#FFF" : "#999",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "12px",
                                boxShadow: isCurrent ? "0 0 0 4px rgba(217, 168, 92, 0.25)" : "none",
                                transition: "all 0.3s",
                              }}
                            >
                              <IconComponent size={20} />
                            </div>
                            <div className="stepper-text" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <div className="stepper-label" style={{ fontSize: "14px", fontWeight: isDone ? 600 : 400, color: isDone ? "#3F3B38" : "#999" }}>
                                {stage.label}
                              </div>
                              <div className="stepper-desc" style={{ fontSize: "12px", color: "#999", marginTop: "4px", maxWidth: "120px" }}>
                                {stage.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items Purchased Table */}
                  <div className="track-items" style={{ backgroundColor: "#FAF6F0", borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "15px", color: "#3F3B38", marginTop: 0, marginBottom: "12px", fontWeight: 600 }}>
                      Order Items Summary
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {itemsList.map((item: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", fontSize: "14px" }}>
                          <span style={{ color: "#3F3B38", minWidth: 0 }}>
                            {item.title} <span style={{ color: "#6E6E6E" }}>x{item.quantity}</span>
                          </span>
                          <span style={{ fontWeight: 600, color: "#3F3B38", whiteSpace: "nowrap" }}>
                            ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: "1px solid #EBE5DB", marginTop: "14px", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "16px", color: "#3F3B38" }}>
                      <span>Total Amount</span>
                      <span style={{ color: "#D9A85C" }}>₹{Number(ord.total_amount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* WhatsApp Support Action */}
                  <div className="track-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a
                      className="track-whatsapp"
                      href={`https://wa.me/919267943830?text=${encodeURIComponent(`Hi Aartcafe! I would like to inquire about my Order #AART-${ord.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "#25D366",
                        color: "#FFF",
                        padding: "10px 20px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                    >
                      <MessageCircle size={18} /> Inquire via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 1024px) {
          .track-whatsapp {
            min-height: 44px;
          }
        }

        /* Undo the global h1/h2/h3 clamp, which inflates these headings on tablets */
        @media (max-width: 768px) {
          .track-title {
            font-size: 32px !important;
            line-height: 1.25 !important;
          }
          .track-ref-id {
            font-size: 24px !important;
            line-height: 1.3 !important;
          }
          .track-progress-title {
            font-size: 20px !important;
            line-height: 1.35 !important;
          }
        }

        /* Small screens: 2 x 2 order summary and a vertical progress tracker */
        @media (max-width: 640px) {
          .track-topbar {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 16px 12px !important;
            align-items: start !important;
          }
          .track-ref {
            order: 1;
            min-width: 0;
          }
          .track-status {
            order: 2;
            justify-self: end;
          }
          .track-customer {
            order: 3;
            min-width: 0;
          }
          .track-date {
            order: 4;
            justify-self: end;
            text-align: right;
          }
          .track-customer .track-meta-label {
            text-align: left !important;
          }

          .stepper {
            flex-direction: column;
          }
          .stepper-line {
            display: none;
          }
          .stepper-step {
            flex-direction: row !important;
            align-items: flex-start !important;
            text-align: left !important;
            flex: none !important;
            gap: 14px;
            padding-bottom: 26px;
          }
          .stepper-step:last-child {
            padding-bottom: 0;
          }
          /* Vertical connector from each step's circle down to the next one */
          .stepper-step:not(:last-child)::after {
            content: "";
            position: absolute;
            left: 19px;
            top: 44px;
            bottom: 4px;
            width: 2px;
            border-radius: 1px;
            background-color: #EBE5DB;
          }
          .stepper-step.line-done::after {
            background-color: #D9A85C;
          }
          .stepper-dot {
            width: 40px !important;
            height: 40px !important;
            margin-bottom: 0 !important;
            flex-shrink: 0;
          }
          .stepper-text {
            align-items: flex-start !important;
            padding-top: 2px;
            min-width: 0;
          }
          .stepper-label {
            font-size: 15px !important;
            line-height: 1.35;
          }
          .stepper-desc {
            max-width: none !important;
            font-size: 14px !important;
            line-height: 1.4;
            margin-top: 2px !important;
          }
        }

        /* Phones */
        @media (max-width: 600px) {
          .track-main {
            padding: 32px 16px 56px !important;
          }
          .track-header {
            margin-bottom: 28px !important;
          }
          .track-badge {
            font-size: 12px !important;
            padding: 6px 14px !important;
          }
          .track-title {
            font-size: 28px !important;
          }
          .track-intro {
            font-size: 15px !important;
            line-height: 23px !important;
          }
          .track-search-card {
            padding: 16px !important;
            border-radius: 16px !important;
            margin-bottom: 28px !important;
          }
          .track-form {
            flex-direction: column;
          }
          .track-field {
            flex: none !important;
            min-width: 0 !important;
            width: 100%;
          }
          .track-submit {
            width: 100%;
            justify-content: center;
          }
          .track-error {
            justify-content: flex-start !important;
            align-items: flex-start !important;
            text-align: left !important;
            padding: 16px !important;
            font-size: 14px !important;
          }
          .track-order-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
          .track-topbar {
            padding-bottom: 20px !important;
            margin-bottom: 24px !important;
          }
          .track-ref-id {
            font-size: 22px !important;
          }
          .track-progress {
            margin-bottom: 28px !important;
          }
          .track-progress-title {
            font-size: 18px !important;
            margin-bottom: 18px !important;
          }
          .track-items {
            padding: 16px !important;
          }
          .track-whatsapp {
            width: 100%;
            justify-content: center;
            padding: 12px 20px !important;
            border-radius: 24px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
