"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Upload, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

// Utility to compress and convert images to WebP
async function compressImageToWebp(file: File): Promise<string> {
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  let fileToProcess: File = file;
  if (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  ) {
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg" });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      fileToProcess = new File([blob], file.name.replace(/\.heic|\.heif/i, ".jpg"), { type: "image/jpeg" });
    } catch (e) {
      console.warn("heic2any conversion failed or not available", e);
    }
  }

  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp" as string,
      initialQuality: 0.8,
    };
    const compressedFile = await imageCompression(fileToProcess, options);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (err) {
    console.error("Compression error:", err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileToProcess);
    });
  }
}

export default function BannersDashboard() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("all");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const dataUrl = await compressImageToWebp(file);
      setImageUrl(dataUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const fetchBanners = () => {
    setLoading(true);
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load banners.");
        return res.json();
      })
      .then((data) => {
        setBanners(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load banners from server.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("");
    setPosition("all");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setImageUrl(banner.image_url || "");
    setLinkUrl(banner.link_url || "");
    setPosition(banner.position || "all");
    setIsActive(!!banner.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const url = editingBanner
      ? `https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners/${editingBanner.id}`
      : "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners";

    const method = editingBanner ? "PUT" : "POST";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title,
        subtitle,
        image_url: imageUrl,
        link_url: linkUrl,
        position: position,
        is_active: isActive,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errMsg = data.message || "Failed to save banner.";
          throw new Error(errMsg);
        }
        return data;
      })
      .then(() => {
        setIsModalOpen(false);
        fetchBanners();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete banner.");
        fetchBanners();
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
          BANNERS
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
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      {/* Banners List */}
      <div style={{ border: "2px solid #8FB9A8", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading banners...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>No banners found. Add one above!</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #8FB9A8" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Title</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Location Placement</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Image</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{banner.id}</td>
                  <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{banner.title}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: 600,
                      backgroundColor: "rgba(217, 168, 92, 0.15)", color: "#D9A85C", display: "inline-block"
                    }}>
                      {banner.position === "special_offers_main" ? "Special Offers - Main Big Banner" :
                       banner.position === "special_offers_top_right" ? "Special Offers - Top Right Card" :
                       banner.position === "special_offers_bottom_right" ? "Special Offers - Bottom Right Card" :
                       banner.position === "home_top" ? "Home Page Top Banner" :
                       banner.position || "All Pages"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", color: "#D98A9C" }}>
                    {banner.image_url ? (
                      <img src={banner.image_url} alt="Banner" style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                    ) : (
                      <span style={{ fontSize: "12px", color: "#BCAEA2" }}>No Image</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span
                      style={{
                        padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 500,
                        backgroundColor: banner.is_active ? "rgba(143,185,168,0.15)" : "#F5EDE8",
                        color: banner.is_active ? "#8FB9A8" : "#BCAEA2",
                      }}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => openEditModal(banner)}
                        style={{ background: "none", border: "none", color: "#D9A85C", cursor: "pointer" }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
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
              border: "1px solid #8FB9A8", display: "flex", flexDirection: "column", gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="font-serif" style={{ fontSize: "20px", color: "#3F3B38", margin: 0 }}>
                {editingBanner ? "Edit Banner" : "Add Banner"}
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
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #8FB9A8",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. MADE BY HANDS. MEANT FOR THE HEART."
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Subtitle / Description</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #8FB9A8",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. Personalized handmade frames and keepsakes..."
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Banner Image</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                      backgroundColor: "#F5EDE8", color: "#8FB9A8", border: "1px dashed #8FB9A8",
                      borderRadius: "8px", cursor: uploading ? "not-allowed" : "pointer",
                      fontSize: "14px", fontWeight: 500, flex: 1, justifyContent: "center"
                    }}
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {uploading ? "Compressing..." : "Upload Image"}
                  </button>
                </div>
                {imageUrl && (
                  <div style={{ marginTop: "10px", position: "relative", width: "100%", height: "120px", borderRadius: "8px", overflow: "hidden" }}>
                    <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      style={{
                        position: "absolute", top: "5px", right: "5px", background: "rgba(255,255,255,0.8)",
                        border: "none", borderRadius: "50%", padding: "4px", cursor: "pointer", color: "#E05A47"
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E" }}>Target Link URL (Button click destination)</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{
                    height: "40px", borderRadius: "8px", border: "1px solid #8FB9A8",
                    padding: "0 12px", fontSize: "16px", outline: "none", color: "#3F3B38",
                  }}
                  placeholder="e.g. /shop or /special-offers"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", color: "#6E6E6E", fontWeight: 600 }}>Exact Location Placement</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  style={{
                    height: "42px", borderRadius: "8px", border: "2px solid #D9A85C",
                    padding: "0 12px", fontSize: "15px", outline: "none", color: "#3F3B38", backgroundColor: "#FFFBF5", fontWeight: 500
                  }}
                >
                  <option value="special_offers_main">🌟 Special Offers - Main Big Banner (Left)</option>
                  <option value="special_offers_top_right">🏆 Special Offers - Top Right Card (Gold 50% OFF)</option>
                  <option value="special_offers_bottom_right">✨ Special Offers - Bottom Right Card (Green Special Offer)</option>
                  <option value="home_top">🏠 Home Page Top Banner</option>
                  <option value="all">🌐 All Pages / General</option>
                </select>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#3F3B38" }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                Active Status
              </label>

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
