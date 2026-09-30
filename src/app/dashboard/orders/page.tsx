"use client";

import React, { useState, useEffect } from "react";
import { Printer, RefreshCw, Eye, X, Phone, Mail, Calendar, CheckCircle2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0 }}>
            Customer Orders & Logistics
          </h1>
          <p style={{ color: "#6E6E6E", fontSize: "14px", margin: "4px 0 0" }}>
            Manage order statuses and print official customer invoices.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            padding: "10px 20px",
            backgroundColor: "#D9A85C",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(217, 168, 92, 0.3)",
          }}
        >
          <RefreshCw size={16} /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div style={{ color: "#8FB9A8", textAlign: "center", padding: "60px 0", fontSize: "16px" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", backgroundColor: "#FFF", borderRadius: "16px", color: "#BCAEA2", border: "1px solid #EBE5DB" }}>
          No customer orders recorded yet. Orders submitted via WhatsApp will appear here automatically.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: "#FFF",
                  border: "1px solid #EBE5DB",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px", borderBottom: "1px solid #FAF6F0", paddingBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: 0 }}>
                        Order #AART-{order.id}
                      </h3>
                      <span
                        style={{
                          padding: "4px 14px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 700,
                          backgroundColor:
                            order.status === "completed"
                              ? "#E8F5E9"
                              : order.status === "shipped"
                              ? "#FFF3E0"
                              : order.status === "preserving"
                              ? "#E1F5FE"
                              : order.status === "cancelled"
                              ? "#FFEBEE"
                              : "#FFF8E1",
                          color:
                            order.status === "completed"
                              ? "#2E7D32"
                              : order.status === "shipped"
                              ? "#E65100"
                              : order.status === "preserving"
                              ? "#0277BD"
                              : order.status === "cancelled"
                              ? "#C62828"
                              : "#F57F17",
                          textTransform: "uppercase",
                        }}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", color: "#6E6E6E", fontSize: "14px", flexWrap: "wrap" }}>
                      <span>👤 <strong>{order.customer_name}</strong></span>
                      <span>📞 {order.customer_phone}</span>
                      {order.customer_email && <span>✉️ {order.customer_email}</span>}
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedInvoice(order)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        backgroundColor: "#FAF6F0",
                        border: "1.5px solid #D9A85C",
                        color: "#D9A85C",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      <Printer size={16} /> Print PDF Invoice
                    </button>

                    <select
                      value={order.status || "pending"}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "20px",
                        border: "1.5px solid #EBE5DB",
                        fontSize: "13px",
                        fontWeight: 600,
                        outline: "none",
                        backgroundColor: "#FFF",
                        color: "#3F3B38",
                        cursor: "pointer",
                      }}
                    >
                      <option value="pending">Pending (Order Received)</option>
                      <option value="processing">Processing (Flowers Received)</option>
                      <option value="preserving">Preserving (Resin Casting)</option>
                      <option value="shipped">Shipped (Dispatched)</option>
                      <option value="completed">Completed (Delivered)</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px", backgroundColor: "#FAF6F0", padding: "12px 16px", borderRadius: "12px" }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                      ) : (
                        <div style={{ width: "50px", height: "50px", backgroundColor: "#EBE5DB", borderRadius: "8px" }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p className="font-sans" style={{ fontSize: "15px", color: "#3F3B38", fontWeight: 600, margin: 0 }}>
                          {item.title}
                        </p>
                        <p className="font-sans" style={{ fontSize: "13px", color: "#6E6E6E", margin: "2px 0 0" }}>
                          Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className="font-sans" style={{ fontSize: "16px", fontWeight: 700, color: "#D9A85C" }}>
                        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #FAF6F0", paddingTop: "14px" }}>
                  <span className="font-sans" style={{ fontSize: "13px", color: "#999" }}>
                    Placed on: {new Date(order.created_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#3F3B38" }}>
                    Total Order Value: <span style={{ color: "#D9A85C" }}>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            id="printable-invoice"
            style={{
              backgroundColor: "#FFF",
              width: "100%",
              maxWidth: "750px",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              position: "relative",
              fontFamily: "var(--font-jost), sans-serif",
            }}
          >
            {/* Modal Close Button (hidden when printing) */}
            <button
              className="no-print"
              onClick={() => setSelectedInvoice(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6E6E6E",
              }}
            >
              <X size={24} />
            </button>

            {/* Modal Print Action Header (hidden when printing) */}
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #EBE5DB", paddingBottom: "16px" }}>
              <span style={{ fontSize: "14px", color: "#6E6E6E" }}>Invoice Preview</span>
              <button
                onClick={handlePrint}
                style={{
                  backgroundColor: "#D9A85C",
                  color: "#FFF",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "20px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Printer size={18} /> Click to Print / Save PDF
              </button>
            </div>

            {/* Printable Invoice Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
              <div>
                <h1 className="font-serif" style={{ fontSize: "32px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
                  AARTCAFE
                </h1>
                <p style={{ fontSize: "13px", color: "#6E6E6E", margin: "4px 0 0", lineHeight: "18px" }}>
                  Handcrafted Floral Preservation & Keepsakes<br />
                  WhatsApp: +91 9267943830 | support@aartcafe.com<br />
                  www.aartcafe.com
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <h2 style={{ fontSize: "20px", color: "#D9A85C", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                  TAX INVOICE / RECEIPT
                </h2>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#3F3B38", marginTop: "6px" }}>
                  Invoice #: AART-{selectedInvoice.id}
                </div>
                <div style={{ fontSize: "13px", color: "#6E6E6E", marginTop: "2px" }}>
                  Date: {new Date(selectedInvoice.created_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* Customer Details Box */}
            <div style={{ backgroundColor: "#FAF6F0", borderRadius: "12px", padding: "18px", marginBottom: "28px", border: "1px solid #EBE5DB" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#D9A85C", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "6px" }}>
                Billed To (Customer Details):
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#3F3B38" }}>
                {selectedInvoice.customer_name}
              </div>
              <div style={{ fontSize: "14px", color: "#6E6E6E", marginTop: "4px" }}>
                Phone: {selectedInvoice.customer_phone}
                {selectedInvoice.customer_email && ` | Email: ${selectedInvoice.customer_email}`}
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
              <thead>
                <tr style={{ backgroundColor: "#3F3B38", color: "#FFF", textAlign: "left", fontSize: "13px", textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 14px", borderRadius: "6px 0 0 6px" }}>Item Description</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Qty</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "10px 14px", textAlign: "right", borderRadius: "0 6px 6px 0" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(selectedInvoice.items) &&
                  selectedInvoice.items.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #EBE5DB", fontSize: "14px", color: "#3F3B38" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{item.title}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>
                        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Total Calculation */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
              <div style={{ width: "240px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: "#6E6E6E" }}>
                  <span>Subtotal</span>
                  <span>₹{Number(selectedInvoice.total_amount).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: "#6E6E6E" }}>
                  <span>Shipping & Delivery</span>
                  <span style={{ color: "#4E8E76", fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px solid #3F3B38", fontSize: "18px", fontWeight: 700, color: "#3F3B38", marginTop: "6px" }}>
                  <span>Grand Total</span>
                  <span style={{ color: "#D9A85C" }}>₹{Number(selectedInvoice.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Thank You Footer */}
            <div style={{ textAlign: "center", borderTop: "1px dashed #D9A85C", paddingTop: "20px", color: "#6E6E6E", fontSize: "13px" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#3F3B38" }}>Thank you for choosing Aartcafe for your handcrafted memories!</p>
              <p style={{ margin: 0 }}>Every piece is preserved with utmost love and care.</p>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
