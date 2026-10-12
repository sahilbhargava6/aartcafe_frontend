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
          setBanners(data.filter((b: any) => b.is_active));
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

  const mainBanners = React.useMemo(() => banners.filter((b: any) => b.position === "special_offers_main" && b.image_url), [banners]);

  React.useEffect(() => {
    if (mainBanners.length <= 1) return;
    const timer = setInterval(() => {
      setMainBannerIdx((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mainBanners.length]);

  // Each slot only shows a banner saved for it in the dashboard; an empty slot is left out
  const banner1 = mainBanners[mainBannerIdx % Math.max(mainBanners.length, 1)] || null;
  const sideBanners = ["special_offers_top_right", "special_offers_bottom_right"]
    .map((position) => banners.find((b: any) => b.position === position && b.image_url))
    .filter(Boolean);
  const bannerLink = (banner: any) => banner.button_url || banner.link_url || "/shop";

  // The images keep their own shape. The side column is sized so the main banner is exactly as tall
  // as the two side cards stacked (gaps included); until the photos have loaded, 2.4 : 1 is used.
  const [shapes, setShapes] = React.useState<Record<string, number>>({});
  const rememberShape = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    setShapes((prev) => (prev[img.src] === ratio ? prev : { ...prev, [img.src]: ratio }));
  };
  const BANNER_GAP = 24; // matches the .banner-grid and .cards-stack gaps
  const bannerColumns = React.useMemo(() => {
    const mainRatio = banner1 ? shapes[banner1.image_url] : undefined;
    const sideRatios = sideBanners.map((b: any) => shapes[b.image_url]);
    if (!mainRatio || sideRatios.some((r) => !r)) return "2.4fr 1fr";
    // Main height = side width x (sum of 1/ratio) + the gaps between the cards, and the two columns
    // share the row width minus the column gap; solving that gives the side column width
    const stacked = sideRatios.reduce((sum, r) => sum + 1 / r, 0);
    const stackGaps = BANNER_GAP * (sideRatios.length - 1);
    return `1fr calc((100% - ${BANNER_GAP + mainRatio * stackGaps}px) / ${1 + mainRatio * stacked})`;
  }, [banner1, sideBanners, shapes]);

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
              HEADER: MAIN BANNER + 2 SIDE CARDS
              The banners from the dashboard, shown whole as uploaded (their designs carry their
              own text). A slot without a banner is left out.
              ═══════════════════════════════════════════════════════ */}
          {(banner1?.image_url || sideBanners.length > 0) && (
            <div
              className={`banner-grid${banner1?.image_url && sideBanners.length > 0 ? "" : " banner-grid--single"}`}
              style={{ "--so-cols": bannerColumns } as React.CSSProperties}
            >
              {banner1?.image_url && (
                <div className="so-banner-wrap" style={{ position: "relative", width: "100%" }}>
                  <Link href={bannerLink(banner1)} className="so-image-banner">
                    <img src={banner1.image_url} alt={banner1.title || "Special offer"} onLoad={rememberShape} />
                  </Link>

                  {/* Main Banner Carousel Dots */}
                  {mainBanners.length > 1 && (
                    <div className="so-dots" style={{ position: "absolute", bottom: "16px", right: "24px", display: "flex", gap: "6px", zIndex: 10 }}>
                      {mainBanners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMainBannerIdx(idx)}
                          className="so-dot"
                          aria-label={`Show banner ${idx + 1}`}
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
              )}

              {/* Right Column: the two side cards, stacked */}
              {sideBanners.length > 0 && (
                <div className="cards-stack">
                  {sideBanners.map((banner) => (
                    <Link key={banner.id} href={bannerLink(banner)} className="so-image-banner">
                      <img src={banner.image_url} alt={banner.title || "Special offer"} onLoad={rememberShape} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

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
            
            {/* Left side: wedding illustrations on a slowly turning mandala (layers built from public/images/wedding) */}
            <div className="mandala-container">
              <div className="wedding-art">
                <img className="wedding-mandala" src="/images/wedding/wedding-mandala.webp" width={550} height={550} alt="" loading="lazy" decoding="async" />
                <img className="wedding-items" src="/images/wedding/wedding-items.webp" width={550} height={550} alt="" loading="lazy" decoding="async" />
              </div>
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
        /* The column widths are worked out from the banner images (--so-cols) so the main banner
           and the two stacked side cards come out the same height */
        .banner-grid {
          display: grid;
          grid-template-columns: var(--so-cols, 2.4fr 1fr);
          align-items: start;
          gap: 24px;
          margin-bottom: 80px;
        }
        .banner-grid--single {
          grid-template-columns: 1fr;
        }
        .cards-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        /* A banner is shown whole, at its own shape: nothing cropped, no text over it */
        .so-image-banner {
          display: block;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
          background-color: #F7F2EE;
        }
        .so-image-banner img {
          display: block;
          width: 100%;
          height: auto;
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
          position: relative;
          width: 100%;
          max-width: 550px;
          aspect-ratio: 1;
        }
        .wedding-art img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        /* The mandala turns full circle once a minute behind the wedding items */
        .wedding-mandala {
          animation: wedding-mandala-spin 60s linear infinite;
        }
        @keyframes wedding-mandala-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wedding-mandala {
            animation: none;
          }
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
            gap: 20px;
            margin-bottom: 56px;
          }
          /* Side cards next to each other under the main banner */
          .cards-stack {
            flex-direction: row;
            align-items: flex-start;
            gap: 20px;
          }
          .cards-stack > :global(*) {
            flex: 1 1 0;
            min-width: 0;
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
          .cards-stack {
            flex-direction: column;
            gap: 16px;
          }
          .so-image-banner {
            border-radius: 12px;
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
