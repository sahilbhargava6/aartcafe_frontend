"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, X, Search, Filter } from "lucide-react";

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHasProducts, setFilterHasProducts] = useState("all");
  const [sortBy, setSortBy] = useState("id_desc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");

  const fetchCategories = () => {
    setLoading(true);
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories.");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load categories from server.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredAndSortedCategories = useMemo(() => {
    let result = [...categories];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((cat) => {
        const nameMatch = cat.name?.toLowerCase().includes(q);
        const slugMatch = cat.slug?.toLowerCase().includes(q);
        const idMatch = String(cat.id) === q;
        return nameMatch || slugMatch || idMatch;
      });
    }

    if (filterHasProducts !== "all") {
      result = result.filter((cat) => {
        const count = cat.products_count ?? 0;
        if (filterHasProducts === "with_products") return count > 0;
        if (filterHasProducts === "empty") return count === 0;
        return true;
      });
    }

    result.sort((a, b) => {
      const countA = a.products_count ?? 0;
      const countB = b.products_count ?? 0;

      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "count_desc") return countB - countA;
      if (sortBy === "id_asc") return a.id - b.id;
      return b.id - a.id;
    });

    return result;
  }, [categories, searchQuery, filterHasProducts, sortBy]);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const url = editingCategory
      ? `https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories/${editingCategory.id}`
      : "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories";

    const method = editingCategory ? "PUT" : "POST";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name: categoryName }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errMsg = data.message || (data.errors ? Object.values(data.errors).flat().join("\n") : "Failed to save category.");
          throw new Error(errMsg);
        }
        return data;
      })
      .then(() => {
        setIsModalOpen(false);
        fetchCategories();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete category.");
        fetchCategories();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const isFiltered = searchQuery.trim() !== "" || filterHasProducts !== "all" || sortBy !== "id_desc";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header with add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          CATEGORIES
        </h1>
        <button
          onClick={openAddModal}
          style={{
            display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#D98A9C",
            color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px",
            fontSize: "16px", cursor: "pointer", fontWeight: 500, transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      {/* Search & Filter Controls Bar */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search input */}
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={18} color="#BCAEA2" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search category name, slug, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #D9A85C",
              paddingLeft: "40px",
              paddingRight: "14px",
              fontSize: "15px",
              outline: "none",
              backgroundColor: "#fff",
              color: "#3F3B38",
            }}
          />
        </div>

        {/* Product Count Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="#D9A85C" />
          <select
            value={filterHasProducts}
            onChange={(e) => setFilterHasProducts(e.target.value)}
            style={{
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #D9A85C",
              padding: "0 14px",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#fff",
              color: "#3F3B38",
              cursor: "pointer",
            }}
          >
            <option value="all">All Categories</option>
            <option value="with_products">With Products (&gt; 0)</option>
            <option value="empty">Empty Categories (0)</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            height: "42px",
            borderRadius: "10px",
            border: "1px solid #D9A85C",
            padding: "0 14px",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#fff",
            color: "#3F3B38",
            cursor: "pointer",
          }}
        >
          <option value="id_desc">Sort: ID (Newest)</option>
          <option value="id_asc">Sort: ID (Oldest)</option>
          <option value="name_asc">Sort: Name (A-Z)</option>
          <option value="name_desc">Sort: Name (Z-A)</option>
          <option value="count_desc">Sort: Products Count (High-Low)</option>
        </select>

        {/* Reset Filters button */}
        {isFiltered && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterHasProducts("all");
              setSortBy("id_desc");
            }}
            style={{
              height: "42px",
              padding: "0 16px",
              borderRadius: "10px",
              border: "1px solid #D98A9C",
              backgroundColor: "transparent",
              color: "#D98A9C",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Count Badge */}
      <div style={{ fontSize: "14px", color: "#6E6E6E", padding: "0 4px" }}>
        Showing <b>{filteredAndSortedCategories.length}</b> of <b>{categories.length}</b> Categories
      </div>

      {/* Categories List Table */}
      <div style={{ border: "2px solid #D9A85C", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading categories...</div>
        ) : filteredAndSortedCategories.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>
            {categories.length === 0 ? "No categories found. Add one above!" : "No categories match your search or filters."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #D9A85C" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Name</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Slug</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Products Count</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCategories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{cat.id}</td>
                  <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: "16px 24px", color: "#D98A9C" }}>{cat.slug}</td>
                  <td style={{ padding: "16px 24px", color: "#8FB9A8" }}>{cat.products_count ?? 0}</td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => openEditModal(cat)}
                        style={{ background: "none", border: "none", color: "#D9A85C", cursor: "pointer" }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        style={{ background: "none", border: "none", color: "#E05A47", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff", padding: "30px", borderRadius: "15px",
              width: "95%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto" as const,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "1px solid #D9A85C", display: "flex", flexDirection: "column", gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="font-serif" style={{ fontSize: "20px", color: "#3F3B38", margin: 0 }}>
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "#BCAEA2", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="font-sans" style={{ fontSize: "14px", color: "#6E6E6E" }}>Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. Handmade Rakhis"
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  height: "40px", backgroundColor: "#D98A9C", color: "#fff",
                  border: "none", borderRadius: "8px", fontSize: "16px",
                  fontWeight: 500, cursor: "pointer", transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
