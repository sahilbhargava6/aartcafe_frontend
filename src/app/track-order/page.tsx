"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MessageCircle, AlertCircle } from "lucide-react";

const STAGES = [
  { key: "pending", label: "Order Received", desc: "Order details received in system", icon: Clock },
  { key: "processing", label: "Flowers Received", desc: "Flowers inspected & drying prepared", icon: ShieldCheck },
  { key: "preserving", label: "Preserving & Resin Casting", desc: "Handcrafted deep cast in progress", icon: Package },
  { key: "shipped", label: "Quality Check & Shipped", desc: "Packed safely with care guide", icon: Truck },
  { key: "completed", label: "Delivered", desc: "Handed over to customer", icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSearched(true);

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders/track?query=${encodeURIComponent(searchQuery.trim())}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("No orders found matching this Order ID or Phone Number.");
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
    if (s === "completed" || s === "delivered") return 4;
    if (s === "shipped" || s === "dispatched") return 3;
    if (s === "preserving" || s === "casting") return 2;
    if (s === "processing" || s === "flowers_received") return 1;
    return 0; // pending
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FAF6F0" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "50px 20px 80px" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
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
          <h1 className="font-serif" style={{ fontSize: "36px", color: "#3F3B38", margin: "0 0 12px", fontWeight: 400 }}>
            Track Your Artisanal Order
          </h1>
          <p style={{ color: "#6E6E6E", fontSize: "16px", maxWidth: "540px", margin: "0 auto", lineHeight: "24px" }}>
            Enter your <strong>Order ID</strong> (e.g. #1) or <strong>WhatsApp Mobile Number</strong> below to view real-time preservation and shipping progress.
          </p>
        </div>

        {/* Search Box */}
        <div
          style={{
            backgroundColor: "#FFF",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            border: "1px solid #EBE5DB",
            marginBottom: "40px",
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. 1) or Phone (e.g. 9267943830)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <button
              type="submit"
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
                    <div>
                      <div style={{ fontSize: "14px", color: "#6E6E6E" }}>Order Reference</div>
                      <h2 className="font-serif" style={{ fontSize: "24px", color: "#3F3B38", margin: 0 }}>
                        #AART-{ord.id}
                      </h2>
                    </div>

                    <div>
                      <div style={{ fontSize: "13px", color: "#6E6E6E", textAlign: "right" }}>Customer Name</div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#3F3B38" }}>{ord.customer_name}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "13px", color: "#6E6E6E", textAlign: "right" }}>Order Date</div>
                      <div style={{ fontSize: "15px", color: "#3F3B38" }}>
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor:
                          ord.status === "completed"
                            ? "rgba(143, 185, 168, 0.2)"
                            : ord.status === "shipped"
                            ? "rgba(217, 168, 92, 0.2)"
                            : "rgba(217, 138, 156, 0.2)",
                        color:
                          ord.status === "completed"
                            ? "#4E8E76"
                            : ord.status === "shipped"
                            ? "#B88330"
                            : "#D98A9C",
                        padding: "8px 18px",
                        borderRadius: "20px",
                        fontWeight: 700,
                        fontSize: "13px",
                        textTransform: "uppercase",
                      }}
                    >
                      {ord.status || "Pending"}
                    </div>
                  </div>

                  {/* Stepper Timeline */}
                  <div style={{ marginBottom: "40px" }}>
                    <h3 className="font-serif" style={{ fontSize: "18px", color: "#3F3B38", marginBottom: "24px" }}>
                      Handcrafting & Delivery Progress
                    </h3>

                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                      {/* Connecting Line */}
                      <div
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
                            <div style={{ fontSize: "14px", fontWeight: isDone ? 600 : 400, color: isDone ? "#3F3B38" : "#999" }}>
                              {stage.label}
                            </div>
                            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px", maxWidth: "120px" }}>
                              {stage.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items Purchased Table */}
                  <div style={{ backgroundColor: "#FAF6F0", borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "15px", color: "#3F3B38", marginTop: 0, marginBottom: "12px", fontWeight: 600 }}>
                      Order Items Summary
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {itemsList.map((item: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                          <span style={{ color: "#3F3B38" }}>
                            {item.title} <span style={{ color: "#6E6E6E" }}>x{item.quantity}</span>
                          </span>
                          <span style={{ fontWeight: 600, color: "#3F3B38" }}>
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
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <a
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
    </div>
  );
}
