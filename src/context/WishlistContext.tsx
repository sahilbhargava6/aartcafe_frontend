"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WishlistItem {
  id: string | number;
  title: string;
  price: number;
  image: string;
  slug?: string;
  category?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string | number) => boolean;
  removeFromWishlist: (id: string | number) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("aartcafe-wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load wishlist", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aartcafe-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.some((i) => String(i.id) === String(item.id));
      if (exists) {
        return prev.filter((i) => String(i.id) !== String(item.id));
      } else {
        return [...prev, item];
      }
    });
  };

  const isInWishlist = (id: string | number) => {
    return wishlist.some((item) => String(item.id) === String(id));
  };

  const removeFromWishlist = (id: string | number) => {
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
