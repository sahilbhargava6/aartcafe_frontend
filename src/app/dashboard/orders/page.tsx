"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Printer, RefreshCw, Eye, X, Phone, Mail, Calendar, CheckCircle2, ArrowUpDown, Filter, Search } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_high" | "amount_low" | "name_asc" | "status">("newest");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Status priority order for custom status sorting
  const statusOrderWeight: Record<string, number> = {
    pending: 1,
    flowers_received: 2,
    payment_received: 3,
    processing: 4,
    on_hold: 5,
    shipped: 6,
    completed: 7,
    cancelled: 8,
  };

  // Filtered & Sorted orders list
  const filteredAndSortedOrders = useMemo(() => {
    return [...orders]
      .filter((order) => {
        // Status filter
        if (statusFilter !== "all" && (order.status || "pending") !== statusFilter) {
          return false;
        }
        // Search filter (name, phone, email, order ID, items)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = String(order.id).toLowerCase().includes(q) || `aart-${order.id}`.toLowerCase().includes(q);
          const matchName = (order.customer_name || "").toLowerCase().includes(q);
          const matchPhone = (order.customer_phone || "").toLowerCase().includes(q);
          const matchEmail = (order.customer_email || "").toLowerCase().includes(q);
          const matchItems = Array.isArray(order.items) && order.items.some((it: any) => (it.title || "").toLowerCase().includes(q));
          if (!matchId && !matchName && !matchPhone && !matchEmail && !matchItems) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          case "amount_high":
            return Number(b.total_amount || 0) - Number(a.total_amount || 0);
          case "amount_low":
            return Number(a.total_amount || 0) - Number(b.total_amount || 0);
          case "name_asc":
            return (a.customer_name || "").localeCompare(b.customer_name || "");
          case "status": {
            const weightA = statusOrderWeight[a.status || "pending"] ?? 99;
            const weightB = statusOrderWeight[b.status || "pending"] ?? 99;
            return weightA - weightB;
          }
          case "newest":
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
      });
  }, [orders, sortBy, statusFilter, searchQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0 }}>
            Customer Orders & Logistics
          </h1>
          <p style={{ color: "#6E6E6E", fontSize: "14px", margin: "4px 0 0" }}>
            Manage order statuses, filter & sort customer logs, and print official invoices.
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

      {/* Filter and Sort Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          backgroundColor: "#FFF",
          border: "1px solid #EBE5DB",
          borderRadius: "16px",
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px", position: "relative" }}>
          <Search size={17} color="#A89F91" style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: "20px",
              border: "1.5px solid #EBE5DB",
              fontSize: "13px",
              color: "#3F3B38",
              outline: "none",
              backgroundColor: "#FFFDF9",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter and Sort Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6E6E6E", display: "flex", alignItems: "center", gap: "4px" }}>
              <Filter size={14} color="#D9A85C" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: "1.5px solid #EBE5DB",
                fontSize: "13px",
                fontWeight: 600,
                color: "#3F3B38",
                backgroundColor: "#FFFDF9",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending">Pending (Order Received)</option>
              <option value="flowers_received">Flowers Received</option>
              <option value="payment_received">Payment Received</option>
              <option value="processing">Processing</option>
              <option value="on_hold">On Hold</option>
              <option value="shipped">Shipped (Dispatched)</option>
              <option value="completed">Completed (Delivered)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6E6E6E", display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowUpDown size={14} color="#D9A85C" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: "1.5px solid #EBE5DB",
                fontSize: "13px",
                fontWeight: 600,
                color: "#3F3B38",
                backgroundColor: "#FFFDF9",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="amount_high">Amount: High to Low</option>
              <option value="amount_low">Amount: Low to High</option>
              <option value="status">Status (Workflow Step)</option>
              <option value="name_asc">Customer Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#8FB9A8", textAlign: "center", padding: "60px 0", fontSize: "16px" }}>Loading orders...</div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", backgroundColor: "#FFF", borderRadius: "16px", color: "#BCAEA2", border: "1px solid #EBE5DB" }}>
          {orders.length === 0
            ? "No customer orders recorded yet. Orders submitted via WhatsApp will appear here automatically."
            : "No orders match the selected filters or search keyword."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredAndSortedOrders.map((order) => {
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
                              : order.status === "on_hold"
                              ? "#FFFDE7"
                              : order.status === "processing"
                              ? "#E0F2F1"
                              : order.status === "payment_received"
                              ? "#EDE7F6"
                              : order.status === "flowers_received"
                              ? "#E1F5FE"
                              : order.status === "cancelled"
                              ? "#FFEBEE"
                              : "#FFF8E1",
                          color:
                            order.status === "completed"
                              ? "#2E7D32"
                              : order.status === "shipped"
                              ? "#E65100"
                              : order.status === "on_hold"
                              ? "#F57F17"
                              : order.status === "processing"
                              ? "#00796B"
                              : order.status === "payment_received"
                              ? "#512DA8"
                              : order.status === "flowers_received"
                              ? "#0277BD"
                              : order.status === "cancelled"
                              ? "#C62828"
                              : "#B88330",
                          textTransform: "uppercase",
                        }}
                      >
                        {order.status === "on_hold"
                          ? "On Hold"
                          : order.status === "flowers_received"
                          ? "Flowers Received"
                          : order.status === "payment_received"
                          ? "Payment Received"
                          : order.status || "pending"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", color: "#6E6E6E", fontSize: "14px", flexWrap: "wrap" }}>
                      <span>👤 <strong>{order.customer_name}</strong></span>
                      <span>📞 {order.customer_phone}</span>
                      {order.customer_email && <span>✉️ {order.customer_email}</span>}
                    </div>

                    {/* Reference photo the customer attached in the bag */}
                    {order.reference_image && (
                      <a
                        href={order.reference_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "10px", color: "#D98A9C", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}
                      >
                        <img src={order.reference_image} alt="Reference" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", border: "1px solid #EBE5DB" }} />
                        📎 Reference image (open)
                      </a>
                    )}
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
                      <option value="flowers_received">Flowers Received</option>
                      <option value="payment_received">Payment Received</option>
                      <option value="processing">Processing</option>
                      <option value="on_hold">On Hold</option>
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
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <img
                  src="/images/logo.webp"
                  alt="Aartcafe Logo"
                  style={{ width: "70px", height: "70px", objectFit: "contain", borderRadius: "8px" }}
                />
                <div>
                  <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 500 }}>
                    AARTCAFE
                  </h1>
                  <p style={{ fontSize: "13px", color: "#6E6E6E", margin: "4px 0 0", lineHeight: "18px" }}>
                    Handcrafted Floral Preservation & Keepsakes<br />
                    WhatsApp: +91 9267943830 | support@aartcafe.com<br />
                    www.aartcafe.com
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#3F3B38" }}>
                  Invoice #: AART-{selectedInvoice.id}
                </div>
                <div style={{ fontSize: "13px", color: "#6E6E6E", marginTop: "4px" }}>
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
