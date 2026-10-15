"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Search, User, ShoppingBag, Heart, X, Menu, Package, ArrowRight, History, LayoutGrid } from "lucide-react";
import { type CategoryNode, normalizeCategories, mainCategoriesOf, pathTo } from "@/lib/categories";
import { buildSearchIndex, searchProducts, searchCategories, searchSuggestions, correctedQuery, highlightParts, productCountIn, normalizeText } from "@/lib/search";

const CATEGORIES_API = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/categories";
const RECENT_SEARCHES_KEY = "aartcafe_recent_searches";

type SearchProduct = {
  id: number | string;
  slug?: string;
  title?: string;
  description?: string;
  image?: string;
  base_price?: number | string;
  discount_price?: number | string | null;
  categoryIds: number[];
};

// One row of the search panel (the arrow keys move through them in order)
type SearchOption =
  | { kind: "suggestion" | "recent"; text: string }
  | { kind: "category"; category: CategoryNode }
  | { kind: "product"; product: SearchProduct }
  | { kind: "all" };

const optionKey = (o: SearchOption) =>
  o.kind + ":" + (o.kind === "category" ? o.category.id : o.kind === "product" ? o.product.id : o.kind === "all" ? "" : o.text);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [searchCategoryList, setSearchCategoryList] = useState<CategoryNode[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  // The row picked with the arrow keys (-1 = none: Enter searches what is typed)
  const [activeIndex, setActiveIndex] = useState(-1);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Festive Specials", path: "/festive-specials" },
    { name: "Wedding Celebration", path: "/wedding-celebration" },
    { name: "Special offers", path: "/special-offers" },
  ];

  // Fetch products once for live search with fallback logic
  // Fetch products once for live search with parallel race
  useEffect(() => {
    let isMounted = true;
    const urls = [
      "http://localhost:8000/api/products",
      process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/products` : null,
      "https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products",
    ].filter(Boolean) as string[];

    const fetchProducts = async () => {
      try {
        const data = await Promise.any(
          urls.map(async (url) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout
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
            throw new Error("Failed");
          })
        );
        if (isMounted && Array.isArray(data)) {
          setAllProducts(
            data.map((p: { categories?: { id: number | string }[]; category?: { id: number | string } | null }) => ({
              ...(p as SearchProduct),
              categoryIds: (p.categories?.length ? p.categories : p.category ? [p.category] : []).map((c) => Number(c.id)),
            }))
          );
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Opening search: recent searches from this browser, and the category tree (fetched once)
  const openSearch = () => {
    setSearchOpen(true);
    setActiveIndex(-1);
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
      setRecentSearches(Array.isArray(saved) ? saved.filter((t) => typeof t === "string").slice(0, 5) : []);
    } catch {
      setRecentSearches([]);
    }
    if (searchCategoryList.length === 0) {
      fetch(CATEGORIES_API)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setSearchCategoryList(normalizeCategories(data).map((c) => ({ id: c.id, name: c.name, parent_ids: c.parent_ids })));
        })
        .catch(() => {});
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  const rememberSearch = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const next = [t, ...recentSearches.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5);
    setRecentSearches(next);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    setActiveIndex(-1);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Live results: ranked products (a category also finds its sub-categories' products), matching
  // categories, completions of what is typed and a spelling fix
  const query = searchQuery.trim();
  const searchIndex = useMemo(() => buildSearchIndex(allProducts, searchCategoryList), [allProducts, searchCategoryList]);
  const searchMatches = useMemo(() => (query ? searchProducts(searchIndex, query) : []), [searchIndex, query]);
  const searchProductHits = searchMatches.slice(0, 6);
  const shopCategories = useMemo(() => searchCategoryList.filter((c) => normalizeText(c.name) !== "all"), [searchCategoryList]);
  const searchCategoryHits = useMemo(() => (query ? searchCategories(shopCategories, query).slice(0, 4) : []), [shopCategories, query]);
  const searchPhrases = useMemo(
    () => [...shopCategories.map((c) => c.name), ...allProducts.map((p) => p.title || "")],
    [shopCategories, allProducts]
  );
  const searchSuggestionList = useMemo(() => (query ? searchSuggestions(searchPhrases, query, 4) : []), [searchPhrases, query]);
  const searchCorrection = useMemo(() => (query ? correctedQuery(searchPhrases, query) : null), [searchPhrases, query]);
  const categoryCounts = useMemo(
    () => new Map(shopCategories.map((c) => [c.id, productCountIn(searchCategoryList, allProducts, c.id)])),
    [shopCategories, searchCategoryList, allProducts]
  );
  const popularCategories = useMemo(
    () => mainCategoriesOf(shopCategories).filter((c) => (categoryCounts.get(c.id) || 0) > 0)
      .sort((a, b) => (categoryCounts.get(b.id) || 0) - (categoryCounts.get(a.id) || 0)).slice(0, 6),
    [shopCategories, categoryCounts]
  );
  const searchOptions: SearchOption[] = query
    ? [
        ...searchSuggestionList.map((text) => ({ kind: "suggestion" as const, text })),
        ...searchCategoryHits.map((category) => ({ kind: "category" as const, category })),
        ...searchProductHits.map((product) => ({ kind: "product" as const, product })),
        ...(searchProductHits.length > 0 ? [{ kind: "all" as const }] : []),
      ]
    : [
        ...recentSearches.map((text) => ({ kind: "recent" as const, text })),
        ...popularCategories.map((category) => ({ kind: "category" as const, category })),
      ];

  const categoryLink = (category: CategoryNode) => `/shop?category=${encodeURIComponent(category.name)}`;
  const productLink = (product: SearchProduct) => `/shop/${product.slug || product.id}`;
  const allResultsLink = `/shop?search=${encodeURIComponent(query)}`;

  // Enter (or a click on a suggestion): suggestions fill the box, the rest open their page
  const chooseOption = (option: SearchOption | undefined) => {
    if (!option) return;
    if (option.kind === "suggestion" || option.kind === "recent") {
      setSearchQuery(option.text);
      setActiveIndex(-1);
      return;
    }
    if (option.kind === "all" && !query) return;
    if (query) rememberSearch(query);
    const href = option.kind === "category" ? categoryLink(option.category) : option.kind === "product" ? productLink(option.product) : allResultsLink;
    closeSearch();
    router.push(href);
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const count = searchOptions.length;
    if (count === 0) return;
    const next = e.key === "ArrowDown" ? (activeIndex + 1) % count : activeIndex <= 0 ? count - 1 : activeIndex - 1;
    setActiveIndex(next);
    requestAnimationFrame(() => document.getElementById(`search-option-${next}`)?.scrollIntoView({ block: "nearest" }));
  };

  const highlighted = (text: string) =>
    highlightParts(text, query).map((part, i) => (part.match ? <mark key={i}>{part.text}</mark> : <React.Fragment key={i}>{part.text}</React.Fragment>));

  // Google-style completion: what was typed stays plain, the rest of the suggestion is bold
  const completion = (text: string) => {
    const at = text.toLowerCase().indexOf(query.toLowerCase());
    if (at < 0) return <b>{text}</b>;
    return (
      <>
        {at > 0 && <b>{text.slice(0, at)}</b>}
        {text.slice(at, at + query.length)}
        <b>{text.slice(at + query.length)}</b>
      </>
    );
  };

  const categoryPath = (category: CategoryNode) => pathTo(searchCategoryList, category).map((c) => c.name).join(" › ");
  const productCategory = (product: SearchProduct) => {
    const category = searchCategoryList.find((c) => product.categoryIds.includes(c.id) && normalizeText(c.name) !== "all")
      || searchCategoryList.find((c) => product.categoryIds.includes(c.id));
    return category ? categoryPath(category) : "";
  };

  const renderSearchOption = (option: SearchOption, asChip = false) => {
    const index = searchOptions.findIndex((o) => optionKey(o) === optionKey(option));
    const common = {
      id: `search-option-${index}`,
      role: "option",
      "aria-selected": index === activeIndex,
      onMouseEnter: () => setActiveIndex(index),
      className: `search-option${asChip ? " search-chip" : ""}${index === activeIndex ? " is-active" : ""}`,
    };
    const followLink = () => {
      if (query) rememberSearch(query);
      closeSearch();
    };
    if (option.kind === "suggestion" || option.kind === "recent") {
      return (
        <button key={optionKey(option)} type="button" {...common} onClick={() => chooseOption(option)}>
          {option.kind === "recent" ? <History size={17} className="search-option-icon" /> : <Search size={17} className="search-option-icon" />}
          <span>{option.kind === "suggestion" ? completion(option.text) : option.text}</span>
        </button>
      );
    }
    if (option.kind === "category") {
      const count = categoryCounts.get(option.category.id) || 0;
      return asChip ? (
        <Link key={optionKey(option)} href={categoryLink(option.category)} {...common} onClick={followLink}>
          {option.category.name}
        </Link>
      ) : (
        <Link key={optionKey(option)} href={categoryLink(option.category)} {...common} onClick={followLink}>
          <LayoutGrid size={17} className="search-option-icon" />
          <span>{highlighted(categoryPath(option.category))}</span>
          <span className="search-option-meta">{count === 1 ? "1 product" : `${count} products`}</span>
        </Link>
      );
    }
    if (option.kind === "all") {
      return (
        <Link key="all" href={allResultsLink} {...common} className={`${common.className} search-option-all`} onClick={followLink}>
          <span>
            See all {searchMatches.length} {searchMatches.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </span>
          <ArrowRight size={17} />
        </Link>
      );
    }
    if (option.kind !== "product") return null;
    const prod = option.product;
    return (
      <Link key={optionKey(option)} href={productLink(prod)} {...common} className={`${common.className} search-result`} onClick={followLink}>
        {prod.image ? (
          <img src={prod.image} alt="" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "10px", flexShrink: 0, overflow: "hidden" }} />
        ) : (
          <div style={{ width: "50px", height: "50px", backgroundColor: "#EBE5DB", borderRadius: "10px", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: "16px", fontWeight: 500, color: "#3F3B38" }}>
            {highlighted(prod.title || "")}
          </div>
          {productCategory(prod) && (
            <div style={{ fontSize: "12px", color: "#8FB9A8", textTransform: "uppercase", fontWeight: 600, marginTop: "2px" }}>
              {productCategory(prod)}
            </div>
          )}
        </div>
        {prod.discount_price && Number(prod.discount_price) > 0 && Number(prod.discount_price) < Number(prod.base_price || 0) ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#D9A85C" }}>
              ₹{Number(prod.discount_price).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "12px", color: "#999", textDecoration: "line-through", marginTop: "1px" }}>
              ₹{Number(prod.base_price || 0).toLocaleString("en-IN")}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#D9A85C" }}>
            ₹{Number(prod.discount_price || prod.base_price || 0).toLocaleString("en-IN")}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      <header
        className="site-header"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          zIndex: 99,
          height: "100px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="site-header-inner"
          style={{
            width: "100%",
            maxWidth: "1920px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Brand/Logo */}
          <Link href="/" className="site-logo" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img src="/images/logo.webp" alt="Aartcafe" width={279} height={240} className="site-logo-img" />
          </Link>

          {/* Navigation Links - Desktop Only */}
          <nav
            className="desktop-nav"
            style={{
              display: "flex",
              gap: "0",
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="font-serif"
                  style={{
                    fontSize: "22px",
                    lineHeight: "32px",
                    fontWeight: 400,
                    color: isActive ? "#D9A85C" : "#3F3B38",
                    textDecoration: "none",
                    padding: "0 1.5rem",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#D9A85C";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#3F3B38";
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Utility Icons */}
          <div
            className="nav-icons"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Search */}
            <button
              className="nav-icon-btn"
              onClick={openSearch}
              aria-label="Search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Search size={28} strokeWidth={1.2} />
            </button>

            {/* Wishlist Heart Icon */}
            <Link
              href="/wishlist"
              style={{
                background: pathname === "/wishlist" ? "#D98A9C" : "none",
                border: "none",
                cursor: "pointer",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                color: pathname === "/wishlist" ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/wishlist") e.currentTarget.style.opacity = "0.6";
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/wishlist") e.currentTarget.style.opacity = "1";
              }}
            >
              <Heart size={26} strokeWidth={1.3} color={pathname === "/wishlist" ? "#fff" : "#3F3B38"} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "#D98A9C",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>



            {/* Bag/Cart */}
            <Link
              href="/cart"
              style={{
                background: pathname === "/cart" ? "#D9A85C" : "none",
                border: "none",
                cursor: "pointer",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                color: pathname === "/cart" ? "#fff" : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/cart") e.currentTarget.style.opacity = "0.6";
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/cart") e.currentTarget.style.opacity = "1";
              }}
            >
              <ShoppingBag size={28} strokeWidth={1.2} color={pathname === "/cart" ? "#fff" : "#000"} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "#D98A9C",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              className="mobile-toggle nav-icon-btn"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#000",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={28} strokeWidth={1.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay (full screen, above the floating WhatsApp button) */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          {/* Top bar mirrors the header so the close button sits where the menu button was */}
          <div
            className="mobile-menu-top"
            style={{
              height: "100px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center" }}>
              <img src="/images/logo.webp" alt="Aartcafe" width={279} height={240} className="menu-logo-img" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "44px",
                height: "44px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={32} color="#3F3B38" />
            </button>
          </div>

          <nav
            className="mobile-menu-nav"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 20px 64px",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="font-serif mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "26px",
                    fontWeight: 400,
                    color: isActive ? "#D9A85C" : "#3F3B38",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                    padding: "10px 16px",
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/wishlist"
              className="font-serif mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: "26px",
                color: "#D98A9C",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
              }}
            >
              <Heart size={24} /> My Wishlist ({wishlistCount})
            </Link>
          </nav>
        </div>
      )}

      {/* Live Search Overlay/Modal */}
      {searchOpen && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 20px 40px",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          <button
            className="search-close"
            aria-label="Close search"
            onClick={closeSearch}
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            <X size={28} color="#3F3B38" />
          </button>

          <div style={{ width: "100%", maxWidth: "680px", textAlign: "center" }}>
            <h2
              className="font-serif search-title"
              style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "#3F3B38", fontWeight: 400 }}
            >
              Search Aartcafe Catalog
            </h2>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                chooseOption(activeIndex >= 0 ? searchOptions[activeIndex] : { kind: "all" });
              }}
              style={{ position: "relative", width: "100%", marginBottom: "16px" }}
            >
              <input
                className="search-input"
                type="text"
                role="combobox"
                aria-label="Search products and categories"
                aria-expanded={searchOptions.length > 0}
                aria-controls="search-options"
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Search by product name, category, or keyword..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleSearchKey}
                autoFocus
                style={{
                  width: "100%",
                  padding: "1.1rem 3.5rem 1.1rem 1.8rem",
                  fontSize: "1.2rem",
                  borderRadius: "35px",
                  border: "1.5px solid #D9A85C",
                  outline: "none",
                  backgroundColor: "#FAF6F0",
                  color: "#3F3B38",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="search-input-icon search-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveIndex(-1);
                  }}
                >
                  <X size={22} color="#8B7E74" />
                </button>
              ) : (
                <Search
                  className="search-input-icon"
                  size={24}
                  color="#D9A85C"
                  style={{
                    position: "absolute",
                    right: "1.8rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              )}
            </form>

            <div id="search-options" role="listbox" aria-label="Search suggestions" className="search-panel">
              {searchQuery.trim() !== "" ? (
                <>
                  {/* Google-style spelling fix */}
                  {searchCorrection && (
                    <div className="search-correction">
                      Did you mean{" "}
                      <button type="button" onClick={() => setSearchQuery(searchCorrection)}>
                        {searchCorrection}
                      </button>
                      ?
                    </div>
                  )}

                  {searchSuggestionList.length > 0 && (
                    <div className="search-group">
                      {searchSuggestionList.map((text) => renderSearchOption({ kind: "suggestion", text }))}
                    </div>
                  )}

                  {searchCategoryHits.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">Categories</div>
                      {searchCategoryHits.map((category) => renderSearchOption({ kind: "category", category }))}
                    </div>
                  )}

                  {searchProductHits.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">Products</div>
                      {searchProductHits.map((product) => renderSearchOption({ kind: "product", product }))}
                      {renderSearchOption({ kind: "all" })}
                    </div>
                  )}

                  {searchProductHits.length === 0 && searchCategoryHits.length === 0 && (
                    <div className="search-empty">
                      No products found matching &quot;{searchQuery.trim()}&quot;. Try fewer words, or browse a category below.
                      <div className="search-chips">
                        {popularCategories.map((category) => (
                          <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} onClick={closeSearch} className="search-chip">
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {recentSearches.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">
                        Recent searches
                        <button type="button" className="search-group-action" onClick={clearRecentSearches}>
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((text) => renderSearchOption({ kind: "recent", text }))}
                    </div>
                  )}
                  {popularCategories.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-title">Popular categories</div>
                      <div className="search-chips">
                        {popularCategories.map((category) => renderSearchOption({ kind: "category", category }, true))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}




      {/* Global CSS for media queries */}
      <style jsx>{`
        /* Logo: fills most of the 100px bar (70px on phones, see below) */
        .site-logo-img {
          display: block;
          height: 72px;
          width: auto;
        }
        .menu-logo-img {
          display: block;
          height: 48px;
          width: auto;
        }

        /* Search panel: groups of rows (suggestions, categories, products), Google style */
        .search-overlay :global(.search-panel) {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .search-overlay :global(.search-group) {
          background-color: #fff;
          border: 1px solid #EBE5DB;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          padding: 6px 0;
        }
        .search-overlay :global(.search-group-title) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px 6px;
          font-size: 12px;
          color: #6E6E6E;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .search-overlay :global(.search-group-action) {
          background: none;
          border: none;
          padding: 4px;
          color: #D98A9C;
          font: inherit;
          cursor: pointer;
        }
        .search-overlay :global(.search-option) {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 11px 20px;
          background: none;
          border: none;
          font: inherit;
          font-size: 16px;
          color: #3F3B38;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
        }
        .search-overlay :global(.search-option.is-active) {
          background-color: #FAF6F0;
        }
        .search-overlay :global(.search-option b) {
          font-weight: 600;
        }
        .search-overlay :global(.search-option mark) {
          background: none;
          color: #C88E56;
          font-weight: 600;
        }
        .search-overlay :global(.search-option-icon) {
          flex-shrink: 0;
          color: #BCAEA2;
        }
        .search-overlay :global(.search-option-meta) {
          margin-left: auto;
          padding-left: 12px;
          font-size: 13px;
          color: #8B7E74;
          white-space: nowrap;
        }
        .search-overlay :global(.search-option-all) {
          justify-content: space-between;
          border-top: 1px solid #F3EEE6;
          color: #D98A9C;
          font-weight: 500;
        }
        .search-overlay :global(.search-chips) {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 6px 20px 12px;
        }
        .search-overlay :global(.search-option.search-chip),
        .search-overlay :global(.search-chip) {
          width: auto;
          padding: 8px 16px;
          border: 1px solid #EBE5DB;
          border-radius: 20px;
          background-color: #fff;
          font-size: 14px;
          color: #3F3B38;
          text-decoration: none;
        }
        .search-overlay :global(.search-option.search-chip.is-active),
        .search-overlay :global(.search-chip:hover) {
          background-color: #FAF6F0;
          border-color: #D9A85C;
        }
        .search-overlay :global(.search-correction) {
          padding: 0 8px;
          font-size: 15px;
          color: #6E6E6E;
        }
        .search-overlay :global(.search-correction button) {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          font-style: italic;
          font-weight: 600;
          color: #D98A9C;
          text-decoration: underline;
          cursor: pointer;
        }
        .search-overlay :global(.search-empty) {
          background-color: #fff;
          border: 1px solid #EBE5DB;
          border-radius: 20px;
          padding: 24px 20px 12px;
          font-size: 15px;
          color: #8B7E74;
          text-align: center;
        }
        .search-overlay :global(.search-empty .search-chips) {
          justify-content: center;
          padding: 16px 0 8px;
        }
        .search-overlay :global(.search-clear) {
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 50%;
          cursor: pointer;
        }

        @supports (height: 100dvh) {
          .mobile-menu,
          .search-overlay {
            height: 100dvh !important;
          }
        }

        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          /* 44px tap targets for every header icon */
          .nav-icon-btn {
            width: 44px;
            height: 44px;
            padding: 0 !important;
            flex-shrink: 0;
          }
          .nav-icons > :global(a) {
            flex-shrink: 0;
          }
          .site-header-inner > :global(.site-logo) {
            padding: 6px 0;
          }
        }

        @media (max-width: 768px) {
          .site-header {
            height: 70px !important;
          }
          .site-logo-img {
            height: 52px;
          }
          .site-header-inner {
            padding: 0 16px !important;
            gap: 12px;
          }
          .nav-icons {
            gap: 4px !important;
          }
          .mobile-menu-top {
            height: 70px !important;
            padding: 0 16px !important;
          }

          /* Search overlay: keep the close button clear of the title */
          .search-overlay {
            padding: 72px 16px 32px !important;
          }
          .search-close {
            top: 13px !important;
            right: 16px !important;
            width: 44px;
            height: 44px;
            padding: 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .search-title {
            font-size: 28px !important;
            line-height: 1.25 !important;
            margin-bottom: 20px !important;
          }
          .search-overlay :global(.search-result) {
            padding: 12px 16px !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 600px) {
          .search-title {
            font-size: 24px !important;
          }
          .search-input {
            padding: 14px 48px 14px 20px !important;
          }
          .search-overlay :global(.search-input-icon) {
            right: 18px !important;
            width: 22px;
            height: 22px;
          }
          .search-overlay :global(.search-clear) {
            right: 6px;
            width: 44px;
            height: 44px;
          }
          .search-overlay :global(.search-option) {
            padding: 11px 16px;
          }
          .search-overlay :global(.search-group-title),
          .search-overlay :global(.search-chips) {
            padding-left: 16px;
            padding-right: 16px;
          }
          .mobile-menu-nav > :global(.mobile-menu-link) {
            font-size: 24px !important;
          }
        }

        @media (max-width: 360px) {
          .site-logo-img {
            height: 46px;
          }
          .nav-icons {
            gap: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
