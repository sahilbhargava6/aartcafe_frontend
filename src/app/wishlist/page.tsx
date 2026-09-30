"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToBag } = useCart();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FAF6F0" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Page Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#F3EBE1", padding: "6px 16px", borderRadius: "20px", marginBottom: "12px" }}>
            <Heart size={16} color="#D98A9C" fill="#D98A9C" />
            <span style={{ fontSize: "14px", color: "#6E6E6E", fontWeight: 500 }}>Your Saved Favorites</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: "36px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFF",
              borderRadius: "20px",
              padding: "60px 20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              border: "1px solid #EBE5DB",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(217, 138, 156, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Heart size={36} color="#D98A9C" />
            </div>
            <h2 className="font-serif" style={{ fontSize: "24px", color: "#3F3B38", marginBottom: "10px" }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: "#6E6E6E", fontSize: "15px", marginBottom: "28px", lineHeight: "22px" }}>
              Explore our handcrafted collections and click the heart icon on any product to save your favorites for later!
            </p>
            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#D9A85C",
                color: "#FFF",
                padding: "14px 28px",
                borderRadius: "30px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "15px",
                transition: "all 0.2s",
              }}
            >
              Explore Shop <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {wishlist.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                  border: "1px solid #EBE5DB",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  title="Remove from Wishlist"
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    zIndex: 2,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    color: "#E05A47",
                  }}
                >
                  <Trash2 size={16} />
                </button>

                {/* Product Image */}
                <Link href={item.slug ? `/shop/${item.slug}` : "/shop"} style={{ position: "relative", height: "240px", backgroundColor: "#FAF6F0", display: "block" }}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                      No Image
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#8FB9A8", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
                      {item.category || "General"}
                    </span>
                    <h3 className="font-serif" style={{ fontSize: "18px", color: "#3F3B38", margin: "6px 0 10px", fontWeight: 500 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "17px", fontWeight: 700, color: "#D9A85C", margin: "0 0 16px" }}>
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      addToBag({
                        id: String(item.id),
                        title: item.title,
                        price: item.price,
                        image: item.image,
                        category: item.category,
                      });
                    }}
                    style={{
                      width: "100%",
                      height: "44px",
                      borderRadius: "22px",
                      backgroundColor: "#3F3B38",
                      color: "#FFF",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "backgroundColor 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A85C")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3F3B38")}
                  >
                    <ShoppingBag size={16} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
