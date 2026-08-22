"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SlotStyle {
  width: number;
  height: number;
  left: number;
  top: number;
  opacity: number;
  zIndex: number;
}

const SLOTS: SlotStyle[] = [
  { width: 169, height: 211, left: 0,   top: 59, opacity: 0.5,  zIndex: 1 }, // far left
  { width: 255, height: 255, left: 85,  top: 29, opacity: 0.75, zIndex: 2 }, // left-center
  { width: 225, height: 300, left: 227, top: 0,  opacity: 1,    zIndex: 3 }, // center (front)
  { width: 255, height: 255, left: 340, top: 29, opacity: 0.75, zIndex: 2 }, // right-center
  { width: 169, height: 211, left: 510, top: 59, opacity: 0.5,  zIndex: 1 }, // far right
];

const DEFAULT_IMAGES = [
  { id: "def-0", label: "Image 1", bg: "#F5EDE8", url: "" },
  { id: "def-1", label: "Image 2", bg: "#F0E6DF", url: "" },
  { id: "def-2", label: "Image 3", bg: "#EBE0D8", url: "" },
  { id: "def-3", label: "Image 4", bg: "#F5EDE8", url: "" },
  { id: "def-4", label: "Image 5", bg: "#F0E6DF", url: "" },
];

const AUTO_INTERVAL = 3000;

export default function HeroCarousel() {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [carouselItems, setCarouselItems] = useState<any[]>(DEFAULT_IMAGES);

  useEffect(() => {
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/hero-featured")
      .then((res) => {
        if (!res.ok) throw new Error("Endpoint not available yet");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          applyHeroItems(data);
        } else {
          fetchFallbackProducts();
        }
      })
      .catch(() => {
        fetchFallbackProducts();
      });
  }, []);

  const fetchFallbackProducts = () => {
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const featured = data.filter((p: any) => p.is_hero_featured);
          if (featured.length > 0) {
            applyHeroItems(featured);
          }
        }
      })
      .catch(() => {});
  };

  const applyHeroItems = (data: any[]) => {
    const fetchedItems = data.map((p, i) => ({
      id: p.id || i,
      label: p.title,
      bg: "#F5EDE8",
      url: p.image || "",
    }));

    let items = [...fetchedItems];
    while (items.length < 5) {
      items = items.concat(fetchedItems).slice(0, 5);
    }
    setCarouselItems(items.slice(0, 5));
  };

  const advance = useCallback(() => {
    setOffset((prev) => (prev + 1) % carouselItems.length);
  }, [carouselItems.length]);

  useEffect(() => {
    if (isPaused || carouselItems.length === 0) return;
    const timer = setInterval(advance, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, isPaused, carouselItems.length]);

  return (
    <div className="carousel-wrapper" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="carousel-inner">
        {carouselItems.map((image, index) => {
          const slotIdx = ((index - offset) % carouselItems.length + carouselItems.length) % carouselItems.length;
          const slot = SLOTS[slotIdx] || SLOTS[0];

          return (
            <div
              key={`${image.id}-${index}`}
              style={{
                position: "absolute",
                width: `${slot.width}px`,
                height: `${slot.height}px`,
                left: `${slot.left}px`,
                top: `${slot.top}px`,
                opacity: slot.opacity,
                zIndex: slot.zIndex,
                filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.5))",
                borderRadius: "15px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#BCAEA2",
                fontSize: "11px",
                background: image.bg,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {image.url ? (
                <img src={image.url} alt={image.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>{image.label}</span>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .carousel-wrapper {
          position: relative;
          width: 680px;
          height: 400px;
          flex-shrink: 0;
          margin-left: auto;
          margin-right: 100px;
          margin-top: 67px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .carousel-inner {
          position: relative;
          width: 680px;
          height: 400px;
          transform-origin: center center;
        }

        @media (max-width: 1400px) {
          .carousel-wrapper {
            margin-right: 0;
          }
        }
        @media (max-width: 1200px) {
          .carousel-wrapper {
            width: 100%;
            height: 320px;
            margin: 40px auto 0 auto;
          }
          .carousel-inner {
            transform: scale(0.8);
          }
        }
        @media (max-width: 768px) {
          .carousel-wrapper {
            height: 240px;
          }
          .carousel-inner {
            transform: scale(0.6);
          }
        }
        @media (max-width: 480px) {
          .carousel-wrapper {
            height: 200px;
          }
          .carousel-inner {
            transform: scale(0.48);
          }
        }
      `}</style>
    </div>
  );
}
