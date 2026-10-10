"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

type FestiveFlag = "is_festive_featured" | "is_festive_selected" | "is_festive_hidden";

// Each button toggles its own flag. Featured and Selected can be combined; turning on
// Hidden (price on request) clears both, and turning either back on clears Hidden.
const FESTIVE_OPTIONS: { flag: FestiveFlag; value: string; label: string; hint: string; color: string }[] = [
  { flag: "is_festive_featured", value: "featured", label: "Featured", hint: "Festive Treasures on the homepage", color: "#D98A9C" },
  { flag: "is_festive_selected", value: "selected", label: "Selected", hint: "Festive Specials page (can be combined with Featured)", color: "#8FB9A8" },
  { flag: "is_festive_hidden", value: "hidden", label: "Hidden", hint: "More off-festival items, price hidden, \"Contact for details\" (can't be combined with Featured or Selected)", color: "#D9A85C" },
];
const festiveRank = (p: any) => (p.is_festive_featured ? 0 : p.is_festive_selected ? 1 : p.is_festive_hidden ? 2 : 3);

export default function FestiveSpecialsDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      // ?all=1 includes inactive products so they can be re-activated from this page
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products?all=1").then((res) => res.json()),
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories").then((res) => res.json()).catch(() => []),
    ])
      .then(([prodData, catData]) => {
        setProducts(Array.isArray(prodData) ? prodData : []);
        setCategories(Array.isArray(catData) ? catData : []);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load data from server.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => (p.title || "").toLowerCase().includes(q));
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter((p) => String(p.category_id) === filterCategory || p.category?.name === filterCategory);
    }

    // Status filter
    const statusOption = FESTIVE_OPTIONS.find((o) => o.value === filterStatus);
    if (filterStatus === "none") {
      result = result.filter((p) => !FESTIVE_OPTIONS.some((o) => p[o.flag]));
    } else if (statusOption) {
      result = result.filter((p) => p[statusOption.flag]);
    }

    // Featured, then Selected, then Hidden, then the rest; newest first within each
    result.sort((a, b) => festiveRank(a) - festiveRank(b) || b.id - a.id);

    return result;
  }, [products, searchQuery, filterCategory, filterStatus]);

  const updateProduct = (prod: any, changes: Record<string, unknown>) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    setSavingId(prod.id);

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${prod.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(changes),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to update status.");
        // The server returns the saved product (including flags it adjusted, e.g. Hidden
        // clearing Featured/Selected), so update just that row instead of reloading the list
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setSavingId(null));
  };

  const toggleActive = (prod: any) => updateProduct(prod, { is_active: prod.is_active === false });

  const toggleFestive = (prod: any, flag: FestiveFlag) => updateProduct(prod, { [flag]: !prod[flag] });

  // A backend without the festive flag columns leaves them out and silently ignores updates to them
  const backendOutdated = products.length > 0 && !products.some((p) => "is_festive_featured" in p);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          FESTIVE SPECIALS & TREASURES
        </h1>
      </div>

      <div className="font-sans" style={{ color: "#6E6E6E", fontSize: "15px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        {FESTIVE_OPTIONS.map((o) => (
          <span key={o.value}>
            <b style={{ color: o.color }}>{o.label}:</b> {o.hint}
          </span>
        ))}
      </div>

      {backendOutdated && (
        <div style={{ border: "1px solid #E05A47", backgroundColor: "rgba(224, 90, 71, 0.08)", color: "#E05A47", borderRadius: "10px", padding: "12px 16px", fontSize: "15px" }}>
          The server doesn&apos;t support Featured / Selected / Hidden yet, so these buttons can&apos;t save. Deploy the latest backend (and run its migrations), then reload this page.
        </div>
      )}

      {/* Filter Controls */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={18} color="#BCAEA2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #8FB9A8", paddingLeft: "38px", paddingRight: "12px", fontSize: "15px", outline: "none" }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ height: "42px", borderRadius: "10px", border: "1px solid #8FB9A8", padding: "0 14px", fontSize: "15px", outline: "none", backgroundColor: "#fff", color: "#3F3B38" }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ height: "42px", borderRadius: "10px", border: "1px solid #8FB9A8", padding: "0 14px", fontSize: "15px", outline: "none", backgroundColor: "#fff", color: "#3F3B38" }}
        >
          <option value="all">All Festive Status</option>
          {FESTIVE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label} Only</option>
          ))}
          <option value="none">Not in Festive</option>
        </select>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      <div style={{ border: "2px solid #8FB9A8", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading && products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>No matching products found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #8FB9A8" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Image</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Product Title</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Category</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Active Status</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Festive Placement</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const current = FESTIVE_OPTIONS.find((o) => prod[o.flag]);
                const saving = savingId === prod.id;
                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: "1px solid #EBE5DB",
                      backgroundColor: current ? `${current.color}0D` : "transparent",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{prod.id}</td>
                    <td style={{ padding: "16px 24px" }}>
                      {prod.image ? (
                        <img src={prod.image} alt={prod.title} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", backgroundColor: "#F5EDE8", borderRadius: "8px" }} />
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{prod.title}</td>
                    <td style={{ padding: "16px 24px", color: "#D98A9C" }}>{prod.category?.name || "Uncategorized"}</td>
                    {/* Active Toggle Column */}
                    <td style={{ padding: "16px 24px" }}>
                      <button
                        onClick={() => toggleActive(prod)}
                        disabled={saving}
                        style={{
                          padding: "4px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: 500,
                          border: "none", cursor: "pointer",
                          backgroundColor: prod.is_active !== false ? "rgba(143, 185, 168, 0.2)" : "rgba(224, 90, 71, 0.15)",
                          color: prod.is_active !== false ? "#4F8571" : "#E05A47",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {prod.is_active !== false ? "Active" : "Inactive"}
                      </button>
                    </td>
                    {/* Festive Placement: Featured / Selected / Hidden */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        {FESTIVE_OPTIONS.map((o) => {
                          const isOn = !!prod[o.flag];
                          return (
                            <button
                              key={o.flag}
                              onClick={() => toggleFestive(prod, o.flag)}
                              aria-pressed={isOn}
                              disabled={saving || backendOutdated}
                              title={backendOutdated ? "Deploy the latest backend to use festive placement" : isOn ? `Remove from ${o.label}` : o.hint}
                              style={{
                                backgroundColor: isOn ? o.color : "transparent",
                                color: isOn ? "#fff" : o.color,
                                border: `1px solid ${o.color}`, borderRadius: "8px",
                                padding: "6px 12px", fontSize: "14px", fontWeight: 500,
                                cursor: backendOutdated ? "not-allowed" : saving ? "wait" : "pointer",
                                opacity: backendOutdated ? 0.45 : 1,
                                transition: "all 0.2s ease",
                              }}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
