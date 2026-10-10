"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  description?: string;
  productId?: number;
  optionIds?: number[];
  priceOnRequest?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToBag: (item: Omit<CartItem, "quantity">) => void;
  removeFromBag: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// "₹1,200", "₹1,200 + on request" or "On request" when the bag has price-on-request items
export function formatCartTotal(cart: CartItem[], cartTotal: number) {
  if (!cart.some((item) => item.priceOnRequest)) return `₹${cartTotal}`;
  return cartTotal > 0 ? `₹${cartTotal} + on request` : "On request";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Becomes true once the saved cart has been read, so the empty starting cart never overwrites it
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("aartcafe-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart data", e);
      }
    }
    setLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (loaded) localStorage.setItem("aartcafe-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToBag = (newItem: Omit<CartItem, "quantity">) => {
    // Cart ids are e.g. 12, "12" or "12-1728000000000"; placeholders like "fav-1" have no product
    const leadingId = String(newItem.id).match(/^\d+/);
    const productId = newItem.productId ?? (leadingId ? Number(leadingId[0]) : undefined);
    if (productId) trackEvent("add_to_bag", window.location.pathname, productId);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true); // Open the cart drawer automatically when adding an item
  };

  const removeFromBag = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBag(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addToBag,
        removeFromBag,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
