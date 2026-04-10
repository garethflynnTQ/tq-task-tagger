"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TagDef { id: string; label: string; color: string; }

interface ProjectData {
  id: string;
  client_name: string;
  project_name: string;
  job_title: string;
  profession: string;
  tasks: string[];
  tag_definitions: TagDef[];
}

interface ClientTask {
  index: number;
  originalDescription: string;
  description: string;
  included: boolean;
  editing: boolean;
  tags: string[];
}

type PageState = "loading" | "active" | "submitting" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [clientTasks, setClientTasks] = useState<ClientTask[]>([]);
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [error, setError] = useState("");
  const [editBuffer, setEditBuffer] = useState("");

  // ── Load project ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(`/api/session/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject(data.project);
        setClientTasks(
          data.project.tasks.map((desc: string, i: number) => ({
            index: i,
            originalDescription: desc,
            description: desc,
            included: true,
            editing: false,
            tags: [],
          }))
        );
        setPageState("active");
      })
      .catch((e) => {
        setError(e.message);
        setPageState("error");
      });
  }, [token]);

  // ── Task interactions ─────────────────────────────────────────────────────

  const toggleIncluded = (index: number) => {
    setClientTasks((prev) =>
      prev.map((t) =>
        t.index === index ? { ...t, included: !t.included, tags: [] } : t
      )
    );
  };

  const startEdit = (index: number) => {
    const task = clientTasks.find((t) => t.index === index);
    if (!task) return;
    setEditBuffer(task.description);
    setClientTasks((prev) => prev.map((t) => ({ ...t, editing: t.index === index })));
  };

  const commitEdit = (index: number) => {
    const value = editBuffer.trim();
    setClientTasks((prev) =>
      prev.map((t) =>
        t.index === index
          ? { ...t, description: value || t.originalDescription, editing: false }
          : t
      )
    );
  };

  const toggleTag = (index: number, tagId: string) => {
    setClientTasks((prev) =>
      prev.map((t) => {
        if (t.index !== index) return t;
        const has = t.tags.includes(tagId);
        return { ...t, tags: has ? t.tags.filter((x) => x !== tagId) : [...t.tags, tagId] };
      })
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setPageState("submitting");

    try {
      const res = await fetch(`/api/session/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondent_name: respondentName.trim(),
          respondent_email: respondentEmail.trim(),
          task_responses: clientTasks.map(({ index, originalDescription, description, included, tags }) => ({
            index, originalDescription, description, included, tags,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      router.push(`/session/${token}/done`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPageState("active");
    }
  };

  // ── Counts ────────────────────────────────────────────────────────────────

  const includedCount = clientTasks.filter((t) => t.included).length;
  const taggedCount   = clientTasks.filter((t) => t.included && t.tags.length > 0).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  // Loading
  if (pageState === "loading") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5", display: "flex", flexDirection: "column" }}>
        <SessionHeader project={null} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTop: "3px solid #d65a31", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: "#888" }}>Loading your tasks...</span>
        </div>
      </div>
    );
  }

  // Error
  if (pageState === "error" || !project) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5", display: "flex", flexDirection: "column" }}>
        <SessionHeader project={null} />
        <div style={{ maxWidth: "540px", margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#dc2626" }}>
            {error || "This link is invalid or has expired. Please contact TQ Solutions."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5" }}>
      <SessionHeader project={project} />

      {/* Intro banner */}
      <div style={{ backgroundColor: "#1a2d6c", color: "white", padding: "20px 24px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <p style={{ margin: "0 0 6px", fontSize: "15px", lineHeight: 1.6 }}>
            Below is a list of tasks generated for the <strong>{project.job_title}</strong> role.
            Please review each one:
          </p>
          <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "14px", color: "#93aceb", lineHeight: 1.8 }}>
            <li>Keep tasks that apply to your role — remove ones that don&apos;t</li>
            <li>Click the pencil icon ✎ to edit any task description to better reflect what you actually do</li>
            <li>Apply one or more tags to each task you&apos;re keeping</li>
          </ul>
        </div>
      </div>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 24px" }}>

        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {project.tag_definitions.map((tag) => (
              <span key={tag.id} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#666" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: tag.color, display: "inline-block" }} />
                {tag.label}
              </span>
            ))}
          </div>
          <span style={{ fontSize: "13px", color: "#888" }}>
            {includedCount} kept · {taggedCount} tagged
          </span>
        </div>

        {/* Task cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
          {clientTasks.map((task) => (
            <div key={task.index}
              style={{
                backgroundColor: task.included ? "white" : "#f9fafb",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                borderLeft: `4px solid ${task.included ? (task.tags.length > 0 ? "#d65a31" : "#1a2d6c") : "#e5e7eb"}`,
                padding: "14px 18px",
                opacity: task.included ? 1 : 0.55,
                transition: "opacity 0.15s, border-left-color 0.15s",
              }}>

              {/* Top row: task number + description + edit + toggle */}
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", color: "#ccc", fontWeight: 600, flexShrink: 0, marginTop: "3px", minWidth: "24px" }}>
                  {String(task.index + 1).padStart(2, "0")}
                </span>

                {/* Description or edit input */}
                <div style={{ flex: 1 }}>
                  {task.editing ? (
                    <textarea
                      autoFocus
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      onBlur={() => commitEdit(task.index)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(task.index); } }}
                      rows={2}
                      style={{ width: "100%", fontSize: "14px", lineHeight: 1.5, border: "1.5px solid #1a2d6c", borderRadius: "6px", padding: "6px 10px", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                  ) : (
                    <p style={{ margin: 0, fontSize: "14px", color: "#1a1a1a", lineHeight: 1.5, textDecoration: task.included ? "none" : "line-through" }}>
                      {task.description}
                      {task.description !== task.originalDescription && (
                        <span style={{ marginLeft: "6px", fontSize: "11px", color: "#d65a31", fontWeight: 600 }}>edited</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Edit + remove buttons */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  {task.included && !task.editing && (
                    <button onClick={() => startEdit(task.index)} title="Edit description"
                      style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "5px", padding: "4px 8px", cursor: "pointer", fontSize: "13px", color: "#888" }}>
                      ✎
                    </button>
                  )}
                  <button onClick={() => toggleIncluded(task.index)}
                    title={task.included ? "Remove this task" : "Include this task"}
                    style={{
                      background: "none",
                      border: `1px solid ${task.included ? "#fca5a5" : "#86efac"}`,
                      borderRadius: "5px", padding: "4px 8px", cursor: "pointer",
                      fontSize: "12px", fontWeight: 600,
                      color: task.included ? "#dc2626" : "#16a34a",
                    }}>
                    {task.included ? "Remove" : "Include"}
                  </button>
                </div>
              </div>

              {/* Tag buttons — only when included */}
              {task.included && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px", paddingLeft: "36px" }}>
                  {project.tag_definitions.map((tag) => {
                    const isActive = task.tags.includes(tag.id);
                    return (
                      <button key={tag.id} onClick={() => toggleTag(task.index, tag.id)}
                        style={{
                          backgroundColor: isActive ? tag.color : "transparent",
                          border: `1.5px solid ${tag.color}`,
                          color: isActive ? "white" : tag.color,
                          borderRadius: "6px", padding: "4px 12px",
                          fontSize: "12px", fontWeight: 600,
                          cursor: "pointer", whiteSpace: "nowrap",
                          transition: "all 0.12s ease",
                        }}>
                        {isActive ? "✓ " : ""}{tag.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Respondent info + submit */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a2d6c", margin: "0 0 16px" }}>
            Your Details <span style={{ color: "#bbb", fontWeight: 400, fontSize: "13px" }}>(optional)</span>
          </h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <input value={respondentName} onChange={(e) => setRespondentName(e.target.value)}
              placeholder="Your name"
              style={{ flex: 1, minWidth: "180px", padding: "10px 14px", fontSize: "15px", border: "2px solid #ddd", borderRadius: "8px", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
            <input type="email" value={respondentEmail} onChange={(e) => setRespondentEmail(e.target.value)}
              placeholder="Your email"
              style={{ flex: 1, minWidth: "180px", padding: "10px 14px", fontSize: "15px", border: "2px solid #ddd", borderRadius: "8px", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={pageState === "submitting"}
          style={{ backgroundColor: pageState === "submitting" ? "#aaa" : "#d65a31", color: "white", border: "none", borderRadius: "8px", padding: "15px 24px", fontSize: "16px", fontWeight: 700, cursor: pageState === "submitting" ? "not-allowed" : "pointer", width: "100%" }}>
          {pageState === "submitting" ? "Submitting..." : `Submit — ${includedCount} tasks, ${taggedCount} tagged →`}
        </button>
      </main>
    </div>
  );
}

// ─── Session page header (no admin controls) ──────────────────────────────────

function SessionHeader({ project }: { project: ProjectData | null }) {
  return (
    <header style={{ backgroundColor: "#1a2d6c", height: "60px", display: "flex", alignItems: "center", padding: "0 24px", gap: "12px" }}>
      <span style={{ color: "#d65a31", fontWeight: 800, fontSize: "20px" }}>TQ</span>
      <span style={{ color: "white", fontWeight: 500, fontSize: "15px" }}>
        Work Analysis &amp; Task Intelligence
      </span>
      {project && (
        <>
          <span style={{ color: "#3d5a9e" }}>›</span>
          <span style={{ color: "#93aceb", fontSize: "14px" }}>
            {project.client_name} · {project.project_name}
          </span>
        </>
      )}
    </header>
  );
}
