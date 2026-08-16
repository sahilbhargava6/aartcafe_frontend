"use client";

import React from "react";

export default function BannersDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
        BANNERS
      </h1>
      <div style={{ border: "2px solid #8FB9A8", borderRadius: "15px", padding: "30px", backgroundColor: "#fff" }}>
        <p className="font-sans" style={{ color: "#6E6E6E", fontSize: "16px" }}>
          Configure headers and special promotional banners for your pages here.
        </p>
      </div>
    </div>
  );
}
