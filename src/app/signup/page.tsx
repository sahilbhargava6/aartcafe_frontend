"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (!agreeTerms) {
      setMessage("Please agree to the Terms and Privacy Policy.");
      return;
    }
    // Success simulation
    setMessage("Account created successfully! Welcome to Aartcafe.");
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
            Create Account
          </h1>
          <p className="font-sans" style={{ fontSize: "16px", color: "#6E6E6E", textAlign: "center", margin: "0 0 32px 0", lineHeight: "24px" }}>
            Join Aartcafe to track orders, save favorites, and manage your custom frame requests.
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
                backgroundColor: message.includes("successfully") ? "rgba(143, 185, 168, 0.15)" : "rgba(224, 90, 71, 0.15)",
                color: message.includes("successfully") ? "#4E8E76" : "#E05A47",
                border: message.includes("successfully") ? "1px solid #8FB9A8" : "1px solid #E05A47",
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500 }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
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
              <label className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500 }}>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
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
              <label className="font-sans" style={{ fontSize: "14px", color: "#3F3B38", fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", margin: "4px 0" }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "#D9A85C", width: "16px", height: "16px", marginTop: "3px" }}
              />
              <label htmlFor="terms" className="font-sans" style={{ fontSize: "13px", color: "#6E6E6E", cursor: "pointer", lineHeight: "20px" }}>
                I agree to the <a href="#" style={{ color: "#D98A9C" }}>Terms of Service</a> and <a href="#" style={{ color: "#D98A9C" }}>Privacy Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              className="font-sans"
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#D9A85C",
                color: "#FFF",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "10px",
                boxShadow: "0px 4px 10px rgba(217, 168, 92, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c9974c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#D9A85C";
              }}
            >
              CREATE ACCOUNT
            </button>
          </form>

          <div style={{ marginTop: "32px", textAlign: "center", fontSize: "15px", color: "#6E6E6E" }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "#D98A9C", fontWeight: 600, textDecoration: "underline" }}>
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
