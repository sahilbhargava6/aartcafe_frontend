"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown } from "lucide-react";

export default function ProductDetails() {
  const { addToBag } = useCart();
  const [productData, setProductData] = useState<any>(null);
  
  // Customization selection states
  const [preservation, setPreservation] = useState("");
  const [shape, setShape] = useState("");
  const [size, setSize] = useState("");
  const [filling, setFilling] = useState("");
  const [flowers, setFlowers] = useState("");
  const [accessory, setAccessory] = useState("");
  const [outline, setOutline] = useState("");

  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // Fetch product customization options and reviews from API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Find the seeded wedding memory frame
          const weddingFrame = data.find((p: any) => p.slug === "wedding-memory-frame");
          if (weddingFrame) {
            setProductData(weddingFrame);
            
            // Set default select values based on seeded data
            const getAttrDefault = (name: string) => {
              const attr = weddingFrame.attributes?.find((a: any) => a.name === name);
              return attr?.values?.[0]?.value || "";
            };

            setPreservation(getAttrDefault("Type of Preservation"));
            setShape(getAttrDefault("Shapes"));
            setSize(getAttrDefault("Sizes"));
            setFilling(getAttrDefault("Type of Filling"));
            setFlowers(getAttrDefault("Type of Flowers"));
            setAccessory(getAttrDefault("Accessories"));
            setOutline(getAttrDefault("Outline"));
          }
        }
      })
      .catch((err) => console.error("Error loading product details:", err));

    fetch("http://127.0.0.1:8000/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviewsList(data.filter((r: any) => r.product_id === 1 || r.product?.slug === "wedding-memory-frame"));
        }
      })
      .catch((err) => console.error("Error loading reviews:", err));
  }, []);

  const getAttributeOptions = (name: string) => {
    const attr = productData?.attributes?.find((a: any) => a.name === name);
    return attr?.values || [];
  };

  // Calculate dynamic total price based on selected surcharges
  const calculateTotalPrice = () => {
    if (!productData) return 2000;
    let total = parseFloat(productData.base_price);

    const checkSurcharge = (attrName: string, selectedValue: string) => {
      const vals = getAttributeOptions(attrName);
      const matched = vals.find((v: any) => v.value === selectedValue);
      return matched ? parseFloat(matched.price_modifier) : 0;
    };

    total += checkSurcharge("Type of Preservation", preservation);
    total += checkSurcharge("Shapes", shape);
    total += checkSurcharge("Sizes", size);
    total += checkSurcharge("Type of Filling", filling);
    total += checkSurcharge("Type of Flowers", flowers);
    total += checkSurcharge("Accessories", accessory);
    total += checkSurcharge("Outline", outline);

    return total;
  };

  const handleAddToBag = () => {
    const finalPrice = calculateTotalPrice();
    addToBag({
      id: productData?.id || "shop-1",
      title: `${productData?.title || "Wedding Frame"} (${shape}, ${size})`,
      price: finalPrice,
      image: productData?.image || "",
    });
  };

  const relatedProducts = [
    { id: "rel-1", title: "Resin Floral Rakhi", price: 299, image: "" },
    { id: "rel-2", title: "Baby Keepsake", price: 1500, image: "" },
    { id: "rel-3", title: "Luxury Gift Hamper", price: 4500, image: "" },
    { id: "rel-4", title: "Festive Joy Hamper", price: 3200, image: "" },
  ];

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
            }}
          >
            WEDDING FRAMES
          </h1>

          {/* Two-Column Grid */}
          <div className="details-layout">
            
            {/* LEFT COLUMN: Gallery */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Main large image */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "364/455",
                  backgroundColor: "#F5EDE8",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#BCAEA2",
                  fontSize: "18px",
                }}
              >
                {productData?.title || "Main Product Image"}
              </div>

              {/* Sub-gallery grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ height: "180px", backgroundColor: "#F5EDE8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>Preservation Details</div>
                  <div style={{ height: "180px", backgroundColor: "#F5EDE8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>Shapes Examples</div>
                </div>
                <div style={{ height: "180px", backgroundColor: "#F5EDE8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>Fillings & Flowers Styles</div>
                <div style={{ height: "180px", backgroundColor: "#F5EDE8", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>Accessories Options</div>
              </div>
            </div>

            {/* RIGHT COLUMN: Details, dropdowns, and reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              
              {/* Top Row: Description & Price side-by-side */}
              <div className="desc-price-row">
                <p
                  className="font-sans product-desc"
                  style={{
                    fontSize: "18px",
                    lineHeight: "28px",
                    fontWeight: 400,
                    color: "#8FB9A8",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {productData?.description || "Wedding memory frames come in a wide variety of styles to preserve your flowers and keep your stories alive."}
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

              {/* Customization Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* 1. Types of Preservation */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Types of Preservation</label>
                  <select
                    value={preservation}
                    onChange={(e) => setPreservation(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Type of Preservation").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Shape */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Shape</label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Shapes").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Sizes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Sizes</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Sizes").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : (parseFloat(opt.price_modifier) < 0 ? `(-₹${Math.abs(parseInt(opt.price_modifier))})` : "")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Type of Filling */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Type of Filling</label>
                  <select
                    value={filling}
                    onChange={(e) => setFilling(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Type of Filling").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Choose of Flowers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Choose of Flowers</label>
                  <select
                    value={flowers}
                    onChange={(e) => setFlowers(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Type of Flowers").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Accessories */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Accessories</label>
                  <select
                    value={accessory}
                    onChange={(e) => setAccessory(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Accessories").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Outline */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="font-serif" style={{ fontSize: "18px", color: "#3F3B38" }}>Outline</label>
                  <select
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    style={{
                      width: "100%", height: "40px", borderRadius: "10px", border: "1px solid #D9A85C",
                      padding: "0 16px", fontSize: "16px", color: "#D98A9C", backgroundColor: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    {getAttributeOptions("Outline").map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {parseFloat(opt.price_modifier) > 0 ? `(+₹${parseInt(opt.price_modifier)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Add to Cart button */}
              <div>
                <button
                  onClick={handleAddToBag}
                  style={{
                    width: "100%", height: "48px", borderRadius: "24px", border: "1px solid #D9A85C",
                    backgroundColor: "transparent", color: "#D98A9C", fontSize: "16px", fontWeight: 500,
                    letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(217, 138, 156, 0.05)";
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
                  <p className="font-sans" style={{ color: "#8FB9A8" }}>No reviews submitted for this frame yet.</p>
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
                      <p className="font-sans" style={{ fontSize: "16px", lineHeight: "24px", color: "#8FB9A8", margin: 0 }}>
                        {item.review_text}
                      </p>
                      <div style={{ display: "flex", gap: "6px", color: "#D98A9C" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Heart key={i} size={20} fill={i < item.rating ? "#D98A9C" : "none"} color="#3F3B38" />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px" }}>
            <h2 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
              You may also Like:
            </h2>

            <div className="related-grid">
              {relatedProducts.map((prod) => (
                <div key={prod.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%", aspectRatio: "338/422", backgroundColor: "#F5EDE8", borderRadius: "15px",
                      boxShadow: "0px 4px 4px rgba(0,0,0,0.15)", marginBottom: "16px", display: "flex",
                      alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px",
                    }}
                  >
                    Product Image
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <h4 className="font-serif" style={{ fontSize: "22px", lineHeight: "30px", fontWeight: 400, color: "#3F3B38", textAlign: "center", margin: 0 }}>
                      {prod.title}
                    </h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span className="font-sans" style={{ fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
                        ₹{prod.price}
                      </span>
                      <button
                        onClick={() => addToBag({ id: prod.id, title: prod.title, price: prod.price, image: "" })}
                        className="font-sans"
                        style={{
                          background: "none", border: "none", borderBottom: "1px solid #3F3B38",
                          fontSize: "20px", color: "#3F3B38", cursor: "pointer", padding: "0 0 2px 0",
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
            font-size: 16px !important;
            line-height: 24px !important;
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
