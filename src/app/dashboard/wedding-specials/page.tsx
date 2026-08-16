"use client";

import React from "react";

export default function WeddingSpecialsDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
        WEDDING SPECIALS
      </h1>
      <div style={{ border: "2px solid #D9A85C", borderRadius: "15px", padding: "30px", backgroundColor: "#fff" }}>
        <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px" }}>
          Edit the couple mandalas, description blocks, and thumbnails in the Wedding Specials section.
        </p>
      </div>
    </div>
  );
}
