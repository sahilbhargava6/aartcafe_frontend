"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Heart, Search } from "lucide-react";

export default function SpecialOffersDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products").then((res) => res.json()),
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
      result = result.filter((p) => p.is_special_offer || (p.discount_price && parseFloat(p.discount_price) < parseFloat(p.base_price)));
    } else if (filterStatus === "unfeatured") {
      result = result.filter((p) => !p.is_special_offer && (!p.discount_price || parseFloat(p.discount_price) >= parseFloat(p.base_price)));
    }

    // Featured items shown on top, then sorted by ID desc
    result.sort((a, b) => {
      const aFeatured = a.is_special_offer || (a.discount_price && parseFloat(a.discount_price) < parseFloat(a.base_price));
      const bFeatured = b.is_special_offer || (b.discount_price && parseFloat(b.discount_price) < parseFloat(b.base_price));
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return b.id - a.id;
    });

    return result;
  }, [products, searchQuery, filterCategory, filterStatus]);

  const toggleSpecialOffer = (prod: any) => {
    const updatedStatus = !prod.is_special_offer;
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${prod.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...prod,
        is_special_offer: updatedStatus,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status.");
        fetchData();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          SPECIAL OFFERS
        </h1>
      </div>

      <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px", margin: 0 }}>
        Quickly toggle which products appear in the "Special Offers" section on the Website. Featured products appear at the top.
      </p>

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
          <option value="all">All Status</option>
          <option value="featured">Featured Only</option>
          <option value="unfeatured">Unfeatured Only</option>
        </select>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      <div style={{ border: "2px solid #8FB9A8", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading ? (
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
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Toggle Feature</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const isOffer = prod.is_special_offer || (prod.discount_price && parseFloat(prod.discount_price) < parseFloat(prod.base_price));
                return (
                  <tr key={prod.id} style={{ borderBottom: "1px solid #EBE5DB", backgroundColor: isOffer ? "rgba(143,185,168,0.05)" : "transparent" }}>
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
                    <td style={{ padding: "16px 24px" }}>
                      <span
                        style={{
                          padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 500,
                          backgroundColor: isOffer ? "rgba(143,185,168,0.15)" : "#F5EDE8",
                          color: isOffer ? "#8FB9A8" : "#BCAEA2",
                        }}
                      >
                        {isOffer ? "Featured Offer" : "Standard Price"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button
                        onClick={() => toggleSpecialOffer(prod)}
                        style={{
                          backgroundColor: isOffer ? "#8FB9A8" : "transparent",
                          color: isOffer ? "#fff" : "#8FB9A8",
                          border: "1px solid #8FB9A8", borderRadius: "8px",
                          padding: "6px 12px", fontSize: "14px", fontWeight: 500,
                          cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Heart size={14} fill={isOffer ? "#fff" : "none"} /> {isOffer ? "Unfeature" : "Feature"}
                      </button>
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
