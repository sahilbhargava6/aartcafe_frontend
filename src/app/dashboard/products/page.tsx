"use client";

import React from "react";

export default function ProductsDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
        PRODUCTS
      </h1>
      <div style={{ border: "2px solid #D98A9C", borderRadius: "15px", padding: "30px", backgroundColor: "#fff" }}>
        <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px" }}>
          Add, edit, or remove Aartcafe frames and handmade items.
        </p>
      </div>
    </div>
  );
}
