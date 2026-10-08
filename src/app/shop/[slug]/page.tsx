"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown, Truck, ArrowLeft } from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToBag } = useCart();

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: { value: string; modifier: number } }>({});
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productData?.id,
          reviewer_name: newReviewerName.trim(),
          review_text: newReviewText.trim(),
          rating: newRating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewsList((prev) => [data.review || data, ...prev]);
        setNewReviewerName("");
        setNewReviewText("");
        setNewRating(5);
        setShowReviewForm(false);
        alert("Thank you! Your review has been submitted successfully.");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    // Fetch product by slug
    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProductData(data);
        if (data.reviews) {
          setReviewsList(data.reviews);
        }

        // Initialize default attribute selections
        if (data.attributes && Array.isArray(data.attributes)) {
          const initialSelections: { [key: string]: { value: string; modifier: number } } = {};
          data.attributes.forEach((attr: any) => {
            if (attr.values && attr.values.length > 0) {
              initialSelections[attr.name] = {
                value: attr.values[0].value,
                modifier: parseFloat(attr.values[0].price_modifier || "0"),
              };
            }
          });
          setSelectedAttributes(initialSelections);
        }
      })
      .catch(() => {
        // Fallback: search in all products list
        fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
          .then((res) => res.json())
          .then((allProducts) => {
            if (Array.isArray(allProducts)) {
              const matched = allProducts.find(
                (p: any) => p.slug === slug || p.slug?.toLowerCase() === slug.toLowerCase() || p.title.toLowerCase().replace(/\s+/g, "-") === slug
              ) || allProducts[0];
              if (matched) {
                setProductData(matched);
                if (matched.attributes && Array.isArray(matched.attributes)) {
                  const initialSelections: { [key: string]: { value: string; modifier: number } } = {};
                  matched.attributes.forEach((attr: any) => {
                    if (attr.values && attr.values.length > 0) {
                      initialSelections[attr.name] = {
                        value: attr.values[0].value,
                        modifier: parseFloat(attr.values[0].price_modifier || "0"),
                      };
                    }
                  });
                  setSelectedAttributes(initialSelections);
                }
              }
              setRelatedProducts(allProducts.filter((p: any) => p.id !== matched?.id).slice(0, 4));
            }
          });
      })
      .finally(() => setLoading(false));

    // Fetch related products
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => res.json())
      .then((all) => {
        if (Array.isArray(all)) {
          setRelatedProducts(all.filter((p: any) => p.slug !== slug).slice(0, 4));
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleAttributeChange = (attrName: string, selectedValue: string, attrValues: any[]) => {
    const matched = attrValues.find((v: any) => v.value === selectedValue);
    const mod = matched ? parseFloat(matched.price_modifier || "0") : 0;
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: { value: selectedValue, modifier: mod },
    }));
  };

  const toggleCheckboxAttribute = (attrName: string, value: string, attrValues: any[]) => {
    setSelectedAttributes((prev) => {
      const current = prev[attrName];
      let currentValues: string[] = [];
      if (current && current.value) {
        currentValues = current.value.split(", ").map((s) => s.trim()).filter(Boolean);
      }

      let newValues: string[];
      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v) => v !== value);
      } else {
        newValues = [...currentValues, value];
      }

      let totalMod = 0;
      newValues.forEach((valStr) => {
        const match = attrValues.find((v: any) => v.value === valStr);
        if (match) totalMod += parseFloat(match.price_modifier || "0");
      });

      return {
        ...prev,
        [attrName]: { value: newValues.join(", "), modifier: totalMod },
      };
    });
  };

  const calculateTotalPrice = () => {
    if (!productData) return 0;
    const baseVal = productData.discount_price ? parseFloat(productData.discount_price) : parseFloat(productData.base_price || "0");
    let total = baseVal;
    Object.values(selectedAttributes).forEach((attr) => {
      total += attr.modifier || 0;
    });
    return Math.max(0, total);
  };

  const calculateOriginalTotalPrice = () => {
    if (!productData) return 0;
    let baseVal = parseFloat(productData.base_price || "0");
    Object.values(selectedAttributes).forEach((attr) => {
      baseVal += attr.modifier || 0;
    });
    return Math.max(0, baseVal);
  };

  const handleAddToBag = () => {
    if (!productData) return;
    const finalPrice = calculateTotalPrice();
    const attrSummary = Object.entries(selectedAttributes)
      .map(([k, v]) => `${v.value}`)
      .filter(Boolean)
      .join(", ");

    addToBag({
      id: `${productData.id}-${Date.now()}`,
      title: `${productData.title}${attrSummary ? ` (${attrSummary})` : ""}`,
      price: finalPrice,
      image: productData.image || (productData.images && productData.images[0]) || "",
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
        <Navbar />
        <div style={{ flex: 1, padding: "80px 20px", textAlign: "center", color: "#8FB9A8", fontSize: "18px" }}>
          Loading Product Details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!productData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
        <Navbar />
        <div style={{ flex: 1, padding: "80px 20px", textAlign: "center" }}>
          <h2 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "16px" }}>
            Product Not Found
          </h2>
          <p className="font-sans" style={{ color: "#6E6E6E", marginBottom: "24px" }}>
            We could not find the product you were looking for.
          </p>
          <a
            href="/shop"
            style={{
              padding: "12px 24px",
              borderRadius: "24px",
              backgroundColor: "#D98A9C",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Return to Shop
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  // Robust parsing for gallery images array
  const getGalleryImages = (): string[] => {
    if (!productData) return [];
    const list: string[] = [];

    if (productData.image && typeof productData.image === "string") {
      const trimmed = productData.image.trim();
      if (trimmed && !trimmed.startsWith("[")) {
        list.push(trimmed);
      }
    }

    let extra: any = productData.images;
    if (typeof extra === "string") {
      try {
        extra = JSON.parse(extra);
      } catch (e) {
        if (extra.includes(",")) {
          extra = extra.split(",").map((s: string) => s.trim());
        } else if (extra.trim() && !extra.trim().startsWith("[")) {
          extra = [extra.trim()];
        }
      }
    }

    if (Array.isArray(extra)) {
      extra.forEach((img: any) => {
        if (typeof img === "string" && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }

    return list.filter(Boolean);
  };

  const galleryImages = getGalleryImages();
  const currentMainImage = galleryImages[selectedImageIndex] || galleryImages[0] || productData?.image || "";
  const subImages = galleryImages.slice(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="details-container">
          
          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#8FB9A8",
              textDecoration: "none",
              fontSize: "15px",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={18} /> Back to Shop
          </Link>

          {/* Header Title */}
          <h1
            className="font-serif page-title"
            style={{
              fontSize: "36px",
              lineHeight: "48px",
              fontWeight: 400,
              color: "#3F3B38",
              margin: "0 0 40px 0",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {productData.title}
          </h1>

          {/* Two-Column Grid */}
          <div className="details-layout">
            
            {/* LEFT COLUMN: Gallery Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Main large image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "364/455",
                  backgroundColor: "#FAF6F0",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {currentMainImage ? (
                  <img src={currentMainImage} alt={productData.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ color: "#BCAEA2", fontSize: "16px", textAlign: "center", padding: "20px" }}>
                    {productData.title}
                  </div>
                )}
              </div>

              {/* Interactive Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div style={{ display: "flex", gap: "12px", overflowX: "auto", padding: "4px 0 8px 0", scrollbarWidth: "none" }}>
                  {galleryImages.map((imgUrl: string, idx: number) => {
                    const isActive = idx === selectedImageIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: isActive ? "2.5px solid #D98A9C" : "1px solid #E5D5C5",
                          backgroundColor: "#FAF6F0",
                          cursor: "pointer",
                          flexShrink: 0,
                          padding: 0,
                          transition: "all 0.2s ease",
                          boxShadow: isActive ? "0px 4px 10px rgba(217,138,156,0.3)" : "none",
                        }}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sub-gallery grid */}
              {galleryImages.length > 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: subImages.length > 1 ? "1fr 1fr" : "1fr", gap: "20px" }}>
                    {subImages.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx + 1)}
                        style={{
                          height: "220px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          backgroundColor: "#FAF6F0",
                          cursor: "pointer",
                          border: selectedImageIndex === idx + 1 ? "2.5px solid #D98A9C" : "1px solid transparent",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <img src={imgUrl} alt={`Gallery sub-image ${idx + 2}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Configurator & Reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              
              {/* Top Row: Description & Price side-by-side */}
              <div className="desc-price-row">
                <p
                  className="font-sans product-desc"
                  style={{
                    fontSize: "16px",
                    lineHeight: "26px",
                    fontWeight: 400,
                    color: "#8FB9A8",
                    margin: 0,
                    flex: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {productData.description || "Handcrafted custom keepsake crafted especially with premium flowers and preservation craftsmanship."}
                </p>
                <div
                  className="font-serif product-price"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span style={{ fontSize: "36px", lineHeight: "44px", fontWeight: 400, color: "#3F3B38" }}>
                    ₹{calculateTotalPrice().toLocaleString("en-IN")}
                  </span>
                  {productData.discount_price && (
                    <span style={{ fontSize: "20px", textDecoration: "line-through", color: "#999" }}>
                      ₹{calculateOriginalTotalPrice().toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Free Delivery Banner */}
              {productData.is_free_delivery && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    backgroundColor: "rgba(78, 142, 118, 0.12)",
                    border: "1px solid #8FB9A8",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    color: "#2E7D32",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <Truck size={20} color="#4E8E76" />
                  <span>🚚 <b>Free Delivery:</b> Included on this handcrafted product!</span>
                </div>
              )}

              {/* Dynamic Attribute Customizers */}
              {productData.attributes && productData.attributes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {productData.attributes.map((attr: any) => {
                    const validValues = (attr.values || []).filter(
                      (v: any) => v.value && !["na", "n/a", "none", "-", "null", ""].includes(v.value.toString().trim().toLowerCase())
                    );

                    const isCheckbox = attr.type === "checkbox" || attr.name.toLowerCase() === "options";
                    const isTextInput = attr.type === "text";

                    if (!isTextInput && validValues.length === 0) return null;

                    const currentSelectedStr = selectedAttributes[attr.name]?.value || "";
                    const checkedList = currentSelectedStr.split(", ").map((s: string) => s.trim()).filter(Boolean);

                    return (
                      <div key={attr.id || attr.name} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label className="font-serif" style={{ fontSize: "17px", color: "#3F3B38", fontWeight: 500 }}>
                          {attr.name}
                        </label>

                        {isTextInput ? (
                          <input
                            type="text"
                            placeholder={`Enter ${attr.name.toLowerCase()} details...`}
                            value={currentSelectedStr}
                            onChange={(e) => handleAttributeChange(attr.name, e.target.value, validValues)}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1px solid #D9A85C",
                              fontSize: "14px",
                              color: "#3F3B38",
                              outline: "none",
                              backgroundColor: "#FFFDF9",
                            }}
                          />
                        ) : isCheckbox ? (
                          /* CHECKBOX MULTI-SELECT OPTIONS */
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {validValues.map((opt: any) => {
                              const mod = parseFloat(opt.price_modifier || "0");
                              const modText = mod > 0 ? ` (+₹${parseInt(mod.toString())})` : mod < 0 ? ` (-₹${Math.abs(parseInt(mod.toString()))})` : "";
                              const isChecked = checkedList.includes(opt.value);
                              return (
                                <label
                                  key={opt.id || opt.value}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleCheckboxAttribute(attr.name, opt.value, validValues);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 16px",
                                    borderRadius: "10px",
                                    border: isChecked ? "2px solid #D9A85C" : "1px solid #E5D5C5",
                                    backgroundColor: isChecked ? "rgba(217, 168, 92, 0.1)" : "#FFFDF9",
                                    color: isChecked ? "#3F3B38" : "#6E6E6E",
                                    fontSize: "14px",
                                    fontWeight: isChecked ? 600 : 400,
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    style={{ accentColor: "#D9A85C", width: "16px", height: "16px", cursor: "pointer" }}
                                  />
                                  <span>{opt.value}{modText}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          /* PILL / RADIO SINGLE-SELECT OPTIONS */
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {validValues.map((opt: any) => {
                              const mod = parseFloat(opt.price_modifier || "0");
                              const modText = mod > 0 ? ` (+₹${parseInt(mod.toString())})` : mod < 0 ? ` (-₹${Math.abs(parseInt(mod.toString()))})` : "";
                              const isSelected = selectedAttributes[attr.name]?.value === opt.value;
                              return (
                                <button
                                  key={opt.id || opt.value}
                                  type="button"
                                  onClick={() => handleAttributeChange(attr.name, opt.value, validValues)}
                                  style={{
                                    padding: "10px 16px",
                                    borderRadius: "10px",
                                    border: isSelected ? "2px solid #D98A9C" : "1px solid #D9A85C",
                                    backgroundColor: isSelected ? "rgba(217, 138, 156, 0.05)" : "#fff",
                                    color: isSelected ? "#3F3B38" : "#8FB9A8",
                                    fontSize: "14px",
                                    fontWeight: isSelected ? 600 : 400,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  {opt.value}{modText}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add to Cart button */}
              <div>
                <button
                  onClick={handleAddToBag}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "24px",
                    border: "1.5px solid #D9A85C",
                    backgroundColor: "transparent",
                    color: "#D98A9C",
                    fontSize: "16px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(217, 138, 156, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  ADD TO CART
                </button>
              </div>

              {/* Reviews Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: 0 }}>Customer Reviews</h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    style={{
                      backgroundColor: showReviewForm ? "#FAF6F0" : "#D98A9C",
                      color: showReviewForm ? "#3F3B38" : "#fff",
                      border: "1px solid #D98A9C",
                      padding: "8px 18px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                </div>

                {/* Write a Review Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleReviewSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      padding: "20px",
                      borderRadius: "15px",
                      backgroundColor: "#FAF6F0",
                      border: "1px solid #D9A85C",
                    }}
                  >
                    <h4 className="font-serif" style={{ fontSize: "18px", margin: 0, color: "#3F3B38" }}>
                      Share Your Feedback
                    </h4>
                    
                    <div>
                      <label className="font-sans" style={{ fontSize: "13px", color: "#6E6E6E", display: "block", marginBottom: "4px" }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #EBE5DB",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label className="font-sans" style={{ fontSize: "13px", color: "#6E6E6E", display: "block", marginBottom: "4px" }}>
                        Rating (1 to 5 Stars) *
                      </label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                          >
                            <Heart size={22} fill={star <= newRating ? "#D98A9C" : "none"} color="#3F3B38" />
                          </button>
                        ))}
                        <span className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500, marginLeft: "6px" }}>
                          {newRating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="font-sans" style={{ fontSize: "13px", color: "#6E6E6E", display: "block", marginBottom: "4px" }}>
                        Review Comment *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="What did you love about this item?"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #EBE5DB",
                          fontSize: "14px",
                          outline: "none",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{
                        backgroundColor: "#D98A9C",
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "24px",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: submittingReview ? "not-allowed" : "pointer",
                        alignSelf: "flex-start",
                      }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
                
                {reviewsList.length === 0 ? (
                  <div style={{ border: "1px solid #EBE5DB", borderRadius: "12px", padding: "16px", backgroundColor: "#FAF6F0" }}>
                    <span className="font-serif" style={{ fontSize: "16px", color: "#D98A9C", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                      Ayush Sharma
                    </span>
                    <p className="font-sans" style={{ fontSize: "14px", lineHeight: "22px", color: "#8FB9A8", margin: "0 0 8px 0" }}>
                      {productData.title} come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts.
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Heart key={i} size={18} fill={i < 4 ? "#D98A9C" : "none"} color="#3F3B38" />
                      ))}
                    </div>
                  </div>
                ) : (
                  reviewsList.map((item) => (
                    <div
                      key={item.id || Math.random()}
                      style={{
                        border: "1px solid #D9A85C",
                        borderRadius: "15px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <span className="font-serif" style={{ fontSize: "18px", color: "#D98A9C", fontWeight: 500 }}>
                        {item.reviewer_name}
                      </span>
                      <p className="font-sans" style={{ fontSize: "15px", lineHeight: "24px", color: "#8FB9A8", margin: 0 }}>
                        {item.review_text}
                      </p>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Heart key={i} size={18} fill={i < (item.rating || 5) ? "#D98A9C" : "none"} color="#3F3B38" />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* RELATED PRODUCTS GRID */}
          {relatedProducts.length > 0 && (
            <div style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px", marginTop: "40px" }}>
              <h2 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
                You may also Like:
              </h2>

              <div className="related-grid">
                {relatedProducts.map((prod) => (
                  <div key={prod.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <a
                      href={`/shop/${prod.slug || prod.id}`}
                      style={{
                        width: "100%",
                        aspectRatio: "338/422",
                        backgroundColor: "#FAF6F0",
                        borderRadius: "15px",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.08)",
                        marginBottom: "16px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                      }}
                    >
                      {prod.image ? (
                        <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ color: "#BCAEA2", fontSize: "14px", padding: "12px", textAlign: "center" }}>
                          {prod.title}
                        </div>
                      )}
                    </a>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                      <a
                        href={`/shop/${prod.slug || prod.id}`}
                        className="font-serif"
                        style={{
                          fontSize: "20px",
                          lineHeight: "28px",
                          fontWeight: 400,
                          color: "#3F3B38",
                          textAlign: "center",
                          margin: 0,
                          textDecoration: "none",
                        }}
                      >
                        {prod.title}
                      </a>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span className="font-sans" style={{ fontSize: "18px", fontWeight: 500, color: "#3F3B38" }}>
                          ₹{parseInt(prod.base_price || "2000").toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() =>
                            addToBag({
                              id: prod.id,
                              title: prod.title,
                              price: parseFloat(prod.base_price || "2000"),
                              image: prod.image || "",
                            })
                          }
                          className="font-sans"
                          style={{
                            background: "none",
                            border: "none",
                            borderBottom: "1px solid #3F3B38",
                            fontSize: "18px",
                            color: "#3F3B38",
                            cursor: "pointer",
                            padding: "0 0 2px 0",
                          }}
                        >
                          Add to bag
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      <style jsx>{`
        .details-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 120px;
        }
        .details-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          margin-bottom: 80px;
        }
        .desc-price-row {
          display: flex;
          gap: 40px;
          align-items: start;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        @media (max-width: 1200px) {
          .details-container {
            padding: 0 40px;
          }
          .details-layout {
            gap: 40px;
          }
        }
        @media (max-width: 992px) {
          .details-layout {
            grid-template-columns: 1fr;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .details-container {
            padding: 0 16px;
          }
          .page-title {
            font-size: 28px !important;
            line-height: 38px !important;
            margin-bottom: 24px !important;
          }
          .desc-price-row {
            flex-direction: column;
            gap: 16px;
          }
          .product-desc {
            font-size: 15px !important;
            line-height: 22px !important;
          }
          .product-price {
            font-size: 28px !important;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
