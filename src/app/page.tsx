"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import SwipeCarousel from "@/components/SwipeCarousel";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const { addToBag } = useCart();
  const [activeFestiveTab, setActiveFestiveTab] = useState("Handmade Rakhi");
  const [bestsellerProducts, setBestsellerProducts] = useState<any[]>([]);
  const [newDiscoveryProducts, setNewDiscoveryProducts] = useState<any[]>([]);
  const [weddingSpecials, setWeddingSpecials] = useState<any[]>([]);
  const [festiveSpecials, setFestiveSpecials] = useState<any[]>([]);
  const [activeWeddingIndex, setActiveWeddingIndex] = useState(0);
  const [activeFestiveIndex, setActiveFestiveIndex] = useState(0);
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const weddingThumbsRef = useRef<HTMLDivElement>(null);

  // Show a wedding special (the arrows wrap around) and slide its thumbnail into view
  const showWedding = (index: number) => {
    const count = weddingSpecials.length;
    if (count === 0) return;
    const next = (index + count) % count;
    setActiveWeddingIndex(next);
    const row = weddingThumbsRef.current;
    const thumb = row?.children[next] as HTMLElement | undefined;
    if (row && thumb) {
      row.scrollTo({ left: thumb.offsetLeft - (row.clientWidth - thumb.offsetWidth) / 2, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (newDiscoveryProducts.length > 1) {
      const interval = setInterval(() => {
        setDiscoveryIndex((prev) => (prev + 1) % newDiscoveryProducts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [newDiscoveryProducts]);


  useEffect(() => {
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/festive-specials?status=featured")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // A backend without the festive flags ignores ?status=; then keep showing all festive items as before
          const featured = data.filter((p: any) => !("is_festive_featured" in p) || p.is_festive_featured);
          if (featured.length > 0) setFestiveSpecials(featured);
        }
      })
      .catch((err) => console.error("Error fetching festive specials:", err));

    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/bestsellers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBestsellerProducts(data);
        }
      })
      .catch((err) => console.error("Error fetching bestsellers:", err));

    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/new-discoveries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNewDiscoveryProducts(data);
        }
      })
      .catch((err) => console.error("Error fetching new discoveries:", err));

    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/wedding-specials")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWeddingSpecials(data);
        }
      })
      .catch((err) => console.error("Error fetching wedding specials:", err));

    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Featured reviews: approved only, best rated first, newest first within a rating
          const featured = data
            .filter((r: any) => r.is_approved !== false)
            .sort((a: any, b: any) => Number(b.rating) - Number(a.rating) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 12);
          setReviews(featured);
        }
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  const festiveDetails: Record<string, { desc: string; price: number; title: string }> = {
    "Handmade Thal": {
      title: "Handmade Decorative Thal",
      desc: "Beautifully decorated resin and wooden thals perfect for puja ceremonies and festive celebrations.",
      price: 2499,
    },
    "Handmade Rakhi": {
      title: "Handmade Rakhi Set",
      desc: "Handcrafted with love, designed to celebrate the timeless bond between siblings.",
      price: 2000,
    },
    "Handmade Shubh Labh": {
      title: "Handmade Shubh Labh Wall Hanging",
      desc: "Aesthetic floral and resin wall hangings to bring prosperity and positive energy to your entrance.",
      price: 1499,
    },
  };

  // One slide per festive product for the tablet/phone carousel (same fallback items as the desktop tabs)
  const festiveSlides =
    festiveSpecials.length > 0
      ? festiveSpecials.map((p) => {
          const price = p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.base_price);
          return {
            id: String(p.id),
            title: p.title,
            description: (p.description && p.description.trim() && p.description.trim() !== "No description filled.") ? p.description : "❤️",
            price,
            image: p.image || "",
            href: `/shop/${p.slug || p.id}`,
            cartItem: { id: String(p.id), title: p.title, price, image: p.image || "", category: p.category?.name || "Festive Specials" },
          };
        })
      : Object.entries(festiveDetails).map(([tab, details]) => {
          const id = `festive-${tab.toLowerCase().replace(/\s+/g, "-")}`;
          return {
            id,
            title: tab,
            description: details.desc,
            price: details.price,
            image: "",
            href: "/festive-specials",
            cartItem: { id, title: details.title, price: details.price, image: "", category: "Festive Specials" },
          };
        });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1 }}>

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          className="hero-section"
          style={{
            position: "relative",
            width: "100%",
            minHeight: "680px",
            paddingBottom: "10px",
            overflow: "visible",
            background: "#fff",
          }}
        >
          {/* ── Flower decoration: top-left cluster ── */}
          <div
            className="hero-flower hero-flower--tl"
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "240px",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            <img
              src="/images/Group 3.png"
              alt="Magnolia flowers top-left decoration"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.15))",
              }}
            />
          </div>

          {/* ── Hero content layout ── */}
          <div
            className="hero-container"
            style={{
              maxWidth: "1920px",
              margin: "0 auto",
              padding: "0 37px",
              display: "flex",
              alignItems: "flex-start",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Left: Text content */}
            <div
              className="hero-text-side"
              style={{
                paddingTop: "240px",
                paddingLeft: "60px",
                flex: "1",
              }}
            >
              <h1
                className="font-serif hero-h1"
                style={{
                  fontSize: "64px",
                  lineHeight: "85px",
                  fontWeight: 400,
                  color: "#3F3B38",
                  margin: 0,
                }}
              >
                MADE BY HANDS.<br />
                KEPT FOREVER.
              </h1>
              <p
                className="font-script hero-p"
                style={{
                  fontSize: "40px",
                  lineHeight: "58px",
                  fontWeight: 400,
                  color: "#D98A9C",
                  marginTop: "40px",
                }}
              >
                Preserving What Matters, Personalising What You Love
              </p>
            </div>

            {/* Right: Auto-rotating fanned image carousel */}
            <HeroCarousel />
          </div>

          {/* ── Flower decoration: bottom-right branch ── */}
          <div
            className="hero-flower hero-flower--br"
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "0px",
              width: "760px",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            <img
              src="/images/Group 2.png"
              alt="Magnolia flower branch bottom-right decoration"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.12))",
              }}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CUSTOMER'S FAVORITES
            ═══════════════════════════════════════════════════════ */}
        <section
          id="bestsellers"
          className="home-section"
          style={{
            padding: "40px 0 60px 0",
            background: "#fff",
          }}
        >
          <div className="home-section-wrapper" style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative" }}>
            {/* Section Header */}
            <div className="home-section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
              <h2
                className="font-serif home-section-title"
                style={{
                  fontSize: "48px",
                  lineHeight: "64px",
                  fontWeight: 400,
                  color: "#3F3B38",
                  margin: 0,
                }}
              >
                CUSTOMER&apos;S FAVORITES
              </h2>
              <a
                href="/shop?collection=bestsellers"
                className="font-sans home-section-link"
                style={{
                  color: "#8FB9A8",
                  fontSize: "32px",
                  lineHeight: "46px",
                  fontWeight: 400,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  marginTop: "4px",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                All Bestsellers here →
              </a>
            </div>

            {/* Carousel: 3 cards per view on laptops and tablets, 2 on phones; moves on by itself every 4 seconds */}
            <SwipeCarousel
              ariaLabel="Customer's favorites"
              autoPlay={4000}
              items={
                bestsellerProducts.length > 0
                  ? bestsellerProducts
                  : [
                    { id: "fav-1", title: "Wedding Frame", base_price: 2000 },
                    { id: "fav-2", title: "Wedding Frame", base_price: 2000 },
                    { id: "fav-3", title: "Wedding Frame", base_price: 2000 },
                    { id: "fav-4", title: "Wedding Frame", base_price: 2000 },
                  ]
              }
              getKey={(prod) => prod.id}
              perView={{ desktop: 3, tablet: 3, mobile: 2 }}
              gap={{ desktop: 55, mobile: 14 }}
              arrowTop="36%"
              renderItem={(prod) => (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  {/* Product image */}
                  <a
                    href={`/shop/${prod.slug || prod.id}`}
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      backgroundColor: "#F5EDE8",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#BCAEA2",
                      fontSize: "14px",
                      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {prod.image ? (
                      <img src={prod.image} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "Product Image"
                    )}
                  </a>

                  <a href={`/shop/${prod.slug || prod.id}`} style={{ textDecoration: "none" }}>
                    <h3
                      className="font-serif fav-title"
                      style={{
                        fontSize: "24px",
                        lineHeight: "32px",
                        fontWeight: 400,
                        color: "#3F3B38",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {prod.title}
                    </h3>
                  </a>
                  <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", justifyContent: "center", columnGap: "8px", margin: "0 0 4px 0" }}>
                    <span
                      className="font-sans fav-price"
                      style={{
                        fontSize: "22px",
                        lineHeight: "32px",
                        fontWeight: 500,
                        color: "#3F3B38",
                      }}
                    >
                      ₹{prod.discount_price ?? prod.base_price ?? prod.price}
                    </span>
                    {prod.discount_price && (
                      <span className="font-sans fav-strike" style={{ fontSize: "15px", textDecoration: "line-through", color: "#999" }}>
                        ₹{prod.base_price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToBag({ id: prod.id, title: prod.title, price: parseFloat(prod.discount_price ?? prod.base_price ?? prod.price), image: prod.image || "" })}
                    className="font-sans fav-btn"
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #000",
                      fontSize: "22px",
                      lineHeight: "32px",
                      fontWeight: 400,
                      color: "#3F3B38",
                      cursor: "pointer",
                      padding: "0 0 2px 0",
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#D9A85C";
                      e.currentTarget.style.borderColor = "#D9A85C";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#3F3B38";
                      e.currentTarget.style.borderColor = "#000";
                    }}
                  >
                    Add to Bag
                  </button>
                </div>
              )}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            DISCOVER NEW
            ═══════════════════════════════════════════════════════ */}
        <section className="home-section" style={{ padding: "60px 0 80px 0", background: "#fff", position: "relative", overflow: "hidden" }}>
          {/* Flower decoration top-right for this section */}
          <div style={{
            position: "absolute", top: "-20px", right: "-30px",
            width: "300px", height: "300px", pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(ellipse at center, rgba(239,211,199,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />

          {(() => {
            const rightProduct = newDiscoveryProducts.length > 0 ? newDiscoveryProducts[discoveryIndex] : null;
            const leftProduct = newDiscoveryProducts.length > 1
              ? newDiscoveryProducts[(discoveryIndex - 1 + newDiscoveryProducts.length) % newDiscoveryProducts.length]
              : rightProduct;

            return (
              <div className="home-desktop-only" style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative", zIndex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "80px", alignItems: "start", maxWidth: "1350px", margin: "0 auto" }}>
                  {/* Left: Large product frame image */}
                  <a
                    href={leftProduct ? `/shop/${leftProduct.slug || leftProduct.id}` : "/shop"}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "676px",
                        aspectRatio: "676/844",
                        backgroundColor: "#F5EDE8",
                        borderRadius: "15px",
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#BCAEA2",
                        fontSize: "14px",
                        overflow: "hidden",
                        transition: "all 0.5s ease-in-out"
                      }}
                    >
                      {newDiscoveryProducts.length > 0 ? (
                        newDiscoveryProducts.map((p) => (
                          <img
                            key={p.id}
                            src={p.image}
                            alt={p.title}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              opacity: leftProduct?.id === p.id ? 1 : 0,
                              transition: "opacity 1.5s ease-in-out"
                            }}
                          />
                        ))
                      ) : (
                        "Large Product Image"
                      )}
                    </div>
                  </a>

                  {/* Right: Discover heading + smaller image + text */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "40px" }}>
                    <h2
                      className="font-serif home-section-title"
                      style={{
                        fontSize: "48px",
                        lineHeight: "64px",
                        fontWeight: 400,
                        color: "#3F3B38",
                        textAlign: "center",
                        margin: 0,
                      }}
                    >
                      DISCOVER<br />NEW
                    </h2>

                    {/* Smaller product image */}
                    <a
                      href={rightProduct ? `/shop/${rightProduct.slug || rightProduct.id}` : "/shop"}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "354px",
                          height: "442px",
                          backgroundColor: "#F5EDE8",
                          borderRadius: "15px",
                          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#BCAEA2",
                          fontSize: "14px",
                          margin: "0 auto",
                          overflow: "hidden",
                          transition: "all 0.5s ease-in-out"
                        }}
                      >
                        {newDiscoveryProducts.length > 0 ? (
                          newDiscoveryProducts.map((p) => (
                            <img
                              key={p.id}
                              src={p.image}
                              alt={p.title}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: rightProduct?.id === p.id ? 1 : 0,
                                transition: "opacity 1.5s ease-in-out"
                              }}
                            />
                          ))
                        ) : (
                          "Product Image"
                        )}
                      </div>
                    </a>

                    {/* Product details */}
                    <div style={{ textAlign: "center" }}>
                      <a
                        href={rightProduct ? `/shop/${rightProduct.slug || rightProduct.id}` : "/shop"}
                        style={{ textDecoration: "none" }}
                      >
                        <h3
                          className="font-serif"
                          style={{
                            fontSize: "24px",
                            lineHeight: "32px",
                            fontWeight: 400,
                            color: "#3F3B38",
                            margin: "0 0 12px 0",
                            transition: "all 0.5s ease-in-out"
                          }}
                        >
                          {rightProduct ? rightProduct.title : "Wedding Frame"}
                        </h3>
                      </a>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: "22px",
                          lineHeight: "32px",
                          fontWeight: 400,
                          color: "#3F3B38",
                          margin: "0 0 12px 0",
                          maxWidth: "422px",
                          marginLeft: "auto",
                          marginRight: "auto",
                          transition: "all 0.5s ease-in-out"
                        }}
                      >
                        {rightProduct?.description && rightProduct.description.trim() && rightProduct.description.trim() !== "No description filled."
                          ? rightProduct.description
                          : "❤️"}
                      </p>
                      <button
                        className="font-sans"
                        onClick={() => {
                          if (rightProduct) {
                            addToBag({ id: rightProduct.id, title: rightProduct.title, price: parseFloat(rightProduct.discount_price || rightProduct.base_price), image: rightProduct.image || "" });
                          }
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          borderBottom: "1px solid #000",
                          fontSize: "22px",
                          lineHeight: "32px",
                          fontWeight: 400,
                          color: "#3F3B38",
                          cursor: "pointer",
                          padding: "0 0 2px 0",
                        }}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tablets & phones: heading + swipeable row of new products */}
          {newDiscoveryProducts.length > 0 && (
            <div className="home-mobile-only home-section-wrapper" style={{ padding: "0 40px", position: "relative", zIndex: 1 }}>
              <h2
                className="font-serif home-section-title"
                style={{ fontSize: "48px", lineHeight: "64px", fontWeight: 400, color: "#3F3B38", textAlign: "center", margin: "0 0 24px 0" }}
              >
                DISCOVER NEW
              </h2>
              <SwipeCarousel
                ariaLabel="New discoveries"
                items={newDiscoveryProducts}
                getKey={(p) => p.id}
                perView={{ desktop: 3, tablet: 2.3, mobile: 1.3 }}
                gap={{ desktop: 24, mobile: 14 }}
                arrowTop="40%"
                renderItem={(p) => {
                  const price = parseFloat(p.discount_price || p.base_price);
                  return (
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "center", height: "100%" }}>
                      <a
                        href={`/shop/${p.slug || p.id}`}
                        style={{ display: "block", width: "100%", aspectRatio: "4/5", backgroundColor: "#F5EDE8", borderRadius: "15px", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)", overflow: "hidden", marginBottom: "12px" }}
                      >
                        {p.image && <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </a>
                      <a href={`/shop/${p.slug || p.id}`} style={{ textDecoration: "none" }}>
                        <h3 className="font-serif" style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 400, color: "#3F3B38", margin: "0 0 6px 0" }}>
                          {p.title}
                        </h3>
                      </a>
                      <p
                        className="font-sans"
                        style={{ fontSize: "14px", lineHeight: "20px", color: "#6E6E6E", margin: "0 0 8px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {(p.description && p.description.trim() && p.description.trim() !== "No description filled.") ? p.description : "❤️"}
                      </p>
                      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
                        <span className="font-sans" style={{ fontSize: "16px", fontWeight: 500, color: "#3F3B38" }}>₹{price}</span>
                        <button
                          onClick={() => addToBag({ id: p.id, title: p.title, price, image: p.image || "" })}
                          className="font-sans"
                          style={{ background: "none", border: "none", borderBottom: "1px solid #3F3B38", fontSize: "15px", color: "#3F3B38", cursor: "pointer", padding: "0 0 2px 0", minHeight: "32px" }}
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}

          {/* Rotated decorative image (background) */}
          <div style={{
            position: "absolute",
            right: "-50px",
            top: "0",
            width: "531px",
            height: "531px",
            background: "radial-gradient(ellipse at center, rgba(239,211,199,0.15) 0%, transparent 65%)",
            borderRadius: "50%",
            transform: "rotate(-17deg)",
            pointerEvents: "none",
          }} />
        </section>

        {/* ═══════════════════════════════════════════════════════
            FESTIVE TREASURES
            ═══════════════════════════════════════════════════════ */}
        <section className="home-section" style={{ padding: "60px 0 80px 0", background: "#fff" }}>
          <div className="home-section-wrapper" style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px" }}>
            {/* Section title */}
            <h2
              className="font-serif home-section-title"
              style={{
                fontSize: "48px",
                lineHeight: "64px",
                fontWeight: 400,
                color: "#3F3B38",
                textAlign: "center",
                margin: "0 0 60px 0",
              }}
            >
              FESTIVE TREASURES
            </h2>

            {festiveSpecials.length > 0 ? (
              (() => {
                const currentProduct = festiveSpecials[activeFestiveIndex % festiveSpecials.length];
                const prodPrice = currentProduct.discount_price ? parseFloat(currentProduct.discount_price) : parseFloat(currentProduct.base_price);
                return (
                  <div className="festive-grid festive-desktop-only" style={{ display: "grid", gridTemplateColumns: "452px 1.2fr 1fr", gap: "40px", alignItems: "center" }}>
                    {/* Left: Festive product image with zoom & fade effect */}
                    <a href={`/shop/${currentProduct.slug || currentProduct.id}`} style={{ textDecoration: "none", display: "block" }}>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "452px",
                          aspectRatio: "452/603",
                          backgroundColor: "#F5EDE8",
                          borderRadius: "18px",
                          boxShadow: "0px 12px 30px rgba(63, 59, 56, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#BCAEA2",
                          fontSize: "14px",
                          overflow: "hidden",
                          position: "relative",
                          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.02) translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0px 20px 40px rgba(217, 138, 156, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1) translateY(0)";
                          e.currentTarget.style.boxShadow = "0px 12px 30px rgba(63, 59, 56, 0.12)";
                        }}
                      >
                        {currentProduct.image ? (
                          <img
                            key={currentProduct.id}
                            src={currentProduct.image}
                            alt={currentProduct.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              animation: "festiveImgFade 0.5s ease-in-out forwards",
                            }}
                          />
                        ) : (
                          "Festive Product Image"
                        )}
                      </div>
                    </a>

                    {/* Middle: Tab list of featured festive products */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", justifyContent: "center" }}>
                      {festiveSpecials.map((prod, idx) => {
                        const isActive = activeFestiveIndex === idx;
                        return (
                          <button
                            key={prod.id}
                            onClick={() => setActiveFestiveIndex(idx)}
                            className="font-serif"
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: isActive ? "34px" : "26px",
                              lineHeight: "44px",
                              fontWeight: isActive ? 500 : 400,
                              color: isActive ? "#3F3B38" : "#BCAEA2",
                              cursor: "pointer",
                              textAlign: "center",
                              padding: "6px 16px",
                              borderRadius: "24px",
                              backgroundColor: isActive ? "rgba(217, 138, 156, 0.1)" : "transparent",
                              transform: isActive ? "scale(1.05)" : "scale(1)",
                              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.color = "#D98A9C";
                                e.currentTarget.style.transform = "scale(1.02)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.color = "#BCAEA2";
                                e.currentTarget.style.transform = "scale(1)";
                              }
                            }}
                          >
                            {isActive && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D98A9C", display: "inline-block" }} />}
                            {prod.title}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right: Active tab details with smooth fade */}
                    <div
                      key={`details-${currentProduct.id}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: "16px",
                        maxWidth: "340px",
                        margin: "0 auto",
                        animation: "festiveTextFade 0.4s ease-in-out forwards",
                      }}
                    >
                      <p
                        className="font-sans"
                        style={{
                          fontSize: "16px",
                          lineHeight: "26px",
                          fontWeight: 400,
                          color: "#6E6E6E",
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {(currentProduct.description && currentProduct.description.trim() && currentProduct.description.trim() !== "No description filled.") ? currentProduct.description : "❤️"}
                      </p>
                      <span
                        className="font-sans"
                        style={{
                          fontSize: "24px",
                          lineHeight: "34px",
                          fontWeight: 500,
                          color: "#D98A9C",
                        }}
                      >
                        ₹{prodPrice}
                      </span>
                      <div>
                        <button
                          onClick={() =>
                            addToBag({
                              id: String(currentProduct.id),
                              title: currentProduct.title,
                              price: prodPrice,
                              image: currentProduct.image || "",
                              category: currentProduct.category?.name || "Festive Specials",
                            })
                          }
                          className="font-sans"
                          style={{
                            background: "#D98A9C",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "16px",
                            fontWeight: 500,
                            color: "#fff",
                            cursor: "pointer",
                            padding: "10px 24px",
                            boxShadow: "0 4px 12px rgba(217, 138, 156, 0.3)",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(217, 138, 156, 0.45)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(217, 138, 156, 0.3)";
                          }}
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="festive-grid festive-desktop-only" style={{ display: "grid", gridTemplateColumns: "452px 1.2fr 1fr", gap: "40px", alignItems: "center" }}>
                {/* Fallback layout */}
                <div
                  style={{
                    width: "100%", maxWidth: "452px", aspectRatio: "452/603",
                    backgroundColor: "#F5EDE8", borderRadius: "15px", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px", overflow: "hidden",
                  }}
                >
                  Festive Product Image
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "center", justifyContent: "center" }}>
                  {Object.keys(festiveDetails).map((tab) => {
                    const isActive = activeFestiveTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveFestiveTab(tab)}
                        className="font-serif"
                        style={{
                          background: "none", border: "none", fontSize: "36px", lineHeight: "48px",
                          fontWeight: 400, color: isActive ? "#3F3B38" : "#BCAEA2", cursor: "pointer",
                          textAlign: "center", padding: "8px 0", transition: "all 0.3s ease",
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    textAlign: "center", gap: "12px", maxWidth: "320px", margin: "0 auto",
                  }}
                >
                  <p className="font-sans" style={{ fontSize: "18px", lineHeight: "26px", fontWeight: 400, color: "#6E6E6E", margin: 0 }}>
                    {festiveDetails[activeFestiveTab].desc}
                  </p>
                  <span className="font-sans" style={{ fontSize: "22px", lineHeight: "32px", fontWeight: 400, color: "#3F3B38" }}>
                    ₹{festiveDetails[activeFestiveTab].price}
                  </span>
                  <div>
                    <button
                      onClick={() =>
                        addToBag({
                          id: `festive-${activeFestiveTab.toLowerCase().replace(/\s+/g, "-")}`,
                          title: festiveDetails[activeFestiveTab].title,
                          price: festiveDetails[activeFestiveTab].price,
                          image: "",
                          category: "Festive Specials",
                        })
                      }
                      className="font-sans"
                      style={{
                        background: "none", border: "none", borderBottom: "1px solid #000",
                        fontSize: "18px", lineHeight: "26px", fontWeight: 400, color: "#3F3B38", cursor: "pointer", padding: "0 0 2px 0",
                      }}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tablets & phones: each product in one card frame, swipeable */}
            <div className="festive-mobile-only">
              <SwipeCarousel
                ariaLabel="Festive treasures"
                items={festiveSlides}
                getKey={(s) => s.id}
                perView={{ desktop: 3, tablet: 2.4, mobile: 1.08 }}
                gap={{ desktop: 24, mobile: 12 }}
                arrowTop="28%"
                renderItem={(s) => (
                  <div
                    style={{
                      height: "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      background: "#fff",
                      border: "1px solid #F0E6DF",
                      borderRadius: "18px",
                      boxShadow: "0 8px 24px rgba(63, 59, 56, 0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <a
                      href={s.href}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "4/3", backgroundColor: "#F5EDE8", color: "#BCAEA2", fontSize: "14px", overflow: "hidden", textDecoration: "none" }}
                    >
                      {s.image ? <img src={s.image} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "Festive Product Image"}
                    </a>
                    <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px", flex: 1 }}>
                      <h3 className="font-serif" style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 400, color: "#3F3B38", margin: 0 }}>
                        {s.title}
                      </h3>
                      <p
                        className="font-sans"
                        style={{ fontSize: "14px", lineHeight: "21px", color: "#6E6E6E", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {s.description}
                      </p>
                      <span className="font-sans" style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 500, color: "#D98A9C", marginTop: "auto" }}>
                        ₹{s.price}
                      </span>
                      <button
                        onClick={() => addToBag(s.cartItem)}
                        className="font-sans"
                        style={{ background: "#D98A9C", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 500, color: "#fff", cursor: "pointer", padding: "10px 24px", minHeight: "42px", boxShadow: "0 4px 12px rgba(217, 138, 156, 0.3)" }}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            WEDDING SPECIALS
            ═══════════════════════════════════════════════════════ */}
        <section className="wedding-section" style={{ padding: "80px 0 100px 0", background: "#fff", position: "relative", overflow: "hidden" }}>
          {/* Section title */}
          <h2
            className="font-serif home-section-title wedding-heading"
            style={{
              fontSize: "48px",
              lineHeight: "64px",
              fontWeight: 400,
              color: "#3F3B38",
              textAlign: "center",
              margin: "0 0 60px 0",
              position: "relative",
              zIndex: 2,
            }}
          >
            WEDDING SPECIALS
          </h2>

          {/* Background Indian Red Dupatta with Golden Zari Border */}
          <style>{`
            @keyframes silkWind1 {
              0% { transform: skewX(-2deg) translateY(0px) scaleY(1); }
              25% { transform: skewX(3deg) translateY(-40px) scaleY(1.15); }
              50% { transform: skewX(-2deg) translateY(5px) scaleY(0.95); }
              75% { transform: skewX(3deg) translateY(-30px) scaleY(1.1); }
              100% { transform: skewX(-2deg) translateY(0px) scaleY(1); }
            }
            @keyframes silkWind2 {
              0% { transform: skewX(3deg) translateY(20px) scaleY(1.15); }
              25% { transform: skewX(-2deg) translateY(-20px) scaleY(1); }
              50% { transform: skewX(3deg) translateY(-45px) scaleY(1.2); }
              75% { transform: skewX(-1deg) translateY(10px) scaleY(0.95); }
              100% { transform: skewX(3deg) translateY(20px) scaleY(1.15); }
            }
          `}</style>

          {/* Back Dupatta Layer */}
          <div className="wedding-dupatta wedding-dupatta--back" style={{
            position: "absolute",
            left: "-10%",
            top: "8%",
            width: "120%",
            height: "850px",
            zIndex: 0,
            pointerEvents: "none",
            animation: "silkWind1 14s ease-in-out infinite",
            opacity: 0.92,
          }}>
            <svg width="100%" height="100%" viewBox="0 -100 1440 1200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Metallic Gold Zari Gradient */}
                <linearGradient id="zariGold1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#BF953F" />
                  <stop offset="25%" stopColor="#FCF6BA" />
                  <stop offset="50%" stopColor="#B38728" />
                  <stop offset="75%" stopColor="#FBF5B7" />
                  <stop offset="100%" stopColor="#AA771C" />
                </linearGradient>

                {/* Deep Indian Royal Red Base */}
                <linearGradient id="dupatta1Base" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#800010" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#B80018" stopOpacity="0.92" />
                  <stop offset="70%" stopColor="#D90429" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#5B000B" stopOpacity="0.95" />
                </linearGradient>

                {/* Dupatta Sheen Highlights */}
                <linearGradient id="dupatta1Highlights" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF99AA" stopOpacity="0" />
                  <stop offset="25%" stopColor="#FFB3C1" stopOpacity="0.5" />
                  <stop offset="40%" stopColor="#FFF0F3" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#FF8095" stopOpacity="0.3" />
                  <stop offset="80%" stopColor="#FFCBD5" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#800010" stopOpacity="0" />
                </linearGradient>

                {/* Deep Fold Shadow */}
                <linearGradient id="dupatta1Shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#300006" stopOpacity="0.7" />
                  <stop offset="30%" stopColor="#300006" stopOpacity="0" />
                  <stop offset="50%" stopColor="#400008" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#300006" stopOpacity="0" />
                  <stop offset="100%" stopColor="#300006" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Main Red Dupatta Body */}
              <path fill="url(#dupatta1Base)" d="M 0,400 C 480,50 960,750 1440,400 L 1440,700 C 960,1050 480,300 0,700 Z" />

              {/* Dupatta Fabric Sheen Folds */}
              <path fill="url(#dupatta1Highlights)" d="M 0,410 C 480,60 960,740 1440,410 L 1440,680 C 960,1030 480,320 0,680 Z" />
              <path fill="url(#dupatta1Shadow)" d="M 0,400 C 480,50 960,750 1440,400 L 1440,700 C 960,1050 480,300 0,700 Z" />


            </svg>
          </div>

          {/* Front Dupatta Layer (Inverted wave with Zari border) */}
          <div className="wedding-dupatta wedding-dupatta--front" style={{
            position: "absolute",
            left: "-8%",
            top: "12%",
            width: "116%",
            height: "800px",
            zIndex: 0,
            pointerEvents: "none",
            animation: "silkWind2 10s ease-in-out infinite",
            opacity: 0.95,
          }}>
            <svg width="100%" height="100%" viewBox="0 0 1440 1300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Metallic Gold Zari Gradient */}
                <linearGradient id="zariGold2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F5D061" />
                  <stop offset="25%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E5A93B" />
                  <stop offset="75%" stopColor="#FFF2A1" />
                  <stop offset="100%" stopColor="#B37E14" />
                </linearGradient>

                {/* Rich Crimson Base */}
                <linearGradient id="dupatta2Base" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A80016" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#E60026" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#FF1A3C" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#73000E" stopOpacity="0.95" />
                </linearGradient>

                {/* Specular Sheen */}
                <linearGradient id="dupatta2Specular" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFCCD5" stopOpacity="0" />
                  <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#FFA3B1" stopOpacity="0.4" />
                  <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#A80016" stopOpacity="0" />
                </linearGradient>

                {/* Deep Fold Shadow */}
                <linearGradient id="dupatta2Shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2A0005" stopOpacity="0.8" />
                  <stop offset="30%" stopColor="#2A0005" stopOpacity="0" />
                  <stop offset="50%" stopColor="#450009" stopOpacity="0.65" />
                  <stop offset="70%" stopColor="#2A0005" stopOpacity="0" />
                  <stop offset="100%" stopColor="#2A0005" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Main Red Dupatta Body */}
              <path fill="url(#dupatta2Base)" d="M 0,600 C 480,950 960,250 1440,600 L 1440,850 C 960,500 480,1200 0,850 Z" />

              {/* Specular & Shadow Sheen Folds */}
              <path fill="url(#dupatta2Specular)" d="M 0,610 C 480,960 960,260 1440,610 L 1440,835 C 960,485 480,1185 0,835 Z" />
              <path fill="url(#dupatta2Shadow)" d="M 0,600 C 480,950 960,250 1440,600 L 1440,850 C 960,500 480,1200 0,850 Z" />


            </svg>
          </div>

          <div className="wedding-container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 120px", position: "relative", zIndex: 1 }}>
            <div className="wedding-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", position: "relative" }}>

              {/* Slider Left Arrow */}
              <button
                type="button"
                className="wedding-arrow wedding-arrow--prev"
                onClick={() => showWedding(activeWeddingIndex - 1)}
                disabled={weddingSpecials.length < 2}
                aria-label="Previous wedding special"
                style={{
                  position: "absolute",
                  left: "-80px",
                  bottom: "0px",
                  background: "transparent",
                  border: "none",
                  color: "#8FB9A8",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "color 0.2s ease",
                  padding: "10px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#6c9383"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#8FB9A8"; }}
              >
                <ChevronLeft size={32} strokeWidth={1} />
              </button>

              {/* Left Column: Wedding Couple Illustration */}
              <div
                className="wedding-couple"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 2,
                  height: "700px", // Increased height to make bride/groom larger
                }}
              >
                {/* Groom */}
                <img
                  className="wedding-groom"
                  src="/images/Minimalist_Spring_Sale_Facebook_Post_6.png"
                  alt="Wedding Groom"
                  style={{
                    height: "100%",
                    width: "auto",
                    objectFit: "contain",
                    position: "absolute",
                    left: "-15%",
                    bottom: 0,
                    zIndex: 1
                  }}
                />
                {/* Bride */}
                <img
                  className="wedding-bride"
                  src="/images/Minimalist_Spring_Sale_Facebook_Post_5.png"
                  alt="Wedding Bride"
                  style={{
                    height: "85%",
                    width: "auto",
                    objectFit: "contain",
                    position: "absolute",
                    left: "10%",
                    bottom: 0,
                    zIndex: 2
                  }}
                />
              </div>

              {/* Right Column: Details & Mini-gallery */}
              <div
                className="wedding-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  zIndex: 2,
                  minWidth: 0,
                  // Frosted card keeps the text readable over the animated red dupatta
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  borderRadius: "20px",
                  padding: "28px 32px",
                  boxShadow: "0 10px 30px rgba(91, 0, 11, 0.12)",
                }}
              >
                <h3
                  className="font-serif wedding-title"
                  style={{
                    fontSize: "24px",
                    lineHeight: "32px",
                    fontWeight: 400,
                    color: "#5c5753",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {weddingSpecials.length > 0 ? weddingSpecials[activeWeddingIndex]?.title : "WEDDING FRAMES"}
                </h3>

                {/* Product thumbnails: tap one to show it; the row swipes when there are more than fit */}
                <div
                  ref={weddingThumbsRef}
                  className="wedding-thumbs"
                  style={{ display: "flex", gap: "16px", overflowX: "auto", scrollbarWidth: "none", scrollSnapType: "x mandatory", position: "relative", padding: "4px 2px 12px" }}
                >
                  {weddingSpecials.length > 0 ? (
                    weddingSpecials.map((wProd, idx) => (
                      <button
                        key={wProd.id}
                        type="button"
                        className="wedding-thumb"
                        onClick={() => showWedding(idx)}
                        aria-label={`Show ${wProd.title}`}
                        aria-pressed={idx === activeWeddingIndex}
                        style={{
                          flex: "0 0 auto",
                          width: "180px",
                          height: "230px",
                          padding: 0,
                          backgroundColor: "#F5EDE8",
                          borderRadius: "10px",
                          border: idx === activeWeddingIndex ? "2px solid #D98A9C" : "2px solid transparent",
                          boxShadow: "0px 6px 12px rgba(0,0,0,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#BCAEA2",
                          fontSize: "14px",
                          overflow: "hidden",
                          cursor: "pointer",
                          scrollSnapAlign: "start",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {wProd.image ? (
                          <img src={wProd.image} alt={wProd.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          `Frame ${idx + 1}`
                        )}
                      </button>
                    ))
                  ) : (
                    [1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className="wedding-thumb"
                        style={{
                          flex: "0 0 auto",
                          width: "180px",
                          height: "230px",
                          backgroundColor: "#F5EDE8",
                          borderRadius: "10px",
                          boxShadow: "0px 6px 12px rgba(0,0,0,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#BCAEA2",
                          fontSize: "14px",
                        }}
                      >
                        Frame {num}
                      </div>
                    ))
                  )}
                </div>

                <p
                  className="font-sans wedding-desc"
                  style={{
                    fontSize: "15px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#3F3B38",
                    margin: 0,
                    maxWidth: "500px",
                    display: "-webkit-box",
                    WebkitLineClamp: 6,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {weddingSpecials.length > 0 && weddingSpecials[activeWeddingIndex]?.description && weddingSpecials[activeWeddingIndex].description.trim() && weddingSpecials[activeWeddingIndex].description.trim() !== "No description filled."
                    ? weddingSpecials[activeWeddingIndex].description
                    : "❤️"}
                </p>

                <div
                  className="font-serif wedding-price"
                  style={{
                    fontSize: "42px",
                    lineHeight: "48px",
                    fontWeight: 500,
                    color: "#3F3B38",
                    marginTop: "10px",
                  }}
                >
                  ₹{weddingSpecials.length > 0 ? (weddingSpecials[activeWeddingIndex]?.discount_price || weddingSpecials[activeWeddingIndex]?.base_price) : "2000"}
                </div>

                <div style={{ marginTop: "10px" }}>
                  <a
                    href={weddingSpecials.length > 0 && weddingSpecials[activeWeddingIndex]?.slug ? `/shop/${weddingSpecials[activeWeddingIndex].slug}` : "#"}
                    style={{
                      width: "100%",
                      maxWidth: "380px",
                      height: "44px",
                      borderRadius: "22px",
                      border: "1.5px solid #D9A85C",
                      backgroundColor: "#fff",
                      color: "#D98A9C",
                      fontSize: "15px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(217, 138, 156, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                    }}
                  >
                    MORE DETAILS
                  </a>
                </div>
              </div>

              {/* Slider Right Arrow */}
              <button
                type="button"
                className="wedding-arrow wedding-arrow--next"
                onClick={() => showWedding(activeWeddingIndex + 1)}
                disabled={weddingSpecials.length < 2}
                aria-label="Next wedding special"
                style={{
                  position: "absolute",
                  right: "-80px",
                  bottom: "0px",
                  background: "transparent",
                  border: "none",
                  color: "#8FB9A8",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "color 0.2s ease",
                  padding: "10px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#6c9383"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#8FB9A8"; }}
              >
                <ChevronRight size={32} strokeWidth={1} />
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ENJOYED BY MANY
            ═══════════════════════════════════════════════════════ */}
        <section className="home-section" style={{ padding: "60px 0 120px 0", background: "#fff" }}>
          <div className="home-section-wrapper" style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative" }}>
            {/* Section title */}
            <h2
              className="font-serif home-section-title"
              style={{
                fontSize: "48px",
                lineHeight: "64px",
                fontWeight: 400,
                color: "#3F3B38",
                textAlign: "center",
                margin: "0 0 50px 0",
              }}
            >
              ENJOYED BY MANY
            </h2>

            {/* Carousel: 3 reviews per view on laptops, 2 on tablets, 1 (with a peek of the next) on phones */}
            <SwipeCarousel
              ariaLabel="Customer reviews"
              items={
                reviews.length > 0
                  ? reviews.slice(0, 12)
                  : [
                    { id: 1, reviewer_name: "Mohit Sharma", review_text: "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime", rating: 5 },
                    { id: 2, reviewer_name: "Ananya Roy", review_text: "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime", rating: 5 },
                    { id: 3, reviewer_name: "Priya Patel", review_text: "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime", rating: 5 },
                  ]
              }
              getKey={(rev, index) => rev.id || index}
              perView={{ desktop: 3, tablet: 2, mobile: 1.15 }}
              gap={{ desktop: 32, mobile: 14 }}
              renderItem={(rev, index) => {
                const borderColors = ["#D98A9C", "#8FB9A8", "#D9A85C"];
                const borderColor = borderColors[index % borderColors.length];
                return (
                  <div
                    className="rev-card"
                    style={{
                      height: "100%",
                      boxSizing: "border-box",
                      border: `2px solid ${borderColor}`,
                      borderRadius: "15px",
                      padding: "30px 24px",
                      background: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3 className="font-serif rev-name" style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 400, color: "#3F3B38", margin: "0 0 8px 0" }}>
                        {rev.reviewer_name}
                      </h3>
                      {rev.product && (
                        <span style={{ fontSize: "12px", color: "#D98A9C", display: "block", marginBottom: "12px", fontWeight: 500 }}>
                          {rev.product.title}
                        </span>
                      )}
                      <p className="font-sans rev-text" style={{ fontSize: "18px", lineHeight: "28px", fontWeight: 400, color: "#555", margin: 0 }}>
                        &ldquo;{rev.review_text?.trim() ? rev.review_text : "❤️"}&rdquo;
                      </p>
                    </div>

                    {rev.rating && (
                      <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginTop: "16px" }}>
                        {Array.from({ length: Number(rev.rating) }).map((_, i) => (
                          <span key={i} style={{ color: "#D98A9C", fontSize: "16px" }}>❤️</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        /* Discover New switches to a swipeable card row below 993px, Festive Treasures below 1200px */
        @media (min-width: 993px) {
          .home-mobile-only {
            display: none !important;
          }
        }
        @media (min-width: 1200px) {
          .festive-mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 1199px) {
          .festive-desktop-only {
            display: none !important;
          }
        }

        /* Wedding thumbnails share the card width (up to their original 180px) */
        .wedding-thumb {
          width: calc((100% - 32px) / 3) !important;
          max-width: 180px;
          height: auto !important;
          aspect-ratio: 180 / 230;
        }


        @media (max-width: 1200px) {
          .home-section-wrapper {
            padding: 0 40px !important;
          }
          .home-section-title {
            font-size: 40px !important;
            line-height: 52px !important;
          }
          .hero-text-side {
            padding-left: 40px !important;
          }
          .hero-h1 {
            font-size: 48px !important;
            line-height: 64px !important;
          }
          .hero-p {
            font-size: 32px !important;
            line-height: 46px !important;
          }
          .wedding-container {
            padding: 0 60px !important;
          }
          .wedding-grid {
            gap: 32px !important;
          }
          .wedding-couple {
            height: 560px !important;
          }
          .wedding-groom {
            left: -4% !important;
          }
          .wedding-bride {
            left: 18% !important;
          }
          .wedding-arrow--prev {
            left: -50px !important;
          }
          .wedding-arrow--next {
            right: -50px !important;
          }
        }

        @media (max-width: 992px) {
          .home-desktop-only {
            display: none !important;
          }
          .home-section {
            padding: 48px 0 56px !important;
          }
          .home-section-title {
            margin-bottom: 28px !important;
          }
          .home-section-header {
            margin-bottom: 28px !important;
          }
          .home-section-header .home-section-title {
            margin-bottom: 0 !important;
          }
          .fav-title {
            font-size: 20px !important;
            line-height: 28px !important;
          }
          .fav-price {
            font-size: 18px !important;
          }
          .fav-btn {
            font-size: 18px !important;
          }

          /* Hero: smaller flowers kept in the corners, behind the photos and clear of the text */
          .hero-section {
            min-height: 0 !important;
            padding-bottom: 90px !important;
            /* The carousel's outer photos run past the screen edges on phones; clip them sideways only */
            overflow-x: clip !important;
          }
          .hero-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-text-side {
            padding-left: 0 !important;
            padding-top: 150px !important;
            margin-bottom: 20px !important;
          }
          .hero-flower--tl {
            width: 130px !important;
          }
          .hero-flower--br {
            width: 320px !important;
            bottom: -30px !important;
            z-index: 1 !important;
          }

          /* Wedding Specials: couple on top, details card below, all centred */
          .wedding-section {
            padding: 56px 0 64px !important;
          }
          .wedding-heading {
            margin-bottom: 24px !important;
          }
          .wedding-container {
            padding: 0 24px !important;
          }
          .wedding-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .wedding-couple {
            height: 380px !important;
          }
          .wedding-groom {
            left: calc(50% - 154px) !important;
          }
          .wedding-bride {
            left: calc(50% - 92px) !important;
          }
          .wedding-card {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .wedding-arrow {
            top: 190px !important;
            bottom: auto !important;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            padding: 0 !important;
            border-radius: 50% !important;
            background: rgba(255, 255, 255, 0.94) !important;
            box-shadow: 0 2px 10px rgba(63, 59, 56, 0.15);
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .wedding-arrow--prev {
            left: 0 !important;
          }
          .wedding-arrow--next {
            right: 0 !important;
          }
          .wedding-dupatta--back {
            top: 70px !important;
            height: 460px !important;
          }
          .wedding-dupatta--front {
            top: 110px !important;
            height: 420px !important;
          }
        }

        @keyframes festiveImgFade {
          from {
            opacity: 0.3;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes festiveTextFade {
          from {
            opacity: 0.2;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .home-section-wrapper {
            padding: 0 16px !important;
          }
          .home-section {
            padding: 32px 0 40px !important;
          }
          .home-section-title {
            margin-bottom: 20px !important;
          }
          .home-section-header {
            margin-bottom: 20px !important;
          }
          .home-section-title {
            font-size: 28px !important;
            line-height: 38px !important;
          }
          .home-section-link {
            font-size: 20px !important;
            line-height: 30px !important;
          }

          .hero-section {
            padding-bottom: 70px !important;
          }
          .hero-text-side {
            padding-top: 112px !important;
          }
          .hero-h1 {
            font-size: 34px !important;
            line-height: 46px !important;
          }
          .hero-p {
            font-size: 24px !important;
            line-height: 34px !important;
            margin-top: 16px !important;
          }
          .hero-flower--tl {
            width: 92px !important;
          }
          .hero-flower--br {
            width: 230px !important;
            bottom: -24px !important;
          }

          .fav-title {
            font-size: 16px !important;
            line-height: 22px !important;
          }
          .fav-price {
            font-size: 16px !important;
            line-height: 24px !important;
          }
          .fav-strike {
            font-size: 12px !important;
          }
          .fav-btn {
            font-size: 15px !important;
            line-height: 24px !important;
          }

          .rev-card {
            padding: 22px 18px !important;
          }
          .rev-name {
            font-size: 20px !important;
            line-height: 28px !important;
          }
          .rev-text {
            font-size: 15px !important;
            line-height: 24px !important;
          }

          .wedding-section {
            padding: 40px 0 48px !important;
          }
          .wedding-container {
            padding: 0 16px !important;
          }
          .wedding-couple {
            height: 300px !important;
          }
          .wedding-groom {
            left: calc(50% - 122px) !important;
          }
          .wedding-bride {
            left: calc(50% - 73px) !important;
          }
          .wedding-arrow {
            top: 150px !important;
            width: 36px;
            height: 36px;
          }
          .wedding-card {
            padding: 18px 16px !important;
            gap: 12px !important;
          }
          .wedding-title {
            font-size: 18px !important;
            line-height: 24px !important;
          }
          .wedding-thumbs {
            gap: 10px !important;
          }
          .wedding-thumb {
            width: calc((100% - 20px) / 3) !important;
          }
          .wedding-desc {
            font-size: 14px !important;
            line-height: 21px !important;
            -webkit-line-clamp: 3 !important;
          }
          .wedding-price {
            font-size: 28px !important;
            line-height: 34px !important;
            margin-top: 0 !important;
          }
          .wedding-dupatta--back {
            top: 50px !important;
            height: 380px !important;
          }
          .wedding-dupatta--front {
            top: 80px !important;
            height: 340px !important;
          }
        }
      `}</style>
    </div>
  );
}
