"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please fill in all required fields.");
      return;
    }
    // Success simulation
    setMessage("Successfully signed in!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "#FAF6F0",
            borderRadius: "20px",
            padding: "48px 40px",
            boxShadow: "0px 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid #EBE5DB",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1 className="font-serif" style={{ fontSize: "32px", color: "#3F3B38", margin: "0 0 12px 0", fontWeight: 400, textAlign: "center" }}>
            Sign In
          </h1>
          <p className="font-sans" style={{ fontSize: "16px", color: "#6E6E6E", textAlign: "center", margin: "0 0 32px 0", lineHeight: "24px" }}>
            Log in to track orders, save favorites, and manage your custom requests.
          </p>

          {message && (
            <div
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                textAlign: "center",
                backgroundColor: message.includes("Successfully") ? "rgba(143, 185, 168, 0.15)" : "rgba(224, 90, 71, 0.15)",
                color: message.includes("Successfully") ? "#4E8E76" : "#E05A47",
                border: message.includes("Successfully") ? "1px solid #8FB9A8" : "1px solid #E05A47",
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  border: "1.5px solid #D9A85C",
                  padding: "0 16px",
                  fontSize: "16px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#3F3B38",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500 }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: "13px", color: "#D98A9C", textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                  border: "1.5px solid #D9A85C",
                  padding: "0 16px",
                  fontSize: "16px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#3F3B38",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "#D9A85C", width: "16px", height: "16px" }}
              />
              <label htmlFor="remember" className="font-sans" style={{ fontSize: "14px", color: "#6E6E6E", cursor: "pointer" }}>
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              className="font-sans"
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "25px",
                border: "1.5px solid #D9A85C",
                backgroundColor: "transparent",
                color: "#D98A9C",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(217, 138, 156, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              SIGN IN
            </button>
          </form>

          <div style={{ marginTop: "32px", textAlign: "center", fontSize: "15px", color: "#6E6E6E" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#D9A85C", fontWeight: 600, textDecoration: "underline" }}>
              Create Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
