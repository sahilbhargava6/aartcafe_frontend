"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import QuickCustomizeModal from "@/components/QuickCustomizeModal";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown } from "lucide-react";

export default function WeddingCelebration() {
  const { addToBag, closeCart } = useCart();
  const router = useRouter();
  const [customizingProduct, setCustomizingProduct] = useState<any | null>(null);

  // Directly opening the customizer modal so customer can pick attributes & reference image
  const addProductToBag = (prod: any) => setCustomizingProduct(prod);

  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  // Wedding keepsakes / bespoke pieces for enquiry via the bag
  const [offWeddingProducts, setOffWeddingProducts] = useState<any[]>([]);

  const contactForDetails = (prod: any) => {
    addToBag({
      id: `${prod.id}-enquiry`,
      title: prod.title,
      price: 0,
      image: prod.image || (Array.isArray(prod.images) && prod.images[0]) || "",
      productId: typeof prod.id === "number" ? prod.id : undefined,
      priceOnRequest: true,
    });
    // Go straight to the bag to fill in contact details and send to WhatsApp
    closeCart();
    router.push("/cart");
  };

  // Reviews state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingProductId, setReviewingProductId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ name: "", text: "", rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // 1. Fetch Banners (filter for wedding celebration / wedding specials or all)
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter(
            (b: any) =>
              b.is_active &&
              (!b.position ||
                b.position === "all" ||
                b.position === "wedding-celebration" ||
                b.position === "wedding_celebration" ||
                b.position === "wedding-specials" ||
                b.position === "wedding_specials")
          );
          const specific = active.filter(
            (b: any) =>
              b.position === "wedding-celebration" ||
              b.position === "wedding_celebration" ||
              b.position === "wedding-specials" ||
              b.position === "wedding_specials"
          );
          setBanners(specific.length > 0 ? specific : active);
        }
      })
      .catch((err) => console.error("Error loading banners:", err));

    // 2. Fetch Wedding Celebration Products (Selected)
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/wedding-celebration")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback if backend endpoint not yet deployed: fetch all products and check is_wedding_selected
          fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
            .then((res) => (res.ok ? res.json() : []))
            .then((all) => {
              if (Array.isArray(all)) {
                const selected = all.filter((p: any) => p.is_wedding_selected);
                if (selected.length > 0) {
                  setProducts(selected);
                } else {
                  const fallbackItems = all.filter(
                    (p: any) =>
                      p.is_wedding_special ||
                      /wedding|varmala|garland|preservation/i.test(p.title)
                  );
                  setProducts(fallbackItems);
                }
              }
            });
        }
      })
      .catch((err) => console.error("Error loading wedding products:", err));

    // 3. Fetch all products to populate "Bespoke Wedding Keepsakes" (custom enquiry items)
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          // Additional wedding keepsakes like varmala frames, flower preservation
          const bespoke = data.filter(
            (p: any) =>
              !p.is_wedding_special &&
              /wedding|varmala|garland|preservation/i.test(p.title)
          );
          setOffWeddingProducts(bespoke.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error loading bespoke items:", err));

    // 4. Fetch related/bestseller products
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/bestsellers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setRelatedProducts(data.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error loading related products:", err));
  }, []);

  // Auto rotate banners if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[currentBannerIdx] || null;

  const bannerText = (
    banner: { title?: string | null; subtitle?: string | null } | null,
    field: "title" | "subtitle",
    sample: string
  ) => (banner ? banner[field] || "" : sample);

  const activeBannerTitle = bannerText(activeBanner, "title", "Wedding Celebration");
  const activeBannerSubtitle = bannerText(
    activeBanner,
    "subtitle",
    "Preserving Your Sacred Vows & Treasured Moments Forever"
  );

  const toggleReview = (id: string | number) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const submitReview = async () => {
    if (!reviewingProductId || !reviewForm.name || !reviewForm.text) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(
        "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: reviewingProductId,
            reviewer_name: reviewForm.name,
            review_text: reviewForm.text,
            rating: reviewForm.rating,
            is_approved: true,
          }),
        }
      );
      if (res.ok) {
        const newReview = await res.json();
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === reviewingProductId) {
              return { ...p, reviews: [...(p.reviews || []), newReview] };
            }
            return p;
          })
        );
        setReviewModalOpen(false);
        setReviewForm({ name: "", text: "", rating: 5 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar overlay={Boolean(activeBanner?.image_url)} />
      <CartDrawer />

      {activeBanner?.image_url ? (
        /* FULL-BLEED HERO BANNER: FROM BEHIND THE HEADER TILL FULL SIZE IMAGE */
        <section className="wedding-full-hero" aria-label="Wedding Celebration Hero">
          <div className="wedding-hero-inner">
            <img
              key={activeBanner.id}
              src={activeBanner.image_url}
              alt={activeBanner.title || "Wedding celebration"}
              className="wedding-hero-img"
            />

            {/* Clickable link over the banner if provided and no separate button */}
            {(activeBanner.button_url || activeBanner.link_url) && !activeBannerTitle && !activeBannerSubtitle && !activeBanner.button_text && (
              <Link
                href={activeBanner.button_url || activeBanner.link_url}
                className="wedding-hero-overlay-link"
                aria-label={activeBanner.title || "Wedding celebration"}
              />
            )}

            {/* Optional text content if title/subtitle is configured */}
            {(activeBannerTitle ||
              activeBannerSubtitle ||
              (activeBanner.button_text && (activeBanner.button_url || activeBanner.link_url))) && (
              <div
                className="wedding-hero-content"
                key={activeBanner?.id || currentBannerIdx}
              >
                {activeBannerTitle && <h1 className="font-serif banner-title">{activeBannerTitle}</h1>}
                {activeBannerSubtitle && (
                  <p className="font-sans banner-desc">
                    {activeBannerSubtitle}
                  </p>
                )}
                {activeBanner.button_text && (activeBanner?.button_url || activeBanner?.link_url) && (
                  <div style={{ marginTop: "20px" }}>
                    <Link
                      href={activeBanner.button_url || activeBanner.link_url}
                      style={{
                        display: "inline-block",
                        padding: "10px 24px",
                        backgroundColor: "#D98A9C",
                        color: "#fff",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "16px",
                        fontWeight: 500,
                      }}
                    >
                      {activeBanner.button_text}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Carousel Navigation & Indicators */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)
                  }
                  className="banner-arrow banner-arrow--left"
                  aria-label="Previous banner"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentBannerIdx((prev) => (prev + 1) % banners.length)}
                  className="banner-arrow banner-arrow--right"
                  aria-label="Next banner"
                >
                  ›
                </button>
                <div className="banner-dots">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={`banner-dot${idx === currentBannerIdx ? " is-active" : ""}`}
                      aria-label={`Go to banner ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}

      <main style={{ flex: 1, backgroundColor: "#fff", padding: activeBanner?.image_url ? "60px 0 80px 0" : "40px 0 80px 0" }}>
        <div className="fest-container">
          {!activeBanner?.image_url && (
            /* Fallback SVG Medallion Banner if no image is uploaded */
            <div className="rakhi-banner" style={{ position: "relative", overflow: "hidden" }}>
              <svg className="banner-svg-medallion" width="300" height="300" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="#EFD3C7" opacity="0.1" />
                <circle cx="85" cy="100" r="38" stroke="#D9A85C" strokeWidth="5" fill="none" opacity="0.9" />
                <circle cx="115" cy="100" r="38" stroke="#D98A9C" strokeWidth="5" fill="none" opacity="0.85" />
                <polygon points="85,55 91,62 85,69 79,62" fill="#FFFFFF" stroke="#D9A85C" strokeWidth="1" />
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i * 360) / 16;
                  return (
                    <circle
                      key={i}
                      cx={100 + 78 * Math.cos((angle * Math.PI) / 180)}
                      cy={100 + 78 * Math.sin((angle * Math.PI) / 180)}
                      r="3.5"
                      fill="#FFF"
                      opacity="0.75"
                    />
                  );
                })}
              </svg>
              <div className="banner-content">
                <span className="font-serif banner-sub">WEDDING CELEBRATION</span>
                <h1 className="font-serif banner-title">{activeBannerTitle || "WEDDING CELEBRATION"}</h1>
                {activeBannerSubtitle && (
                  <p className="font-sans banner-desc" style={{ fontSize: "24px", lineHeight: "34px", color: "#BCAEA2", margin: 0 }}>
                    {activeBannerSubtitle}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS LIST (Alternating Left/Right) */}
          {products.map((prod, index) => {
            const isLeft = index % 2 === 0;
            const productUrl = `/shop/${prod.slug || prod.id}`;
            return (
              <div
                key={prod.id}
                className={`product-row ${isLeft ? "row-align-left" : "row-align-right"}`}
              >
                {/* Left Side (Image if Left, Details if Right) */}
                {isLeft ? (
                  <Link href={productUrl} style={{ textDecoration: "none" }}>
                    <div className="product-image-container" style={{ cursor: "pointer" }}>
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        "Product Image"
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="product-details-container detail-order-first">
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <Link href={productUrl} style={{ textDecoration: "none" }}>
                        <h2 className="font-serif detail-title" style={{ cursor: "pointer" }}>
                          {prod.title}
                        </h2>
                      </Link>
                    </div>

                    <p className="font-sans detail-desc">
                      {prod.description && prod.description.trim() && prod.description.trim() !== "No description filled." ? prod.description : "❤️"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        justifyContent: "flex-end",
                      }}
                    >
                      {prod.discount_price ? (
                        <>
                          <span className="font-serif detail-price">₹{prod.discount_price}</span>
                          <span
                            className="font-sans detail-old-price"
                            style={{
                              textDecoration: "line-through",
                              color: "#BCAEA2",
                              fontSize: "20px",
                            }}
                          >
                            ₹{prod.base_price}
                          </span>
                        </>
                      ) : (
                        <span className="font-serif detail-price">₹{prod.base_price}</span>
                      )}
                    </div>

                    <div>
                      <button onClick={() => addProductToBag(prod)} className="font-sans cart-button">
                        ADD TO CART
                      </button>
                    </div>

                    {/* Reviews */}
                    <div
                      className="reviews-block"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        marginTop: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="font-serif review-section-label">Reviews</span>
                        <button
                          onClick={() => {
                            setReviewingProductId(prod.id);
                            setReviewModalOpen(true);
                          }}
                          className="font-sans add-review-btn"
                          style={{
                            background: "none",
                            border: "1px solid #D9A85C",
                            color: "#D9A85C",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          Add Review
                        </button>
                      </div>

                      {prod.reviews && prod.reviews.length > 0 ? (
                        <>
                          <div className="review-box">
                            <span className="font-serif reviewer-name">
                              {prod.reviews[0].reviewer_name}
                            </span>
                            <p className="font-sans review-text">{prod.reviews[0].review_text?.trim() ? prod.reviews[0].review_text : "❤️"}</p>
                            <div
                              className="review-hearts"
                              style={{
                                display: "flex",
                                gap: "6px",
                                color: "#D98A9C",
                                justifyContent: "flex-end",
                              }}
                            >
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Heart
                                  key={i}
                                  size={26}
                                  fill={i < prod.reviews[0].rating ? "#D98A9C" : "transparent"}
                                  color={i < prod.reviews[0].rating ? "#D98A9C" : "#3F3B38"}
                                />
                              ))}
                            </div>
                          </div>

                          {expandedReviews[prod.id] &&
                            prod.reviews.slice(1).map((rev: any) => (
                              <div key={rev.id} className="review-box">
                                <span className="font-serif reviewer-name">
                                  {rev.reviewer_name}
                                </span>
                                <p className="font-sans review-text">{rev.review_text?.trim() ? rev.review_text : "❤️"}</p>
                                <div
                                  className="review-hearts"
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    color: "#D98A9C",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Heart
                                      key={i}
                                      size={26}
                                      fill={i < rev.rating ? "#D98A9C" : "transparent"}
                                      color={i < rev.rating ? "#D98A9C" : "#3F3B38"}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}

                          {prod.reviews.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <button
                                onClick={() => toggleReview(prod.id)}
                                className="review-toggle"
                              >
                                <ChevronDown
                                  size={22}
                                  style={{
                                    transform: expandedReviews[prod.id]
                                      ? "rotate(180deg)"
                                      : "none",
                                    transition: "transform 0.3s",
                                  }}
                                />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className="no-reviews"
                          style={{
                            color: "#8FB9A8",
                            fontStyle: "italic",
                            fontSize: "16px",
                            padding: "10px 0",
                          }}
                        >
                          No reviews yet. Be the first to add one!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Right Side (Details if Left, Image if Right) */}
                {isLeft ? (
                  <div className="product-details-container">
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <Link href={productUrl} style={{ textDecoration: "none" }}>
                        <h2 className="font-serif detail-title" style={{ cursor: "pointer" }}>
                          {prod.title}
                        </h2>
                      </Link>
                    </div>

                    <p className="font-sans detail-desc">
                      {prod.description && prod.description.trim() && prod.description.trim() !== "No description filled." ? prod.description : "❤️"}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {prod.discount_price ? (
                        <>
                          <span className="font-serif detail-price">₹{prod.discount_price}</span>
                          <span
                            className="font-sans detail-old-price"
                            style={{
                              textDecoration: "line-through",
                              color: "#BCAEA2",
                              fontSize: "20px",
                            }}
                          >
                            ₹{prod.base_price}
                          </span>
                        </>
                      ) : (
                        <span className="font-serif detail-price">₹{prod.base_price}</span>
                      )}
                    </div>

                    <div>
                      <button onClick={() => addProductToBag(prod)} className="font-sans cart-button">
                        ADD TO CART
                      </button>
                    </div>

                    {/* Reviews */}
                    <div
                      className="reviews-block"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        marginTop: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="font-serif review-section-label">Reviews</span>
                        <button
                          onClick={() => {
                            setReviewingProductId(prod.id);
                            setReviewModalOpen(true);
                          }}
                          className="font-sans add-review-btn"
                          style={{
                            background: "none",
                            border: "1px solid #D9A85C",
                            color: "#D9A85C",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          Add Review
                        </button>
                      </div>

                      {prod.reviews && prod.reviews.length > 0 ? (
                        <>
                          <div className="review-box">
                            <span className="font-serif reviewer-name">
                              {prod.reviews[0].reviewer_name}
                            </span>
                            <p className="font-sans review-text">{prod.reviews[0].review_text?.trim() ? prod.reviews[0].review_text : "❤️"}</p>
                            <div
                              className="review-hearts"
                              style={{
                                display: "flex",
                                gap: "6px",
                                color: "#D98A9C",
                                justifyContent: "flex-start",
                              }}
                            >
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Heart
                                  key={i}
                                  size={26}
                                  fill={i < prod.reviews[0].rating ? "#D98A9C" : "transparent"}
                                  color={i < prod.reviews[0].rating ? "#D98A9C" : "#3F3B38"}
                                />
                              ))}
                            </div>
                          </div>

                          {expandedReviews[prod.id] &&
                            prod.reviews.slice(1).map((rev: any) => (
                              <div key={rev.id} className="review-box">
                                <span className="font-serif reviewer-name">
                                  {rev.reviewer_name}
                                </span>
                                <p className="font-sans review-text">{rev.review_text?.trim() ? rev.review_text : "❤️"}</p>
                                <div
                                  className="review-hearts"
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    color: "#D98A9C",
                                    justifyContent: "flex-start",
                                  }}
                                >
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Heart
                                      key={i}
                                      size={26}
                                      fill={i < rev.rating ? "#D98A9C" : "transparent"}
                                      color={i < rev.rating ? "#D98A9C" : "#3F3B38"}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}

                          {prod.reviews.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <button
                                onClick={() => toggleReview(prod.id)}
                                className="review-toggle"
                              >
                                <ChevronDown
                                  size={22}
                                  style={{
                                    transform: expandedReviews[prod.id]
                                      ? "rotate(180deg)"
                                      : "none",
                                    transition: "transform 0.3s",
                                  }}
                                />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className="no-reviews"
                          style={{
                            color: "#8FB9A8",
                            fontStyle: "italic",
                            fontSize: "16px",
                            padding: "10px 0",
                            textAlign: "left",
                          }}
                        >
                          No reviews yet. Be the first to add one!
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link href={productUrl} style={{ textDecoration: "none" }}>
                    <div
                      className="product-image-container detail-order-second"
                      style={{ cursor: "pointer" }}
                    >
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        "Product Image"
                      )}
                    </div>
                  </Link>
                )}
              </div>
            );
          })}

          {/* "Bespoke Wedding Keepsakes (Price on Request / Contact for Details)" SECTION */}
          {offWeddingProducts.length > 0 && (
            <div
              className="related-section"
              style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px" }}
            >
              <h2
                className="font-serif related-heading"
                style={{
                  fontSize: "28px",
                  color: "#3F3B38",
                  marginBottom: "40px",
                  margin: "0 0 40px 0",
                }}
              >
                Bespoke Wedding Keepsakes:
              </h2>
              <div className="related-grid">
                {offWeddingProducts.map((prod) => {
                  const productUrl = `/shop/${prod.slug || prod.id}`;
                  return (
                    <div
                      key={prod.id}
                      className="related-card"
                      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <Link href={productUrl} style={{ width: "100%", textDecoration: "none" }}>
                        <div
                          className="related-image"
                          style={{
                            width: "100%",
                            aspectRatio: "338/422",
                            backgroundColor: "#F5EDE8",
                            borderRadius: "15px",
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#BCAEA2",
                            fontSize: "14px",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                        >
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            "Product Image"
                          )}
                        </div>
                      </Link>
                      <div
                        className="related-info"
                        style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
                      >
                        <Link href={productUrl} style={{ textDecoration: "none" }}>
                          <h4
                            className="font-serif related-title"
                            style={{
                              fontSize: "22px",
                              lineHeight: "30px",
                              fontWeight: 400,
                              color: "#3F3B38",
                              textAlign: "center",
                              margin: 0,
                              cursor: "pointer",
                            }}
                          >
                            {prod.title}
                          </h4>
                        </Link>
                        <div
                          className="related-meta"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <button
                            onClick={() => contactForDetails(prod)}
                            className="font-sans related-action"
                            style={{
                              background: "none",
                              border: "none",
                              borderBottom: "1px solid #D98A9C",
                              fontSize: "20px",
                              color: "#D98A9C",
                              cursor: "pointer",
                              padding: "0 0 2px 0",
                            }}
                          >
                            Contact for details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* "You may also Like:" SECTION */}
          {relatedProducts.length > 0 && (
            <div
              className="related-section related-section-spaced"
              style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px", marginTop: "80px" }}
            >
              <Link href="/shop" style={{ textDecoration: "none" }}>
                <h2
                  className="font-serif related-heading"
                  style={{
                    fontSize: "28px",
                    color: "#3F3B38",
                    marginBottom: "40px",
                    margin: "0 0 40px 0",
                  }}
                >
                  You may also Like:
                </h2>
              </Link>
              <div className="related-grid">
                {relatedProducts.map((prod) => {
                  const productUrl = `/shop/${prod.slug || prod.id}`;
                  return (
                    <div
                      key={prod.id}
                      className="related-card"
                      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <Link href={productUrl} style={{ width: "100%", textDecoration: "none" }}>
                        <div
                          className="related-image"
                          style={{
                            width: "100%",
                            aspectRatio: "338/422",
                            backgroundColor: "#F5EDE8",
                            borderRadius: "15px",
                            boxShadow: "0px 4px 4px rgba(0,0,0,0.15)",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#BCAEA2",
                            fontSize: "14px",
                            overflow: "hidden",
                          }}
                        >
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            "Product Image"
                          )}
                        </div>
                      </Link>
                      <div
                        className="related-info"
                        style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
                      >
                        <Link href={productUrl} style={{ textDecoration: "none" }}>
                          <h4
                            className="font-serif related-title"
                            style={{
                              fontSize: "22px",
                              lineHeight: "30px",
                              fontWeight: 400,
                              color: "#3F3B38",
                              textAlign: "center",
                              margin: 0,
                              cursor: "pointer",
                            }}
                          >
                            {prod.title}
                          </h4>
                        </Link>
                        <div
                          className="related-meta"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <span
                            className="font-sans related-price"
                            style={{ fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}
                          >
                            ₹{prod.discount_price || prod.base_price}
                          </span>
                          <button
                            onClick={() => addProductToBag(prod)}
                            className="font-sans related-action"
                            style={{
                              background: "none",
                              border: "none",
                              borderBottom: "1px solid #3F3B38",
                              fontSize: "20px",
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <QuickCustomizeModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />

      {/* ADD REVIEW MODAL */}
      {reviewModalOpen && (
        <div
          className="review-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="review-modal"
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "15px",
              width: "90%",
              maxWidth: "500px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              className="font-serif review-modal-title"
              style={{ margin: 0, fontSize: "28px", color: "#3F3B38" }}
            >
              Add a Review
            </h3>

            <input
              type="text"
              placeholder="Your Name"
              value={reviewForm.name}
              onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #EBE5DB",
                fontSize: "16px",
                outline: "none",
              }}
            />

            <div>
              <span
                className="font-sans"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#8FB9A8",
                  fontSize: "16px",
                }}
              >
                Rating
              </span>
              <div className="rating-row" style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={32}
                    fill={i < reviewForm.rating ? "#D98A9C" : "transparent"}
                    color={i < reviewForm.rating ? "#D98A9C" : "#3F3B38"}
                    onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                  />
                ))}
              </div>
            </div>

            <textarea
              placeholder="Your Review"
              rows={4}
              value={reviewForm.text}
              onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #EBE5DB",
                fontSize: "16px",
                resize: "none",
                outline: "none",
              }}
            />

            <div
              className="review-modal-actions"
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <button
                onClick={() => setReviewModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #8FB9A8",
                  backgroundColor: "transparent",
                  color: "#8FB9A8",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#D9A85C",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "16px",
                  opacity: submittingReview ? 0.7 : 1,
                }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .fest-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 120px;
        }
        /* ═══════════════════════════════════════════════════════
           FULL-BLEED HERO BANNER (starts behind header, full size image)
           ═══════════════════════════════════════════════════════ */
        .wedding-full-hero {
          position: relative;
          width: 100%;
          margin-top: -100px; /* Pulls banner behind the sticky/overlay header */
          padding: 0;
          overflow: hidden;
          background-color: #FAF7F5;
        }
        .wedding-hero-inner {
          position: relative;
          width: 100%;
          line-height: 0;
        }
        .wedding-hero-img {
          display: block;
          width: 100%;
          height: auto;
          max-height: none; /* Never cut off or truncate the banner */
          object-fit: contain; /* Preserves entire full size image from top to bottom */
          border-radius: 0; /* Full edge-to-edge bleed */
          margin: 0;
          padding: 0;
          animation: fadeIn 0.4s ease;
        }
        .wedding-hero-overlay-link {
          position: absolute;
          inset: 0;
          z-index: 5;
        }
        .wedding-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 120px 40px 40px;
          background: rgba(0, 0, 0, 0.25);
          z-index: 6;
          animation: fadeIn 0.4s ease;
        }
        .banner-arrow--left {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.35);
          border: none;
          color: #fff;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          cursor: pointer;
          font-size: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .banner-arrow--right {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.35);
          border: none;
          color: #fff;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          cursor: pointer;
          font-size: 24px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .banner-arrow:hover {
          background: rgba(0, 0, 0, 0.6);
        }
        .banner-dots {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .banner-dot {
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .banner-dot.is-active {
          width: 28px;
          background-color: #D98A9C;
        }

        @media (max-width: 768px) {
          .wedding-full-hero {
            margin-top: 0 !important; /* On mobile/phone, display the full image below the header so heads/faces are never cut */
          }
          .banner-arrow--left {
            left: 10px;
            width: 36px;
            height: 36px;
            font-size: 20px;
          }
          .banner-arrow--right {
            right: 10px;
            width: 36px;
            height: 36px;
            font-size: 20px;
          }
          .banner-dots {
            bottom: 12px;
          }
        }

        /* Fallback Medallion Banner (when no image is uploaded) */
        .rakhi-banner {
          position: relative;
          width: 100%;
          aspect-ratio: 1781/723;
          background-color: #3F3B38;
          border-radius: 15px;
          display: flex;
          align-items: center;
          padding: 80px 100px;
          box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.5);
          margin-bottom: 80px;
          overflow: hidden;
          overflow: clip !important;
        }
        .banner-svg-medallion {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .banner-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 2;
        }
        .banner-sub {
          font-size: 22px;
          color: #D9A85C;
          letter-spacing: 2px;
        }
        .banner-title {
          font-size: 72px;
          color: #fff;
          margin: 0;
          font-weight: 400;
        }
        .product-row {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 100px;
          align-items: start;
          margin-bottom: 80px;
        }
        .row-align-right {
          grid-template-columns: 1.2fr 1fr;
        }
        .product-image-container {
          width: 100%;
          max-width: 536px;
          aspect-ratio: 536/715;
          background-color: #F5EDE8;
          border-radius: 15px;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #BCAEA2;
          font-size: 16px;
          overflow: hidden;
        }
        .row-align-left .product-image-container {
          justify-self: end;
        }
        .row-align-right .product-image-container {
          justify-self: start;
        }
        .product-details-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 600px;
          width: 100%;
        }
        .row-align-right .product-details-container {
          justify-self: end;
          text-align: right;
          align-items: flex-end;
        }
        .detail-title {
          font-size: 36px;
          line-height: 44px;
          color: #3F3B38;
          margin: 0;
          font-weight: 400;
          text-transform: uppercase;
        }
        .detail-desc {
          font-size: 22px;
          line-height: 32px;
          color: #8FB9A8;
          margin: 0;
        }
        .detail-price {
          font-size: 40px;
          line-height: 48px;
          color: #3F3B38;
        }
        .cart-button {
          width: 280px;
          height: 56px;
          border-radius: 28px;
          border: 1.5px solid #D9A85C;
          background-color: transparent;
          color: #D98A9C;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-button:hover {
          background-color: rgba(217, 138, 156, 0.05);
        }
        .review-section-label {
          font-size: 22px;
          color: #3F3B38;
        }
        .review-box {
          border: 1px solid #D9A85C;
          border-radius: 15px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .row-align-right .review-box {
          align-items: flex-end;
          text-align: right;
        }
        .reviewer-name {
          font-size: 24px;
          color: #D98A9C;
          font-weight: 500;
        }
        .review-text {
          font-size: 20px;
          line-height: 30px;
          color: #8FB9A8;
          margin: 0;
        }
        .review-toggle {
          background: none;
          border: 1px solid #EBE5DB;
          width: 100%;
          height: 44px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8FB9A8;
          cursor: pointer;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }
        .related-info {
          flex: 1;
        }
        .related-meta {
          margin-top: auto;
        }
        .review-modal-overlay {
          padding: 16px;
        }
        .review-modal {
          max-height: calc(100vh - 32px);
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
        }

        @media (max-width: 1200px) {
          .fest-container {
            padding: 0 40px;
          }
          .rakhi-banner {
            padding: 60px;
          }
          .banner-title {
            font-size: 56px;
          }
          .product-row {
            gap: 40px;
          }
          .add-review-btn {
            min-height: 40px;
            padding: 8px 16px !important;
            border-radius: 20px !important;
          }
          .banner-dot {
            position: relative;
          }
          .banner-dot::after {
            content: "";
            position: absolute;
            inset: -15px -3px;
          }
          .rating-row {
            gap: 4px !important;
          }
          .rating-row :global(svg) {
            width: 40px;
            height: 40px;
            padding: 4px;
          }
          .related-grid {
            gap: 24px;
          }
          .related-title {
            font-size: 18px !important;
            line-height: 26px !important;
          }
          .related-price,
          .related-action {
            font-size: 17px !important;
          }
          .related-action {
            min-height: 40px;
            display: inline-flex;
            align-items: center;
            border-bottom: none !important;
            padding: 0 !important;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 6px;
          }
        }
        @media (max-width: 992px) {
          .rakhi-banner {
            aspect-ratio: auto;
            padding: 80px 40px;
            flex-direction: column;
            justify-content: center;
            text-align: center;
          }
          .rakhi-banner.has-nav {
            padding-left: 72px;
            padding-right: 72px;
          }
          .banner-svg-medallion {
            position: relative;
            right: 0;
            top: 0;
            transform: none;
            margin-bottom: 20px;
            width: 160px;
            height: 160px;
          }
          .banner-content {
            align-items: center;
          }
          .product-row {
            grid-template-columns: 1fr !important;
            gap: 24px;
            margin-bottom: 64px;
          }
          .detail-order-first {
            order: 2;
          }
          .detail-order-second {
            order: 1;
          }
          .product-image-container {
            max-width: 320px;
            margin: 0 auto !important;
            justify-self: center !important;
          }
          .product-details-container {
            max-width: 100%;
            gap: 20px;
            text-align: center !important;
            align-items: center !important;
          }
          .detail-title {
            font-size: 30px !important;
            line-height: 38px !important;
          }
          .detail-desc {
            font-size: 18px;
            line-height: 28px;
          }
          .detail-price {
            font-size: 34px;
            line-height: 42px;
          }
          .reviews-block {
            width: 100%;
            max-width: 600px;
          }
          .review-box,
          .row-align-right .review-box {
            align-items: center;
            text-align: center;
          }
          .review-hearts {
            justify-content: center !important;
          }
          .no-reviews {
            text-align: center !important;
          }
          .related-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .related-heading {
            font-size: 28px !important;
            line-height: 36px !important;
            margin-bottom: 28px !important;
          }
          .related-title {
            font-size: 16px !important;
            line-height: 22px !important;
          }
          .related-price,
          .related-action {
            font-size: 15px !important;
          }
          .related-image {
            margin-bottom: 12px !important;
          }
        }
        @media (max-width: 720px) {
          .related-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 600px) {
          .fest-container {
            padding: 0 16px;
          }
          .rakhi-banner {
            padding: 44px 20px;
            margin-bottom: 48px;
            border-radius: 12px;
          }
          .rakhi-banner.has-nav {
            padding: 44px 20px 76px;
          }
          .banner-arrow {
            top: auto !important;
            bottom: 14px !important;
            transform: none !important;
          }
          .banner-dots {
            bottom: 29px !important;
          }
          .banner-svg-medallion {
            width: 120px;
            height: 120px;
            margin-bottom: 12px;
          }
          .banner-content {
            gap: 12px;
          }
          .banner-sub {
            font-size: 15px;
            letter-spacing: 1.5px;
          }
          .banner-title {
            font-size: clamp(28px, 8vw, 34px) !important;
            line-height: 1.2 !important;
          }
          .banner-desc {
            font-size: 17px !important;
            line-height: 25px !important;
          }
          .product-row {
            gap: 20px;
            margin-bottom: 56px;
          }
          .product-image-container {
            max-width: 280px;
          }
          .product-details-container {
            gap: 16px;
          }
          .detail-title {
            font-size: 24px !important;
            line-height: 32px !important;
          }
          .detail-desc {
            font-size: 16px !important;
            line-height: 24px !important;
          }
          .detail-price {
            font-size: 30px;
            line-height: 38px;
          }
          .detail-old-price {
            font-size: 17px !important;
          }
          .cart-button {
            height: 52px;
            font-size: 18px;
          }
          .review-section-label {
            font-size: 20px;
          }
          .review-box {
            padding: 16px;
          }
          .review-hearts :global(svg) {
            width: 22px;
            height: 22px;
          }
          .review-text {
            font-size: 16px !important;
            line-height: 24px !important;
          }
          .reviewer-name {
            font-size: 18px !important;
          }
          .related-section {
            padding-top: 40px !important;
          }
          .related-section-spaced {
            margin-top: 56px !important;
          }
          .related-heading {
            font-size: 24px !important;
            line-height: 32px !important;
            margin-bottom: 20px !important;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px 12px;
          }
          .related-title {
            font-size: 15px !important;
            line-height: 21px !important;
          }
          .related-price {
            font-size: 15px !important;
          }
          .related-action {
            font-size: 14px !important;
          }
          .related-image {
            margin-bottom: 10px !important;
            border-radius: 12px !important;
          }
          .related-meta {
            flex-wrap: wrap;
            column-gap: 8px;
          }
          .review-modal {
            width: 100% !important;
            padding: 20px !important;
            gap: 16px !important;
          }
          .review-modal-actions button {
            flex: 1;
          }
        }
        @media (max-width: 374px) {
          .related-meta {
            flex-direction: column;
            justify-content: center !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
