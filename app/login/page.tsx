"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "white",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fffaf5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#1a2d6c",
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "12px",
        }}
      >
        <span style={{ color: "#d65a31", fontWeight: 800, fontSize: "20px" }}>TQ</span>
        <span style={{ color: "white", fontWeight: 500, fontSize: "16px" }}>
          Work Analysis &amp; Task Intelligence
        </span>
      </header>

      {/* Login card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "40px 36px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#1a2d6c",
              margin: "0 0 6px",
            }}
          >
            TQ Consultant Login
          </h1>
          <p style={{ color: "#888", fontSize: "14px", margin: "0 0 32px" }}>
            Sign in to manage work analysis projects
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1a2d6c",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@tqsolutions.com"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1a2d6c",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#dc2626",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#aaa" : "#d65a31",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "13px 24px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "100%",
                  marginTop: "4px",
                }}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </div>
          </form>

          <p style={{ color: "#bbb", fontSize: "12px", textAlign: "center", marginTop: "28px" }}>
            Contact your TQ administrator to request access.
          </p>
        </div>
      </div>
    </div>
  );
}
