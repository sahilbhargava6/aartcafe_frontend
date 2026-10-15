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

import Script from "next/script";
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
      <head>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1444527000954487');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1444527000954487&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
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
