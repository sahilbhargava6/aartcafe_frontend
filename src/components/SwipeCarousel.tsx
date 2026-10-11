"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Cards visible at once: laptop (≥1200px), tablet (601–1199px), phone (≤600px).
// A fraction such as 1.15 leaves part of the next card showing, which hints that the row swipes.
type PerView = { desktop: number; tablet: number; mobile: number };

interface SwipeCarouselProps<T> {
  items: T[];
  getKey: (item: T, index: number) => React.Key;
  renderItem: (item: T, index: number) => React.ReactNode;
  perView: PerView;
  gap?: { desktop: number; mobile: number };
  ariaLabel: string;
  // Vertical position of the arrows, e.g. "38%" to centre them on the image rather than the whole card
  arrowTop?: string;
  // Move on by one card every this many milliseconds (back to the start after the last)
  autoPlay?: number;
}

// How long auto-scrolling waits after the visitor touches the row or uses its arrows or dots
const AUTOPLAY_PAUSE_AFTER_USE = 8000;

// Horizontal, swipeable row with scroll-snap. On laptops it keeps the original look (arrows
// outside the row); on tablets and phones the arrows move inside and page dots appear.
export default function SwipeCarousel<T>({
  items,
  getKey,
  renderItem,
  perView,
  gap = { desktop: 32, mobile: 14 },
  ariaLabel,
  arrowTop = "50%",
  autoPlay,
}: SwipeCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ page: 0, pages: 1, atStart: true, atEnd: true });
  // Auto-scrolling waits while the row is hovered or focused, and for a while after it is used
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const pausedUntilRef = useRef(0);
  const pauseAfterUse = () => {
    pausedUntilRef.current = Date.now() + AUTOPLAY_PAUSE_AFTER_USE;
  };

  // Pages = distinct snap positions (one per card start, plus the very end if it falls between cards)
  const measure = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return;
    const step = first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    const maxScroll = track.scrollWidth - track.clientWidth;
    const pages = maxScroll > 2 && step > 0 ? Math.ceil((maxScroll - 2) / step) + 1 : 1;
    const atEnd = track.scrollLeft >= maxScroll - 2;
    const page = atEnd ? pages - 1 : Math.min(pages - 1, Math.round(track.scrollLeft / step));
    setPosition((prev) =>
      prev.page === page && prev.pages === pages && prev.atStart === track.scrollLeft <= 2 && prev.atEnd === atEnd
        ? prev
        : { page, pages, atStart: track.scrollLeft <= 2, atEnd }
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(track);
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [measure, items.length]);

  // Auto-scroll one card at a time; skipped while paused, while the tab is hidden, and for
  // visitors who ask their device for reduced motion
  useEffect(() => {
    if (!autoPlay || position.pages <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      const track = trackRef.current;
      const first = track?.firstElementChild as HTMLElement | null;
      if (!track || !first || document.hidden) return;
      if (hoveredRef.current || focusedRef.current || Date.now() < pausedUntilRef.current) return;
      const step = first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
      const maxScroll = track.scrollWidth - track.clientWidth;
      const next = track.scrollLeft >= maxScroll - 2 ? 0 : Math.min(track.scrollLeft + step, maxScroll);
      track.scrollTo({ left: next, behavior: "smooth" });
    }, autoPlay);
    return () => clearInterval(timer);
  }, [autoPlay, position.pages]);

  const goTo = (page: number) => {
    pauseAfterUse();
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return;
    const step = first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    const target = Math.max(0, Math.min(page, position.pages - 1)) * step;
    track.scrollTo({ left: Math.min(target, track.scrollWidth - track.clientWidth), behavior: "smooth" });
  };

  // Width of one card for a given number visible: (row width - gaps between visible cards) / visible
  const cssVars = {
    "--pv-d": perView.desktop,
    "--pv-t": perView.tablet,
    "--pv-m": perView.mobile,
    "--gv-d": Math.ceil(perView.desktop) - 1,
    "--gv-t": Math.ceil(perView.tablet) - 1,
    "--gv-m": Math.ceil(perView.mobile) - 1,
    "--gap-d": `${gap.desktop}px`,
    "--gap-m": `${gap.mobile}px`,
    "--arrow-top": arrowTop,
  } as React.CSSProperties;

  const scrollable = position.pages > 1;

  return (
    <div
      className="swipe"
      style={cssVars}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => (hoveredRef.current = true)}
      onMouseLeave={() => (hoveredRef.current = false)}
      onTouchStart={pauseAfterUse}
      // Keyboard focus only (a mouse click on an arrow also focuses it, but shouldn't stop auto-scroll for good)
      onFocus={(e) => {
        if ((e.target as HTMLElement).matches?.(":focus-visible")) focusedRef.current = true;
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusedRef.current = false;
      }}
    >
      <div className="swipe-viewport">
        {scrollable && (
          <button type="button" className="swipe-arrow swipe-arrow--prev" onClick={() => goTo(position.page - 1)} disabled={position.atStart} aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
        )}

        <div ref={trackRef} className="swipe-track">
          {items.map((item, index) => (
            <div key={getKey(item, index)} className="swipe-item">
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {scrollable && (
          <button type="button" className="swipe-arrow swipe-arrow--next" onClick={() => goTo(position.page + 1)} disabled={position.atEnd} aria-label="Next">
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {scrollable && (
        <div className="swipe-dots">
          {Array.from({ length: position.pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`swipe-dot${i === position.page ? " swipe-dot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === position.page}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .swipe {
          width: 100%;
        }
        .swipe-viewport {
          position: relative;
        }
        .swipe-track {
          display: flex;
          gap: var(--gap-d);
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
          /* bottom room so card shadows are not clipped by the scroll container */
          padding: 10px 0 22px;
        }
        .swipe-track::-webkit-scrollbar {
          display: none;
        }
        .swipe-item {
          flex: 0 0 calc((100% - var(--gv-d) * var(--gap-d)) / var(--pv-d));
          min-width: 0;
          scroll-snap-align: start;
        }
        /* Auto margins centre a row that is shorter than the viewport and collapse to 0 when it overflows */
        .swipe-item:first-child {
          margin-left: auto;
        }
        .swipe-item:last-child {
          margin-right: auto;
        }
        .swipe-arrow {
          position: absolute;
          top: var(--arrow-top);
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #8fb9a8;
          background: transparent;
          color: #8fb9a8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }
        .swipe-arrow:hover:not(:disabled) {
          background: #8fb9a8;
          color: #fff;
        }
        .swipe-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .swipe-arrow--prev {
          left: -60px;
        }
        .swipe-arrow--next {
          right: -60px;
        }
        .swipe-dots {
          display: none;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 2px;
        }
        .swipe-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: #e5d9d0;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .swipe-dot--active {
          width: 22px;
          border-radius: 4px;
          background: #d98a9c;
        }

        @media (max-width: 1199px) {
          .swipe-item {
            flex-basis: calc((100% - var(--gv-t) * var(--gap-d)) / var(--pv-t));
          }
          .swipe-arrow {
            width: 38px;
            height: 38px;
            background: rgba(255, 255, 255, 0.94);
            box-shadow: 0 2px 10px rgba(63, 59, 56, 0.15);
          }
          .swipe-arrow--prev {
            left: 6px;
          }
          .swipe-arrow--next {
            right: 6px;
          }
          .swipe-arrow:disabled {
            opacity: 0;
            pointer-events: none;
          }
          .swipe-dots {
            display: flex;
          }
        }

        @media (max-width: 600px) {
          .swipe-track {
            gap: var(--gap-m);
          }
          .swipe-item {
            flex-basis: calc((100% - var(--gv-m) * var(--gap-m)) / var(--pv-m));
          }
          .swipe-arrow {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>
    </div>
  );
}
