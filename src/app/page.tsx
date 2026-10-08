"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const { addToBag } = useCart();
  const [activeFestiveTab, setActiveFestiveTab] = useState("Handmade Rakhi");
  const [bestsellerProducts, setBestsellerProducts] = useState<any[]>([]);
  const [newDiscoveryProducts, setNewDiscoveryProducts] = useState<any[]>([]);
  const [weddingSpecials, setWeddingSpecials] = useState<any[]>([]);
  const [activeWeddingIndex, setActiveWeddingIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

  const bestsellersRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          setReviews(data);
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

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.6 : scrollLeft + clientWidth * 0.6;
      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1 }}>

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            width: "100%",
            minHeight: "480px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* ── Flower decoration: top-left cluster ── */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "-62px",
              width: "333px",
              height: "333px",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            {/* Placeholder for magnolia flower images — replace with <Image /> */}
            <div style={{
              position: "absolute", width: "222px", height: "222px",
              left: "111px", top: "0px",
              background: "radial-gradient(ellipse at center, rgba(239,211,199,0.4) 0%, rgba(239,211,199,0.1) 60%, transparent 80%)",
              borderRadius: "50%",
              transform: "scaleX(-1)",
            }} />
            <div style={{
              position: "absolute", width: "222px", height: "222px",
              left: "20px", top: "56px",
              background: "radial-gradient(ellipse at center, rgba(239,211,199,0.35) 0%, rgba(239,211,199,0.1) 60%, transparent 80%)",
              borderRadius: "50%",
              transform: "scaleX(-1)",
            }} />
            <div style={{
              position: "absolute", width: "222px", height: "222px",
              left: "90px", top: "72px",
              background: "radial-gradient(ellipse at center, rgba(239,211,199,0.3) 0%, rgba(239,211,199,0.08) 60%, transparent 80%)",
              borderRadius: "50%",
              transform: "scaleX(-1)",
            }} />
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
              zIndex: 1,
            }}
          >
            {/* Left: Text content */}
            <div
              className="hero-text-side"
              style={{
                paddingTop: "68px",
                paddingLeft: "143px",
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
                MEANT FOR THE HEART.
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
                Personalized handmade frames and keepsakes that tell your story.
              </p>
            </div>

            {/* Right: Auto-rotating fanned image carousel */}
            <HeroCarousel />
          </div>

          {/* ── Flower decoration: bottom-right branch ── */}
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              right: "0px",
              width: "651px",
              height: "400px",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <div style={{
              position: "absolute", width: "561px", height: "561px",
              left: "0px", top: "0px",
              background: "radial-gradient(ellipse at center, rgba(239,211,199,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "scaleX(-1)",
            }} />
            <div style={{
              position: "absolute", width: "522px", height: "522px",
              right: "0px", top: "40px",
              background: "radial-gradient(ellipse at center, rgba(239,211,199,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CUSTOMER'S FAVORITES
            ═══════════════════════════════════════════════════════ */}
        <section
          id="bestsellers"
          style={{
            padding: "80px 0 60px 0",
            background: "#fff",
          }}
        >
          <div className="home-section-wrapper" style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative" }}>
            {/* Section Header */}
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <h2
                className="font-serif"
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
                href="/shop"
                className="font-sans"
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

            {/* Carousel */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Left Arrow */}
              <button
                onClick={() => scrollCarousel(bestsellersRef, "left")}
                style={{
                  position: "absolute",
                  left: "-60px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "1.5px solid #8FB9A8",
                  color: "#8FB9A8",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8FB9A8";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8FB9A8";
                }}
              >
                <ChevronLeft size={22} />
              </button>

              {/* Viewport */}
              <div
                ref={bestsellersRef}
                style={{
                  display: "flex",
                  gap: "55px",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  scrollbarWidth: "none",
                  width: "100%",
                  padding: "10px 0",
                }}
              >
                {(bestsellerProducts.length > 0
                  ? bestsellerProducts
                  : [
                      { id: "fav-1", title: "Wedding Frame", base_price: 2000 },
                      { id: "fav-2", title: "Wedding Frame", base_price: 2000 },
                      { id: "fav-3", title: "Wedding Frame", base_price: 2000 },
                      { id: "fav-4", title: "Wedding Frame", base_price: 2000 },
                    ]
                ).map((prod) => (
                  <div
                    key={prod.id}
                    style={{
                      flex: "0 0 calc(33.333% - 37px)",
                      minWidth: "280px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    {/* Product image */}
                    <a
                      href={prod.slug ? `/shop/${prod.slug}` : `/shop`}
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

                    <a
                      href={prod.slug ? `/shop/${prod.slug}` : `/shop`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3
                        className="font-serif"
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
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "0 0 4px 0" }}>
                      <span
                        className="font-sans"
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
                        <span className="font-sans" style={{ fontSize: "15px", textDecoration: "line-through", color: "#999" }}>
                          ₹{prod.base_price}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToBag({ id: prod.id, title: prod.title, price: parseFloat(prod.discount_price ?? prod.base_price ?? prod.price), image: prod.image || "" })}
                      className="font-sans"
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
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCarousel(bestsellersRef, "right")}
                style={{
                  position: "absolute",
                  right: "-60px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "1.5px solid #8FB9A8",
                  color: "#8FB9A8",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8FB9A8";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8FB9A8";
                }}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            DISCOVER NEW
            ═══════════════════════════════════════════════════════ */}
        <section style={{ padding: "60px 0 80px 0", background: "#fff", position: "relative", overflow: "hidden" }}>
          {/* Flower decoration top-right for this section */}
          <div style={{
            position: "absolute", top: "-20px", right: "-30px",
            width: "300px", height: "300px", pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(ellipse at center, rgba(239,211,199,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />

          <div style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "80px", alignItems: "start", maxWidth: "1350px", margin: "0 auto" }}>
              {/* Left: Large product frame image */}
              <div
                style={{
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
                }}
              >
                {newDiscoveryProducts.length > 0 && newDiscoveryProducts[0].image ? (
                  <img src={newDiscoveryProducts[0].image} alt={newDiscoveryProducts[0].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "Large Product Image"
                )}
              </div>

              {/* Right: Discover heading + smaller image + text */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "40px" }}>
                <h2
                  className="font-serif"
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
                <div
                  style={{
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
                  }}
                >
                  {newDiscoveryProducts.length > 0 && newDiscoveryProducts[0].image ? (
                    <img src={newDiscoveryProducts[0].image} alt={newDiscoveryProducts[0].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    "Product Image"
                  )}
                </div>

                {/* Product details */}
                <div style={{ textAlign: "center" }}>
                  <h3
                    className="font-serif"
                    style={{
                      fontSize: "24px",
                      lineHeight: "32px",
                      fontWeight: 400,
                      color: "#3F3B38",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {newDiscoveryProducts.length > 0 ? newDiscoveryProducts[0].title : "Wedding Frame"}
                  </h3>
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
                    }}
                  >
                    {newDiscoveryProducts.length > 0 && newDiscoveryProducts[0].description
                      ? newDiscoveryProducts[0].description
                      : "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime"}
                  </p>
                  <button
                    className="font-sans"
                    onClick={() => {
                      if (newDiscoveryProducts.length > 0) {
                        const p = newDiscoveryProducts[0];
                        addToBag({ id: p.id, title: p.title, price: p.base_price, image: p.image || "" });
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
        <section style={{ padding: "60px 0 80px 0", background: "#fff" }}>
          <div className="home-section-wrapper" style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px" }}>
            {/* Section title */}
            <h2
              className="font-serif"
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

            <div className="festive-grid" style={{ display: "grid", gridTemplateColumns: "452px 1.2fr 1fr", gap: "40px", alignItems: "center" }}>
              {/* Left: Festive product image */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "452px",
                  aspectRatio: "452/603",
                  backgroundColor: "#F5EDE8",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#BCAEA2",
                  fontSize: "14px",
                  overflow: "hidden",
                }}
              >
                Festive Product Image
              </div>

              {/* Middle: Tab list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "center", justifyContent: "center" }}>
                {Object.keys(festiveDetails).map((tab) => {
                  const isActive = activeFestiveTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveFestiveTab(tab)}
                      className="font-serif"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "36px",
                        lineHeight: "48px",
                        fontWeight: 400,
                        color: isActive ? "#3F3B38" : "#BCAEA2",
                        cursor: "pointer",
                        textAlign: "center",
                        padding: "8px 0",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Right: Active tab details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "12px",
                  maxWidth: "320px",
                  margin: "0 auto",
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <p
                  className="font-sans"
                  style={{
                    fontSize: "18px",
                    lineHeight: "26px",
                    fontWeight: 400,
                    color: "#6E6E6E",
                    margin: 0,
                  }}
                >
                  {festiveDetails[activeFestiveTab].desc}
                </p>
                <span
                  className="font-sans"
                  style={{
                    fontSize: "22px",
                    lineHeight: "32px",
                    fontWeight: 400,
                    color: "#3F3B38",
                  }}
                >
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
                        category: "Festival Specials",
                      })
                    }
                    className="font-sans"
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #000",
                      fontSize: "18px",
                      lineHeight: "26px",
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
        </section>

        {/* ═══════════════════════════════════════════════════════
            WEDDING SPECIALS
            ═══════════════════════════════════════════════════════ */}
        <section style={{ padding: "80px 0 100px 0", background: "#fff", position: "relative", overflow: "hidden" }}>
          {/* Section title */}
          <h2
            className="font-serif"
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

          {/* Background Pink Ribbon Wave Image */}
          <div style={{
            position: "absolute",
            left: "-5%",
            top: "55%",
            width: "110%",
            height: "auto",
            transform: "translateY(-50%)",
            zIndex: 0,
            pointerEvents: "none"
          }}>
            <img 
              src="/images/Minimalist_Spring_Sale_Facebook_Post_6.png" 
              alt="Pink Ribbon Wave" 
              style={{ width: "100%", height: "auto", objectFit: "contain", opacity: 0.9 }} 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 120px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", position: "relative" }}>
              
              {/* Slider Left Arrow */}
              <button
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
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <img
                  src="/images/Minimalist_Spring_Sale_Facebook_Post_5.png"
                  alt="Wedding Couple"
                  style={{ width: "85%", height: "auto", objectFit: "contain" }}
                  onError={(e) => { 
                    e.currentTarget.src = "/images/Minimalist_Spring_Sale_Facebook_Post_7.png";
                  }}
                />
              </div>

              {/* Right Column: Details & Mini-gallery */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "40px", zIndex: 2 }}>
                <h3
                  className="font-serif"
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

                {/* 3 mini product thumbnails gallery */}
                <div style={{ display: "flex", gap: "16px" }}>
                  {weddingSpecials.length > 0 ? (
                    weddingSpecials.slice(0, 3).map((wProd, idx) => (
                      <div
                        key={wProd.id}
                        onClick={() => setActiveWeddingIndex(idx)}
                        style={{
                          width: "140px",
                          height: "180px",
                          backgroundColor: "#F5EDE8",
                          borderRadius: "8px",
                          boxShadow: "0px 6px 12px rgba(0,0,0,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#BCAEA2",
                          fontSize: "14px",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {wProd.image ? (
                          <img src={wProd.image} alt={wProd.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          `Frame ${idx + 1}`
                        )}
                      </div>
                    ))
                  ) : (
                    [1, 2, 3].map((num) => (
                      <div
                        key={num}
                        style={{
                          width: "140px",
                          height: "180px",
                          backgroundColor: "#F5EDE8",
                          borderRadius: "8px",
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
                  className="font-sans"
                  style={{
                    fontSize: "15px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#3F3B38",
                    margin: 0,
                    maxWidth: "500px",
                  }}
                >
                  {weddingSpecials.length > 0 && weddingSpecials[activeWeddingIndex]?.description
                    ? weddingSpecials[activeWeddingIndex].description
                    : "Wedding frames come in a wide variety of styles to beautifully preserve marriage milestones or serve as perfect premium gifts. Top-rated options include customized text frames, elegant tabletop glass and pearl designs, and sterling silver anniversary frames that track a couple's journey over time."}
                </p>

                <div
                  className="font-serif"
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
        <section style={{ padding: "60px 0 120px 0", background: "#fff" }}>
          <div style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative" }}>
            {/* Section title */}
            <h2
              className="font-serif"
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

            {/* Carousel */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Left Arrow */}
              <button
                onClick={() => scrollCarousel(reviewsRef, "left")}
                style={{
                  position: "absolute",
                  left: "-60px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "1.5px solid #8FB9A8",
                  color: "#8FB9A8",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8FB9A8";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8FB9A8";
                }}
              >
                <ChevronLeft size={22} />
              </button>

              <div
                ref={reviewsRef}
                style={{
                  display: "flex",
                  gap: "32px",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  scrollbarWidth: "none",
                  width: "100%",
                  padding: "10px 0",
                }}
              >
                {(reviews.length > 0
                  ? reviews
                  : [
                      { id: 1, reviewer_name: "Mohit Sharma", review_text: "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime", rating: 5 },
                      { id: 2, reviewer_name: "Ananya Roy", review_text: "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime", rating: 5 },
                      { id: 3, reviewer_name: "Priya Patel", review_text: "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime", rating: 5 },
                    ]
                ).map((rev, index) => {
                  const borderColors = ["#D98A9C", "#8FB9A8", "#D9A85C"];
                  const borderColor = borderColors[index % borderColors.length];
                  return (
                    <div
                      key={rev.id || index}
                      style={{
                        flex: "0 0 calc(33.333% - 22px)",
                        minWidth: "280px",
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
                        <h3 className="font-serif" style={{ fontSize: "24px", lineHeight: "32px", fontWeight: 400, color: "#3F3B38", margin: "0 0 8px 0" }}>
                          {rev.reviewer_name}
                        </h3>
                        {rev.product && (
                          <span style={{ fontSize: "12px", color: "#D98A9C", display: "block", marginBottom: "12px", fontWeight: 500 }}>
                            {rev.product.title}
                          </span>
                        )}
                        <p className="font-sans" style={{ fontSize: "18px", lineHeight: "28px", fontWeight: 400, color: "#555", margin: 0 }}>
                          "{rev.review_text}"
                        </p>
                      </div>

                      {rev.rating && (
                        <div style={{ color: "#D9A85C", fontSize: "18px", marginTop: "16px" }}>
                          {"★".repeat(Number(rev.rating))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCarousel(reviewsRef, "right")}
                style={{
                  position: "absolute",
                  right: "-60px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "1.5px solid #8FB9A8",
                  color: "#8FB9A8",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8FB9A8";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8FB9A8";
                }}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @media (max-width: 1200px) {
          .home-section-wrapper {
            padding: 0 40px !important;
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
        }

        @media (max-width: 992px) {
          .hero-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-text-side {
            padding-left: 0 !important;
            padding-top: 40px !important;
            margin-bottom: 20px !important;
          }
          .festive-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .festive-grid > div {
            max-width: 100% !important;
            justify-self: center !important;
          }
        }

        @media (max-width: 600px) {
          .home-section-wrapper {
            padding: 0 16px !important;
          }
          .hero-h1 {
            font-size: 36px !important;
            line-height: 48px !important;
          }
          .hero-p {
            font-size: 24px !important;
            line-height: 34px !important;
            margin-top: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
