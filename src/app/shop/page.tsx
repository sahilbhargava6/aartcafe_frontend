"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import PriceSlider from "@/components/PriceSlider";
import QuickCustomizeModal from "@/components/QuickCustomizeModal";
import { useCart } from "@/context/CartContext";
import { type CategoryNode, normalizeCategories, descendantIdsOf, flattenTree, pathTo, childrenOf, mainCategoriesOf } from "@/lib/categories";
import { buildSearchIndex, searchProducts } from "@/lib/search";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ArrowUpDown, ChevronDown, Flower2, Sparkles, SlidersHorizontal, RotateCcw } from "lucide-react";

const CARD_LAYOUTS = [
  { width: 364, height: 455 }, // Aspect ratio 364/455
  { width: 364, height: 364 }, // Aspect ratio 1:1
  { width: 364, height: 455 },
  { width: 364, height: 364 },
  { width: 364, height: 455 },
  { width: 364, height: 364 },
  { width: 364, height: 455 },
  { width: 364, height: 364 },
];

// Categories can go several levels deep, and a category can sit under several parents
type ShopCategory = CategoryNode & { image?: string | null };

// Keeps the filters in step with the address bar (?category=…&collection=…&search=…&sort=…), including
// footer links and searches made while the shop is already open
function UrlFilters({ onChange }: { onChange: (category: string | null, collection: string | null, search: string | null, sort: string | null) => void }) {
  const params = useSearchParams();
  useEffect(() => {
    onChange(params.get("category"), params.get("collection"), params.get("search"), params.get("sort"));
  }, [params, onChange]);
  return null;
}

export default function Shop() {
  const { addToBag } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Product-flag collection from the URL, e.g. /shop?collection=bestsellers
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Words searched for in the site search ("See all results"), ranked like the search box
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  // Sorting state: default, price-asc, price-desc, newest, bestsellers, title-asc, title-desc
  const [sortBy, setSortBy] = useState<string>("default");

  const applyUrlFilters = useCallback((category: string | null, collection: string | null, search: string | null, sort: string | null) => {
    setSelectedCategory(category);
    setSearchTerm(search?.trim() || null);
    setSelectedCollection(collection === "bestsellers" ? collection : null);
    if (sort) {
      setSortBy(sort);
    }
  }, []);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newSort && newSort !== "default") {
        url.searchParams.set("sort", newSort);
      } else {
        url.searchParams.delete("sort");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  // The branch the shopper went down to reach the selected category (a category with several
  // parents can be reached more than one way); empty = work it out from the category
  const [trail, setTrail] = useState<number[]>([]);

  // Shows a category (null = all products) and writes it to the address bar
  const selectCategory = (cat: string | null, path: number[] = []) => {
    setSelectedCategory(cat);
    setTrail(path);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (cat) url.searchParams.set("category", cat);
      else url.searchParams.delete("category");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Clicking the selected category again clears it
  const handleCategoryClick = (cat: string, path: number[]) => selectCategory(selectedCategory === cat ? null : cat, path);

  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const categoryListRef = useRef<HTMLUListElement>(null);

  // On phones and tablets the categories are one sideways row: bring the selected one into view
  // (only the row scrolls, never the page)
  useEffect(() => {
    const list = categoryListRef.current;
    const active = list?.querySelector<HTMLElement>(".category-btn.is-active");
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const listBox = list.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    if (box.left >= listBox.left && box.right <= listBox.right) return;
    const padding = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
    list.scrollTo({ left: list.scrollLeft + box.left - listBox.left - padding, behavior: "smooth" });
  }, [selectedCategory, categories]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and products with ultra-fast parallel race
  useEffect(() => {
    let isMounted = true;

    const fetchFast = async (endpoint: string) => {
      const urls = [
        "http://localhost:8000/api/" + endpoint,
        process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}` : null,
        "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/" + endpoint,
      ].filter(Boolean) as string[];

      try {
        const data = await Promise.any(
          urls.map(async (url) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout for cold start
            try {
              const res = await fetch(url, { signal: controller.signal });
              clearTimeout(timer);
              if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) return json;
              }
            } catch (e) {
              clearTimeout(timer);
            }
            throw new Error("Endpoint failed");
          })
        );
        return data;
      } catch (e) {
        return [];
      }
    };

    const loadData = async () => {
      const [catData, prodData] = await Promise.all([
        fetchFast("categories"),
        fetchFast("products"),
      ]);

      if (isMounted) {
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(
            normalizeCategories((catData as { id: number | string; name: string; parent_ids?: (number | string)[]; parent_id?: number | string | null; image?: string | null }[]).filter((c) => c.name))
              .map((c: any) => ({ id: c.id, name: c.name, parent_ids: c.parent_ids, image: c.image || null }))
          );
        }

        if (Array.isArray(prodData) && prodData.length > 0) {
          const formatted = prodData.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.base_price),
            basePrice: parseFloat(p.base_price),
            discountPrice: p.discount_price ? parseFloat(p.discount_price) : null,
            category: p.category?.name || "Uncategorized",
            categories: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories.map((c: any) => c.name) : [p.category?.name || "Uncategorized"],
            categoryIds: Array.isArray(p.categories) && p.categories.length > 0
              ? p.categories.map((c: { id: number | string }) => Number(c.id))
              : p.category?.id ? [Number(p.category.id)] : [],
            image: p.image || "",
            images: p.images || [],
            attributes: Array.isArray(p.attributes) ? p.attributes : [],
            description: p.description || "",
            isFreeDelivery: !!p.is_free_delivery,
            isBestseller: !!p.is_bestseller
          }));
          setAllProducts(formatted);
          setFilteredProducts(formatted);
        }
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  useEffect(() => {
    let result = allProducts;

    if (selectedCollection === "bestsellers") {
      result = result.filter((p) => p.isBestseller);
    }

    if (selectedCategory) {
      // A category also shows the products of every category below it
      const chosen = categories.find((c) => c.name === selectedCategory);
      const ids = chosen ? [chosen.id, ...descendantIdsOf(categories, chosen.id)] : [];
      result = result.filter((p) =>
        ids.length > 0 ? p.categoryIds.some((id: number) => ids.includes(id)) : p.categories.includes(selectedCategory)
      );
    }

    // Search: only matching products, best match first
    if (searchTerm) {
      result = searchProducts(buildSearchIndex(result, categories), searchTerm);
    }

    // Apply price filter
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // Apply sorting
    if (sortBy !== "default" || !searchTerm) {
      result = [...result].sort((a, b) => {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(a.price) || 0;
        const priceB = typeof b.price === "number" ? b.price : parseFloat(b.price) || 0;

        switch (sortBy) {
          case "price-asc":
            return priceA - priceB;
          case "price-desc":
            return priceB - priceA;
          case "newest":
            return (Number(b.id) || 0) - (Number(a.id) || 0);
          case "bestsellers":
            if (Boolean(a.isBestseller) !== Boolean(b.isBestseller)) {
              return a.isBestseller ? -1 : 1;
            }
            return (Number(b.id) || 0) - (Number(a.id) || 0);
          case "title-asc":
            return (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" });
          case "title-desc":
            return (b.title || "").localeCompare(a.title || "", undefined, { numeric: true, sensitivity: "base" });
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(result);
  }, [selectedCollection, selectedCategory, searchTerm, minPrice, maxPrice, sortBy, allProducts, categories]);

  const clearFilters = () => {
    setSelectedCollection(null);
    setSelectedCategory(null);
    setSearchTerm(null);
    setMinPrice(0);
    setMaxPrice(10000);
    setSortBy("default");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      url.searchParams.delete("collection");
      url.searchParams.delete("search");
      url.searchParams.delete("sort");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Category tree: main categories A–Z, each with its sub-categories (at any depth) A–Z beneath it
  const categoryRows = flattenTree(categories);
  const byId = (id: number) => categories.find((c) => c.id === id);
  // The way down to the selected category: the branch clicked, or one worked out from its parents
  const selectedCat = categories.find((c) => c.name === selectedCategory);
  const trailFits = !!selectedCat && trail[trail.length - 1] === selectedCat.id
    && trail.every((id, i) => byId(id) && (i === 0 ? byId(id)!.parent_ids.length === 0 : byId(id)!.parent_ids.includes(trail[i - 1])));
  const selectedPath = selectedCat ? (trailFits ? trail : pathTo(categories, selectedCat).map((c) => c.id)) : [];
  // Chips above the products: the selected category and what is under it; for a category with
  // nothing under it, its parent and that parent's other sub-categories. "‹" steps back up a level.
  const chipLevel = selectedCat && childrenOf(categories, selectedCat.id).length > 0 ? selectedPath.length - 1 : selectedPath.length - 2;
  const chipParent = chipLevel >= 0 ? byId(selectedPath[chipLevel]) : undefined;
  const chipParentPath = selectedPath.slice(0, chipLevel + 1);
  const chipChildren = chipParent ? childrenOf(categories, chipParent.id) : [];
  const chipBack = chipLevel > 0 ? byId(selectedPath[chipLevel - 1]) : undefined;

  const [showMobilePriceFilter, setShowMobilePriceFilter] = useState(false);
  const [showDesktopPriceFilter, setShowDesktopPriceFilter] = useState(false);
  const desktopPriceRef = useRef<HTMLDivElement>(null);
  const [mobileCatOpen, setMobileCatOpen] = useState(true);
  const [customizingProduct, setCustomizingProduct] = useState<any | null>(null);
  const activeStoryRef = useRef<HTMLButtonElement>(null);

  // Close desktop price popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopPriceRef.current && !desktopPriceRef.current.contains(event.target as Node)) {
        setShowDesktopPriceFilter(false);
      }
    };
    if (showDesktopPriceFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDesktopPriceFilter]);

  // Smooth scroll down to products section when a subcategory or category without children is picked
  const scrollToProducts = () => {
    if (typeof window === "undefined") return;
    setTimeout(() => {
      const el = document.getElementById("shop-products-section") || document.querySelector(".shop-products-grid");
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 85;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        });
      }
    }, 60);
  };

  // Smooth scroll to child categories pill bar when a parent category with children is clicked
  const scrollToSubcategories = () => {
    if (typeof window === "undefined") return;
    setTimeout(() => {
      const el = document.getElementById("mobile-subcat-section") || document.querySelector(".mobile-subcat-bar");
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 95;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        });
        el.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 60);
  };

  // Main categories (level 0) for story circles carousel (exclude redundant "All" DB category)
  const mainCategories = React.useMemo(
    () => mainCategoriesOf(categories).filter((c) => c.name.trim().toLowerCase() !== "all"),
    [categories]
  );

  // Group mobile category tiles into rows of 2 for inline subcategory placement directly below each category
  const mobileCatRows = React.useMemo(() => {
    const items: ({ type: "all" } | { type: "cat"; cat: ShopCategory })[] = [
      { type: "all" },
      ...mainCategories.map((cat) => ({ type: "cat" as const, cat })),
    ];
    const grouped: ({ type: "all" } | { type: "cat"; cat: ShopCategory })[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      grouped.push(items.slice(i, i + 2));
    }
    return grouped;
  }, [mainCategories]);

  // Pre-calculate representative product images and item counts for each category
  // Custom icon/photo overrides for categories (optional)
  // To override a category icon with a custom image, simply add:
  // "Category Name": "https://your-image-url.jpg" or "/images/icon.png"
  const CATEGORY_CUSTOM_ICONS: Record<string, string> = {
    // e.g. "All Varmala Preservation Collection": "https://...",
  };

  // Pre-calculate representative product images and item counts for each category
  const categoryMeta = React.useMemo(() => {
    const imageMap: Record<number, string> = {};
    const countMap: Record<number, number> = {};

    let localIcons: Record<string, string> = {};
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("category_custom_icons");
        if (stored) localIcons = JSON.parse(stored);
      } catch (_) {}
    }

    categories.forEach((cat) => {
      const ids = [cat.id, ...descendantIdsOf(categories, cat.id)];
      const matchingProds = allProducts.filter((p) =>
        ids.some((id) => p.categoryIds?.includes(id))
      );
      countMap[cat.id] = matchingProds.length;

      // 1. Direct image from backend category database
      // 2. Local storage override (configured via Admin Dashboard)
      // 3. Static fallback CATEGORY_CUSTOM_ICONS
      // 4. Representative first product photo
      const customImg =
        cat.image ||
        localIcons[cat.id] ||
        localIcons[cat.name] ||
        CATEGORY_CUSTOM_ICONS[cat.name] ||
        CATEGORY_CUSTOM_ICONS[String(cat.id)];

      if (customImg) {
        imageMap[cat.id] = customImg;
      } else {
        const prodWithImg = matchingProds.find((p) => p.image);
        if (prodWithImg) {
          imageMap[cat.id] = prodWithImg.image;
        }
      }
    });

    return { imageMap, countMap };
  }, [categories, allProducts]);

  // Display full category name
  const formatCategoryTitle = (name: string): string => {
    return name ? name.trim() : "";
  };

  // Auto-scroll active category story circle into view smoothly
  useEffect(() => {
    if (activeStoryRef.current) {
      activeStoryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedCategory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <Suspense fallback={null}>
        <UrlFilters onChange={applyUrlFilters} />
      </Suspense>

      <main className="shop-main" style={{ flex: 1, backgroundColor: "#fff", padding: "40px 0 80px 0" }}>
        <div className="shop-container">

          {/* Main Grid Wrapper with responsive styling */}
          <div className="shop-layout">

            {/* ═══════════════════════════════════════════════════════
                LEFT SIDEBAR: FILTERS
                (≤992px: becomes a compact block of category chips + price row)
                ═══════════════════════════════════════════════════════ */}
            <aside className="shop-sidebar">
              <h2
                className="font-serif shop-filter-heading"
                style={{
                  fontSize: "24px",
                  lineHeight: "32px",
                  fontWeight: 400,
                  color: "#3F3B38",
                  margin: "0 0 16px 0",
                  paddingLeft: "10px",
                }}
              >
                Filter
              </h2>

              {/* Categories Box */}
              <div className="filter-box filter-box--categories">
                <h3 className="font-serif filter-box-title">
                  Categories
                </h3>
                <div className="category-list-wrap" style={{ flex: 1 }}>
                  <ul ref={categoryListRef} className="category-list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", padding: 0, margin: 0 }}>
                    {categoryRows.map(({ category: cat, depth, path }) => {
                      // A main category stays highlighted while anything under it is shown; a sub-category
                      // listed under several parents only lights up on the branch being browsed
                      const isActive = depth === 0 ? selectedPath[0] === cat.id : path.join("-") === selectedPath.join("-");
                      return depth === 0 ? (
                        <li key={path.join("-")} className="category-item">
                          <button
                            onClick={() => handleCategoryClick(cat.name, path)}
                            className={`font-sans category-btn${isActive ? " is-active" : ""}`}
                            aria-pressed={isActive}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "20px",
                              lineHeight: "30px",
                              color: isActive ? "#D9A85C" : "#3F3B38",
                              fontWeight: 400,
                              textAlign: "left",
                              width: "100%",
                              padding: 0,
                              transition: "color 0.2s ease",
                            }}
                          >
                            {cat.name}
                          </button>
                        </li>
                      ) : (
                        /* Sub-categories, indented one step per level (phones show them as chips above the products instead) */
                        <li key={path.join("-")} className="category-item category-item--sub">
                          <button
                            onClick={() => handleCategoryClick(cat.name, path)}
                            className="font-sans category-btn category-btn--sub"
                            aria-pressed={isActive}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: depth === 1 ? "17px" : "16px",
                              lineHeight: "26px",
                              color: isActive ? "#D9A85C" : "#6E6E6E",
                              fontWeight: 400,
                              textAlign: "left",
                              width: "100%",
                              padding: `0 0 0 ${18 * depth}px`,
                              transition: "color 0.2s ease",
                            }}
                          >
                            {cat.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Prices Box */}
              <div className="filter-box filter-box--price">
                <h3 className="font-serif filter-box-title">
                  Prices
                </h3>
                <div className="price-slider-wrap" style={{ paddingRight: "4px", marginTop: "16px" }}>
                  <PriceSlider
                    min={0}
                    max={10000}
                    currentMin={minPrice}
                    currentMax={maxPrice}
                    onChange={(min: number, max: number) => {
                      setMinPrice(min);
                      setMaxPrice(max);
                    }}
                  />
                </div>
              </div>

              {/* Sort By Box */}
              <div className="filter-box filter-box--sort">
                <h3 className="font-serif filter-box-title">
                  Sort By
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                  {[
                    { id: "default", label: searchTerm ? "Relevance" : "Featured" },
                    { id: "price-asc", label: "Price: Low to High" },
                    { id: "price-desc", label: "Price: High to Low" },
                    { id: "newest", label: "Newest Arrivals" },
                    { id: "bestsellers", label: "Bestsellers" },
                    { id: "title-asc", label: "Name: A to Z" },
                    { id: "title-desc", label: "Name: Z to A" },
                  ].map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSortChange(opt.id)}
                        className={`font-sans sort-option-btn${isSelected ? " is-active" : ""}`}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "17px",
                          lineHeight: "26px",
                          color: isSelected ? "#D9A85C" : "#3F3B38",
                          fontWeight: isSelected ? 600 : 400,
                          textAlign: "left",
                          padding: "3px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: isSelected ? "5px solid #D9A85C" : "1.5px solid #C4B5A5",
                            backgroundColor: "#fff",
                            display: "inline-block",
                            flexShrink: 0,
                            transition: "all 0.2s ease",
                          }}
                        />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </aside>

            {/* ═══════════════════════════════════════════════════════
                RIGHT PRODUCTS PANEL
                ═══════════════════════════════════════════════════════ */}
            <div className="shop-products-panel" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

              {/* Header Title & Active Filter Summary */}
              <div className="shop-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                  <h1
                    className="font-serif shop-title"
                    style={{
                      fontSize: "36px",
                      lineHeight: "48px",
                      fontWeight: 400,
                      color: "#3F3B38",
                      margin: 0,
                    }}
                  >
                    {searchTerm
                      ? `RESULTS FOR “${searchTerm.toUpperCase()}”`
                      : selectedCategory && selectedCategory !== "All"
                      ? selectedCategory.toUpperCase()
                      : selectedCollection === "bestsellers"
                      ? "BESTSELLERS"
                      : "SHOP"}
                  </h1>
                </div>

                <div className="shop-header-actions desktop-only-header-actions" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  {(selectedCollection || selectedCategory || searchTerm || minPrice > 0 || maxPrice < 10000 || (sortBy && sortBy !== "default")) && (
                    <button
                      onClick={clearFilters}
                      className="font-sans shop-clear-btn"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#D98A9C",
                        fontSize: "16px",
                        cursor: "pointer",
                        fontWeight: 500,
                        textDecoration: "underline",
                        padding: "4px 0",
                      }}
                    >
                      Clear Filters
                    </button>
                  )}

                  {/* Desktop Price Filter */}
                  <div className="shop-price-container" ref={desktopPriceRef} style={{ position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span className="shop-sort-label font-sans">
                        <SlidersHorizontal size={13} color="#8E8882" />
                        <span>Price:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDesktopPriceFilter((prev) => !prev)}
                        className={`font-sans desktop-price-toggle-btn ${minPrice > 0 || maxPrice < 10000 ? "is-active" : ""}`}
                        aria-expanded={showDesktopPriceFilter}
                        aria-label="Filter products by price"
                      >
                        <span>
                          {minPrice > 0 || maxPrice < 10000
                            ? `₹${minPrice} - ₹${maxPrice}${maxPrice === 10000 ? "+" : ""}`
                            : "All Prices"}
                        </span>
                        <ChevronDown
                          size={14}
                          color={minPrice > 0 || maxPrice < 10000 ? "#8C5E1B" : "#6E6E6E"}
                          style={{
                            transform: showDesktopPriceFilter ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>
                    </div>

                    {/* Desktop Price Dropdown Popover */}
                    {showDesktopPriceFilter && (
                      <div
                        className="desktop-price-popover"
                        style={{
                          position: "absolute",
                          top: "calc(100% + 10px)",
                          right: 0,
                          width: "320px",
                          backgroundColor: "#fff",
                          border: "1.5px solid #E8DFD8",
                          borderRadius: "16px",
                          boxShadow: "0 12px 32px rgba(63, 59, 56, 0.16)",
                          padding: "18px 20px",
                          zIndex: 100,
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="font-serif" style={{ fontSize: "17px", fontWeight: 700, color: "#3F3B38" }}>
                            Filter by Price
                          </span>
                          {(minPrice > 0 || maxPrice < 10000) && (
                            <button
                              type="button"
                              onClick={() => {
                                setMinPrice(0);
                                setMaxPrice(10000);
                              }}
                              className="font-sans"
                              style={{
                                background: "none",
                                border: "none",
                                color: "#D98A9C",
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: 0,
                              }}
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Quick Presets */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {[
                            { label: "All", min: 0, max: 10000 },
                            { label: "Under ₹1K", min: 0, max: 1000 },
                            { label: "₹1K - ₹3K", min: 1000, max: 3000 },
                            { label: "₹3K - ₹5K", min: 3000, max: 5000 },
                            { label: "₹5K+", min: 5000, max: 10000 },
                          ].map((preset) => {
                            const isPresetActive = minPrice === preset.min && maxPrice === preset.max;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setMinPrice(preset.min);
                                  setMaxPrice(preset.max);
                                }}
                                className="font-sans"
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  backgroundColor: isPresetActive ? "#D9A85C" : "#F8F5F2",
                                  color: isPresetActive ? "#fff" : "#6E6E6E",
                                  border: isPresetActive ? "1px solid #D9A85C" : "1px solid #EADBCC",
                                }}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Price Range Slider */}
                        <div style={{ paddingRight: "4px", marginTop: "2px" }}>
                          <PriceSlider
                            min={0}
                            max={10000}
                            currentMin={minPrice}
                            currentMax={maxPrice}
                            onChange={(min: number, max: number) => {
                              setMinPrice(min);
                              setMaxPrice(max);
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #F3EDE7" }}>
                          <button
                            type="button"
                            onClick={() => setShowDesktopPriceFilter(false)}
                            className="font-sans"
                            style={{
                              backgroundColor: "#3F3B38",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 16px",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="shop-sort-container">
                    <label htmlFor="shop-sort-select" className="shop-sort-label font-sans">
                      <ArrowUpDown size={14} color="#8E8882" />
                      <span>Sort:</span>
                    </label>
                    <div className="shop-sort-select-wrapper">
                      <select
                        id="shop-sort-select"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="font-sans shop-sort-select"
                        aria-label="Sort products"
                      >
                        <option value="default">{searchTerm ? "Relevance" : "Featured"}</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="newest">Newest Arrivals</option>
                        <option value="bestsellers">Bestsellers</option>
                        <option value="title-asc">Name: A to Z</option>
                        <option value="title-desc">Name: Z to A</option>
                      </select>
                      <ChevronDown size={14} className="shop-sort-chevron" color="#6E6E6E" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════
                  MOBILE STORY CATEGORIES (Ultra-intuitive & elegant for touch users)
                  ═══════════════════════════════════════════════════════ */}
              <div className="mobile-story-nav" role="navigation" aria-label="Browse Categories">
                <div className="mobile-story-scroll">
                  {/* All Items Story Circle */}
                  <button
                    type="button"
                    onClick={() => {
                      selectCategory(null, []);
                      scrollToProducts();
                    }}
                    className={`mobile-story-item font-sans ${!selectedCategory && !selectedCollection ? "is-active" : ""}`}
                    aria-pressed={!selectedCategory && !selectedCollection}
                  >
                    <div className="mobile-story-ring">
                      <div className="mobile-story-avatar mobile-story-avatar--all">
                        <Sparkles size={20} color={!selectedCategory && !selectedCollection ? "#D9A85C" : "#8C5E1B"} />
                      </div>
                    </div>
                    <span className="mobile-story-label">All Items</span>
                  </button>

                  {/* Main Categories Story Circles */}
                  {mainCategories.map((cat) => {
                    const isCatActive = selectedPath[0] === cat.id;
                    const catImg = categoryMeta.imageMap[cat.id];
                    const label = formatCategoryTitle(cat.name);
                    return (
                      <button
                        key={cat.id}
                        ref={isCatActive ? activeStoryRef : null}
                        type="button"
                        onClick={() => {
                          const hasChildren = childrenOf(categories, cat.id).length > 0;
                          if (isCatActive && !selectedCat?.parent_ids.length) {
                            selectCategory(null, []);
                            scrollToProducts();
                          } else {
                            handleCategoryClick(cat.name, [cat.id]);
                            if (hasChildren) {
                              scrollToSubcategories();
                            } else {
                              scrollToProducts();
                            }
                          }
                        }}
                        className={`mobile-story-item font-sans ${isCatActive ? "is-active" : ""}`}
                        aria-pressed={isCatActive}
                      >
                        <div className="mobile-story-ring">
                          <div className="mobile-story-avatar">
                            {catImg ? (
                              <img
                                src={catImg}
                                alt={cat.name}
                                loading="lazy"
                                decoding="async"
                                className="mobile-story-img"
                              />
                            ) : (
                              <Flower2 size={20} color="#C4A47C" />
                            )}
                          </div>
                        </div>
                        <span className="mobile-story-label">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-categories Pills (Shown below story circles when a category with subcategories is chosen) */}
                {chipParent && chipChildren.length > 0 && (
                  <div id="mobile-subcat-section" className="mobile-subcat-bar" role="group" aria-label={`${chipParent.name} sub-categories`}>
                    {chipBack && (
                      <button
                        type="button"
                        onClick={() => {
                          selectCategory(chipBack.name, chipParentPath.slice(0, -1));
                          scrollToProducts();
                        }}
                        className="mobile-subcat-pill mobile-subcat-pill--back font-sans"
                        aria-label={`Back to ${chipBack.name}`}
                      >
                        ‹ Back
                      </button>
                    )}
                    {[chipParent, ...chipChildren].map((cat) => {
                      const isActive = selectedCategory === cat.name;
                      const rawLabel =
                        cat.id === chipParent.id && !/^all\b/i.test(cat.name.trim())
                          ? `All ${formatCategoryTitle(cat.name)}`
                          : formatCategoryTitle(cat.name);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            selectCategory(
                              cat.name,
                              cat.id === chipParent.id ? chipParentPath : [...chipParentPath, cat.id]
                            );
                            scrollToProducts();
                          }}
                          aria-pressed={isActive}
                          className={`mobile-subcat-pill font-sans ${isActive ? "is-active" : ""}`}
                        >
                          {rawLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Desktop Sub-categories Chips (hidden on mobile, visible on desktop) */}
              {chipParent && chipChildren.length > 0 && (
                <div className="subcategory-chips desktop-subcategory-chips" role="group" aria-label={`${chipParent.name} sub-categories`}>
                  {chipBack && (
                    <button
                      type="button"
                      onClick={() => selectCategory(chipBack.name, chipParentPath.slice(0, -1))}
                      className="font-sans subcategory-chip subcategory-chip--back"
                      aria-label={`Back to ${chipBack.name}`}
                    >
                      ‹ {formatCategoryTitle(chipBack.name)}
                    </button>
                  )}
                  {[chipParent, ...chipChildren].map((cat) => {
                    const isActive = selectedCategory === cat.name;
                    const rawLabel = cat.id === chipParent.id && !/^all\b/i.test(cat.name.trim())
                      ? `All ${formatCategoryTitle(cat.name)}`
                      : formatCategoryTitle(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat.name, cat.id === chipParent.id ? chipParentPath : [...chipParentPath, cat.id])}
                        aria-pressed={isActive}
                        className={`font-sans subcategory-chip${isActive ? " is-active" : ""}`}
                      >
                        <span>{rawLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════
                  MOBILE COLLAPSIBLE PRICE FILTER & SORT TOOLBAR (Below Categories)
                  ═══════════════════════════════════════════════════════ */}
              <div className="mobile-price-section">
                <div className="mobile-price-bar">
                  <div className="mobile-price-bar-left">
                    <button
                      type="button"
                      onClick={() => setShowMobilePriceFilter((prev) => !prev)}
                      className={`mobile-price-toggle-btn font-sans ${minPrice > 0 || maxPrice < 10000 ? "is-filtered" : ""}`}
                      aria-expanded={showMobilePriceFilter}
                    >
                      <SlidersHorizontal size={13} color={minPrice > 0 || maxPrice < 10000 ? "#D9A85C" : "#6E6E6E"} />
                      <span>
                        {minPrice > 0 || maxPrice < 10000
                          ? `Price: ₹${minPrice} - ₹${maxPrice}${maxPrice === 10000 ? "+" : ""}`
                          : "Filter by Price"}
                      </span>
                      <ChevronDown
                        size={13}
                        color={minPrice > 0 || maxPrice < 10000 ? "#D9A85C" : "#6E6E6E"}
                        style={{
                          transform: showMobilePriceFilter ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {(minPrice > 0 || maxPrice < 10000) && (
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice(0);
                          setMaxPrice(10000);
                        }}
                        className="mobile-price-reset font-sans"
                        title="Reset price filter"
                      >
                        <RotateCcw size={11} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <div className="mobile-price-bar-right">
                    {(selectedCollection || selectedCategory || searchTerm || minPrice > 0 || maxPrice < 10000 || (sortBy && sortBy !== "default")) && (
                      <button
                        onClick={clearFilters}
                        className="font-sans shop-clear-btn"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#D98A9C",
                          fontSize: "14px",
                          cursor: "pointer",
                          fontWeight: 500,
                          textDecoration: "underline",
                          padding: "4px 0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Clear Filters
                      </button>
                    )}

                    {/* Sort By Dropdown */}
                    <div className="shop-sort-container">
                      <label htmlFor="shop-sort-select-mobile" className="shop-sort-label font-sans">
                        <ArrowUpDown size={13} color="#8E8882" />
                        <span>Sort:</span>
                      </label>
                      <div className="shop-sort-select-wrapper">
                        <select
                          id="shop-sort-select-mobile"
                          value={sortBy}
                          onChange={(e) => handleSortChange(e.target.value)}
                          className="font-sans shop-sort-select"
                          aria-label="Sort products"
                        >
                          <option value="default">{searchTerm ? "Relevance" : "Featured"}</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="newest">Newest Arrivals</option>
                          <option value="bestsellers">Bestsellers</option>
                          <option value="title-asc">Name: A to Z</option>
                          <option value="title-desc">Name: Z to A</option>
                        </select>
                        <ChevronDown size={13} className="shop-sort-chevron" color="#6E6E6E" />
                      </div>
                    </div>
                  </div>
                </div>

                {showMobilePriceFilter && (
                  <div className="mobile-price-expanded">
                    <div className="mobile-price-expanded-header">
                      <span className="font-sans" style={{ fontSize: "13px", fontWeight: 600, color: "#3F3B38" }}>
                        Select Price Range
                      </span>
                      <span className="font-sans" style={{ fontSize: "13px", color: "#D9A85C", fontWeight: 600 }}>
                        ₹{minPrice} – ₹{maxPrice}{maxPrice === 10000 ? "+" : ""}
                      </span>
                    </div>
                    <div style={{ padding: "4px 0 0" }}>
                      <PriceSlider
                        min={0}
                        max={10000}
                        currentMin={minPrice}
                        currentMax={maxPrice}
                        onChange={(min: number, max: number) => {
                          setMinPrice(min);
                          setMaxPrice(max);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Grid Anchor */}
              <div id="shop-products-section" style={{ scrollMarginTop: "90px" }} />

              {/* Product Grid */}
              {loading ? (
                <div className="shop-products-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="shop-product-card-wrapper" style={{ opacity: 0.6 }}>
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "364/455",
                          backgroundColor: "#FAF6F0",
                          borderRadius: "15px",
                        }}
                      />
                      <div style={{ marginTop: "14px", height: "22px", backgroundColor: "#FAF6F0", borderRadius: "6px", width: "75%" }} />
                      <div style={{ marginTop: "8px", height: "18px", backgroundColor: "#FAF6F0", borderRadius: "6px", width: "40%" }} />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="shop-empty" style={{ padding: "80px 0", textAlign: "center", color: "#6E6E6E" }}>
                  <p className="font-sans shop-empty-text" style={{ fontSize: "22px" }}>No products match the selected filters.</p>
                  <button
                    onClick={clearFilters}
                    className="underline-link"
                    style={{ marginTop: "16px" }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="shop-products-grid">
                  {filteredProducts.map((prod, index) => {
                    const layout = CARD_LAYOUTS[index % CARD_LAYOUTS.length];
                    const aspectRatioStr = `${layout.width}/${layout.height}`;

                    return (
                        <div key={prod.id} className="shop-product-card-wrapper" style={{ position: "relative" }}>
                          {/* Wishlist Heart Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist({
                                id: prod.id,
                                title: prod.title,
                                price: prod.price,
                                image: prod.image,
                                category: prod.category,
                                slug: prod.slug,
                              });
                            }}
                            title={isInWishlist(prod.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            className="wishlist-btn"
                            style={{
                              position: "absolute",
                              top: "14px",
                              right: "14px",
                              zIndex: 10,
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              border: "none",
                              borderRadius: "50%",
                              width: "36px",
                              height: "36px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <Heart
                              size={18}
                              color={isInWishlist(prod.id) ? "#D98A9C" : "#3F3B38"}
                              fill={isInWishlist(prod.id) ? "#D98A9C" : "none"}
                            />
                          </button>

                          {/* Product Card Container */}
                          <Link
                            href={prod.slug ? `/shop/${prod.slug}` : "/shop/wedding-frames"}
                            className="product-card"
                            style={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: aspectRatioStr,
                              backgroundColor: "#FAF6F0",
                              borderRadius: "15px",
                              overflow: "hidden",
                              display: "block",
                              boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
                            }}
                          >
                          {/* Product Image */}

                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.title}
                              loading="lazy"
                              decoding="async"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "14px" }}>
                              Product Image
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <div
                            className="hover-overlay"
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              zIndex: 2,
                            }}
                          >
                            <span
                              className="font-serif"
                              style={{
                                color: "#fff",
                                fontSize: "20px",
                                borderBottom: "1.5px solid #fff",
                                paddingBottom: "2px",
                                letterSpacing: "1px",
                              }}
                            >
                              View Details
                            </span>
                          </div>
                        </Link>

                        {/* Details below card */}
                        <div className="card-details" style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "14px", width: "100%" }}>
                          <Link href={prod.slug ? `/shop/${prod.slug}` : `/shop/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h4
                              className="font-serif card-title"
                              style={{
                                fontSize: "22px",
                                lineHeight: "30px",
                                fontWeight: 400,
                                color: "#3F3B38",
                                margin: 0,
                                cursor: "pointer",
                              }}
                            >
                              {prod.title}
                            </h4>
                          </Link>
                          
                          <div className="card-price-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="card-price-group" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                              <span className="font-sans card-price" style={{ fontSize: "20px", color: "#3F3B38", fontWeight: 500 }}>
                                ₹{prod.price.toLocaleString("en-IN")}
                              </span>
                              {prod.discountPrice && (
                                <span className="font-sans card-price-was" style={{ fontSize: "14px", textDecoration: "line-through", color: "#999" }}>
                                  ₹{prod.basePrice.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCustomizingProduct(prod);
                              }}
                              className="font-sans card-add-btn"
                              style={{
                                background: "none",
                                border: "none",
                                borderBottom: "1px solid #3F3B38",
                                fontSize: "20px",
                                lineHeight: "30px",
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
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Quick Customize Modal when adding to bag directly from card */}
      <QuickCustomizeModal
        product={customizingProduct}
        isOpen={!!customizingProduct}
        onClose={() => setCustomizingProduct(null)}
      />

      {/* CSS Styles for responsiveness and overlay hover state */}
      <style jsx global>{`
        /* Only on devices that can hover (avoids a "stuck" overlay after a tap on touch screens) */
        @media (hover: hover) {
          .product-card:hover .hover-overlay {
            opacity: 1 !important;
          }
        }
        /* Phones: uniform 4:5 cards so the 2-column grid rows line up */
        @media (max-width: 600px) {
          .shop-products-grid .product-card {
            aspect-ratio: 4 / 5 !important;
            border-radius: 12px !important;
          }
        }
      `}</style>

      <style jsx>{`
        .shop-container {
          --gutter: 40px;
          max-width: 1920px;
          margin: 0 auto;
          padding: 0 var(--gutter);
        }
        .shop-layout {
          display: grid;
          grid-template-columns: 294px 1fr;
          gap: 47px;
        }
        .shop-layout > * {
          min-width: 0;
        }
        /* "All <category>" + its sub-categories, above the products */
        .subcategory-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: -10px;
        }
        .subcategory-chip {
          min-height: 38px;
          padding: 0 16px;
          border: 1px solid #e5d5c5;
          border-radius: 999px;
          background: #fff;
          color: #3f3b38;
          font-size: 15px;
          line-height: 20px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .subcategory-chip:hover {
          border-color: #d9a85c;
        }
        .subcategory-chip.is-active {
          border: 1.5px solid #d9a85c;
          background: rgba(217, 168, 92, 0.12);
          font-weight: 500;
        }
        .shop-sidebar {
          display: flex;
          flex-direction: column;
          gap: 27px;
        }
        .filter-box {
          box-sizing: border-box;
          width: 100%;
          min-height: 220px;
          height: auto;
          border: 2px solid #D98A9C;
          border-radius: 15px;
          padding: 24px 22px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
        }
        .filter-box-title {
          font-size: 32px;
          line-height: 43px;
          font-weight: 700;
          color: #3F3B38;
          margin: 0 0 12px 0;
        }
        .filter-box--sort {
          min-height: auto;
        }
        .sort-option-btn:hover {
          color: #D9A85C !important;
        }
        .sort-option-btn:hover span:first-child {
          border-color: #D9A85C !important;
        }
        .shop-header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .shop-sort-container {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .shop-sort-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 500;
          color: #8E8882;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shop-sort-select-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .shop-sort-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: #fff;
          border: 1.5px solid #E5D5C5;
          border-radius: 999px;
          padding: 7px 32px 7px 14px;
          font-size: 14px;
          line-height: 20px;
          color: #3F3B38;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .shop-sort-select:hover {
          border-color: #D9A85C;
        }
        .shop-sort-select:focus {
          border-color: #D9A85C;
          box-shadow: 0 0 0 3px rgba(217, 168, 92, 0.15);
        }
        .shop-sort-chevron {
          position: absolute;
          right: 12px;
          pointer-events: none;
        }
        .desktop-price-toggle-btn {
          appearance: none;
          -webkit-appearance: none;
          background-color: #fff;
          border: 1.5px solid #E5D5C5;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 14px;
          line-height: 20px;
          color: #3F3B38;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          outline: none;
        }
        .desktop-price-toggle-btn:hover {
          border-color: #D9A85C;
        }
        .desktop-price-toggle-btn:focus {
          border-color: #D9A85C;
          box-shadow: 0 0 0 3px rgba(217, 168, 92, 0.15);
        }
        .desktop-price-toggle-btn.is-active {
          background-color: #FFF9F2;
          border-color: #D9A85C;
          color: #8C5E1B;
          font-weight: 600;
        }
        .shop-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 60px 24px;
          justify-content: center;
        }
        .shop-product-card-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        /* Invisible ≥40px tap areas (no visual change): "Add to bag" grows into the row gap below, the heart by 4px */
        .card-add-btn {
          position: relative;
        }
        .card-add-btn::before {
          content: "";
          position: absolute;
          left: -6px;
          right: 0;
          top: -4px;
          bottom: -14px;
        }
        .wishlist-btn::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
        }

        /* Small laptops (1200–1399px): keep 3 columns next to the sidebar */
        @media (max-width: 1399px) {
          .shop-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* iPad Pro portrait / small landscape tablets: sidebar stays, grid never collapses to 1 column */
        @media (max-width: 1199px) {
          .shop-products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 48px 24px;
          }
        }

        /* Touch screens that still show the sidebar: give each category a 40px tap target */
        @media (min-width: 993px) and (pointer: coarse) {
          .category-list {
            gap: 2px !important;
          }
          .category-btn {
            min-height: 40px;
          }
        }

        .mobile-story-nav,
        .mobile-price-section {
          display: none !important;
        }

        /* ═════ Tablets & phones: single column, visual story categories & price bar ═════ */
        @media (max-width: 992px) {
          .desktop-only-header-actions {
            display: none !important;
          }
          .shop-container {
            --gutter: 20px;
          }
          .shop-main {
            padding: 20px 0 60px 0 !important;
          }
          .shop-layout {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .shop-sidebar {
            display: none !important;
          }
          .shop-products-panel {
            display: flex !important;
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }
          .shop-title {
            font-size: 30px !important;
            line-height: 38px !important;
          }
          .shop-clear-btn {
            font-size: 15px !important;
            min-height: 36px;
            padding: 0 !important;
          }

          /* Hide separate desktop chips on mobile since they are inside the mobile story nav */
          .desktop-subcategory-chips {
            display: none !important;
          }

          /* Mobile Story Categories Nav (Instagram / Nykaa style circular avatars with product preview photos) */
          .mobile-story-nav {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
            margin: 0 -4px;
            padding: 2px 0 4px 0;
          }
          .mobile-story-scroll {
            display: flex;
            gap: 14px;
            overflow-x: auto;
            padding: 6px 6px 8px 6px;
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .mobile-story-scroll::-webkit-scrollbar {
            display: none;
          }
          .mobile-story-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 7px;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            flex-shrink: 0;
            width: 82px;
            outline: none;
            text-align: center;
            transition: transform 0.15s ease;
            scroll-snap-align: start;
          }
          .mobile-story-item:active {
            transform: scale(0.94);
          }
          .mobile-story-ring {
            width: 66px;
            height: 66px;
            border-radius: 50%;
            padding: 2.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #EADBCC;
            transition: all 0.25s ease;
          }
          .mobile-story-item.is-active .mobile-story-ring {
            background: linear-gradient(135deg, #D9A85C 0%, #E8C88B 50%, #D98A9C 100%);
            box-shadow: 0 4px 14px rgba(217, 168, 92, 0.42);
            transform: scale(1.05);
          }
          .mobile-story-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            background: #FAF7F2;
            border: 2px solid #fff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-story-avatar--all {
            background: linear-gradient(135deg, #FFF9F2 0%, #F5ECE0 100%);
          }
          .mobile-story-item.is-active .mobile-story-avatar--all {
            background: #FFF4E5;
          }
          .mobile-story-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .mobile-story-label {
            font-size: 11.5px;
            line-height: 14px;
            color: #6E6E6E;
            text-align: center;
            font-weight: 500;
            max-width: 82px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            word-break: break-word;
            transition: color 0.2s ease, font-weight 0.2s ease;
          }
          .mobile-story-item.is-active .mobile-story-label {
            color: #8C5E1B;
            font-weight: 700;
          }

          /* Subcategories pill bar */
          .mobile-subcat-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            overflow-x: auto;
            padding: 2px 6px 6px 6px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            animation: fadeInSub 0.22s ease-out;
          }
          .mobile-subcat-bar::-webkit-scrollbar {
            display: none;
          }
          @keyframes fadeInSub {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .mobile-subcat-pill {
            height: 33px;
            padding: 0 14px;
            border-radius: 999px;
            background-color: #FAF7F2;
            border: 1px solid #E8DFD8;
            color: #5C554F;
            font-size: 13px;
            line-height: 33px;
            font-weight: 500;
            white-space: nowrap;
            cursor: pointer;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            transition: all 0.18s ease;
          }
          .mobile-subcat-pill:active {
            transform: scale(0.96);
          }
          .mobile-subcat-pill.is-active {
            background-color: #D9A85C;
            border-color: #D9A85C;
            color: #FFFFFF;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(217, 168, 92, 0.32);
          }
          .mobile-subcat-pill--back {
            background-color: #FFF2F5;
            border-color: #F0D0D8;
            color: #D98A9C;
            font-weight: 600;
          }

          /* Mobile Collapsible Price Section */
          .mobile-price-section {
            display: block !important;
            margin: 6px 0 0 0;
          }
          .mobile-price-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }
          .mobile-price-bar-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .mobile-price-bar-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-left: auto;
          }
          .mobile-price-toggle-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: #FAF7F4;
            border: 1px solid #E5D5C5;
            border-radius: 999px;
            padding: 6px 14px;
            font-size: 13px;
            line-height: 18px;
            color: #55504B;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .mobile-price-toggle-btn.is-filtered {
            background: rgba(217, 168, 92, 0.12);
            border-color: #D9A85C;
            color: #8C5E1B;
            font-weight: 600;
          }
          .mobile-price-reset {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            color: #D98A9C;
            font-size: 12px;
            cursor: pointer;
            padding: 4px 6px;
            font-weight: 500;
          }
          .mobile-price-expanded {
            margin-top: 10px;
            padding: 12px 14px 6px;
            background: #FFFDFB;
            border: 1.5px solid #F0E3D6;
            border-radius: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          }
          .mobile-price-expanded-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
          }

          /* Product grid: 3 columns */
          .shop-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 36px 16px;
            margin-top: 4px;
          }
          .shop-empty {
            padding: 48px 0 !important;
          }
          .card-details {
            margin-top: 10px !important;
            gap: 4px !important;
          }
          .card-title {
            font-size: 18px !important;
            line-height: 25px !important;
          }
          .card-price-row {
            flex-wrap: wrap;
            align-items: baseline !important;
            gap: 0 12px;
          }
          .card-price {
            font-size: 17px !important;
          }
          .card-add-btn {
            font-size: 16px !important;
            line-height: 22px !important;
          }
        }

        /* ═════ Phones ═════ */
        @media (max-width: 600px) {
          .shop-container {
            --gutter: 16px;
          }
          .shop-main {
            padding: 18px 0 52px 0 !important;
          }
          .shop-title {
            font-size: 26px !important;
            line-height: 34px !important;
          }
          .shop-header-actions {
            width: 100%;
            justify-content: space-between;
          }
          .shop-sort-container {
            margin-left: auto;
          }
          .shop-sort-select {
            padding: 6px 28px 6px 12px;
            font-size: 13px;
          }
          .shop-clear-btn {
            font-size: 15px !important;
          }
          .mobile-categories-box {
            padding: 12px 10px 10px !important;
            border-radius: 14px !important;
          }
          .mobile-cat-grid {
            gap: 6px !important;
          }
          .mobile-cat-tile {
            padding: 6px 8px !important;
            min-height: 40px !important;
          }
          .mobile-cat-tile-avatar {
            width: 24px !important;
            height: 24px !important;
          }
          .mobile-cat-tile-name {
            font-size: 11.5px !important;
            line-height: 14px !important;
          }
          /* Product grid: 2 columns, price + "Add to bag" stacked */
          .shop-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px 12px;
          }
          .card-title {
            font-size: 14.5px !important;
            line-height: 20px !important;
          }
          .card-price-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0;
          }
          .card-price {
            font-size: 15.5px !important;
          }
          .card-add-btn {
            font-size: 14px !important;
            line-height: 20px !important;
          }
          .wishlist-btn {
            top: 8px !important;
            right: 8px !important;
            width: 34px !important;
            height: 34px !important;
          }
          .shop-empty-text {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
