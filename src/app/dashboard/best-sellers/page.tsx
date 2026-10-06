"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function BestSellersDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products.");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load products from server.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleBestSeller = (prod: any) => {
    const updatedStatus = !prod.is_bestseller;
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/products/${prod.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...prod,
        is_bestseller: updatedStatus,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status.");
        fetchData();
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          BEST SELLERS
        </h1>
      </div>

      <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px", margin: 0 }}>
        Quickly toggle which products appear in the "Best Sellers" collection on the Website.
      </p>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      <div style={{ border: "2px solid #D9A85C", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>No products found. Add products first!</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #D9A85C" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>ID</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Product Title</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Category</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Toggle Feature</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "16px 24px", color: "#6E6E6E" }}>{prod.id}</td>
                  <td style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>{prod.title}</td>
                  <td style={{ padding: "16px 24px", color: "#D98A9C" }}>{prod.category?.name || "Uncategorized"}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span
                      style={{
                        padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 500,
                        backgroundColor: prod.is_bestseller ? "rgba(217,138,156,0.15)" : "#F5EDE8",
                        color: prod.is_bestseller ? "#D98A9C" : "#BCAEA2",
                      }}
                    >
                      {prod.is_bestseller ? "Featured" : "Not Featured"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button
                      onClick={() => toggleBestSeller(prod)}
                      style={{
                        backgroundColor: prod.is_bestseller ? "#D98A9C" : "transparent",
                        color: prod.is_bestseller ? "#fff" : "#D98A9C",
                        border: "1px solid #D98A9C", borderRadius: "8px",
                        padding: "6px 12px", fontSize: "14px", fontWeight: 500,
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Heart size={14} fill={prod.is_bestseller ? "#fff" : "none"} /> {prod.is_bestseller ? "Unfeature" : "Feature"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
