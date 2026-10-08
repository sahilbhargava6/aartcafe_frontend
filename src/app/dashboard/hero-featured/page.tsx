"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Search } from "lucide-react";

export default function HeroFeaturedDashboard() {
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
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products").then(res => res.json()),
      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories").then(res => res.json()).catch(() => [])
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

  const featuredCount = useMemo(() => products.filter(p => p.is_hero_featured).length, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => (p.title || "").toLowerCase().includes(q));
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter(p => String(p.category_id) === filterCategory || p.category?.name === filterCategory);
    }

    // Status filter
    if (filterStatus === "featured") {
      result = result.filter(p => p.is_hero_featured);
    } else if (filterStatus === "unfeatured") {
      result = result.filter(p => !p.is_hero_featured);
    }

    // Featured items shown on top, then sorted by ID desc
    result.sort((a, b) => {
      if (a.is_hero_featured && !b.is_hero_featured) return -1;
      if (!a.is_hero_featured && b.is_hero_featured) return 1;
      return b.id - a.id;
    });

    return result;
  }, [products, searchQuery, filterCategory, filterStatus]);

  const toggleHeroFeatured = (prod: any) => {
    const updatedStatus = !prod.is_hero_featured;

    if (updatedStatus && featuredCount >= 5) {
      alert("Maximum 5 products can be featured on the Hero Banner. Please unfeature a product first.");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${prod.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...prod,
        is_hero_featured: updatedStatus,
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
          HERO BANNER FEATURED
        </h1>
        <div style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: featuredCount >= 5 ? "#F5EDE8" : "rgba(143,185,168,0.15)", color: featuredCount >= 5 ? "#E05A47" : "#8FB9A8", fontWeight: 600, fontSize: "14px" }}>
          Featured: {featuredCount} / 5 (Max 5)
        </div>
      </div>

      <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px", margin: 0 }}>
        Select up to 5 featured products to display in the 3D Hero Banner Carousel on the Home Page. Featured products appear at the top.
      </p>

      {/* Filter and Search Bar */}
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
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Toggle Hero Feature</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid #EBE5DB", backgroundColor: prod.is_hero_featured ? "rgba(143,185,168,0.05)" : "transparent" }}>
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
                        backgroundColor: prod.is_hero_featured ? "rgba(143,185,168,0.15)" : "#F5EDE8",
                        color: prod.is_hero_featured ? "#8FB9A8" : "#BCAEA2",
                      }}
                    >
                      {prod.is_hero_featured ? "Featured on Hero" : "Not Featured"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button
                      onClick={() => toggleHeroFeatured(prod)}
                      style={{
                        backgroundColor: prod.is_hero_featured ? "#8FB9A8" : "transparent",
                        color: prod.is_hero_featured ? "#fff" : "#8FB9A8",
                        border: "1px solid #8FB9A8", borderRadius: "8px",
                        padding: "6px 12px", fontSize: "14px", fontWeight: 500,
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Sparkles size={14} /> {prod.is_hero_featured ? "Unfeature" : "Feature on Hero"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

