"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, X, Check } from "lucide-react";
import { normalizeCategories, mainCategoriesOf, childrenOf, pathTo } from "@/lib/categories";

const API = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api";
const MAX = 4;

type Category = { id: number; name: string; parent_ids: number[]; products_count?: number; footer_order?: number | null };

// The footer's "Shop Collections" list: up to four categories or sub-categories, in the order shown
export default function FooterCollectionsDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories.");
        return res.json();
      })
      .then((raw: (Omit<Category, "parent_ids"> & { parent_ids?: number[]; parent_id?: number | null })[]) => {
        const data: Category[] = normalizeCategories(raw);
        setCategories(data);
        setSelected(
          data
            .filter((c) => c.footer_order)
            .sort((a, b) => Number(a.footer_order) - Number(b.footer_order))
            .map((c) => c.id)
        );
      })
      .catch(() => setError("Could not load categories from server."))
      .finally(() => setLoading(false));
  }, []);

  const mainCategories = mainCategoriesOf(categories);
  const findCategory = (id: number) => categories.find((c) => c.id === id);

  // Sub-categories as chips, each followed by its own sub-categories (as deep as they go)
  const subTree = (parentId: number, path: number[]): React.ReactNode => {
    const subs = childrenOf(categories, parentId).filter((c) => !path.includes(c.id));
    if (subs.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginLeft: "24px" }}>
        {subs.map((sub) => {
          const nested = subTree(sub.id, [...path, sub.id]);
          return nested ? (
            <div key={sub.id} style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{chip(sub, true)}</div>
              {nested}
            </div>
          ) : (
            <React.Fragment key={sub.id}>{chip(sub, true)}</React.Fragment>
          );
        })}
      </div>
    );
  };

  const toggle = (id: number) => {
    setStatus("idle");
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX ? [...prev, id] : prev));
  };

  const move = (index: number, delta: number) => {
    setStatus("idle");
    setSelected((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  };

  const save = async () => {
    setStatus("saving");
    setError("");
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${API}/footer-categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Could not save. Please try again.");
      }
      setStatus("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Please try again.");
      setStatus("idle");
    }
  };

  const chip = (category: Category, isSub: boolean) => {
    const isSelected = selected.includes(category.id);
    const isFull = !isSelected && selected.length >= MAX;
    return (
      <button
        key={category.id}
        type="button"
        onClick={() => toggle(category.id)}
        disabled={isFull}
        aria-pressed={isSelected}
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "36px", padding: "4px 14px",
          borderRadius: "20px", fontSize: isSub ? "13px" : "15px", fontWeight: isSelected ? 600 : isSub ? 400 : 500,
          border: isSelected ? `1.5px solid ${isSub ? "#8FB9A8" : "#D98A9C"}` : "1.5px solid #EBE5DB",
          backgroundColor: isSelected ? (isSub ? "#E9F5F0" : "#FFEAEF") : "#fff",
          color: isSelected ? (isSub ? "#4E8E76" : "#D98A9C") : isSub ? "#6E6E6E" : "#3F3B38",
          cursor: isFull ? "not-allowed" : "pointer", opacity: isFull ? 0.45 : 1, transition: "all 0.2s ease",
        }}
      >
        {isSelected && <Check size={14} />}
        {category.name}
      </button>
    );
  };

  const card: React.CSSProperties = { border: "2px solid #D9A85C", borderRadius: "15px", backgroundColor: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" };
  const iconButton: React.CSSProperties = {
    width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px",
    border: "1px solid #EBE5DB", backgroundColor: "#fff", color: "#6E6E6E", cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          FOOTER COLLECTIONS
        </h1>
        <button
          type="button"
          onClick={save}
          disabled={loading || status === "saving"}
          style={{
            display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#D98A9C", color: "#fff", border: "none",
            borderRadius: "10px", padding: "10px 20px", fontSize: "16px", fontWeight: 500,
            cursor: loading || status === "saving" ? "default" : "pointer", opacity: loading || status === "saving" ? 0.7 : 1,
          }}
        >
          {status === "saving" ? "Saving…" : status === "saved" ? <><Check size={18} /> Saved</> : "Save"}
        </button>
      </div>

      <p className="font-sans" style={{ margin: 0, fontSize: "15px", lineHeight: "22px", color: "#6E6E6E" }}>
        Choose up to four categories or sub-categories for the &ldquo;Shop Collections&rdquo; list in the website footer.
        Until you choose any, the footer shows your four biggest categories.
      </p>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      <div style={card}>
        <h2 className="font-serif" style={{ margin: 0, fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
          In the footer, in this order
        </h2>
        {selected.length === 0 ? (
          <p style={{ margin: 0, fontSize: "14px", color: "#8B7E74" }}>Nothing chosen yet: the footer shows your four biggest categories.</p>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {selected.map((id, index) => {
              const category = findCategory(id);
              const where = category && category.parent_ids.length > 0 ? pathTo(categories, category).slice(0, -1).map((c) => c.name).join(" › ") : "";
              return (
                <li key={id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "10px", backgroundColor: "#FAF6F0" }}>
                  <span style={{ width: "22px", textAlign: "center", fontWeight: 600, color: "#D9A85C" }}>{index + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: "15px", color: "#3F3B38", overflowWrap: "anywhere" }}>
                    {category?.name || `Category #${id}`}
                    {where && <span style={{ fontSize: "12px", color: "#8B7E74" }}> (in {where})</span>}
                  </span>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" style={{ ...iconButton, opacity: index === 0 ? 0.35 : 1 }}>
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1} aria-label="Move down" style={{ ...iconButton, opacity: index === selected.length - 1 ? 0.35 : 1 }}>
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => toggle(id)} aria-label="Remove" style={{ ...iconButton, color: "#E05A47" }}>
                    <X size={16} />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div style={card}>
        <h2 className="font-serif" style={{ margin: 0, fontSize: "20px", fontWeight: 400, color: "#3F3B38" }}>
          Choose categories <span style={{ fontSize: "14px", color: "#8B7E74" }}>({selected.length} of {MAX} chosen)</span>
        </h2>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#8FB9A8" }}>Loading categories...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mainCategories.map((main) => (
              <div key={main.id} style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "12px", borderBottom: "1px dashed #EBE5DB" }}>
                <div>{chip(main, false)}</div>
                {subTree(main.id, [main.id])}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
