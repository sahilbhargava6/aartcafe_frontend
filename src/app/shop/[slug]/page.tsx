"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown } from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToBag } = useCart();

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: { value: string; modifier: number } }>({});
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

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

  const calculateTotalPrice = () => {
    if (!productData) return 0;
    let base = parseFloat(productData.base_price || "0");
    Object.values(selectedAttributes).forEach((attr) => {
      base += attr.modifier || 0;
    });
    return Math.max(0, base);
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

  // Gallery images array
  const galleryImages: string[] = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : productData.image
    ? [productData.image]
    : [];

  const mainImage = galleryImages[0] || "";
  const subImages = galleryImages.slice(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="details-container">
          
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
                {mainImage ? (
                  <img src={mainImage} alt={productData.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ color: "#BCAEA2", fontSize: "16px", textAlign: "center", padding: "20px" }}>
                    {productData.title}
                  </div>
                )}
              </div>

              {/* Sub-gallery grid matching design mockup */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {subImages.length >= 2 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ height: "200px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FAF6F0" }}>
                      <img src={subImages[0]} alt="Gallery 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ height: "200px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FAF6F0" }}>
                      <img src={subImages[1]} alt="Gallery 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </div>
                ) : null}

                {subImages.slice(2).map((imgUrl: string, idx: number) => (
                  <div key={idx} style={{ height: "200px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FAF6F0" }}>
                    <img src={imgUrl} alt={`Gallery ${idx + 3}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
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
                  }}
                >
                  {productData.description || "Handcrafted custom keepsake crafted especially with premium flowers and preservation craftsmanship."}
                </p>
                <div
                  className="font-serif product-price"
                  style={{
                    fontSize: "36px",
                    lineHeight: "44px",
                    fontWeight: 400,
                    color: "#3F3B38",
                    whiteSpace: "nowrap",
                  }}
                >
                  ₹{calculateTotalPrice()}
                </div>
              </div>

              {/* Dynamic Attribute Customizers */}
              {productData.attributes && productData.attributes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {productData.attributes.map((attr: any) => {
                    // Filter out invalid/placeholder values like NA, N/A, -, none, empty
                    const validValues = (attr.values || []).filter(
                      (v: any) => v.value && !["na", "n/a", "none", "-", "null", ""].includes(v.value.toString().trim().toLowerCase())
                    );

                    if (validValues.length === 0) return null;

                    return (
                      <div key={attr.id || attr.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="font-serif" style={{ fontSize: "17px", color: "#3F3B38", fontWeight: 400 }}>
                          {attr.name}
                        </label>
                        <div style={{ position: "relative" }}>
                          <select
                            value={selectedAttributes[attr.name]?.value || validValues[0]?.value || ""}
                            onChange={(e) => handleAttributeChange(attr.name, e.target.value, validValues)}
                            style={{
                              width: "100%",
                              height: "44px",
                              borderRadius: "10px",
                              border: "1px solid #D9A85C",
                              padding: "0 40px 0 16px",
                              fontSize: "15px",
                              color: "#D98A9C",
                              backgroundColor: "#fff",
                              outline: "none",
                              cursor: "pointer",
                              appearance: "none",
                            }}
                          >
                            {validValues.map((opt: any) => {
                              const mod = parseFloat(opt.price_modifier || "0");
                              const modText = mod > 0 ? ` (+₹${parseInt(mod.toString())})` : mod < 0 ? ` (-₹${Math.abs(parseInt(mod.toString()))})` : "";
                              return (
                                <option key={opt.id || opt.value} value={opt.value}>
                                  {opt.value}{modText}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown
                            size={18}
                            color="#D98A9C"
                            style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                          />
                        </div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
                <h3 className="font-serif" style={{ fontSize: "20px", color: "#3F3B38", margin: 0 }}>Reviews</h3>
                
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
                      key={item.id}
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
                          ₹{parseInt(prod.base_price || "2000")}
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
