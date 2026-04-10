"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";

interface Project {
  id: string;
  client_name: string;
  project_name: string;
  job_title: string;
  profession: string;
  client_token: string;
  created_at: string;
  response_count: number;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProjects(data.projects ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5" }}>
      <AdminHeader />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a2d6c", margin: 0 }}>
              Projects
            </h1>
            <p style={{ color: "#888", fontSize: "14px", margin: "4px 0 0" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <a
            href="/admin/new"
            style={{
              backgroundColor: "#d65a31",
              color: "white",
              borderRadius: "8px",
              padding: "11px 20px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            + New Project
          </a>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
            Loading projects...
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "16px",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "2px dashed #e5e7eb",
            }}
          >
            <p style={{ color: "#aaa", fontSize: "16px", margin: "0 0 20px" }}>
              No projects yet. Create your first one.
            </p>
            <a
              href="/admin/new"
              style={{
                backgroundColor: "#1a2d6c",
                color: "white",
                borderRadius: "8px",
                padding: "11px 24px",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              + New Project
            </a>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/admin/${project.id}`}
                style={{
                  display: "block",
                  backgroundColor: "white",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  padding: "20px 24px",
                  textDecoration: "none",
                  borderLeft: "4px solid #1a2d6c",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.boxShadow =
                    "0 2px 12px rgba(0,0,0,0.08)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.boxShadow = "none")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#1a2d6c",
                        }}
                      >
                        {project.client_name}
                      </span>
                      <span style={{ color: "#ccc" }}>—</span>
                      <span style={{ fontSize: "15px", color: "#444" }}>
                        {project.project_name}
                      </span>
                    </div>
                    <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                      {project.job_title}
                      {project.profession ? ` · ${project.profession}` : ""}
                      {" · "}Created {formatDate(project.created_at)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor:
                          project.response_count > 0 ? "#ecfdf5" : "#f9fafb",
                        color: project.response_count > 0 ? "#065f46" : "#9ca3af",
                        borderRadius: "999px",
                        padding: "4px 12px",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {project.response_count}{" "}
                      {project.response_count === 1 ? "response" : "responses"}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
