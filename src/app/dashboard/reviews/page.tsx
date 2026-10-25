"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Edit2, Trash2, X, Heart, Search, Filter, RotateCcw, Check } from "lucide-react";

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "rating_high", "rating_low", "reviewer_asc"

  // Form Fields: Supports single product edit or multi-product selection on create
  const [productIds, setProductIds] = useState<number[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [productListOpen, setProductListOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Reliable click / touch outside listener for iPad and mobile touch devices
  useEffect(() => {
    const handleOutsideInteraction = (e: MouseEvent | TouchEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setProductListOpen(false);
      }
    };

    if (productListOpen) {
      document.addEventListener("mousedown", handleOutsideInteraction);
      document.addEventListener("touchstart", handleOutsideInteraction, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, [productListOpen]);

  const fetchReviews = () => {
    setLoading(true);
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reviews.");
        return res.json();
      })
      .then((data) => {
        setReviews(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load reviews from server.");
      })
      .finally(() => setLoading(false));

    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => console.error("Error loading products:", err));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filtered & Sorted Reviews calculation
  const filteredAndSortedReviews = useMemo(() => {
    return reviews
      .filter((rev) => {
        // Search filter: matching reviewer name, review text, or product title
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = rev.reviewer_name?.toLowerCase().includes(q);
          const textMatch = rev.review_text?.toLowerCase().includes(q);
          const prodMatch = rev.product?.title?.toLowerCase().includes(q);
          if (!nameMatch && !textMatch && !prodMatch) return false;
        }

        // Rating filter
        if (selectedRatingFilter !== "all") {
          const targetRating = parseInt(selectedRatingFilter, 10);
          if (rev.rating !== targetRating) return false;
        }

        // Product filter
        if (selectedProductFilter !== "all") {
          const targetProdId = parseInt(selectedProductFilter, 10);
          if (rev.product_id !== targetProdId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating_high") return b.rating - a.rating;
        if (sortBy === "rating_low") return a.rating - b.rating;
        if (sortBy === "reviewer_asc") return (a.reviewer_name || "").localeCompare(b.reviewer_name || "");
        if (sortBy === "oldest") return a.id - b.id;
        // Default "newest": highest ID first
        return b.id - a.id;
      });
  }, [reviews, searchQuery, selectedRatingFilter, selectedProductFilter, sortBy]);

  const hasActiveFilters = searchQuery !== "" || selectedRatingFilter !== "all" || selectedProductFilter !== "all" || sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRatingFilter("all");
    setSelectedProductFilter("all");
    setSortBy("newest");
  };

  const openAddModal = () => {
    setEditingReview(null);
    setProductIds([]);
    setProductQuery("");
    setProductListOpen(false);
    setReviewerName("");
    setRating(5);
    setReviewText("");
    setIsModalOpen(true);
  };

  const openEditModal = (rev: any) => {
    setEditingReview(rev);
    setProductIds(rev.product_id ? [Number(rev.product_id)] : []);
    setProductQuery("");
    setProductListOpen(false);
    setReviewerName(rev.reviewer_name);
    setRating(rev.rating);
    setReviewText(rev.review_text);
    setIsModalOpen(true);
  };

  // Product multi-selection toggle
  const toggleProduct = (prodId: number) => {
    if (editingReview) {
      // Editing an existing review only attaches to one product
      setProductIds([prodId]);
      setProductQuery("");
      setProductListOpen(false);
      return;
    }

    setProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const removeProduct = (prodId: number) => {
    setProductIds((prev) => prev.filter((id) => id !== prodId));
  };

  const selectedProducts = useMemo(() => {
    return products.filter((p) => productIds.includes(p.id));
  }, [products, productIds]);

  const productMatches = useMemo(() => {
    return products
      .filter((p) => String(p.title || "").toLowerCase().includes(productQuery.trim().toLowerCase()))
      .sort((a, b) => String(a.title).localeCompare(String(b.title)));
  }, [products, productQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productIds.length === 0) {
      alert("Please select at least one product for this review.");
      return;
    }
    if (!reviewerName.trim() || !reviewText.trim()) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    if (editingReview) {
      // Edit single review
      fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: productIds[0],
          reviewer_name: reviewerName,
          rating: parseInt(rating.toString()),
          review_text: reviewText,
        }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to save review.");
          return data;
        })
        .then(() => {
          setIsModalOpen(false);
          fetchReviews();
        })
        .catch((err) => alert(err.message));
    } else {
      // Create new review published to one or multiple products
      // Send product_ids array, with fallback to individual requests if older backend is deployed
      const payload = {
        product_ids: productIds,
        product_id: productIds[0],
        reviewer_name: reviewerName,
        rating: parseInt(rating.toString()),
        review_text: reviewText,
      };

      fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            // If backend only handled the first product because of older API, publish remaining
            if (productIds.length > 1 && !Array.isArray(data) && data?.product_id === productIds[0]) {
              const remaining = productIds.slice(1);
              await Promise.all(
                remaining.map((pId) =>
                  fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                      product_id: pId,
                      reviewer_name: reviewerName,
                      rating: parseInt(rating.toString()),
                      review_text: reviewText,
                    }),
                  })
                )
              );
            }
            return data;
          }
          throw new Error(data.message || "Failed to save review.");
        })
        .then(() => {
          setIsModalOpen(false);
          fetchReviews();
        })
        .catch((err) => alert(err.message));
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete review.");
        fetchReviews();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          REVIEWS
        </h1>
        <button
          onClick={openAddModal}
          style={{
            display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#D98A9C",
            color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px",
            fontSize: "16px", cursor: "pointer", fontWeight: 500, transition: "opacity 0.2s",
          }}
        >
          <Plus size={18} /> Add Review
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div style={{
        backgroundColor: "#fff", border: "1px solid #D9A85C", borderRadius: "15px",
        padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3F3B38", fontWeight: 600, fontSize: "16px" }}>
          <Filter size={18} color="#D98A9C" /> Search & Filter Reviews
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search size={16} color="#BCAEA2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search reviewer or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", height: "40px", paddingLeft: "36px", paddingRight: "12px",
                borderRadius: "8px", border: "1px solid #EBE5DB", fontSize: "14px",
                outline: "none", color: "#3F3B38", backgroundColor: "#F9F6F0"
              }}
            />
          </div>

          {/* Rating Filter */}
          <select
            value={selectedRatingFilter}
            onChange={(e) => setSelectedRatingFilter(e.target.value)}
            style={{
              height: "40px", borderRadius: "8px", border: "1px solid #EBE5DB",
              padding: "0 12px", fontSize: "14px", outline: "none", color: "#3F3B38", backgroundColor: "#F9F6F0"
            }}
          >
            <option value="all">All Ratings (Hearts)</option>
            <option value="5">5 Hearts ❤️❤️❤️❤️❤️</option>
            <option value="4">4 Hearts ❤️❤️❤️❤️</option>
            <option value="3">3 Hearts ❤️❤️❤️</option>
            <option value="2">2 Hearts ❤️❤️</option>
            <option value="1">1 Heart ❤️</option>
          </select>

          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            style={{
              height: "40px", borderRadius: "8px", border: "1px solid #EBE5DB",
              padding: "0 12px", fontSize: "14px", outline: "none", color: "#3F3B38", backgroundColor: "#F9F6F0"
            }}
          >
            <option value="all">All Products</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>{prod.title}</option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              height: "40px", borderRadius: "8px", border: "1px solid #EBE5DB",
              padding: "0 12px", fontSize: "14px", outline: "none", color: "#3F3B38", backgroundColor: "#F9F6F0"
            }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="rating_high">Sort: Rating (High to Low)</option>
            <option value="rating_low">Sort: Rating (Low to High)</option>
            <option value="reviewer_asc">Sort: Reviewer Name (A-Z)</option>
          </select>
        </div>

        {/* Active Filter Info & Reset */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
          <span style={{ fontSize: "14px", color: "#8FB9A8", fontWeight: 500 }}>
            Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{
                display: "flex", alignItems: "center", gap: "6px", background: "none",
                border: "none", color: "#E05A47", fontSize: "14px", cursor: "pointer", fontWeight: 500
              }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      <div style={{ border: "2px solid #D9A85C", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading reviews...</div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>
            {reviews.length === 0 ? "No reviews found. Add one above!" : "No reviews match the current filters."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #D9A85C" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Product</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Reviewer</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Rating</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Comment</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReviews.map((rev) => (
                <tr key={rev.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{rev.id}</td>
                  <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{rev.product?.title || "General"}</td>
                  <td style={{ padding: "16px 24px", color: "#D98A9C", fontWeight: 500 }}>{rev.reviewer_name}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: "2px", color: "#D98A9C" }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Heart key={i} size={14} fill="#D98A9C" color="#D98A9C" />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rev.review_text?.trim() ? rev.review_text : "❤️"}</td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => openEditModal(rev)}
                        style={{ background: "none", border: "none", color: "#D9A85C", cursor: "pointer" }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
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
                {editingReview ? "Edit Review" : "Add Review"}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label htmlFor="review-product" style={{ fontSize: "14px", color: "#6E6E6E" }}>
                    {editingReview ? "Product" : `Products (${selectedProducts.length} selected)`}
                  </label>
                  {!editingReview && selectedProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setProductIds([])}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#E05A47",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Selected Product Badges / Tags */}
                {selectedProducts.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                    {selectedProducts.map((p) => (
                      <span
                        key={p.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#FFEAEF",
                          border: "1px solid #D98A9C",
                          borderRadius: "16px",
                          padding: "3px 10px",
                          fontSize: "13px",
                          color: "#3F3B38",
                        }}
                      >
                        <span style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </span>
                        {!editingReview && (
                          <button
                            type="button"
                            onClick={() => removeProduct(p.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#D98A9C",
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Remove product"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div ref={productDropdownRef} style={{ position: "relative" }}>
                  <Search size={16} color="#B5A89C" style={{ position: "absolute", left: "12px", top: "20px", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    id="review-product"
                    type="text"
                    role="combobox"
                    aria-expanded={productListOpen}
                    aria-controls="review-product-list"
                    autoComplete="off"
                    placeholder={editingReview ? (selectedProducts[0]?.title || "Search product…") : "Search and select products…"}
                    value={productQuery}
                    onFocus={() => {
                      setProductListOpen(true);
                    }}
                    onClick={() => {
                      setProductListOpen(true);
                    }}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      setProductListOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setProductListOpen(false);
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (productMatches[0]) toggleProduct(productMatches[0].id);
                      }
                    }}
                    style={{
                      width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #D9A85C", boxSizing: "border-box",
                      padding: "0 12px 0 36px", fontSize: "16px", outline: "none", color: "#3F3B38", backgroundColor: "#fff",
                    }}
                  />
                  {productListOpen && (
                    <ul
                      id="review-product-list"
                      role="listbox"
                      style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30, maxHeight: "250px", overflowY: "auto",
                        margin: 0, padding: "4px", listStyle: "none", backgroundColor: "#fff", border: "1px solid #D9A85C",
                        borderRadius: "8px", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      {productMatches.length === 0 ? (
                        <li style={{ padding: "12px 14px", fontSize: "14px", color: "#8B7E74" }}>No product matches “{productQuery.trim()}”</li>
                      ) : (
                        productMatches.map((prod) => {
                          const isSelected = productIds.includes(prod.id);
                          return (
                            <li key={prod.id} role="option" aria-selected={isSelected}>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  // Prevent input blur and keyboard dismissal on iPad / touchscreens
                                  e.preventDefault();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleProduct(prod.id);
                                }}
                                style={{
                                  width: "100%", minHeight: "44px", padding: "8px 12px", border: "none", borderRadius: "6px", textAlign: "left",
                                  backgroundColor: isSelected ? "#FFEAEF" : "transparent", color: "#3F3B38", fontSize: "15px", cursor: "pointer",
                                  display: "flex", justifyContent: "space-between", alignItems: "center",
                                  WebkitTapHighlightColor: "transparent",
                                }}
                              >
                                <span>{prod.title}</span>
                                {isSelected && <Check size={16} color="#D98A9C" strokeWidth={2.5} />}
                              </button>
                            </li>
                          );
                        })
                      )}
                      {!editingReview && (
                        <li
                          style={{
                            position: "sticky",
                            bottom: 0,
                            backgroundColor: "#FAF7F5",
                            borderTop: "1px solid #EBE5DB",
                            padding: "8px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            zIndex: 2,
                            borderRadius: "0 0 6px 6px",
                            marginTop: "4px",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: "#6E6E6E", fontWeight: 500 }}>
                            {productIds.length} product{productIds.length !== 1 ? "s" : ""} selected
                          </span>
                          <button
                            type="button"
                            onPointerDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              setProductListOpen(false);
                            }}
                            style={{
                              backgroundColor: "#D98A9C",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 14px",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Done
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. Sahil Bhargava"
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Rating (1 - 5 Hearts)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38", backgroundColor: "#fff",
                  }}
                >
                  <option value="5">5 Hearts</option>
                  <option value="4">4 Hearts</option>
                  <option value="3">3 Hearts</option>
                  <option value="2">2 Hearts</option>
                  <option value="1">1 Heart</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Comment</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{
                    height: "80px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "8px 12px", fontSize: "16px", outline: "none", color: "#3F3B38", resize: "none",
                  }}
                  placeholder="Review comments..."
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

