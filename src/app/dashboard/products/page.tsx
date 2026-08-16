"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Upload, Check, Loader2 } from "lucide-react";

export default function ProductsDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [isWeddingSpecial, setIsWeddingSpecial] = useState(false);

  // Attribute Form Fields (Optional)
  // attributes: Array of { name: string, values: Array<{ value: string, price_modifier: number }> }
  const [attributes, setAttributes] = useState<any[]>([]);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    setLoading(true);
    // Fetch Products
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products.");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load data from server.");
      })
      .finally(() => setLoading(false));

    // Fetch Categories for Form Dropdown
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setCategoryId(categories[0]?.id || "");
    setTitle("");
    setBasePrice("");
    setDescription("");
    setImage("");
    setIsNewDiscovery(false);
    setIsWeddingSpecial(false);
    setAttributes([]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setCategoryId(prod.category_id);
    setTitle(prod.title);
    setBasePrice(prod.base_price);
    setDescription(prod.description || "");
    setImage(prod.image || "");
    setIsNewDiscovery(!!prod.is_new_discovery);
    setIsWeddingSpecial(!!prod.is_wedding_special);
    
    // Parse existing attributes if present
    if (prod.attributes && Array.isArray(prod.attributes)) {
      setAttributes(
        prod.attributes.map((attr: any) => ({
          name: attr.name,
          values: attr.values ? attr.values.map((v: any) => ({
            value: v.value,
            price_modifier: parseFloat(v.price_modifier || "0")
          })) : []
        }))
      );
    } else {
      setAttributes([]);
    }
    
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed. Verify image type & size (<2MB).");
        return res.json();
      })
      .then((data) => {
        if (data.url) {
          setImage(data.url);
        }
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  // Attributes Management
  const addAttribute = () => {
    setAttributes([...attributes, { name: "", values: [{ value: "", price_modifier: 0 }] }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttributeName = (index: number, newName: string) => {
    const updated = [...attributes];
    updated[index].name = newName;
    setAttributes(updated);
  };

  const addAttributeValue = (attrIndex: number) => {
    const updated = [...attributes];
    updated[attrIndex].values.push({ value: "", price_modifier: 0 });
    setAttributes(updated);
  };

  const removeAttributeValue = (attrIndex: number, valIndex: number) => {
    const updated = [...attributes];
    updated[attrIndex].values = updated[attrIndex].values.filter((_: any, i: number) => i !== valIndex);
    setAttributes(updated);
  };

  const updateAttributeValueText = (attrIndex: number, valIndex: number, text: string) => {
    const updated = [...attributes];
    updated[attrIndex].values[valIndex].value = text;
    setAttributes(updated);
  };

  const updateAttributeValueModifier = (attrIndex: number, valIndex: number, val: number) => {
    const updated = [...attributes];
    updated[attrIndex].values[valIndex].price_modifier = val;
    setAttributes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !basePrice || !categoryId) return;

    const url = editingProduct
      ? `https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${editingProduct.id}`
      : "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products";

    const method = editingProduct ? "PUT" : "POST";

    // Clean up empty attributes
    const cleanAttributes = attributes
      .filter((attr) => attr.name.trim() !== "")
      .map((attr) => ({
        name: attr.name,
        values: attr.values.filter((v: any) => v.value.trim() !== "")
      }));

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_id: parseInt(categoryId),
        title,
        base_price: parseFloat(basePrice),
        description,
        image,
        is_new_discovery: isNewDiscovery,
        is_wedding_special: isWeddingSpecial,
        attributes: cleanAttributes
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save product.");
        return res.json();
      })
      .then(() => {
        setIsModalOpen(false);
        fetchData();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete product.");
        fetchData();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header with add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          PRODUCTS
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
          <Plus size={18} /> Add Product
        </button>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      {/* Products List */}
      <div style={{ border: "2px solid #D98A9C", borderRadius: "15px", overflow: "hidden", backgroundColor: "#fff" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>No products found. Add one above!</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #D98A9C" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Thumbnail</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Title</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Category</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Base Price</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Attributes</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{prod.id}</td>
                  <td style={{ padding: "16px 24px" }}>
                    {prod.image ? (
                      <img src={prod.image} alt={prod.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                    ) : (
                      <div style={{ width: "50px", height: "50px", backgroundColor: "#F5EDE8", borderRadius: "8px" }}></div>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{prod.title}</td>
                  <td style={{ padding: "16px 24px", color: "#D98A9C" }}>{prod.category?.name || "Uncategorized"}</td>
                  <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>₹{prod.base_price}</td>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>
                    {prod.attributes && prod.attributes.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {prod.attributes.map((a: any) => (
                          <span key={a.id} style={{ padding: "2px 8px", backgroundColor: "#F5EDE8", borderRadius: "10px", fontSize: "12px", color: "#8B7E74" }}>
                            {a.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#BCAEA2", fontStyle: "italic" }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => openEditModal(prod)}
                        style={{ background: "none", border: "none", color: "#D9A85C", cursor: "pointer" }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
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
              width: "600px", maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #D9A85C",
              display: "flex", flexDirection: "column", gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="font-serif" style={{ fontSize: "20px", color: "#3F3B38", margin: 0 }}>
                {editingProduct ? "Edit Product" : "Add Product"}
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
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38", backgroundColor: "#fff",
                  }}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. Wedding Memory Frame"
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Base Price (₹)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. 2000"
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    height: "80px", borderRadius: "8px", border: "1px solid #D9A85C",
                    padding: "8px 12px", fontSize: "16px", outline: "none", color: "#3F3B38", resize: "none",
                  }}
                  placeholder="Provide product details..."
                />
              </div>

              {/* Image Input & Upload */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Product Image</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    style={{
                      flex: 1, height: "40px", borderRadius: "8px", border: "1px solid #D9A85C",
                      padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                    }}
                    placeholder="Enter image URL or upload..."
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      height: "40px", padding: "0 16px", backgroundColor: "#8FB9A8",
                      color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "8px", fontWeight: 500,
                    }}
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Upload
                  </button>
                </div>
                {image && (
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#8FB9A8" }}>Image Preview:</p>
                    <img src={image} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #EBE5DB" }} />
                  </div>
                )}
              </div>

              {/* Optional Product Attributes Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px dashed #D9A85C", borderRadius: "10px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 className="font-serif" style={{ margin: 0, fontSize: "16px", color: "#3F3B38" }}>
                    Product Attributes (Optional)
                  </h4>
                  <button
                    type="button"
                    onClick={addAttribute}
                    style={{
                      display: "flex", alignItems: "center", gap: "4px", background: "none",
                      border: "none", color: "#D98A9C", cursor: "pointer", fontWeight: 600, fontSize: "14px"
                    }}
                  >
                    <Plus size={16} /> Add Attribute
                  </button>
                </div>

                {attributes.map((attr, attrIndex) => (
                  <div key={attrIndex} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", backgroundColor: "#F9F6F0", borderRadius: "8px", position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => removeAttribute(attrIndex)}
                      style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "#E05A47", cursor: "pointer" }}
                    >
                      <X size={16} />
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "85%" }}>
                      <label style={{ fontSize: "12px", color: "#6E6E6E" }}>Attribute Name</label>
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttributeName(attrIndex, e.target.value)}
                        placeholder="e.g. Size, Frame Color, Preservation"
                        style={{
                          height: "36px", borderRadius: "6px", border: "1px solid #D9A85C",
                          padding: "0 10px", fontSize: "14px", outline: "none", color: "#3F3B38", backgroundColor: "#fff"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#8B7E74" }}>Values & Price Modifiers</span>
                        <button
                          type="button"
                          onClick={() => addAttributeValue(attrIndex)}
                          style={{ fontSize: "12px", color: "#D98A9C", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                        >
                          + Add Value
                        </button>
                      </div>

                      {attr.values.map((val: any, valIndex: number) => (
                        <div key={valIndex} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <input
                            type="text"
                            value={val.value}
                            onChange={(e) => updateAttributeValueText(attrIndex, valIndex, e.target.value)}
                            placeholder="e.g. Medium / Gold"
                            style={{
                              flex: 2, height: "32px", borderRadius: "6px", border: "1px solid #D9A85C",
                              padding: "0 10px", fontSize: "14px", outline: "none", color: "#3F3B38"
                            }}
                          />
                          <input
                            type="number"
                            value={val.price_modifier}
                            onChange={(e) => updateAttributeValueModifier(attrIndex, valIndex, parseFloat(e.target.value) || 0)}
                            placeholder="Price modifier (e.g. +500)"
                            style={{
                              flex: 1, height: "32px", borderRadius: "6px", border: "1px solid #D9A85C",
                              padding: "0 10px", fontSize: "14px", outline: "none", color: "#3F3B38"
                            }}
                          />
                          {attr.values.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttributeValue(attrIndex, valIndex)}
                              style={{ background: "none", border: "none", color: "#E05A47", cursor: "pointer" }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "24px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#3F3B38" }}>
                  <input
                    type="checkbox"
                    checked={isNewDiscovery}
                    onChange={(e) => setIsNewDiscovery(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  New Discovery
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#3F3B38" }}>
                  <input
                    type="checkbox"
                    checked={isWeddingSpecial}
                    onChange={(e) => setIsWeddingSpecial(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  Wedding Special
                </label>
              </div>

              <button
                type="submit"
                style={{
                  height: "40px", backgroundColor: "#D98A9C", color: "#fff",
                  border: "none", borderRadius: "8px", fontSize: "16px",
                  fontWeight: 500, cursor: "pointer", transition: "opacity 0.2s",
                  marginTop: "10px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
