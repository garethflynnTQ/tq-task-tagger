"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TagDef { id: string; label: string; color: string; }

interface Project {
  id: string;
  client_name: string;
  project_name: string;
  job_title: string;
  profession: string;
  tasks: string[];
  tag_definitions: TagDef[];
  client_token: string;
  created_at: string;
}

interface TaskResponse {
  index: number;
  originalDescription: string;
  description: string;
  included: boolean;
  tags: string[];
}

interface Response {
  id: string;
  respondent_name: string;
  respondent_email: string;
  submitted_at: string;
  task_responses: TaskResponse[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/projects/${id}/responses`).then((r) => r.json()),
    ])
      .then(([projData, respData]) => {
        if (projData.error) throw new Error(projData.error);
        setProject(projData.project);
        setResponses(respData.responses ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const clientUrl =
    typeof window !== "undefined" && project
      ? `${window.location.origin}/session/${project.client_token}`
      : "";

  const copyUrl = () => {
    if (!clientUrl) return;
    navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const handleExport = () => {
    window.open(`/api/projects/${id}/export`, "_blank");
  };

  const tagLabel = (tagId: string) =>
    project?.tag_definitions.find((t) => t.id === tagId)?.label ?? tagId;

  const tagColor = (tagId: string) =>
    project?.tag_definitions.find((t) => t.id === tagId)?.color ?? "#888";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5" }}>
        <AdminHeader backHref="/admin" backLabel="All Projects" />
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <p style={{ color: "#888" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5" }}>
        <AdminHeader backHref="/admin" backLabel="All Projects" />
        <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 24px" }}>
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "16px", color: "#dc2626" }}>
            {error || "Project not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5" }}>
      <AdminHeader backHref="/admin" backLabel="All Projects" />

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Project header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a2d6c", margin: "0 0 4px" }}>
                {project.client_name}
                <span style={{ color: "#888", fontWeight: 400, fontSize: "18px", marginLeft: "10px" }}>
                  {project.project_name}
                </span>
              </h1>
              <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
                {project.job_title}{project.profession ? ` · ${project.profession}` : ""} ·{" "}
                {project.tasks.length} tasks · Created{" "}
                {new Date(project.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Tags configured */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {project.tag_definitions.map((tag) => (
            <span key={tag.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "white", border: `1.5px solid ${tag.color}`, borderRadius: "999px", padding: "4px 12px", fontSize: "13px", fontWeight: 500, color: tag.color }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: tag.color, display: "inline-block" }} />
              {tag.label}
            </span>
          ))}
        </div>

        {/* Client link */}
        <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "18px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>
              Client Link
            </p>
            <p style={{ fontSize: "13px", color: "#1a2d6c", fontFamily: "monospace", margin: 0, wordBreak: "break-all" }}>
              {clientUrl}
            </p>
          </div>
          <button onClick={copyUrl}
            style={{ backgroundColor: copied ? "#2a7f4f" : "#1a2d6c", color: "white", border: "none", borderRadius: "7px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Responses */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a2d6c", margin: 0 }}>
            Responses ({responses.length})
          </h2>
          {responses.length > 0 && (
            <button onClick={handleExport}
              style={{ backgroundColor: "#2a7f4f", color: "white", border: "none", borderRadius: "7px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              ↓ Download All CSV
            </button>
          )}
        </div>

        {responses.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", backgroundColor: "white", borderRadius: "10px", border: "2px dashed #e5e7eb" }}>
            <p style={{ color: "#aaa", margin: 0 }}>No responses yet. Share the client link above to collect responses.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {responses.map((resp) => {
            const includedTasks = resp.task_responses.filter((t) => t.included);
            const taggedTasks   = includedTasks.filter((t) => t.tags.length > 0);
            const editedTasks   = includedTasks.filter((t) => t.description !== t.originalDescription);
            const isExpanded    = expandedId === resp.id;

            return (
              <div key={resp.id} style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {/* Response summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : resp.id)}
                  style={{ width: "100%", background: "none", border: "none", padding: "16px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>
                      {resp.respondent_name || "Anonymous"}
                    </span>
                    {resp.respondent_email && (
                      <span style={{ fontSize: "13px", color: "#888", marginLeft: "8px" }}>
                        {resp.respondent_email}
                      </span>
                    )}
                    <p style={{ color: "#888", fontSize: "12px", margin: "2px 0 0" }}>
                      Submitted {formatDate(resp.submitted_at)} ·{" "}
                      {includedTasks.length} tasks kept · {taggedTasks.length} tagged
                      {editedTasks.length > 0 ? ` · ${editedTasks.length} edited` : ""}
                    </p>
                  </div>
                  <span style={{ color: "#aaa", fontSize: "18px", flexShrink: 0 }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {/* Expanded task detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {resp.task_responses.map((task) => (
                        <div key={task.index}
                          style={{ padding: "10px 14px", borderRadius: "7px", backgroundColor: task.included ? "#f9fafb" : "#fafafa", border: "1px solid #e5e7eb", opacity: task.included ? 1 : 0.45 }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "10px", color: "#ccc", fontWeight: 600, flexShrink: 0, marginTop: "3px" }}>
                              {String(task.index + 1).padStart(2, "0")}
                            </span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "13px", color: "#1a1a1a", margin: "0 0 4px", textDecoration: task.included ? "none" : "line-through" }}>
                                {task.description}
                              </p>
                              {task.description !== task.originalDescription && (
                                <p style={{ fontSize: "11px", color: "#aaa", margin: "0 0 6px" }}>
                                  Original: {task.originalDescription}
                                </p>
                              )}
                              {task.included && task.tags.length > 0 && (
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  {task.tags.map((tagId) => (
                                    <span key={tagId} style={{ backgroundColor: tagColor(tagId), color: "white", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
                                      {tagLabel(tagId)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span style={{ fontSize: "11px", color: task.included ? "#2a7f4f" : "#dc2626", fontWeight: 600, flexShrink: 0 }}>
                              {task.included ? "Kept" : "Removed"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
