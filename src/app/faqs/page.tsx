import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import FaqList, { type Faq } from "@/components/FaqList";

const API = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919267943830";

export const metadata: Metadata = {
  title: "FAQs | Aartcafe",
  description: "Answers to common questions about ordering, personalising, flower preservation, payment and order tracking at Aartcafe.",
};

// The questions are the "faqs" page in Dashboard → Pages: one question per block, an empty line
// between blocks; the first line of a block is the question, the lines under it the answer.
async function loadFaqs(): Promise<Faq[]> {
  try {
    const res = await fetch(`${API}/pages`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const pages = await res.json();
    const page = Array.isArray(pages) ? pages.find((p: { slug?: string }) => p.slug === "faqs") : null;
    return String(page?.content || "")
      .replace(/\r/g, "")
      .split(/\n\s*\n/)
      .map((block) => block.trim().split("\n"))
      .filter((lines) => lines[0]?.trim() && lines.length > 1)
      .map(([question, ...answer]) => ({ question: question.trim(), answer: answer.join("\n").trim() }));
  } catch {
    return [];
  }
}

export default async function FaqsPage() {
  const faqs = await loadFaqs();
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Aartcafe! I have a question.")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />
      <CartDrawer />

      <main style={{ flex: 1, padding: "48px 16px 80px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h1 className="font-serif" style={{ fontSize: "40px", lineHeight: "52px", fontWeight: 400, color: "#3F3B38", margin: 0 }}>
              Frequently Asked Questions
            </h1>
            <p className="font-sans" style={{ fontSize: "16px", lineHeight: "24px", color: "#8FB9A8", margin: 0 }}>
              Everything you need to know about ordering your handmade keepsake.
            </p>
          </div>

          {faqs.length > 0 ? (
            <FaqList faqs={faqs} />
          ) : (
            <p className="font-sans" style={{ textAlign: "center", fontSize: "16px", color: "#6E6E6E" }}>
              We are updating our FAQs. Message us on WhatsApp and we will answer any question.
            </p>
          )}

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <p className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: 0 }}>
              Still have a question?
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "46px",
                padding: "0 28px",
                borderRadius: "999px",
                backgroundColor: "#25D366",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Message us on WhatsApp
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
