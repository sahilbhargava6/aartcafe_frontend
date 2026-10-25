"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, X, Search, Filter, Upload, Image as ImageIcon } from "lucide-react";
import { type CategoryNode, normalizeCategories, descendantIdsOf, pathTo } from "@/lib/categories";

type DashCategory = CategoryNode & { slug?: string; products_count?: number; image?: string | null };

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<DashCategory[]>([]);
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
  const [categoryImage, setCategoryImage] = useState<string>("");
  // A category can sit under several parents, at any depth
  const [parentIds, setParentIds] = useState<number[]>([]);

  const fetchCategories = () => {
    setLoading(true);
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories.");
        return res.json();
      })
      .then((data) => {
        let localIcons: Record<string, string> = {};
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("category_custom_icons");
            if (stored) localIcons = JSON.parse(stored);
          } catch (_) {}
        }
        const normalized = Array.isArray(data) ? normalizeCategories(data) : [];
        setCategories(
          normalized.map((cat: any) => ({
            ...cat,
            image: cat.image || localIcons[cat.id] || localIcons[cat.name] || null,
          }))
        );
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
    setCategoryImage("");
    setParentIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    let initialImg = cat.image || "";
    if (!initialImg && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("category_custom_icons");
        if (stored) {
          const parsed = JSON.parse(stored);
          initialImg = parsed[cat.id] || parsed[cat.name] || "";
        }
      } catch (_) {}
    }
    setCategoryImage(initialImg);
    setParentIds(cat.parent_ids || []);
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file is too large. Please select an image under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCategoryImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Each category once, named by its place in the tree ("Frames › Wedding Frames"), A–Z by that
  // path. Left out: the category being edited and everything inside it (that would make a loop).
  const categoryPath = (cat: DashCategory) => pathTo(categories, cat).map((c) => c.name).join(" › ");
  const parentOptions = useMemo(() => {
    const blocked = editingCategory ? new Set([editingCategory.id, ...descendantIdsOf(categories, editingCategory.id)]) : new Set<number>();
    return categories
      .filter((c) => !blocked.has(c.id))
      .map((c) => ({ id: c.id, label: categoryPath(c) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, editingCategory]);
  const toggleParent = (id: number) =>
    setParentIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const url = editingCategory
      ? `https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories/${editingCategory.id}`
      : "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories";

    const method = editingCategory ? "PUT" : "POST";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const cleanImg = categoryImage.trim() || null;

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name: categoryName, parent_ids: parentIds, image: cleanImg }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errMsg = data.message || (data.errors ? Object.values(data.errors).flat().join("\n") : "Failed to save category.");
          throw new Error(errMsg);
        }
        return data;
      })
      .then((savedCat) => {
        // Persist to local storage for immediate client synchronization
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("category_custom_icons") || "{}";
            const parsed = JSON.parse(stored);
            const targetId = editingCategory ? editingCategory.id : savedCat?.id;
            if (cleanImg) {
              if (targetId) parsed[targetId] = cleanImg;
              parsed[categoryName.trim()] = cleanImg;
            } else {
              if (targetId) delete parsed[targetId];
              delete parsed[categoryName.trim()];
            }
            localStorage.setItem("category_custom_icons", JSON.stringify(parsed));
          } catch (_) {}
        }
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
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>Icon</th>
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>Name</th>
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>Parents</th>
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>Slug</th>
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>Products Count</th>
                <th style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCategories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "12px 20px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        border: "1.5px solid #D9A85C",
                        backgroundColor: "#FAF7F2",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
                      }}
                    >
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <ImageIcon size={18} color="#C4A47C" />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#6E6E6E" }}>{cat.id}</td>
                  <td style={{ padding: "16px 20px", color: "#3F3B38", fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: "16px 20px", color: "#8B7E74" }}>
                    {cat.parent_ids?.length
                      ? cat.parent_ids.map((id: number) => categories.find((c) => c.id === id)).filter((p): p is DashCategory => !!p).map(categoryPath).join(", ")
                      : <span style={{ opacity: 0.5 }}>None</span>}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#D98A9C" }}>{cat.slug}</td>
                  <td style={{ padding: "16px 20px", color: "#8FB9A8" }}>{cat.products_count ?? 0}</td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
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
              width: "95%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" as const,
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
                <label className="font-sans" style={{ fontSize: "14px", color: "#6E6E6E", fontWeight: 500 }}>Category Name</label>
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

              {/* Custom Icon / Photo Override */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="font-sans" style={{ fontSize: "14px", color: "#6E6E6E", fontWeight: 500 }}>
                  Category Icon / Photo (Optional)
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Circular preview */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: "2px solid #D9A85C",
                      backgroundColor: "#FAF7F2",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(217, 168, 92, 0.25)",
                    }}
                  >
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt="Category preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <ImageIcon size={22} color="#C4A47C" />
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#FAF7F2",
                          border: "1px solid #D9A85C",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          color: "#8C5E1B",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        <Upload size={14} />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ display: "none" }}
                        />
                      </label>

                      {categoryImage && (
                        <button
                          type="button"
                          onClick={() => setCategoryImage("")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E05A47",
                            fontSize: "12px",
                            cursor: "pointer",
                            textDecoration: "underline",
                            padding: "4px",
                          }}
                        >
                          Remove Icon
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={categoryImage.startsWith("data:") ? "(Uploaded image ready)" : categoryImage}
                      onChange={(e) => setCategoryImage(e.target.value)}
                      readOnly={categoryImage.startsWith("data:")}
                      style={{
                        height: "34px",
                        borderRadius: "6px",
                        border: "1px solid #E8DFD8",
                        padding: "0 10px",
                        fontSize: "12.5px",
                        outline: "none",
                        color: "#3F3B38",
                        backgroundColor: categoryImage.startsWith("data:") ? "#F8F5F2" : "#fff",
                      }}
                    />
                  </div>
                </div>

                <span className="font-sans" style={{ fontSize: "12px", color: "#8B7E74", lineHeight: 1.4 }}>
                  Featured in the circular story badges on the mobile shop. <b>Recommended:</b> <b>1:1 square</b> (e.g. 500×500px) or <b>4:3</b> with the subject centered. Any photo will be automatically centered and cropped to fit the circle cleanly.
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="font-sans" style={{ fontSize: "14px", color: "#6E6E6E" }}>Parent Categories (Optional)</span>
                <div
                  role="group"
                  aria-label="Parent categories"
                  style={{
                    maxHeight: "220px", overflowY: "auto", border: "1px solid #D9A85C", borderRadius: "8px",
                    padding: "6px 0", backgroundColor: "#fff",
                  }}
                >
                  {parentOptions.length === 0 ? (
                    <div className="font-sans" style={{ padding: "8px 12px", fontSize: "14px", color: "#8B7E74" }}>No other categories yet.</div>
                  ) : parentOptions.map((option) => (
                    <label
                      key={option.id}
                      className="font-sans"
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "7px 12px", cursor: "pointer",
                        fontSize: "14px", color: "#3F3B38", backgroundColor: parentIds.includes(option.id) ? "#FFEAEF" : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={parentIds.includes(option.id)}
                        onChange={() => toggleParent(option.id)}
                        style={{ accentColor: "#D98A9C", width: "16px", height: "16px", flexShrink: 0 }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <span className="font-sans" style={{ fontSize: "12px", color: "#8B7E74", lineHeight: 1.5 }}>
                  {parentIds.length === 0
                    ? "None ticked: this is a main category."
                    : `Shows under ${parentIds.length === 1 ? "1 parent" : `${parentIds.length} parents`}. Tick more to show it in several places; sub-categories can have their own sub-categories.`}
                </span>
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
