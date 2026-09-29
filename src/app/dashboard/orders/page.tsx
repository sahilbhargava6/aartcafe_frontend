"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    try {
      const res = await fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0 }}>
          Customer Orders
        </h1>
        <button
          onClick={fetchOrders}
          style={{
            padding: "8px 16px",
            backgroundColor: "#D98A9C",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Refresh Orders
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#8FB9A8", textAlign: "center", padding: "40px 0" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFF", borderRadius: "12px", color: "#BCAEA2" }}>
          No orders received yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: "#FFF",
                border: "1px solid #EBE5DB",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px", borderBottom: "1px solid #FAF6F0", paddingBottom: "12px" }}>
                <div>
                  <h3 className="font-serif" style={{ fontSize: "20px", color: "#3F3B38", margin: "0 0 4px 0" }}>
                    Order #{order.id} — {order.customer_name}
                  </h3>
                  <p className="font-sans" style={{ fontSize: "14px", color: "#6E6E6E", margin: 0 }}>
                    📞 {order.customer_phone} {order.customer_email ? `| 📧 ${order.customer_email}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 600,
                      backgroundColor: order.status === "completed" ? "#E8F5E9" : order.status === "cancelled" ? "#FFEBEE" : "#FFF8E1",
                      color: order.status === "completed" ? "#2E7D32" : order.status === "cancelled" ? "#C62828" : "#F57F17",
                      textTransform: "capitalize",
                    }}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #EBE5DB",
                      fontSize: "13px",
                      outline: "none",
                      backgroundColor: "#FAF6F0",
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Order Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {Array.isArray(order.items) &&
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }} />
                      ) : (
                        <div style={{ width: "48px", height: "48px", backgroundColor: "#FAF6F0", borderRadius: "8px" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500, margin: 0 }}>
                          {item.title}
                        </p>
                        <p className="font-sans" style={{ fontSize: "12px", color: "#6E6E6E", margin: 0 }}>
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <span className="font-sans" style={{ fontSize: "14px", fontWeight: 600, color: "#3F3B38" }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #FAF6F0", paddingTop: "12px" }}>
                <span className="font-sans" style={{ fontSize: "13px", color: "#8FB9A8" }}>
                  Ordered: {new Date(order.created_at || Date.now()).toLocaleString()}
                </span>
                <span className="font-serif" style={{ fontSize: "18px", fontWeight: 600, color: "#3F3B38" }}>
                  Total: ₹{order.total_amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
