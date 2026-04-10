"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface AdminHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export default function AdminHeader({ backHref, backLabel }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      style={{
        backgroundColor: "#1a2d6c",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#d65a31", fontWeight: 800, fontSize: "20px" }}>TQ</span>
          <span style={{ color: "white", fontWeight: 500, fontSize: "15px" }}>
            Work Analysis &amp; Task Intelligence
          </span>
        </div>
        {backHref && (
          <>
            <span style={{ color: "#3d5a9e", fontSize: "16px" }}>›</span>
            <a
              href={backHref}
              style={{ color: "#93aceb", fontSize: "14px", textDecoration: "none" }}
            >
              {backLabel ?? "Back"}
            </a>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <a
          href="/admin/new"
          style={{
            backgroundColor: "#d65a31",
            color: "white",
            borderRadius: "7px",
            padding: "7px 16px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + New Project
        </a>
        <button
          onClick={handleLogout}
          style={{
            color: "#93aceb",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
