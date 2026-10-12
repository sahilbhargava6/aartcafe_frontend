"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { salePrice, originalPrice, formatRupees } from "@/lib/price";

export default function SpecialOffers() {
  const { addToBag } = useCart();
  const [banners, setBanners] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [weddingSpecials, setWeddingSpecials] = React.useState<any[]>([]);
  const [activeWeddingIdx, setActiveWeddingIdx] = React.useState(0);
  const [relatedItems, setRelatedItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch Banners
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/banners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeBanners = data.filter((b: any) => b.is_active);
          setBanners(activeBanners.length > 0 ? activeBanners : data);
        }
      })
      .catch((err) => console.error("Error loading banners:", err));

    // Fetch Products for main offer grid
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.slice(0, 4));
          setRelatedItems(data.slice(0, 4));
        } else {
          setProducts(defaultProducts);
          setRelatedItems(defaultRelated);
        }
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setProducts(defaultProducts);
        setRelatedItems(defaultRelated);
      });

    // Fetch Wedding Specials
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/wedding-specials")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWeddingSpecials(data);
        }
      })
      .catch((err) => console.error("Error loading wedding specials:", err));
  }, []);

  const [mainBannerIdx, setMainBannerIdx] = React.useState(0);

  const mainBanners = React.useMemo(() => {
    const list = banners.filter((b: any) => b.position === "special_offers_main");
    return list.length > 0 ? list : banners;
  }, [banners]);

  React.useEffect(() => {
    if (mainBanners.length <= 1) return;
    const timer = setInterval(() => {
      setMainBannerIdx((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mainBanners.length]);

  const banner1 = mainBanners[mainBannerIdx] || banners[0] || null;
  const banner2 = banners.find((b: any) => b.position === "special_offers_top_right") || banners[1] || null;
  const banner3 = banners.find((b: any) => b.position === "special_offers_bottom_right") || banners[2] || null;

  // A saved banner shows exactly its own text (none if left empty); the sample text is only for when there is no banner
  const bannerText = (banner: { title?: string | null; subtitle?: string | null } | null, field: "title" | "subtitle", sample: string) =>
    banner ? banner[field] || "" : sample;
  const banner1Title = bannerText(banner1, "title", "MADE BY HANDS. MEANT FOR THE HEART.");
  const banner1Subtitle = bannerText(banner1, "subtitle", "Personalized handmade frames and keepsakes that tell your story.");
  const banner2Title = bannerText(banner2, "title", "MADE BY HANDS. MEANT FOR THE HEART.");
  const banner3Title = bannerText(banner3, "title", "SPECIAL OFFER");
  const banner3Subtitle = bannerText(banner3, "subtitle", "SAVE UP TO 40%");

  const defaultProducts = [
    { id: "so-1", title: "HANDMADE RAKHI", base_price: 2000, price: 2000, image: "", description: "Handcrafted with love, designed to celebrate the timeless bond between siblings." },
    { id: "so-2", title: "HANDMADE RAKHI", base_price: 2000, price: 2000, image: "", description: "Handcrafted with love, designed to celebrate the timeless bond between siblings." },
    { id: "so-3", title: "HANDMADE RAKHI", base_price: 2000, price: 2000, image: "", description: "Handcrafted with love, designed to celebrate the timeless bond between siblings." },
    { id: "so-4", title: "HANDMADE RAKHI", base_price: 2000, price: 2000, image: "", description: "Handcrafted with love, designed to celebrate the timeless bond between siblings." },
  ];

  const defaultRelated = [
    { id: "rel-1", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
    { id: "rel-2", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
    { id: "rel-3", title: "Wedding Frame", base_price: 2000, price: 2000, image: "" },
    { id: "rel-4", title: "Wedding Frame", price: 2000, base_price: 2000, image: "" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="offers-container">
          
          {/* ═══════════════════════════════════════════════════════
              HEADER SECTION: SPRING SALE BANNER + 2 SIDE CARDS
              ═══════════════════════════════════════════════════════ */}
          <div className="banner-grid">
            
            {/* Left Box: Spring Sale Banner */}
            <div className="so-banner-wrap" style={{ position: "relative", width: "100%" }}>
              <Link
                href={banner1?.button_url || banner1?.link_url || "/shop"}
                className="spring-banner"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  position: "relative",
                  ...(banner1?.image_url
                    ? {
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url("${banner1.image_url}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              >
                {/* Corner Floral SVGs */}
                <svg className="floral-svg-left" width="120" height="120" viewBox="0 0 100 100">
                  <path d="M10 90 Q30 60 40 40 T90 10" stroke="#8FB9A8" strokeWidth="2" fill="none" />
                  <circle cx="30" cy="70" r="10" fill="#D98A9C" opacity="0.8" />
                  <circle cx="45" cy="55" r="8" fill="#D98A9C" opacity="0.8" />
                  <circle cx="20" cy="80" r="12" fill="#D98A9C" opacity="0.8" />
                </svg>
                <svg className="floral-svg-right" width="120" height="120" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="25" fill="#EFD3C7" opacity="0.75" />
                  <circle cx="65" cy="35" r="15" fill="#D98A9C" opacity="0.7" />
                  <path d="M20 80 Q40 50 60 40" stroke="#8FB9A8" strokeWidth="2" fill="none" />
                </svg>

                <span className="font-sans font-bold so-banner-label" style={{ fontSize: "16px", letterSpacing: "3px", color: "#3F3B38", marginBottom: "16px", display: "inline-block" }}>
                  SPECIAL OFFER
                </span>
                {banner1Title && <h1 className="font-serif spring-title">{banner1Title}</h1>}
                {banner1Subtitle && <p className="font-sans banner-desc" style={{ fontSize: "16px", color: "#8FB9A8", maxWidth: "600px", lineHeight: "26px", margin: "0 0 24px 0" }}>
                  {banner1Subtitle}
                </p>}
                <div
                  className="so-banner-date"
                  style={{
                    border: "1px solid #D9A85C",
                    borderRadius: "4px",
                    padding: "8px 24px",
                    fontSize: "16px",
                    color: "#D9A85C",
                    display: "inline-block",
                    marginBottom: "20px",
                  }}
                >
                  23 September - 22 December
                </div>
                <span className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", opacity: 0.7, display: "block" }}>
                  @reallygreatsite
                </span>
              </Link>

              {/* Main Banner Carousel Dots */}
              {mainBanners.length > 1 && (
                <div className="so-dots" style={{ position: "absolute", bottom: "16px", right: "24px", display: "flex", gap: "6px", zIndex: 10 }}>
                  {mainBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainBannerIdx(idx)}
                      className="so-dot"
                      style={{
                        width: idx === mainBannerIdx ? "20px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        backgroundColor: idx === mainBannerIdx ? "#D98A9C" : "#BCAEA2",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Stacked 2 Cards */}
            <div className="cards-stack">
              
              {/* Card 1: Gold 50% OFF */}
              <Link
                href={banner2?.button_url || banner2?.link_url || "/shop"}
                className="so-offer-card"
                style={{
                  flex: 1,
                  backgroundColor: "#D9A85C",
                  borderRadius: "15px",
                  padding: "20px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  ...(banner2?.image_url
                    ? {
                        backgroundImage: `linear-gradient(rgba(217, 168, 92, 0.75), rgba(217, 168, 92, 0.75)), url("${banner2.image_url}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              >
                {/* Background Text "Offer" */}
                <span className="font-serif" style={{ position: "absolute", left: "12px", top: "12px", fontSize: "48px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                  Offer
                </span>
                
                {/* Right Top 50% OFF */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%" }}>
                  <span className="font-serif" style={{ fontSize: "40px", fontWeight: 700, color: "#fff", lineHeight: "40px" }}>50%</span>
                  <span className="font-sans" style={{ fontSize: "14px", color: "#fff", letterSpacing: "2px" }}>OFF</span>
                </div>

                {/* Center Image / Title */}
                {banner2Title && <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                  <div style={{ padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#D9A85C", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                    {banner2Title}
                  </div>
                </div>}

                {/* Bottom Shop Now action */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span className="font-sans" style={{ fontSize: "12px", color: "#fff", borderBottom: "1.5px solid #fff", paddingBottom: "2px", letterSpacing: "2px", fontWeight: 600 }}>
                    SHOP NOW
                  </span>
                </div>
              </Link>

              {/* Card 2: Green Special Offer */}
              <Link
                href={banner3?.button_url || banner3?.link_url || "/shop"}
                className="so-offer-card"
                style={{
                  flex: 1,
                  backgroundColor: "#8FB9A8",
                  borderRadius: "15px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                  textDecoration: "none",
                  color: "inherit",
                  ...(banner3?.image_url
                    ? {
                        backgroundImage: `linear-gradient(rgba(143, 185, 168, 0.75), rgba(143, 185, 168, 0.75)), url("${banner3.image_url}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              >
                <div
                  style={{
                    border: "2px solid #D9A85C",
                    borderRadius: "8px",
                    padding: "24px 20px",
                    backgroundColor: "#fff",
                    textAlign: "center",
                    width: "90%",
                  }}
                >
                  <span className="font-sans" style={{ fontSize: "10px", color: "#3F3B38", borderBottom: "1px solid #3F3B38", paddingBottom: "2px", letterSpacing: "2px", fontWeight: 700, display: "inline-block", marginBottom: "12px" }}>
                    SHOP NOW
                  </span>
                  {banner3Title && <h4 className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: "0 0 6px 0", letterSpacing: "1px" }}>
                    {banner3Title}
                  </h4>}
                  {banner3Subtitle && <p className="font-sans" style={{ fontSize: "12px", color: "#8FB9A8", fontWeight: 600, margin: 0, letterSpacing: "1px" }}>
                    {banner3Subtitle}
                  </p>}
                </div>
              </Link>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              PRODUCT GRID SECTION: 2x2 HANDMADE RAKHIS / OFFERS
              ═══════════════════════════════════════════════════════ */}
          <div className="products-grid">
            {products.map((prod) => {
              const productUrl = `/shop/${prod.slug || prod.id}`;
              return (
                <div key={prod.id} className="prod-card">
                  
                  {/* Left side: Small Image Frame */}
                  <Link href={productUrl} style={{ display: "block", textDecoration: "none" }}>
                    <div className="prod-image-box" style={{ overflow: "hidden", cursor: "pointer" }}>
                      {prod.image ? (
                        <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        "Image"
                      )}
                    </div>
                  </Link>

                  {/* Right side: Product details */}
                  <div className="so-prod-details" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Link href={productUrl} style={{ textDecoration: "none" }}>
                      <h3 className="font-serif so-prod-title" style={{ fontSize: "24px", color: "#3F3B38", margin: 0, cursor: "pointer" }}>
                        {prod.title}
                      </h3>
                    </Link>
                    <p className="font-sans so-prod-desc" style={{ fontSize: "14px", color: "#8FB9A8", lineHeight: "20px", margin: 0 }}>
                      {prod.description || "Handcrafted with love, designed to celebrate the timeless bond."}
                    </p>
                    <span className="font-serif so-prod-price" style={{ fontSize: "28px", color: "#3F3B38" }}>
                      {formatRupees(salePrice(prod))}
                      {originalPrice(prod) !== null && (
                        <span className="font-sans" style={{ marginLeft: "10px", fontSize: "16px", color: "#BCAEA2", textDecoration: "line-through" }}>
                          {formatRupees(originalPrice(prod) as number)}
                        </span>
                      )}
                    </span>

                    {/* Add to Cart Button */}
                    <div>
                      <button
                        onClick={() => addToBag({ id: prod.id, title: prod.title, price: salePrice(prod), image: prod.image || "" })}
                        className="so-cart-btn"
                        style={{
                          width: "100%",
                          height: "36px",
                          borderRadius: "18px",
                          border: "1px solid #D9A85C",
                          backgroundColor: "transparent",
                          color: "#D98A9C",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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
                  </div>

                </div>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════
              WEDDING SPECIALS SECTION
              ═══════════════════════════════════════════════════════ */}
          <div className="wedding-section">
            
            {/* Left side: wedding illustrations on a mandala (built from public/images/wedding) */}
            <div className="mandala-container">
              <img
                className="wedding-art"
                src="/images/wedding/wedding-specials-art.webp"
                width={550}
                height={550}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Right side: Wedding Frames details */}
            <div className="wedding-details" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <span className="font-serif so-wedding-label" style={{ fontSize: "28px", color: "#D9A85C", letterSpacing: "1px", margin: 0 }}>
                WEDDING SPECIALS
              </span>

              {weddingSpecials.length > 0 && weddingSpecials[activeWeddingIdx] ? (
                <Link href={`/shop/${weddingSpecials[activeWeddingIdx]?.slug || weddingSpecials[activeWeddingIdx]?.id}`} style={{ textDecoration: "none" }}>
                  <h3 className="font-serif so-wedding-title" style={{ fontSize: "36px", color: "#3F3B38", margin: 0, cursor: "pointer" }}>
                    {weddingSpecials[activeWeddingIdx]?.title}
                  </h3>
                </Link>
              ) : (
                <h3 className="font-serif so-wedding-title" style={{ fontSize: "36px", color: "#3F3B38", margin: 0 }}>
                  WEDDING FRAMES
                </h3>
              )}

              {/* Row of 3 square couple thumbnails */}
              <div className="so-wedding-thumbs" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {weddingSpecials.length > 0 ? (
                  weddingSpecials.slice(0, 3).map((wItem, i) => (
                    <div
                      key={wItem.id || i}
                      onClick={() => setActiveWeddingIdx(i)}
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        backgroundColor: "#F5EDE8",
                        borderRadius: "15px",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#BCAEA2",
                        fontSize: "12px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: activeWeddingIdx === i ? "2px solid #D98A9C" : "2px solid transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {wItem.image ? (
                        <img src={wItem.image} alt={wItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        `Frame ${i + 1}`
                      )}
                    </div>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        backgroundColor: "#F5EDE8",
                        borderRadius: "15px",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#BCAEA2",
                        fontSize: "12px",
                      }}
                    >
                      Couple Frame
                    </div>
                  ))
                )}
              </div>

              <p className="font-sans so-wedding-desc" style={{ fontSize: "16px", color: "#8FB9A8", lineHeight: "26px", margin: 0 }}>
                {weddingSpecials.length > 0 && weddingSpecials[activeWeddingIdx]?.description
                  ? weddingSpecials[activeWeddingIdx].description
                  : "Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs, and sterling silver anniversary frames that track a couple's journey over time."}
              </p>

              <span className="font-serif so-wedding-price" style={{ fontSize: "36px", color: "#3F3B38" }}>
                {weddingSpecials[activeWeddingIdx] ? formatRupees(salePrice(weddingSpecials[activeWeddingIdx])) : "₹2000"}
                {weddingSpecials[activeWeddingIdx] && originalPrice(weddingSpecials[activeWeddingIdx]) !== null && (
                  <span className="font-sans" style={{ marginLeft: "12px", fontSize: "18px", color: "#BCAEA2", textDecoration: "line-through" }}>
                    {formatRupees(originalPrice(weddingSpecials[activeWeddingIdx]) as number)}
                  </span>
                )}
              </span>

              <div className="so-wedding-cta">
                <button
                  onClick={() => {
                    if (weddingSpecials.length > 0) {
                      const wObj = weddingSpecials[activeWeddingIdx];
                      addToBag({ id: wObj.id, title: wObj.title, price: salePrice(wObj), image: wObj.image || "" });
                    }
                  }}
                  style={{
                    height: "44px",
                    padding: "0 40px",
                    borderRadius: "22px",
                    border: "1px solid #D9A85C",
                    backgroundColor: "transparent",
                    color: "#D98A9C",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    cursor: "pointer",
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

            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════
              "You may also Like:" SECTION
              ═══════════════════════════════════════════════════════ */}
          <div className="so-related-section" style={{ borderTop: "1px solid #EBE5DB", paddingTop: "60px" }}>
            <h2 className="font-serif so-section-title" style={{ fontSize: "28px", color: "#3F3B38", marginBottom: "40px", margin: "0 0 40px 0" }}>
              You may also Like:
            </h2>

            <div className="related-grid">
              {relatedItems.map((prod) => {
                const productUrl = `/shop/${prod.slug || prod.id}`;
                return (
                  <div key={prod.id} className="so-related-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Link href={productUrl} style={{ width: "100%", textDecoration: "none" }}>
                      <div
                        className="so-related-image"
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
                          cursor: "pointer",
                        }}
                      >
                        {prod.image ? (
                          <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "Product Image"
                        )}
                      </div>
                    </Link>

                    <div className="so-related-info" style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                      <Link href={productUrl} style={{ textDecoration: "none" }}>
                        <h4 className="font-serif so-related-title" style={{ fontSize: "22px", lineHeight: "30px", fontWeight: 400, color: "#3F3B38", textAlign: "center", margin: 0, cursor: "pointer" }}>
                          {prod.title}
                        </h4>
                      </Link>
                      <div className="so-related-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span className="font-sans so-related-price" style={{ fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
                          {formatRupees(salePrice(prod))}
                          {originalPrice(prod) !== null && (
                            <span style={{ marginLeft: "8px", fontSize: "14px", color: "#BCAEA2", textDecoration: "line-through" }}>
                              {formatRupees(originalPrice(prod) as number)}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => addToBag({ id: prod.id, title: prod.title, price: salePrice(prod), image: prod.image || "" })}
                          className="font-sans so-related-action"
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
        </div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .offers-container {
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 120px;
        }
        .banner-grid {
          display: grid;
          grid-template-columns: 2.4fr 1fr;
          gap: 30px;
          margin-bottom: 80px;
        }
        /* The wrapper is the grid item; the banner grows to fit its text and stretches to the
           height of the offer cards beside it (a fixed aspect ratio clipped the date/handle text) */
        .so-banner-wrap {
          display: flex;
          flex-direction: column;
        }
        .spring-banner {
          position: relative;
          width: 100%;
          flex: 1 0 auto;
          background-color: #fff;
          border: 6px solid #D98A9C;
          border-radius: 15px;
          display: flex !important;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          overflow: hidden;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
        }
        .spring-title {
          font-size: 72px;
          line-height: 80px;
          color: #3F3B38;
          margin: 0 0 16px 0;
          letter-spacing: 2px;
        }
        .floral-svg-left {
          position: absolute;
          left: -10px;
          bottom: -10px;
          opacity: 0.9;
        }
        .floral-svg-right {
          position: absolute;
          right: 10px;
          top: 10px;
          opacity: 0.9;
        }
        .cards-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px 40px;
          margin-bottom: 80px;
        }
        .prod-card {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 30px;
          align-items: center;
        }
        .prod-image-box {
          width: 100%;
          aspect-ratio: 216/288;
          background-color: #F5EDE8;
          border-radius: 15px;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #BCAEA2;
          font-size: 14px;
        }
        .wedding-section {
          border-top: 1px solid #EBE5DB;
          padding-top: 60px;
          margin-bottom: 80px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .mandala-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .wedding-art {
          width: 100%;
          max-width: 550px;
          height: auto;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }
        /* Cards in a row share one height; pin price/action to the bottom so they line up when titles wrap */
        .so-related-info {
          flex: 1;
        }
        .so-related-meta {
          margin-top: auto;
        }

        @media (max-width: 1200px) {
          .offers-container {
            padding: 0 40px;
          }
          .spring-title {
            font-size: 48px;
            line-height: 56px;
          }
          .wedding-section {
            gap: 40px;
          }
          /* Touch-sized controls (tablets, iPad) */
          .so-dot {
            position: relative;
          }
          .so-dot::after {
            content: "";
            position: absolute;
            inset: -16px -3px;
          }
          .so-cart-btn {
            height: 40px !important;
            border-radius: 20px !important;
          }
          .related-grid {
            gap: 24px;
          }
          .so-related-title {
            font-size: 18px !important;
            line-height: 26px !important;
          }
          .so-related-price,
          .so-related-action {
            font-size: 17px !important;
          }
          /* 40px tap box; a text underline keeps the line under the words instead of at the box edge */
          .so-related-action {
            min-height: 40px;
            display: inline-flex !important;
            align-items: center;
            border-bottom: none !important;
            padding: 0 !important;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 6px;
          }
        }
        @media (max-width: 992px) {
          .banner-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 56px;
          }
          .spring-banner {
            padding: 56px 24px;
          }
          /* Offer cards side by side under the main banner */
          .cards-stack {
            flex-direction: row;
            gap: 20px;
          }
          .so-offer-card {
            min-height: 180px;
          }
          .products-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px 24px;
            margin-bottom: 56px;
          }
          .prod-card {
            grid-template-columns: 1fr 1.3fr;
            gap: 16px;
          }
          .so-prod-details {
            gap: 10px !important;
          }
          .so-prod-title {
            font-size: 20px !important;
            line-height: 28px !important;
          }
          .so-prod-price {
            font-size: 24px !important;
          }
          .wedding-section {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-top: 48px;
            margin-bottom: 56px;
          }
          /* Larger than the old 260px drawing so the wedding pictures stay recognisable */
          .wedding-art {
            max-width: 380px;
          }
          .so-wedding-label {
            font-size: 24px !important;
          }
          .so-wedding-title {
            font-size: 30px !important;
            line-height: 38px !important;
          }
          /* Price + button right under the photos; the (often long) description follows */
          .so-wedding-price {
            order: 1;
          }
          .so-wedding-cta {
            order: 2;
          }
          .so-wedding-desc {
            order: 3;
          }
          .related-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .so-section-title {
            font-size: 28px !important;
            line-height: 36px !important;
            margin-bottom: 28px !important;
          }
          .so-related-title {
            font-size: 16px !important;
            line-height: 22px !important;
          }
          .so-related-price,
          .so-related-action {
            font-size: 15px !important;
          }
          .so-related-image {
            margin-bottom: 12px !important;
          }
        }
        @media (max-width: 720px) {
          /* One product per row: compact image-left card */
          .products-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .prod-card {
            grid-template-columns: min(38%, 180px) 1fr;
            gap: 16px;
          }
          .related-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 600px) {
          .offers-container {
            padding: 0 16px;
          }
          .banner-grid {
            gap: 16px;
            margin-bottom: 40px;
          }
          .spring-banner {
            padding: 40px 16px;
            border-width: 4px;
          }
          .spring-title {
            font-size: clamp(26px, 8vw, 32px) !important;
            line-height: 1.2 !important;
            letter-spacing: 1px;
          }
          .so-banner-label {
            font-size: 13px !important;
            letter-spacing: 2px !important;
            margin-bottom: 12px !important;
          }
          .banner-desc {
            font-size: 14px !important;
            line-height: 22px !important;
          }
          .so-banner-date {
            font-size: 14px !important;
            padding: 8px 16px !important;
            margin-bottom: 16px !important;
          }
          .floral-svg-left, .floral-svg-right {
            width: 72px;
            height: 72px;
          }
          .cards-stack {
            flex-direction: column;
            gap: 16px;
          }
          .so-offer-card {
            min-height: 0;
          }
          .products-grid {
            gap: 24px;
            margin-bottom: 40px;
          }
          .prod-card {
            gap: 14px;
          }
          .so-prod-details {
            gap: 8px !important;
          }
          .so-prod-title {
            font-size: 18px !important;
            line-height: 24px !important;
          }
          .so-prod-price {
            font-size: 22px !important;
          }
          .wedding-section {
            padding-top: 40px;
            gap: 16px;
            margin-bottom: 40px;
          }
          .wedding-art {
            max-width: 300px;
          }
          .wedding-details {
            gap: 16px !important;
          }
          .so-wedding-label {
            font-size: 20px !important;
          }
          .so-wedding-title {
            font-size: 26px !important;
            line-height: 32px !important;
          }
          .so-wedding-thumbs {
            gap: 12px !important;
          }
          .so-wedding-price {
            font-size: 30px !important;
          }
          .so-related-section {
            padding-top: 40px !important;
          }
          .so-section-title {
            font-size: 24px !important;
            line-height: 32px !important;
            margin-bottom: 20px !important;
          }
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px 12px;
          }
          .so-related-title {
            font-size: 15px !important;
            line-height: 21px !important;
          }
          .so-related-price {
            font-size: 15px !important;
          }
          .so-related-action {
            font-size: 14px !important;
          }
          .so-related-image {
            margin-bottom: 10px !important;
            border-radius: 12px !important;
          }
          .so-related-meta {
            flex-wrap: wrap;
            column-gap: 8px;
          }
        }
        /* Very narrow phones: price and action don't fit side by side, so stack them centered */
        @media (max-width: 374px) {
          .so-related-meta {
            flex-direction: column;
            justify-content: center !important;
            align-items: center !important;
          }
        }
      ` }} />
    </div>
  );
}
