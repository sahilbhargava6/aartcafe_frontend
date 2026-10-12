import type { Metadata } from "next";
import { Playfair_Display, Sacramento, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sacramento = Sacramento({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sacramento",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const siteTitle = "Aartcafe | Personalized Handmade Frames & Keepsakes";
const siteDescription = "Personalized handmade frames, keepsakes, and festive treasures designed to tell your story. Handcrafted with love, meant for the heart.";

export const metadata: Metadata = {
  // Link previews (WhatsApp, Facebook, …) need absolute addresses; product pages set their own photo
  metadataBase: new URL("https://www.aartcafe.com"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: "Aartcafe",
    locale: "en_IN",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/images/share.jpg", width: 1200, height: 630, alt: "Aartcafe: Made by hands. Kept forever." }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/share.jpg"],
  },
};

import { WishlistProvider } from "@/context/WishlistContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sacramento.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#3F3B38]">
        <CartProvider>
          <WishlistProvider>
            {children}
            <WhatsAppButton />
            <AnalyticsTracker />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
