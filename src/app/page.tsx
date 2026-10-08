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
  const [festiveSpecials, setFestiveSpecials] = useState<any[]>([]);
  const [activeWeddingIndex, setActiveWeddingIndex] = useState(0);
  const [activeFestiveIndex, setActiveFestiveIndex] = useState(0);
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (newDiscoveryProducts.length > 1) {
      const interval = setInterval(() => {
        setDiscoveryIndex((prev) => (prev + 1) % newDiscoveryProducts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [newDiscoveryProducts]);

  const bestsellersRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/festive-specials")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFestiveSpecials(data);
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
          setReviews(data.slice(0, 18));
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
            minHeight: "680px",
            paddingBottom: "10px",
            overflow: "visible",
            background: "#fff",
          }}
        >
          {/* ── Flower decoration: top-left cluster ── */}
          <div
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
          style={{
            padding: "40px 0 60px 0",
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

          {(() => {
            const rightProduct = newDiscoveryProducts.length > 0 ? newDiscoveryProducts[discoveryIndex] : null;
            const leftProduct = newDiscoveryProducts.length > 1
              ? newDiscoveryProducts[(discoveryIndex - 1 + newDiscoveryProducts.length) % newDiscoveryProducts.length]
              : rightProduct;

            return (
              <div style={{ maxWidth: "1920px", margin: "0 auto", padding: "0 120px", position: "relative", zIndex: 1 }}>
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
                              transition: "opacity 0.6s ease-in-out"
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
                                transition: "opacity 0.6s ease-in-out"
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
                        {rightProduct?.description
                          ? rightProduct.description
                          : "Preserve your most cherished moments with a handcrafted pressed flower frame, beautifully designed to last a lifetime"}
                      </p>
                      <button
                        className="font-sans"
                        onClick={() => {
                          if (rightProduct) {
                            addToBag({ id: rightProduct.id, title: rightProduct.title, price: rightProduct.base_price, image: rightProduct.image || "" });
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

            {festiveSpecials.length > 0 ? (
              (() => {
                const currentProduct = festiveSpecials[activeFestiveIndex % festiveSpecials.length];
                const prodPrice = currentProduct.discount_price ? parseFloat(currentProduct.discount_price) : parseFloat(currentProduct.base_price);
                return (
                  <div className="festive-grid" style={{ display: "grid", gridTemplateColumns: "452px 1.2fr 1fr", gap: "40px", alignItems: "center" }}>
                    {/* Left: Festive product image with zoom & fade effect */}
                    <a href={`/shop/${currentProduct.slug || currentProduct.id}`} style={{ textDecoration: "none", display: "block" }}>
                      <div
                        style={{
                          position: "relative",
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
                        {currentProduct.description || "Beautifully handcrafted festive special collection item, created with premium materials."}
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
              <div className="festive-grid" style={{ display: "grid", gridTemplateColumns: "452px 1.2fr 1fr", gap: "40px", alignItems: "center" }}>
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
          <div style={{
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
          <div style={{
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
                  alignItems: "flex-end",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 2,
                  height: "700px", // Increased height to make bride/groom larger
                }}
              >
                {/* Groom */}
                <img
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
                  ? reviews.slice(0, 18)
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
                        <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginTop: "16px" }}>
                          {Array.from({ length: Number(rev.rating) }).map((_, i) => (
                            <span key={i} style={{ color: "#D98A9C", fontSize: "16px" }}>❤️</span>
                          ))}
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
