"use client";

import React, { useState, useEffect } from "react";

type Point = { label: string; visitors: number; sessions: number; page_views: number; bounce_rate: number; avg_session_secs: number };
type Summary = Omit<Point, "label"> & { orders: number; revenue: number; conversion_rate: number };
type Report = {
  cards: { visitors_today: number; visitors_week: number };
  summary: Summary;
  series: Point[];
  top_pages: { path: string; views: number }[];
  top_referrers: { source: string; visits: number }[];
  devices: Record<string, number> | [];
};

const METRICS: { name: string; key: Exclude<keyof Point, "label">; format: (v: number) => string }[] = [
  { name: "Users", key: "visitors", format: (v) => String(v) },
  { name: "Page Views", key: "page_views", format: (v) => String(v) },
  { name: "Bounce Rate", key: "bounce_rate", format: (v) => `${v}%` },
  { name: "Session Duration", key: "avg_session_secs", format: (v) => formatDuration(v) },
];
const DATE_RANGES = [
  { name: "Today", value: "today" },
  { name: "Week", value: "week" },
  { name: "Month", value: "month" },
  { name: "Year", value: "year" },
  { name: "Custom Date", value: "custom" },
];

const OUTDATED_BACKEND =
  "Analytics isn't available on the server yet. Deploy the latest backend (and run its migrations), then reload this page.";

// The old /analytics/website endpoint returned { status, data: { latest, history } };
// only accept the current report shape so a stale backend can't crash the page.
function parseReport(json: unknown): Report | null {
  const r = json as Partial<Report> | null;
  if (!r || typeof r !== "object" || !r.cards || !r.summary || !Array.isArray(r.series)) return null;
  return {
    cards: r.cards,
    summary: r.summary,
    series: r.series,
    top_pages: Array.isArray(r.top_pages) ? r.top_pages : [],
    top_referrers: Array.isArray(r.top_referrers) ? r.top_referrers : [],
    devices: r.devices && typeof r.devices === "object" ? r.devices : {},
  };
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

const formatRupees = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const boxStyle = (color: string): React.CSSProperties => ({
  border: `2px solid ${color}`,
  borderRadius: "15px",
  backgroundColor: "#fff",
  minHeight: "220px",
  padding: "24px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
});

const boxTitle: React.CSSProperties = { fontSize: "20px", color: "#3F3B38", margin: 0, fontWeight: 600 };
const emptyText: React.CSSProperties = { color: "#BCAEA2", fontSize: "14px", margin: 0 };

// Horizontal bar list used by Top Pages, Traffic Sources and Devices
function BarList({ rows, color }: { rows: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#3F3B38", gap: "12px" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
            <span style={{ fontWeight: 600 }}>{r.value}</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", backgroundColor: "#F5EDE8" }}>
            <div style={{ width: `${(r.value / max) * 100}%`, height: "100%", borderRadius: "3px", backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WebsiteAnalytics() {
  const [activeMetric, setActiveMetric] = useState(METRICS[0]);
  const [activeRange, setActiveRange] = useState("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = (range: string, from?: string, to?: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const params = new URLSearchParams({ range });
    if (range === "custom" && from && to) {
      params.set("from", from);
      params.set("to", to);
    }

    fetch(`https://aartcafe-backend-production-rjudvs.laravel.cloud/api/analytics/website?${params}`, {
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(async (res) => {
        if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
        if (!res.ok) throw new Error("Could not load website analytics.");
        const parsed = parseReport(await res.json());
        if (!parsed) throw new Error(OUTDATED_BACKEND);
        setReport(parsed);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeRange !== "custom") loadReport(activeRange);
  }, [activeRange]);

  const series = report?.series || [];
  const values = series.map((p) => Number(p[activeMetric.key]) || 0);
  const hasData = values.some((v) => v > 0);

  // Chart geometry (viewBox 600x200, plot area x 50–580, y 20–170)
  const maxVal = Math.max(1, ...values);
  const points = values.map((v, i) => ({
    x: 50 + (series.length > 1 ? (i * 530) / (series.length - 1) : 265),
    y: 170 - (v / maxVal) * 150,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(series.length / 8));

  const summary = report?.summary;
  const devices = report?.devices && !Array.isArray(report.devices) ? Object.entries(report.devices) : [];
  const referralVisits = (report?.top_referrers || []).reduce((sum, r) => sum + Number(r.visits), 0);
  const directVisits = Math.max(0, (summary?.sessions || 0) - referralVisits);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
      <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400, letterSpacing: "1px" }}>
        WEBSITE ANALYTICS
      </h1>

      {error && <div style={{ color: "#E05A47", fontSize: "16px", fontWeight: 500 }}>{error}</div>}

      {/* ROW 1: VISITOR COUNTS & PERFORMANCE CHART */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.4fr", gap: "24px", alignItems: "stretch" }}>
        <div
          style={{
            backgroundColor: "#D98A9C",
            borderRadius: "15px",
            padding: "36px 30px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "40px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <h3 className="font-sans" style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 10px 0", opacity: 0.9 }}>
              Visitors Today
            </h3>
            <span className="font-serif" style={{ fontSize: "40px", fontWeight: 500 }}>
              {report ? report.cards.visitors_today : "–"}
            </span>
          </div>
          <div>
            <h3 className="font-sans" style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 10px 0", opacity: 0.9 }}>
              Visitors (Last 7 Days)
            </h3>
            <span className="font-serif" style={{ fontSize: "40px", fontWeight: 500 }}>
              {report ? report.cards.visitors_week : "–"}
            </span>
          </div>
        </div>

        <div
          style={{
            border: "1.5px solid #8FB9A8",
            borderRadius: "15px",
            padding: "24px 30px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: 0, fontWeight: 600 }}>
                Website Performance
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {METRICS.map((m) => {
                  const isActive = activeMetric.name === m.name;
                  return (
                    <button
                      key={m.name}
                      onClick={() => setActiveMetric(m)}
                      className="font-sans"
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        border: isActive ? "none" : "1px solid #8FB9A8",
                        backgroundColor: isActive ? "#8FB9A8" : "transparent",
                        color: isActive ? "#fff" : "#8FB9A8",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              {DATE_RANGES.map((r) => {
                const isActive = activeRange === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => {
                      if (r.value === activeRange) return;
                      setActiveRange(r.value);
                      if (r.value !== "custom") setLoading(true);
                    }}
                    className="font-sans"
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: isActive ? "2px solid #8FB9A8" : "none",
                      color: isActive ? "#8FB9A8" : "#BCAEA2",
                      padding: "4px 0",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>

          {activeRange === "custom" && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", fontSize: "14px", color: "#6E6E6E" }}>
              <input type="date" aria-label="From date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={{ height: "34px", borderRadius: "8px", border: "1px solid #8FB9A8", padding: "0 10px" }} />
              to
              <input type="date" aria-label="To date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={{ height: "34px", borderRadius: "8px", border: "1px solid #8FB9A8", padding: "0 10px" }} />
              <button
                onClick={() => {
                  setLoading(true);
                  loadReport("custom", customFrom, customTo);
                }}
                disabled={!customFrom || !customTo || customFrom > customTo}
                style={{ height: "34px", padding: "0 16px", borderRadius: "8px", border: "none", backgroundColor: "#8FB9A8", color: "#fff", fontWeight: 500, cursor: "pointer", opacity: !customFrom || !customTo || customFrom > customTo ? 0.5 : 1 }}
              >
                Apply
              </button>
            </div>
          )}

          {/* Range total for the selected metric */}
          {summary && (
            <div style={{ fontSize: "14px", color: "#6E6E6E" }}>
              {activeMetric.name} for this period:{" "}
              <b style={{ color: "#3F3B38", fontSize: "18px" }}>{activeMetric.format(Number(summary[activeMetric.key]) || 0)}</b>
            </div>
          )}

          <div style={{ width: "100%", height: "220px", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              {[20, 70, 120].map((y) => (
                <line key={y} x1="50" y1={y} x2="580" y2={y} stroke="#F5EDE8" strokeWidth="1" strokeDasharray="3,3" />
              ))}
              <line x1="50" y1="170" x2="580" y2="170" stroke="#EBE5DB" strokeWidth="1.5" />
              <line x1="50" y1="20" x2="50" y2="170" stroke="#EBE5DB" strokeWidth="1.5" />
              <text x="44" y="24" textAnchor="end" fontSize="10" fill="#BCAEA2">{activeMetric.format(maxVal)}</text>
              <text x="44" y="173" textAnchor="end" fontSize="10" fill="#BCAEA2">0</text>
              {series.map((p, i) =>
                i % labelEvery === 0 ? (
                  <text key={p.label} x={points[i].x} y="188" textAnchor="middle" fontSize="10" fill="#BCAEA2">{p.label}</text>
                ) : null
              )}
              {points.length > 0 && (
                <path d={path} fill="none" stroke="#3F3B38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {points.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#3F3B38" stroke="#fff" strokeWidth="1.5">
                  <title>{`${series[i].label}: ${activeMetric.format(values[i])}`}</title>
                </circle>
              ))}
            </svg>
            {!loading && report && !hasData && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#BCAEA2", fontSize: "15px" }}>
                No visits recorded in this period yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: TOP PAGES + ORDERS */}
      <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr", gap: "24px" }}>
        <div style={boxStyle("#D9A85C")}>
          <h3 className="font-serif" style={boxTitle}>Top Pages</h3>
          {report && report.top_pages.length > 0 ? (
            <BarList rows={report.top_pages.map((p) => ({ label: p.path, value: Number(p.views) }))} color="#D9A85C" />
          ) : (
            <p style={emptyText}>No page views yet.</p>
          )}
        </div>

        <div style={boxStyle("#D98A9C")}>
          <h3 className="font-serif" style={boxTitle}>Orders</h3>
          {summary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "15px", color: "#6E6E6E" }}>
              <div>Orders <div className="font-serif" style={{ fontSize: "28px", color: "#3F3B38" }}>{summary.orders}</div></div>
              <div>Revenue <div className="font-serif" style={{ fontSize: "28px", color: "#3F3B38" }}>{formatRupees(summary.revenue)}</div></div>
              <div>Conversion (orders per visit): <b style={{ color: "#3F3B38" }}>{summary.conversion_rate}%</b></div>
            </div>
          ) : (
            <p style={emptyText}>–</p>
          )}
        </div>
      </div>

      {/* ROW 3: TRAFFIC SOURCES + DEVICES */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        <div style={boxStyle("#8FB9A8")}>
          <h3 className="font-serif" style={boxTitle}>Traffic Sources</h3>
          {summary && summary.sessions > 0 ? (
            <BarList
              rows={[
                ...(report?.top_referrers || []).map((r) => ({ label: r.source, value: Number(r.visits) })),
                { label: "Direct / other", value: directVisits },
              ].sort((a, b) => b.value - a.value)}
              color="#8FB9A8"
            />
          ) : (
            <p style={emptyText}>No visits yet.</p>
          )}
        </div>

        <div style={boxStyle("#D9A85C")}>
          <h3 className="font-serif" style={boxTitle}>Devices</h3>
          {devices.length > 0 ? (
            <BarList
              rows={devices.map(([device, count]) => ({ label: device.charAt(0).toUpperCase() + device.slice(1), value: count })).sort((a, b) => b.value - a.value)}
              color="#D9A85C"
            />
          ) : (
            <p style={emptyText}>No visits yet.</p>
          )}
          {summary && summary.sessions > 0 && (
            <div style={{ fontSize: "14px", color: "#6E6E6E", marginTop: "auto" }}>
              {summary.sessions} visits · {summary.page_views} page views · bounce {summary.bounce_rate}% · avg {formatDuration(summary.avg_session_secs)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
