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

export const metadata: Metadata = {
  title: "Aartcafe | Personalized Handmade Frames & Keepsakes",
  description: "Personalized handmade frames, keepsakes, and festive treasures designed to tell your story. Handcrafted with love, meant for the heart.",
};

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
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
