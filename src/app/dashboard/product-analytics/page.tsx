"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

type ProductRow = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  category: string;
  is_active: boolean;
  views: number;
  visitors: number;
  add_to_bag: number;
  orders: number;
  units: number;
  revenue: number;
  conversion_rate: number | null;
};
type Totals = { views: number; add_to_bag: number; orders: number; units: number; revenue: number };
type SortKey = "views" | "add_to_bag" | "orders" | "units" | "revenue" | "conversion_rate";

const RANGES = [
  { name: "Today", value: "today" },
  { name: "Week", value: "week" },
  { name: "Month", value: "month" },
  { name: "Year", value: "year" },
];
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "add_to_bag", label: "Added to Bag" },
  { key: "orders", label: "Orders" },
  { key: "units", label: "Units" },
  { key: "revenue", label: "Revenue" },
  { key: "conversion_rate", label: "Conversion" },
];

const formatRupees = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export default function ProductAnalytics() {
  const [range, setRange] = useState("month");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("views");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/analytics/products?range=${range}`, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(async (res) => {
        if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
        if (!res.ok) throw new Error("Could not load product analytics.");
        const data = await res.json();
        // The old endpoint returned { status, data: [...] } with made-up numbers; don't show that
        if (!Array.isArray(data?.products) || !data?.totals) {
          throw new Error("Analytics isn't available on the server yet. Deploy the latest backend (and run its migrations), then reload this page.");
        }
        setRows(data.products);
        setTotals(data.totals);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [range]);

  const visibleRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .sort((a, b) => (Number(b[sortKey]) || 0) - (Number(a[sortKey]) || 0) || b.revenue - a.revenue);
  }, [rows, searchQuery, sortKey]);

  const cards = totals
    ? [
        { label: "Product Views", value: totals.views.toLocaleString("en-IN"), color: "#8FB9A8" },
        { label: "Added to Bag", value: totals.add_to_bag.toLocaleString("en-IN"), color: "#D9A85C" },
        { label: "Orders", value: totals.orders.toLocaleString("en-IN"), color: "#D98A9C" },
        { label: "Revenue", value: formatRupees(totals.revenue), color: "#3F3B38" },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          PRODUCT ANALYTICS
        </h1>
        <div style={{ display: "flex", gap: "16px" }}>
          {RANGES.map((r) => {
            const isActive = range === r.value;
            return (
              <button
                key={r.value}
                onClick={() => {
                  if (r.value === range) return;
                  setRange(r.value);
                  setLoading(true);
                }}
                className="font-sans"
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "2px solid #8FB9A8" : "none",
                  color: isActive ? "#8FB9A8" : "#BCAEA2",
                  padding: "4px 0",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      {/* Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: `2px solid ${c.color}`, borderRadius: "15px", padding: "20px 24px", backgroundColor: "#fff" }}>
            <div className="font-sans" style={{ color: "#6E6E6E", fontSize: "15px" }}>{c.label}</div>
            <div className="font-serif" style={{ color: "#3F3B38", fontSize: "30px", marginTop: "6px" }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", maxWidth: "360px" }}>
        <Search size={18} color="#BCAEA2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search product or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #8FB9A8", paddingLeft: "38px", paddingRight: "12px", fontSize: "15px", outline: "none" }}
        />
      </div>

      {!(error && rows.length === 0) && (
      <div style={{ border: "2px solid #8FB9A8", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff", opacity: loading && rows.length > 0 ? 0.6 : 1 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading product analytics...</div>
        ) : visibleRows.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>No matching products found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #8FB9A8" }}>
                <th style={{ padding: "14px 20px", color: "#3F3B38", fontWeight: 500 }}>Product</th>
                <th style={{ padding: "14px 20px", color: "#3F3B38", fontWeight: 500 }}>Category</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => setSortKey(c.key)}
                      title={`Sort by ${c.label}`}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "15px",
                        color: sortKey === c.key ? "#8FB9A8" : "#3F3B38",
                        fontWeight: sortKey === c.key ? 700 : 500,
                      }}
                    >
                      {c.label}{sortKey === c.key ? " ↓" : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #EBE5DB", opacity: r.is_active ? 1 : 0.55 }}>
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {r.image ? (
                        <img src={r.image} alt={r.title} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", backgroundColor: "#F5EDE8", borderRadius: "8px" }} />
                      )}
                      <span style={{ color: "#3F3B38", fontWeight: 500 }}>
                        {r.title}
                        {!r.is_active && <span style={{ color: "#E05A47", fontSize: "12px", marginLeft: "6px" }}>(inactive)</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px", color: "#D98A9C" }}>{r.category}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>{r.views}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>{r.add_to_bag}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>{r.orders}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>{r.units}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right", fontWeight: 500 }}>{formatRupees(r.revenue)}</td>
                  <td style={{ padding: "12px 20px", textAlign: "right", color: "#6E6E6E" }}>
                    {r.conversion_rate === null ? "–" : `${r.conversion_rate}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      <p className="font-sans" style={{ color: "#BCAEA2", fontSize: "13px", margin: 0 }}>
        Views and Added to Bag come from storefront tracking. Orders, units and revenue come from saved orders (cancelled orders excluded). Conversion = orders ÷ product page views.
      </p>
    </div>
  );
}
