"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Download } from "lucide-react";

const API = "https://aartcafe-backend-production-rjudvs.laravel.cloud/api";

type Subscriber = { id: number; email: string; created_at: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Email sign-ups from the footer's "Stay Connected" box, with an Excel download
export default function SubscribersDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch(`${API}/subscribers`, { headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load subscribers.");
        return res.json();
      })
      .then((data) => setSubscribers(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not load subscribers from server."))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? subscribers.filter((s) => s.email.toLowerCase().includes(q)) : subscribers;
  }, [subscribers, searchQuery]);

  const downloadExcel = async () => {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.json_to_sheet(subscribers.map((s) => ({ Email: s.email, "Subscribed on": formatDate(s.created_at) })));
    sheet["!cols"] = [{ wch: 40 }, { wch: 24 }];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Subscribers");
    XLSX.writeFile(book, `aartcafe-subscribers-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const remove = (subscriber: Subscriber) => {
    if (!confirm(`Remove ${subscriber.email} from the list?`)) return;
    const token = localStorage.getItem("admin_token");
    fetch(`${API}/subscribers/${subscriber.id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove the subscriber.");
        setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id));
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400 }}>
          SUBSCRIBERS
        </h1>
        <button
          type="button"
          onClick={downloadExcel}
          disabled={subscribers.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#D98A9C", color: "#fff", border: "none",
            borderRadius: "10px", padding: "10px 16px", fontSize: "16px", fontWeight: 500,
            cursor: subscribers.length === 0 ? "default" : "pointer", opacity: subscribers.length === 0 ? 0.6 : 1,
          }}
        >
          <Download size={18} /> Download Excel
        </button>
      </div>

      <p className="font-sans" style={{ margin: 0, fontSize: "15px", lineHeight: "22px", color: "#6E6E6E" }}>
        Everyone who signed up through &ldquo;Stay Connected&rdquo; in the website footer, newest first.
      </p>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      <div style={{ position: "relative", maxWidth: "420px" }}>
        <Search size={18} color="#BCAEA2" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%", height: "42px", borderRadius: "10px", border: "1px solid #D9A85C", paddingLeft: "40px",
            paddingRight: "14px", fontSize: "15px", outline: "none", backgroundColor: "#fff", color: "#3F3B38", boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ fontSize: "14px", color: "#6E6E6E", padding: "0 4px" }}>
        Showing <b>{shown.length}</b> of <b>{subscribers.length}</b> subscribers
      </div>

      <div style={{ border: "2px solid #D9A85C", borderRadius: "15px", overflowX: "auto", backgroundColor: "#fff" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>Loading subscribers...</div>
        ) : shown.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8FB9A8" }}>
            {subscribers.length === 0 ? "No one has subscribed yet." : "No subscriber matches your search."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9F6F0", borderBottom: "2px solid #D9A85C" }}>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Email</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500 }}>Subscribed on</th>
                <th style={{ padding: "16px 24px", color: "#3F3B38", fontWeight: 500, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #EBE5DB" }}>
                  <td style={{ padding: "14px 24px", color: "#3F3B38", overflowWrap: "anywhere" }}>{s.email}</td>
                  <td style={{ padding: "14px 24px", color: "#8B7E74", whiteSpace: "nowrap" }}>{formatDate(s.created_at)}</td>
                  <td style={{ padding: "14px 24px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      aria-label={`Remove ${s.email}`}
                      style={{ background: "none", border: "none", color: "#E05A47", cursor: "pointer", padding: "6px" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
