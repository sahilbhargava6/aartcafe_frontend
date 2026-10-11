"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown, Truck, ArrowLeft } from "lucide-react";

// An attribute value as the API sends it; `links` are the options of other attributes it is
// "available only with" (set in the dashboard), `image` one of the product's photos
type Option = { id?: number; value: string; price_modifier?: string | number; image?: string | null; links?: { value: string; attribute?: { name: string } }[] };
type Attribute = { id?: number; name: string; type?: string; values?: Option[] };
type Selections = { [key: string]: { value: string; modifier: number } };

// Values like "NA" mean "not applicable" and are never offered
const isRealOption = (v: Option) => !!v.value && !["na", "n/a", "none", "-", "null", ""].includes(v.value.toString().trim().toLowerCase());
// The dashboard's "Customer Input Type" decides (checkout allows several choices only for checkbox attributes)
const isMultiChoice = (attr: Attribute) => attr.type === "checkbox";
const splitChoice = (choice?: string) => (choice ? choice.split(", ").map((s) => s.trim()).filter(Boolean) : []);
const findOption = (attr: Attribute, value: string) => (attr.values || []).find((v) => v.value === value);

const choiceOf = (attr: Attribute, values: string[]) => ({
  value: values.join(", "),
  modifier: values.reduce((sum, v) => sum + (Number(findOption(attr, v)?.price_modifier) || 0), 0),
});

// Options of `attrName` that `value` is "available only with"
const linkedTo = (value: Option, attrName: string): string[] =>
  (value.links || []).filter((l) => l.attribute?.name === attrName).map((l) => l.value);

// Two options of different attributes go together unless either one is linked to other options of the other's attribute
const pairFits = (attrA: Attribute, a: Option, attrB: Attribute, b: Option) => {
  const aAllows = linkedTo(a, attrB.name);
  const bAllows = linkedTo(b, attrA.name);
  return (!aAllows.length || aAllows.includes(b.value)) && (!bAllows.length || bAllows.includes(a.value));
};

// Can `value` of `attr` be combined with everything chosen in the other attributes?
const fitsSelection = (attributes: Attribute[], attr: Attribute, value: Option, selected: Selections) =>
  attributes.every(
    (other) =>
      other.name === attr.name ||
      other.type === "text" ||
      splitChoice(selected[other.name]?.value).every((picked) => {
        const pickedValue = findOption(other, picked);
        return !pickedValue || pairFits(attr, value, other, pickedValue);
      })
  );

// Customers choose from top to bottom: an attribute offers only the options that go with the
// choices in the attributes above it
const fitsAbove = (attributes: Attribute[], index: number, value: Option, selected: Selections) =>
  fitsSelection(attributes.slice(0, index), attributes[index], value, selected);

const firstFittingAbove = (attributes: Attribute[], index: number, selected: Selections) =>
  (attributes[index].values || []).filter(isRealOption).find((v) => fitsAbove(attributes, index, v, selected));

// After a choice in attribute `index` changed, the attributes below it keep only the choices that
// still go with the ones above; single-choice ones that lost theirs move to their first option that fits
const cascadeBelow = (attributes: Attribute[], index: number, selected: Selections) => {
  for (let i = index + 1; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.type === "text") continue;
    const kept = splitChoice(selected[attr.name]?.value).filter((picked) => {
      const option = findOption(attr, picked);
      return !!option && fitsAbove(attributes, i, option, selected);
    });
    if (!kept.length && !isMultiChoice(attr)) {
      const first = firstFittingAbove(attributes, i, selected);
      if (first) kept.push(first.value);
    }
    selected[attr.name] = choiceOf(attr, kept);
  }
  return selected;
};

// Starting choices: the first option of each attribute that goes with the ones above it
const initialSelections = (attributes: Attribute[]): Selections => {
  const selected: Selections = {};
  attributes.forEach((attr, index) => {
    const first = attr.type === "text" ? attr.values?.[0] : firstFittingAbove(attributes, index, selected);
    if (first) selected[attr.name] = choiceOf(attr, [first.value]);
  });
  return selected;
};

// The product's photos: main image first, then the gallery, without duplicates
const galleryOf = (product: { image?: unknown; images?: unknown } | null): string[] => {
  if (!product) return [];
  const list: string[] = [];

  if (product.image && typeof product.image === "string") {
    const trimmed = product.image.trim();
    if (trimmed && !trimmed.startsWith("[")) {
      list.push(trimmed);
    }
  }

  let extra: unknown = product.images;
  if (typeof extra === "string") {
    const text = extra.trim();
    try {
      extra = JSON.parse(text);
    } catch {
      if (text.includes(",")) {
        extra = text.split(",").map((s) => s.trim());
      } else if (text && !text.startsWith("[")) {
        extra = [text];
      }
    }
  }

  if (Array.isArray(extra)) {
    extra.forEach((img: unknown) => {
      if (typeof img === "string" && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    });
  }

  return list.filter(Boolean);
};

// Gallery position of the photo linked to the first chosen option that has one
const photoIndexFor = (product: { attributes?: Attribute[]; image?: unknown; images?: unknown }, selected: Selections) => {
  const photos = galleryOf(product);
  for (const attr of product.attributes || []) {
    for (const picked of splitChoice(selected[attr.name]?.value)) {
      const image = findOption(attr, picked)?.image;
      if (image && photos.includes(image)) return photos.indexOf(image);
    }
  }
  return 0;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { addToBag } = useCart();

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Selections>({});
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // On phones and tablets the gallery is a sideways carousel: bring the selected photo into
  // view there (only the carousel scrolls, never the page)
  useEffect(() => {
    const grid = galleryRef.current;
    const tile = grid?.children[selectedImageIndex] as HTMLElement | undefined;
    if (!grid || !tile || grid.scrollWidth <= grid.clientWidth) return;
    const gridBox = grid.getBoundingClientRect();
    const tileBox = tile.getBoundingClientRect();
    if (tileBox.left >= gridBox.left && tileBox.right <= gridBox.right) return;
    const padding = parseFloat(getComputedStyle(grid).scrollPaddingLeft) || 0;
    grid.scrollTo({ left: grid.scrollLeft + tileBox.left - gridBox.left - padding, behavior: "smooth" });
  }, [selectedImageIndex]);

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

        // Default choices, with the gallery on the photo linked to them
        const selections = initialSelections(Array.isArray(data.attributes) ? data.attributes : []);
        setSelectedAttributes(selections);
        setSelectedImageIndex(photoIndexFor(data, selections));
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
                const selections = initialSelections(Array.isArray(matched.attributes) ? matched.attributes : []);
                setSelectedAttributes(selections);
                setSelectedImageIndex(photoIndexFor(matched, selections));
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

  // Pick (or untick) an option of the attribute at `index`. The attributes below it are re-checked
  // against the new choice, and the gallery shows the option's photo.
  const chooseOption = (index: number, option: Option) => {
    const attributes: Attribute[] = productData?.attributes || [];
    const attr = attributes[index];
    const current = splitChoice(selectedAttributes[attr.name]?.value);
    const untick = isMultiChoice(attr) && current.includes(option.value);
    const next: Selections = { ...selectedAttributes };
    next[attr.name] = choiceOf(
      attr,
      untick ? current.filter((v) => v !== option.value) : isMultiChoice(attr) ? [...current, option.value] : [option.value]
    );
    cascadeBelow(attributes, index, next);

    // Show the chosen option's photo, or else the photo of an option the change picked further down
    const photos = galleryOf(productData);
    const pickedBelow = attributes.slice(index + 1).flatMap((below) => {
      const before = splitChoice(selectedAttributes[below.name]?.value);
      return splitChoice(next[below.name]?.value).filter((v) => !before.includes(v)).map((v) => findOption(below, v));
    });
    const photo = [untick ? undefined : option, ...pickedBelow].find((o) => o?.image && photos.includes(o.image))?.image;
    if (photo) setSelectedImageIndex(photos.indexOf(photo));
    setSelectedAttributes(next);
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

    // IDs of the chosen option values, so the server can price the order itself
    const optionIds: number[] = [];
    (productData.attributes || []).forEach((attr: any) => {
      const chosen = selectedAttributes[attr.name]?.value?.split(", ") || [];
      (attr.values || []).forEach((v: any) => {
        if (chosen.includes(v.value)) optionIds.push(v.id);
      });
    });

    // The photo selected in the gallery goes to the bag and into the WhatsApp order message
    const photos = galleryOf(productData);

    addToBag({
      id: `${productData.id}-${Date.now()}`,
      title: `${productData.title}${attrSummary ? ` (${attrSummary})` : ""}`,
      price: finalPrice,
      image: photos[selectedImageIndex] || photos[0] || "",
      productId: productData.id,
      optionIds,
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

  const galleryImages = galleryOf(productData);
  const currentMainImage = galleryImages[selectedImageIndex] || galleryImages[0] || productData?.image || "";
  const subImages = galleryImages.slice(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main className="details-main" style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="details-container">

          <button
            onClick={() => router.back()}
            className="back-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#8FB9A8",
              textDecoration: "none",
              fontSize: "15px",
              marginBottom: "20px",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>

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
            
            {/* LEFT COLUMN: Seamless Edge-to-Edge Cover Bento Grid Gallery
                (≤992px: becomes a swipeable scroll-snap carousel) */}
            <div className="gallery-col" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div
                ref={galleryRef}
                className="bento-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "18px",
                  alignItems: "stretch",
                }}
              >
                {galleryImages.map((imgUrl: string, idx: number) => {
                  // Bento Grid Pattern:
                  // idx 0 -> Feature Hero Card (span 2, tall)
                  // idx 1, 2 -> Dual Side-by-Side Cards (span 1, square)
                  // idx 3 -> Panoramic Wide Card (span 2, banner)
                  // idx 4, 5... -> Repeating pattern
                  const isFullWidth = idx % 3 === 0;
                  const isSelected = selectedImageIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        gridColumn: isFullWidth ? "span 2" : "span 1",
                        width: "100%",
                        height: isFullWidth ? (idx === 0 ? "440px" : "300px") : "280px",
                        borderRadius: "18px",
                        overflow: "hidden",
                        backgroundColor: "#FAF6F0",
                        cursor: "pointer",
                        position: "relative",
                        boxShadow: isSelected
                          ? "0px 8px 24px rgba(217, 138, 156, 0.35)"
                          : "0px 4px 14px rgba(0,0,0,0.06)",
                        border: isSelected ? "3px solid #D98A9C" : "1.5px solid transparent",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      className="bento-tile-card"
                    >
                      <img
                        src={imgUrl}
                        alt={`${productData.title} - View ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                          objectPosition: "center",
                          transition: "transform 0.5s ease-out",
                        }}
                        className="bento-tile-img"
                      />
                      {isSelected && (
                        <div
                          className="main-view-badge"
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            backgroundColor: "#D98A9C",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: "20px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                          }}
                        >
                          Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Configurator & Reviews */}
            <div className="info-col" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              
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
                  <span className="price-now" style={{ fontSize: "36px", lineHeight: "44px", fontWeight: 400, color: "#3F3B38" }}>
                    ₹{calculateTotalPrice().toLocaleString("en-IN")}
                  </span>
                  {productData.discount_price && (
                    <span className="price-was" style={{ fontSize: "18px", textDecoration: "line-through", color: "#999" }}>
                      ₹{calculateOriginalTotalPrice().toLocaleString("en-IN")}
                    </span>
                  )}
                  {productData.is_free_delivery && (
                    <span className="price-free" style={{ fontSize: "14px", color: "#4E8E76", fontWeight: 600, marginTop: "4px" }}>
                      🚚 Free Delivery
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Attribute Customizers. Customers choose from top to bottom; each attribute lists only
                  the options that go with the choices above it (the dashboard's "available only with" links). */}
              {productData.attributes && productData.attributes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {productData.attributes.map((attr: Attribute, attrIndex: number) => {
                    const validValues = (attr.values || []).filter(isRealOption);
                    const isCheckbox = isMultiChoice(attr);
                    const isTextInput = attr.type === "text";
                    const isDropdown = attr.type === "dropdown";

                    const currentSelectedStr = selectedAttributes[attr.name]?.value || "";
                    const checkedList = splitChoice(currentSelectedStr);
                    const shownValues = validValues.filter(
                      (opt) => checkedList.includes(opt.value) || fitsAbove(productData.attributes, attrIndex, opt, selectedAttributes)
                    );

                    if (!isTextInput && shownValues.length === 0) return null;

                    // Small photo for options linked to one of the gallery photos
                    const swatch = (opt: Option) =>
                      opt.image ? (
                        <img src={opt.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                      ) : null;

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
                            className="attr-input"
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
                        ) : isDropdown ? (
                          /* DROPDOWN SINGLE-SELECT */
                          <div style={{ position: "relative" }}>
                            <select
                              value={currentSelectedStr}
                              onChange={(e) => {
                                const opt = shownValues.find((v) => v.value === e.target.value);
                                if (opt) chooseOption(attrIndex, opt);
                              }}
                              aria-label={attr.name}
                              style={{
                                width: "100%",
                                height: "46px",
                                padding: "0 44px 0 14px",
                                borderRadius: "10px",
                                border: "1px solid #D9A85C",
                                backgroundColor: "#FFFDF9",
                                color: "#3F3B38",
                                fontSize: "16px",
                                outline: "none",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              {!currentSelectedStr && (
                                <option value="" disabled>
                                  Choose {attr.name.toLowerCase()}
                                </option>
                              )}
                              {shownValues.map((opt) => (
                                <option key={opt.id || opt.value} value={opt.value}>
                                  {opt.value}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={18}
                              color="#D9A85C"
                              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                            />
                          </div>
                        ) : isCheckbox ? (
                          /* CHECKBOX MULTI-SELECT OPTIONS */
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {shownValues.map((opt) => {
                              const isChecked = checkedList.includes(opt.value);
                              return (
                                <label
                                  key={opt.id || opt.value}
                                  className="option-chip"
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
                                    onChange={() => chooseOption(attrIndex, opt)}
                                    style={{ accentColor: "#D9A85C", width: "16px", height: "16px", cursor: "pointer" }}
                                  />
                                  {swatch(opt)}
                                  <span>{opt.value}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          /* PILL / RADIO SINGLE-SELECT OPTIONS */
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {shownValues.map((opt) => {
                              const isSelected = currentSelectedStr === opt.value;
                              return (
                                <button
                                  key={opt.id || opt.value}
                                  type="button"
                                  onClick={() => chooseOption(attrIndex, opt)}
                                  className="option-chip"
                                  aria-pressed={isSelected}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: opt.image ? "6px 16px 6px 6px" : "10px 16px",
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
                                  {swatch(opt)}
                                  {opt.value}
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

              {/* The selected photo is the one that goes to the bag and the WhatsApp message */}
              {galleryImages.length > 1 && currentMainImage && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", lineHeight: "20px", color: "#6E6E6E" }}>
                  <img
                    src={currentMainImage}
                    alt="Selected photo"
                    style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover", border: "2px solid #D98A9C", flexShrink: 0 }}
                  />
                  <span>This photo is sent with your order. Tap another photo to change it.</span>
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
                <div className="reviews-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="font-serif reviews-title" style={{ fontSize: "22px", color: "#3F3B38", margin: 0 }}>Customer Reviews</h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="write-review-btn"
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
                    className="review-form"
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
                        Rating (1 to 5 Hearts) *
                      </label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="rating-btn"
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
                  <div className="review-card" style={{ border: "1px solid #EBE5DB", borderRadius: "12px", padding: "16px", backgroundColor: "#FAF6F0" }}>
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
                      className="review-card"
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

          {/* RELATED PRODUCTS GRID (≤992px: swipeable scroll-snap carousel) */}
          {relatedProducts.length > 0 && (
            <div className="related-section" style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px", marginTop: "40px" }}>
              <h2 className="font-serif related-title" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
                You may also Like:
              </h2>

              <div className="related-grid">
                {relatedProducts.map((prod) => (
                  <div key={prod.id} className="related-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <a
                      href={`/shop/${prod.slug || prod.id}`}
                      className="related-img-link"
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
                        <img
                          src={prod.image}
                          alt={prod.title}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ color: "#BCAEA2", fontSize: "14px", padding: "12px", textAlign: "center" }}>
                          {prod.title}
                        </div>
                      )}
                    </a>
                    <div className="related-info" style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                      <a
                        href={`/shop/${prod.slug || prod.id}`}
                        className="font-serif related-name"
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
                      <div className="related-price-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span className="font-sans related-price" style={{ fontSize: "18px", fontWeight: 500, color: "#3F3B38" }}>
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
                          className="font-sans related-add-btn"
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
          --gutter: 120px;
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 var(--gutter);
        }
        /* Hover zoom only where a real hover exists (no "stuck" zoom after a tap) */
        @media (hover: hover) {
          .bento-tile-card:hover .bento-tile-img {
            transform: scale(1.05);
          }
          .bento-tile-card:hover {
            box-shadow: 0px 10px 28px rgba(0, 0, 0, 0.12) !important;
          }
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
        /* Keep every related card's price row on the same line even when titles wrap differently */
        .related-info {
          flex: 1 1 auto;
        }
        .related-price-row {
          margin-top: auto;
        }
        /* Invisible ≥40px tap area for the related "Add to bag" links (no visual change) */
        .related-add-btn {
          position: relative;
        }
        .related-add-btn::before {
          content: "";
          position: absolute;
          left: -6px;
          right: 0;
          top: -8px;
          bottom: -10px;
        }

        /* Touch screens (and anything ≤992px): comfortable tap targets */
        @media (max-width: 992px), (pointer: coarse) {
          .back-btn {
            min-height: 40px;
            margin-bottom: 4px !important;
          }
          .option-chip {
            min-height: 44px;
          }
          .attr-input {
            min-height: 44px;
          }
          .write-review-btn {
            min-height: 40px;
          }
          .rating-btn {
            min-width: 40px;
            min-height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        @media (max-width: 1200px) {
          .details-container {
            --gutter: 40px;
          }
          .details-layout {
            gap: 40px;
          }
        }

        /* ═════ Tablets & phones: image stacked above info ═════ */
        @media (max-width: 992px) {
          .details-container {
            --gutter: 24px;
          }
          .details-main {
            padding: 24px 0 64px 0 !important;
          }
          .page-title {
            font-size: 32px !important;
            line-height: 42px !important;
            margin-bottom: 20px !important;
            overflow-wrap: anywhere;
          }
          .details-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 28px;
            margin-bottom: 48px;
          }

          /* Gallery → swipeable carousel that bleeds to the screen edges (next image peeks in) */
          .bento-grid {
            display: flex !important;
            gap: 12px !important;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            scroll-snap-type: x mandatory;
            scroll-padding: 0 var(--gutter);
            margin: -6px calc(-1 * var(--gutter)) 0;
            padding: 6px var(--gutter) 16px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .bento-grid::-webkit-scrollbar {
            display: none;
          }
          /* Softer shadow so it isn't clipped by the scroller (the pink border still marks the selected image) */
          .bento-tile-card {
            flex: 0 0 auto;
            width: 48% !important;
            height: auto !important;
            aspect-ratio: 1 / 1;
            scroll-snap-align: start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
          }
          .bento-tile-card:only-child {
            width: 100% !important;
            aspect-ratio: 4 / 3;
          }

          .reviews-header {
            flex-wrap: wrap;
            gap: 12px;
          }
          .reviews-title {
            font-size: 22px !important;
            line-height: 30px !important;
          }

          /* Related products → swipeable carousel */
          .related-section {
            padding-top: 40px !important;
            margin-top: 0 !important;
          }
          .related-title {
            font-size: 24px !important;
            line-height: 32px !important;
            margin-bottom: 20px !important;
          }
          .related-grid {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            scroll-snap-type: x mandatory;
            scroll-padding: 0 var(--gutter);
            margin: 0 calc(-1 * var(--gutter));
            padding: 4px var(--gutter) 16px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .related-grid::-webkit-scrollbar {
            display: none;
          }
          .related-card {
            flex: 0 0 30%;
            min-width: 0;
            scroll-snap-align: start;
          }
          .related-img-link {
            margin-bottom: 12px !important;
          }
          .related-name {
            font-size: 17px !important;
            line-height: 24px !important;
          }
          .related-price-row {
            flex-wrap: wrap;
            align-items: baseline !important;
            gap: 0 10px;
          }
          .related-price {
            font-size: 16px !important;
          }
          .related-add-btn {
            font-size: 15px !important;
            line-height: 22px;
          }
        }

        /* ═════ Phones ═════ */
        @media (max-width: 600px) {
          .details-container {
            --gutter: 16px;
          }
          .details-main {
            padding: 20px 0 56px 0 !important;
          }
          .page-title {
            font-size: 26px !important;
            line-height: 34px !important;
            margin-bottom: 16px !important;
            letter-spacing: 0.5px !important;
          }
          .details-layout {
            gap: 24px;
            margin-bottom: 40px;
          }
          .bento-tile-card {
            width: 84% !important;
            border-radius: 14px !important;
          }
          .bento-tile-card:only-child {
            width: 100% !important;
            aspect-ratio: 1 / 1;
          }
          .info-col {
            gap: 24px !important;
          }
          /* Price first, on one line, then the description */
          .desc-price-row {
            flex-direction: column;
            gap: 12px;
          }
          .product-price {
            order: -1;
            flex-direction: row !important;
            flex-wrap: wrap;
            align-items: baseline !important;
            gap: 2px 12px;
          }
          .price-now {
            font-size: 30px !important;
            line-height: 38px !important;
          }
          .price-was {
            font-size: 16px !important;
          }
          .price-free {
            flex-basis: 100%;
            margin-top: 0 !important;
          }
          .product-desc {
            font-size: 15px !important;
            line-height: 23px !important;
          }
          .reviews-title {
            font-size: 20px !important;
            line-height: 28px !important;
          }
          .review-form {
            padding: 16px !important;
          }
          .review-card {
            padding: 16px !important;
          }
          .related-title {
            font-size: 22px !important;
            line-height: 30px !important;
          }
          .related-grid {
            gap: 12px;
          }
          .related-card {
            flex-basis: 44%;
          }
          .related-name {
            font-size: 15px !important;
            line-height: 21px !important;
          }
          .related-price {
            font-size: 15px !important;
          }
          .related-add-btn {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
