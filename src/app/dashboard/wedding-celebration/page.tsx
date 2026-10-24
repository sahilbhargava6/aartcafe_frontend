"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Heart, Sparkles, Check } from "lucide-react";

type WeddingFlag = "is_wedding_featured" | "is_wedding_selected";

// 1) Featured: Shown in Wedding Specials on Homepage and Wedding Specials in special-offers
// 2) Selected: Shown on the page WEDDING CELEBRATION
const WEDDING_OPTIONS: {
  flag: WeddingFlag;
  value: string;
  label: string;
  hint: string;
  color: string;
  icon: typeof Heart;
}[] = [
  {
    flag: "is_wedding_featured",
    value: "featured",
    label: "Featured",
    hint: "Shown in Wedding Specials on Homepage and Wedding Specials in special-offers",
    color: "#D98A9C",
    icon: Heart,
  },
  {
    flag: "is_wedding_selected",
    value: "selected",
    label: "Selected",
    hint: "Shown on the page WEDDING CELEBRATION",
    color: "#8FB9A8",
    icon: Sparkles,
  },
];

const weddingRank = (p: any) => {
  const isFeatured = !!(p.is_wedding_featured || p.is_wedding_special);
  const isSelected = !!p.is_wedding_selected;
  if (isFeatured && isSelected) return 0;
  if (isFeatured) return 1;
  if (isSelected) return 2;
  return 3;
};

export default function WeddingCelebrationDashboard() {
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
    if (filterStatus === "featured") {
      result = result.filter((p) => p.is_wedding_featured || p.is_wedding_special);
    } else if (filterStatus === "selected") {
      result = result.filter((p) => p.is_wedding_selected);
    } else if (filterStatus === "both") {
      result = result.filter((p) => (p.is_wedding_featured || p.is_wedding_special) && p.is_wedding_selected);
    } else if (filterStatus === "none") {
      result = result.filter((p) => !(p.is_wedding_featured || p.is_wedding_special) && !p.is_wedding_selected);
    }

    // Sort: Both, then Featured, then Selected, then others; newest first
    result.sort((a, b) => weddingRank(a) - weddingRank(b) || b.id - a.id);

    return result;
  }, [products, searchQuery, filterCategory, filterStatus]);

  const updateProduct = (prod: any, changes: Record<string, unknown>) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    setSavingId(prod.id);

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${prod.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(changes),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to update product status.");
        }
        const updated = await res.json();
        // Merge changes locally
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, ...changes, ...updated } : p))
        );
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setSavingId(null));
  };

  const toggleActive = (prod: any) => updateProduct(prod, { is_active: prod.is_active === false });

  const toggleFeatured = (prod: any) => {
    const current = !!(prod.is_wedding_featured || prod.is_wedding_special);
    const nextVal = !current;
    updateProduct(prod, {
      is_wedding_featured: nextVal,
      is_wedding_special: nextVal,
    });
  };

  const toggleSelected = (prod: any) => {
    const current = !!prod.is_wedding_selected;
    const nextVal = !current;
    updateProduct(prod, {
      is_wedding_selected: nextVal,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          WEDDING CELEBRATION
        </h1>
      </div>

      <div
        className="font-sans"
        style={{
          color: "#6E6E6E",
          fontSize: "15px",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          backgroundColor: "#FAF7F5",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid #EBE5DB",
        }}
      >
        {WEDDING_OPTIONS.map((o) => (
          <span key={o.value} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                backgroundColor: o.color,
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {o.label}
            </span>
            <span>{o.hint}</span>
          </span>
        ))}
      </div>

      {/* Filter Controls */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search
            size={18}
            color="#BCAEA2"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #8FB9A8",
              paddingLeft: "38px",
              paddingRight: "12px",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            height: "42px",
            borderRadius: "10px",
            border: "1px solid #8FB9A8",
            padding: "0 14px",
            fontSize: "15px",
            outline: "none",
            backgroundColor: "#fff",
            color: "#3F3B38",
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            height: "42px",
            borderRadius: "10px",
            border: "1px solid #8FB9A8",
            padding: "0 14px",
            fontSize: "15px",
            outline: "none",
            backgroundColor: "#fff",
            color: "#3F3B38",
          }}
        >
          <option value="all">All Status</option>
          <option value="featured">Featured Only (Home & Special Offers)</option>
          <option value="selected">Selected Only (Wedding Celebration Page)</option>
          <option value="both">Both Featured & Selected</option>
          <option value="none">Not in Wedding</option>
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
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>
                  Wedding Placement
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const isFeatured = !!(prod.is_wedding_featured || prod.is_wedding_special);
                const isSelected = !!prod.is_wedding_selected;
                const saving = savingId === prod.id;

                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: "1px solid #EBE5DB",
                      backgroundColor:
                        isFeatured && isSelected
                          ? "rgba(217, 138, 156, 0.08)"
                          : isFeatured
                          ? "rgba(217, 138, 156, 0.05)"
                          : isSelected
                          ? "rgba(143, 185, 168, 0.08)"
                          : "transparent",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{prod.id}</td>
                    <td style={{ padding: "16px 24px" }}>
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.title}
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <div
                          style={{ width: "40px", height: "40px", backgroundColor: "#F5EDE8", borderRadius: "8px" }}
                        />
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{prod.title}</td>
                    <td style={{ padding: "16px 24px", color: "#D98A9C" }}>
                      {prod.category?.name || "Uncategorized"}
                    </td>

                    {/* Active Toggle Column */}
                    <td style={{ padding: "16px 24px" }}>
                      <button
                        onClick={() => toggleActive(prod)}
                        disabled={saving}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          border: "none",
                          cursor: "pointer",
                          backgroundColor:
                            prod.is_active !== false ? "rgba(143, 185, 168, 0.2)" : "rgba(224, 90, 71, 0.15)",
                          color: prod.is_active !== false ? "#4F8571" : "#E05A47",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {prod.is_active !== false ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Wedding Placement: 1) Featured, 2) Selected */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "10px" }}>
                        {/* 1) Featured Button */}
                        <button
                          onClick={() => toggleFeatured(prod)}
                          aria-pressed={isFeatured}
                          disabled={saving}
                          title={
                            isFeatured
                              ? "Remove from Featured (Home & Special Offers)"
                              : "Show in Wedding Specials on Homepage and Special Offers"
                          }
                          style={{
                            backgroundColor: isFeatured ? "#D98A9C" : "transparent",
                            color: isFeatured ? "#fff" : "#D98A9C",
                            border: "1.5px solid #D98A9C",
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: saving ? "wait" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s ease",
                            boxShadow: isFeatured ? "0 2px 6px rgba(217, 138, 156, 0.3)" : "none",
                          }}
                        >
                          <Heart size={14} fill={isFeatured ? "#fff" : "none"} strokeWidth={2} />
                          Featured
                        </button>

                        {/* 2) Selected Button */}
                        <button
                          onClick={() => toggleSelected(prod)}
                          aria-pressed={isSelected}
                          disabled={saving}
                          title={
                            isSelected
                              ? "Remove from WEDDING CELEBRATION page"
                              : "Show on the WEDDING CELEBRATION page"
                          }
                          style={{
                            backgroundColor: isSelected ? "#8FB9A8" : "transparent",
                            color: isSelected ? "#fff" : "#8FB9A8",
                            border: "1.5px solid #8FB9A8",
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: saving ? "wait" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "0 2px 6px rgba(143, 185, 168, 0.3)" : "none",
                          }}
                        >
                          <Sparkles size={14} fill={isSelected ? "#fff" : "none"} strokeWidth={2} />
                          Selected
                        </button>
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
