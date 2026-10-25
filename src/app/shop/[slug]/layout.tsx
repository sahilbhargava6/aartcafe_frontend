import type { Metadata } from "next";
import { salePrice, formatRupees } from "@/lib/price";

const API = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api";

// When a product page is shared (WhatsApp, Facebook, …), the preview shows that product's photo,
// name and price. The photo comes as a JPEG card from the backend, since not every app shows WebP.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/products/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 600 } });
    if (!res.ok) return {};
    const product = await res.json();
    if (!product?.id || !product.title) return {};

    const summary = String(product.description || "").replace(/\s+/g, " ").trim();
    const description = `${formatRupees(salePrice(product))} · ${summary && summary !== "No description filled." ? summary.slice(0, 150) + (summary.length > 150 ? "…" : "") : "❤️"}`;
    const title = `${product.title} | Aartcafe`;
    // A product without a photo shares the site card instead
    const hasPhoto = Boolean(product.image || (Array.isArray(product.images) && product.images.length));
    const images = [
      hasPhoto
        ? { url: `${API}/products/${product.id}/share-image`, width: 1200, height: 630, alt: product.title }
        : { url: "/images/share.jpg", width: 1200, height: 630, alt: "Aartcafe" },
    ];

    return {
      title,
      description,
      openGraph: {
        type: "website",
        siteName: "Aartcafe",
        locale: "en_IN",
        url: `/shop/${slug}`,
        title,
        description,
        images,
      },
      twitter: { card: "summary_large_image", title, description, images: [images[0].url] },
    };
  } catch {
    return {};
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
