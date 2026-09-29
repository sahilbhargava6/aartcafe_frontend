"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappNumber = "918851475721"; // Creator's WhatsApp Business Number
  const message = encodeURIComponent("Hello Aartcafe! I have an inquiry about custom handmade frames.");

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp Business"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#25D366",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 6px 20px rgba(37, 211, 102, 0.4)",
        zIndex: 9999,
        transition: "transform 0.3s ease, boxShadow 0.3s ease",
        cursor: "pointer",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <MessageCircle size={28} fill="#fff" color="#25D366" />
    </a>
  );
}
