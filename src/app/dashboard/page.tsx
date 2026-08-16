"use client";

import React, { useState, useEffect } from "react";

export default function WebsiteAnalytics() {
  const [activeMetric, setActiveMetric] = useState("Users");
  const [activeRange, setActiveRange] = useState("Week");
  const [stats, setStats] = useState({ dailyUsers: 1420, weeklyUsers: 9840 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/analytics/website")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.status === "success" && payload.data) {
          const latest = payload.data.latest;
          const history = payload.data.history;
          if (latest) {
            setStats({
              dailyUsers: latest.daily_user_count,
              weeklyUsers: latest.weekly_user_count,
            });
          }
          if (history) {
            setChartData(history);
          }
        }
      })
      .catch((err) => console.error("Error loading analytics from API:", err));
  }, []);

  const metrics = ["Users", "Bounce Rate", "Session Duration"];
  const dateRanges = ["Today", "Week", "Month", "Year", "Custom Date"];

  // Helper to generate SVG path from analytics data
  const getSvgPath = () => {
    if (!chartData || chartData.length === 0) {
      return "M 50 130 L 90 70 L 130 95 L 170 65 L 210 75 L 250 140 L 290 135 L 330 75 L 370 65 L 410 50 L 450 85";
    }
    const width = 500;
    const height = 120;
    const maxVal = Math.max(...chartData.map(d => activeMetric === "Users" ? d.daily_user_count : (activeMetric === "Bounce Rate" ? parseFloat(d.bounce_rate) : d.session_duration)));
    const minVal = Math.min(...chartData.map(d => activeMetric === "Users" ? d.daily_user_count : (activeMetric === "Bounce Rate" ? parseFloat(d.bounce_rate) : d.session_duration)));
    const range = maxVal - minVal || 1;

    return chartData.map((d, index) => {
      const val = activeMetric === "Users" ? d.daily_user_count : (activeMetric === "Bounce Rate" ? parseFloat(d.bounce_rate) : d.session_duration);
      const x = 50 + (index * (width / (chartData.length - 1 || 1)));
      const y = 150 - ((val - minVal) / range * height);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getPoints = () => {
    if (!chartData || chartData.length === 0) {
      return [
        { x: 50, y: 130 }, { x: 90, y: 70 }, { x: 130, y: 95 },
        { x: 170, y: 65 }, { x: 210, y: 75 }, { x: 250, y: 140 },
        { x: 290, y: 135 }, { x: 330, y: 75 }, { x: 370, y: 65 },
        { x: 410, y: 50 }, { x: 450, y: 85 }
      ];
    }
    const width = 500;
    const height = 120;
    const maxVal = Math.max(...chartData.map(d => activeMetric === "Users" ? d.daily_user_count : (activeMetric === "Bounce Rate" ? parseFloat(d.bounce_rate) : d.session_duration)));
    const minVal = Math.min(...chartData.map(d => activeMetric === "Users" ? d.daily_user_count : (activeMetric === "Bounce Rate" ? parseFloat(d.bounce_rate) : d.session_duration)));
    const range = maxVal - minVal || 1;

    return chartData.map((d, index) => {
      const val = activeMetric === "Users" ? d.daily_user_count : (activeMetric === "Bounce Rate" ? parseFloat(d.bounce_rate) : d.session_duration);
      const x = 50 + (index * (width / (chartData.length - 1 || 1)));
      const y = 150 - ((val - minVal) / range * height);
      return { x, y };
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
      
      {/* Page Title */}
      <h1 className="font-serif" style={{ fontSize: "28px", color: "#3F3B38", margin: 0, fontWeight: 400, letterSpacing: "1px" }}>
        WEBSITE ANALYTICS
      </h1>

      {/* ═══════════════════════════════════════════════════════
          ROW 1: STATS & PERFORMANCE CHART
          ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.4fr", gap: "24px", alignItems: "stretch" }}>
        
        {/* Left Box: Daily/Weekly user count */}
        <div
          style={{
            backgroundColor: "#D98A9C", // Soft rose/pink background
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
              Daily User Counts
            </h3>
            <span className="font-serif" style={{ fontSize: "40px", fontWeight: 500 }}>
              {stats.dailyUsers}
            </span>
          </div>

          <div>
            <h3 className="font-sans" style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 10px 0", opacity: 0.9 }}>
              Weekly User Counts
            </h3>
            <span className="font-serif" style={{ fontSize: "40px", fontWeight: 500 }}>
              {stats.weeklyUsers}
            </span>
          </div>
        </div>

        {/* Right Box: Website Performance Chart */}
        <div
          style={{
            border: "1.5px solid #8FB9A8", // Elegant teal border outline
            borderRadius: "15px",
            padding: "24px 30px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 className="font-serif" style={{ fontSize: "22px", color: "#3F3B38", margin: 0, fontWeight: 600 }}>
                Website Performance
              </h3>
              
              {/* Metric filter pills */}
              <div style={{ display: "flex", gap: "10px" }}>
                {metrics.map((m) => {
                  const isActive = activeMetric === m;
                  return (
                    <button
                      key={m}
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
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range tab links */}
            <div style={{ display: "flex", gap: "16px" }}>
              {dateRanges.map((r) => {
                const isActive = activeRange === r;
                return (
                  <button
                    key={r}
                    onClick={() => setActiveRange(r)}
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
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Line Chart representing the mockup pattern exactly */}
          <div style={{ width: "100%", height: "200px", marginTop: "10px" }}>
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#F5EDE8" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#F5EDE8" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#F5EDE8" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#EBE5DB" strokeWidth="1.5" />
              
              {/* Vertical axis line */}
              <line x1="40" y1="20" x2="40" y2="170" stroke="#EBE5DB" strokeWidth="1.5" />

              {/* Chart Line Path */}
              <path
                d={getSvgPath()}
                fill="none"
                stroke="#3F3B38"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots on chart vertices */}
              {getPoints().map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#3F3B38" stroke="#fff" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════
          ROW 2: WIDE GOLD CARD + NARROW PINK CARD
          ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr", gap: "24px" }}>
        
        {/* Golden Border Box */}
        <div
          style={{
            border: "2px solid #D9A85C",
            borderRadius: "15px",
            backgroundColor: "#fff",
            height: "220px",
            padding: "24px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
          }}
        >
          {/* Content goes here */}
        </div>

        {/* Pink Border Box */}
        <div
          style={{
            border: "2px solid #D98A9C",
            borderRadius: "15px",
            backgroundColor: "#fff",
            height: "220px",
            padding: "24px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
          }}
        >
          {/* Content goes here */}
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════
          ROW 3: WIDE GREEN CARD + MEDIUM GOLD CARD
          ═══════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        
        {/* Green Border Box */}
        <div
          style={{
            border: "2px solid #8FB9A8",
            borderRadius: "15px",
            backgroundColor: "#fff",
            height: "220px",
            padding: "24px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
          }}
        >
          {/* Content goes here */}
        </div>

        {/* Gold Border Box */}
        <div
          style={{
            border: "2px solid #D9A85C",
            borderRadius: "15px",
            backgroundColor: "#fff",
            height: "220px",
            padding: "24px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.02)",
          }}
        >
          {/* Content goes here */}
        </div>

      </div>

    </div>
  );
}
