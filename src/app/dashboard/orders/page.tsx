"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Printer, RefreshCw, Eye, X, Phone, Mail, Calendar, CheckCircle2, ArrowUpDown, Filter, Search, Copy, Users, ImagePlus } from "lucide-react";
import { shrinkImage } from "@/lib/shrinkImage";

type OrderItem = { title?: string; product_title?: string; attributes?: { name?: string; value?: string }[]; quantity?: number; price?: number | string; price_on_request?: boolean; image?: string };
type OrderRecord = { id: number; created_at?: string; status?: string; customer_name?: string; customer_phone?: string; customer_email?: string | null; custom_request?: string | null; admin_notes?: string | null; admin_images?: string[] | null; reference_image?: string | null; items?: OrderItem[]; total_amount?: number | string };

// The same person may write their number in different ways: compare the last 10 digits
const phoneKey = (phone: unknown) => String(phone || "").replace(/\D/g, "").slice(-10);

// An item's name without the "(option, option)" added to its title
const itemName = (item: OrderItem) => (item.product_title || String(item.title || "").replace(/\s*\([^)]*\)\s*$/, "") || "Product").trim();

// The item's choices and typed details (names, dates, notes), one per line
const itemDetails = (item: OrderItem): { name: string; value: string }[] =>
  Array.isArray(item.attributes) ? item.attributes.filter((a): a is { name: string; value: string } => !!a?.name && !!a?.value) : [];

const money = (n: unknown) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// The whole order as plain text, to keep or paste anywhere (when WhatsApp is not working)
function orderAsText(order: OrderRecord): string {
  const items = Array.isArray(order.items) ? order.items : [];
  const lines = [
    `ORDER #AART-${order.id}`,
    `Placed: ${new Date(order.created_at || Date.now()).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    `Status: ${order.status || "pending"}`,
    "",
    "CUSTOMER",
    `Name: ${order.customer_name || ""}`,
    `Phone: ${order.customer_phone || ""}`,
    ...(order.customer_email ? [`Email: ${order.customer_email}`] : []),
    ...(order.custom_request ? ["", "CUSTOM REQUEST", order.custom_request] : []),
    ...(order.reference_image ? ["", `Reference image: ${order.reference_image}`] : []),
    "",
    "ITEMS",
  ];
  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${itemName(item)}`);
    itemDetails(item).forEach((d) => lines.push(`   - ${d.name}: ${d.value}`));
    lines.push(`   - Quantity: ${item.quantity}`);
    lines.push(`   - Price: ${item.price_on_request ? "On request" : money(Number(item.price) * Number(item.quantity))}`);
    if (item.image && !String(item.image).startsWith("data:")) lines.push(`   - Photo: ${item.image}`);
  });
  lines.push("", `TOTAL: ${money(order.total_amount)}`);
  if (order.admin_notes?.trim()) lines.push("", "MY NOTES", order.admin_notes.trim());
  if (order.admin_images?.length) lines.push("", "MY PHOTOS", ...order.admin_images);
  return lines.join("\n");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / no permission: copy through a hidden text box
    const box = document.createElement("textarea");
    box.value = text;
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    box.remove();
    return ok;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<number | null>(null);

  const copyOrder = async (order: OrderRecord) => {
    if (await copyText(orderAsText(order))) {
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId((id) => (id === order.id ? null : id)), 2500);
    } else {
      alert("Could not copy. Please use Print PDF Invoice instead.");
    }
  };

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

  // The shop's own notes on each order (never shown to the customer): what is being typed, and
  // which order is saving / was just saved
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [noteState, setNoteState] = useState<Record<number, "saving" | "saved" | "error" | undefined>>({});

  // The shop's own photos on each order (never shown to the customer): upload progress / problems
  const [photoBusy, setPhotoBusy] = useState<Record<number, string | undefined>>({});
  const [photoError, setPhotoError] = useState<Record<number, string | undefined>>({});
  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };
  const keepPhotos = (orderId: number, photos: string[] | null | undefined) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, admin_images: photos || [] } : o)));

  const addPhotos = async (order: OrderRecord, files: File[]) => {
    if (files.length === 0) return;
    setPhotoError((prev) => ({ ...prev, [order.id]: undefined }));
    let failed = 0;
    let lastError = "";
    for (let i = 0; i < files.length; i++) {
      setPhotoBusy((prev) => ({ ...prev, [order.id]: files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…" }));
      try {
        // Phone photos are made smaller first, so they upload quickly
        const body = new FormData();
        body.append("image", await shrinkImage(files[i], 2000), "photo.jpg");
        const res = await fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders/${order.id}/photos`, { method: "POST", headers: authHeaders(), body });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.errors?.image?.[0] || data?.message || "Upload failed.");
        keepPhotos(order.id, data?.order?.admin_images);
      } catch (err) {
        failed++;
        lastError = err instanceof Error ? err.message : "Upload failed.";
      }
    }
    setPhotoBusy((prev) => ({ ...prev, [order.id]: undefined }));
    if (failed) setPhotoError((prev) => ({ ...prev, [order.id]: failed === files.length ? lastError : `${failed} of ${files.length} photos could not be added: ${lastError}` }));
  };

  const removePhoto = async (order: OrderRecord, url: string) => {
    if (!window.confirm("Remove this photo from the order?")) return;
    setPhotoBusy((prev) => ({ ...prev, [order.id]: "Removing…" }));
    setPhotoError((prev) => ({ ...prev, [order.id]: undefined }));
    try {
      const res = await fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders/${order.id}/photos`, {
        method: "DELETE",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Could not remove the photo.");
      keepPhotos(order.id, data?.order?.admin_images);
    } catch (err) {
      setPhotoError((prev) => ({ ...prev, [order.id]: err instanceof Error ? err.message : "Could not remove the photo." }));
    } finally {
      setPhotoBusy((prev) => ({ ...prev, [order.id]: undefined }));
    }
  };

  const saveNote = async (order: OrderRecord) => {
    const text = noteDrafts[order.id] ?? order.admin_notes ?? "";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    setNoteState((prev) => ({ ...prev, [order.id]: "saving" }));
    try {
      const res = await fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ admin_notes: text.trim() || null }),
      });
      if (!res.ok) throw new Error();
      // Keep the saved text on the order; the box then shows it with nothing left to save
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, admin_notes: text.trim() || null } : o)));
      setNoteDrafts((prev) => { const next = { ...prev }; delete next[order.id]; return next; });
      setNoteState((prev) => ({ ...prev, [order.id]: "saved" }));
      setTimeout(() => setNoteState((prev) => (prev[order.id] === "saved" ? { ...prev, [order.id]: undefined } : prev)), 2500);
    } catch {
      setNoteState((prev) => ({ ...prev, [order.id]: "error" }));
    }
  };

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
          const matchPhone = (order.customer_phone || "").toLowerCase().includes(q) || (phoneKey(q).length === 10 && phoneKey(order.customer_phone) === phoneKey(q));
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
            // Other orders from the same person (same phone number)
            const customerOrders = phoneKey(order.customer_phone) ? orders.filter((o) => phoneKey(o.customer_phone) === phoneKey(order.customer_phone)).length : 1;

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
                      {customerOrders > 1 && phoneKey(searchQuery) !== phoneKey(order.customer_phone) && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery(order.customer_phone || "")}
                          title="Show every order from this customer together"
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "12px", border: "1px solid #8FB9A8", background: "#F2F8F5", color: "#4E8E76", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          <Users size={13} /> All {customerOrders} orders from this customer
                        </button>
                      )}
                    </div>

                    {/* What the customer wrote in the bag */}
                    {order.custom_request && (
                      <div style={{ marginTop: "10px", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#FFF8EC", border: "1px solid #F0DDBB", color: "#3F3B38", fontSize: "14px", maxWidth: "640px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                        <strong style={{ color: "#C88E56" }}>📝 Custom request:</strong> {order.custom_request}
                      </div>
                    )}

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
                      onClick={() => copyOrder(order)}
                      title="Copy every detail of this order, to paste anywhere"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        backgroundColor: copiedOrderId === order.id ? "#E9F5F0" : "#FFF",
                        border: "1.5px solid #8FB9A8",
                        color: "#4E8E76",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {copiedOrderId === order.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {copiedOrderId === order.id ? "Copied" : "Copy full order"}
                    </button>
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="font-sans" style={{ fontSize: "15px", color: "#3F3B38", fontWeight: 600, margin: 0 }}>
                          {itemDetails(item).length > 0 ? itemName(item) : item.title}
                        </p>
                        {/* Each choice and anything the customer typed, one per line */}
                        {itemDetails(item).map((d, di) => (
                          <p key={di} className="font-sans" style={{ fontSize: "13px", color: "#3F3B38", margin: "2px 0 0", overflowWrap: "anywhere" }}>
                            <span style={{ color: "#8B7E74" }}>{d.name}:</span> {d.value}
                          </p>
                        ))}
                        <p className="font-sans" style={{ fontSize: "13px", color: "#6E6E6E", margin: "2px 0 0" }}>
                          Qty: {item.quantity} × {item.price_on_request ? "Price on request" : `₹${Number(item.price).toLocaleString("en-IN")}`}
                        </p>
                      </div>
                      <span className="font-sans" style={{ fontSize: "16px", fontWeight: 700, color: "#D9A85C" }}>
                        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* My notes: private to the shop, saved with the order */}
                {(() => {
                  const saved = order.admin_notes || "";
                  const draft = noteDrafts[order.id] ?? saved;
                  const changed = draft.trim() !== saved.trim();
                  const state = noteState[order.id];
                  return (
                    <div style={{ marginBottom: "16px" }}>
                      <label htmlFor={`order-note-${order.id}`} className="font-sans" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#8B7E74", marginBottom: "6px" }}>
                        🗒️ My notes <span style={{ fontWeight: 400 }}>(only you can see these)</span>
                      </label>
                      <textarea
                        id={`order-note-${order.id}`}
                        value={draft}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNoteDrafts((prev) => ({ ...prev, [order.id]: value }));
                          setNoteState((prev) => ({ ...prev, [order.id]: undefined }));
                        }}
                        rows={draft.split("\n").length > 2 ? 4 : 2}
                        maxLength={5000}
                        placeholder="e.g. Flowers received 5 Nov · Paid ₹1,000 advance on GPay · Names to print: Riya & Arjun · Deliver by 20 Nov"
                        className="font-sans"
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${changed ? "#D9A85C" : "#EBE5DB"}`, backgroundColor: "#FFFDF9", fontSize: "14px", lineHeight: "21px", color: "#3F3B38", resize: "vertical", outline: "none" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                        <button
                          type="button"
                          onClick={() => saveNote(order)}
                          disabled={!changed || state === "saving"}
                          style={{ padding: "6px 16px", borderRadius: "16px", border: "none", backgroundColor: changed ? "#D98A9C" : "#EBE5DB", color: changed ? "#fff" : "#8B7E74", fontSize: "13px", fontWeight: 600, cursor: changed ? "pointer" : "default" }}
                        >
                          {state === "saving" ? "Saving…" : "Save note"}
                        </button>
                        {state === "saved" && <span className="font-sans" style={{ fontSize: "13px", color: "#4E8E76" }}>✓ Saved</span>}
                        {state === "error" && <span className="font-sans" style={{ fontSize: "13px", color: "#E05A47" }}>Could not save. Please try again.</span>}
                        {changed && state !== "saving" && <span className="font-sans" style={{ fontSize: "12px", color: "#C88E56" }}>Not saved yet</span>}
                      </div>
                    </div>
                  );
                })()}

                {/* My photos: private to the shop, saved with the order */}
                {(() => {
                  const photos: string[] = Array.isArray(order.admin_images) ? order.admin_images : [];
                  const busy = photoBusy[order.id];
                  return (
                    <div style={{ marginBottom: "16px" }}>
                      <div className="font-sans" style={{ fontSize: "13px", fontWeight: 600, color: "#8B7E74", marginBottom: "8px" }}>
                        📷 My photos <span style={{ fontWeight: 400 }}>(only you can see these)</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                        {photos.map((url, pi) => (
                          <div key={url} style={{ position: "relative", width: "84px", height: "84px" }}>
                            <a href={url} target="_blank" rel="noopener noreferrer" title="Open full size">
                              <img src={url} alt={`Order photo ${pi + 1}`} style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #EBE5DB", display: "block" }} />
                            </a>
                            <button
                              type="button"
                              onClick={() => removePhoto(order, url)}
                              disabled={!!busy}
                              aria-label={`Remove photo ${pi + 1}`}
                              title="Remove photo"
                              style={{ position: "absolute", top: "-7px", right: "-7px", width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #EBE5DB", backgroundColor: "#fff", color: "#E05A47", display: "flex", alignItems: "center", justifyContent: "center", cursor: busy ? "default" : "pointer", padding: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <label
                          style={{ width: "84px", height: "84px", borderRadius: "10px", border: "1.5px dashed #D9A85C", backgroundColor: "#FFFDF9", color: "#C88E56", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "12px", fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, textAlign: "center" }}
                        >
                          <ImagePlus size={20} />
                          Add photos
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={!!busy}
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              e.target.value = "";
                              addPhotos(order, files);
                            }}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                      {busy && <div className="font-sans" style={{ fontSize: "13px", color: "#8B7E74", marginTop: "6px" }}>{busy}</div>}
                      {photoError[order.id] && <div className="font-sans" style={{ fontSize: "13px", color: "#E05A47", marginTop: "6px" }}>{photoError[order.id]}</div>}
                    </div>
                  );
                })()}

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
              {selectedInvoice.custom_request && (
                <div style={{ fontSize: "14px", color: "#3F3B38", marginTop: "10px", whiteSpace: "pre-wrap" }}>
                  <strong>Custom request:</strong> {selectedInvoice.custom_request}
                </div>
              )}
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
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                        {itemDetails(item).length > 0 ? itemName(item) : item.title}
                        {itemDetails(item).map((d, di) => (
                          <div key={di} style={{ fontWeight: 400, fontSize: "13px", color: "#6E6E6E" }}>
                            {d.name}: {d.value}
                          </div>
                        ))}
                      </td>
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
