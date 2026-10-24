"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { openWhatsApp, getDirectWhatsAppUrl } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919267943830"; // Business WhatsApp Number (+91 9267943830)
  const messageText = "Hello Aartcafe! I have an inquiry about custom handmade frames.";
  const directUrl = getDirectWhatsAppUrl(whatsappNumber, messageText);

  return (
    <>
      <a
        href={directUrl}
        onClick={(e) => {
          e.preventDefault();
          openWhatsApp(whatsappNumber, messageText);
        }}
        title="Chat on WhatsApp Business"
        className={`whatsapp-fab${pathname === "/cart" ? " whatsapp-fab--bag" : ""}`}
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

      <style jsx>{`
        /* Phones / small tablets: a little smaller and tucked closer to the corner */
        @media (max-width: 768px) {
          .whatsapp-fab {
            width: 52px !important;
            height: 52px !important;
            right: 16px !important;
            bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
        /* The bag page already sends the order through WhatsApp; once its columns stack, the floating
           button would sit over the full-width "send the order list" button, so leave it out there */
        @media (max-width: 992px) {
          .whatsapp-fab--bag {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
