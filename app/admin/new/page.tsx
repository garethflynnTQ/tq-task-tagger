"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TagDef {
  id: string;
  label: string;
  color: string;
}

type PageState = "details" | "generating" | "preview" | "saving" | "created";

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_COLOR_PALETTE = [
  "#1a2d6c", "#d65a31", "#2a7f4f",
  "#6b3fa0", "#0e7490", "#b45309", "#be123c", "#065f46",
];

const DEFAULT_TAGS: TagDef[] = [
  { id: "critical",   label: "Critical Work",                  color: "#1a2d6c" },
  { id: "human",      label: "Needs a Human for Execution",    color: "#d65a31" },
  { id: "efficiency", label: "Efficiency Opportunity",         color: "#2a7f4f" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const [pageState, setPageState] = useState<PageState>("details");

  // Project form
  const [clientName, setClientName]     = useState("");
  const [projectName, setProjectName]   = useState("");
  const [jobTitle, setJobTitle]         = useState("");
  const [profession, setProfession]     = useState("");

  // Tag configuration
  const [tagDefs, setTagDefs]           = useState<TagDef[]>(DEFAULT_TAGS);
  const [newTagLabel, setNewTagLabel]   = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagLabel, setEditingTagLabel] = useState("");

  // Generated data
  const [tasks, setTasks]               = useState<string[]>([]);
  const [error, setError]               = useState("");
  const [clientToken, setClientToken]   = useState("");
  const [projectId, setProjectId]       = useState("");

  // ── Tag management ───────────────────────────────────────────────────────

  const addTag = () => {
    const label = newTagLabel.trim();
    if (!label) return;
    setTagDefs((prev) => [
      ...prev,
      { id: `tag-${Date.now()}`, label, color: TAG_COLOR_PALETTE[prev.length % TAG_COLOR_PALETTE.length] },
    ]);
    setNewTagLabel("");
  };

  const removeTag = (id: string) => setTagDefs((prev) => prev.filter((t) => t.id !== id));

  const startRename = (tag: TagDef) => { setEditingTagId(tag.id); setEditingTagLabel(tag.label); };

  const commitRename = () => {
    if (!editingTagId) return;
    const label = editingTagLabel.trim();
    if (label) setTagDefs((prev) => prev.map((t) => (t.id === editingTagId ? { ...t, label } : t)));
    setEditingTagId(null);
  };

  // ── Generate tasks ───────────────────────────────────────────────────────

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !projectName.trim() || !jobTitle.trim()) return;
    setPageState("generating");
    setError("");

    try {
      const res = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), profession: profession.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate tasks");
      setTasks(data.tasks);
      setPageState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPageState("details");
    }
  };

  // ── Save project ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    setPageState("saving");
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName.trim(),
          project_name: projectName.trim(),
          job_title: jobTitle.trim(),
          profession: profession.trim(),
          tasks,
          tag_definitions: tagDefs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      setClientToken(data.project.client_token);
      setProjectId(data.project.id);
      setPageState("created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPageState("preview");
    }
  };

  // ── Copy URL helper ──────────────────────────────────────────────────────

  const clientUrl = typeof window !== "undefined"
    ? `${window.location.origin}/session/${clientToken}`
    : `/session/${clientToken}`;

  const [copied, setCopied] = useState(false);
  const copyUrl = () => {
    navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ─── Shared styles ────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", fontSize: "15px",
    border: "2px solid #ddd", borderRadius: "8px", outline: "none",
    boxSizing: "border-box", backgroundColor: "white",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "12px", fontWeight: 600,
    color: "#1a2d6c", marginBottom: "6px",
    textTransform: "uppercase", letterSpacing: "0.5px",
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fffaf5" }}>
      <AdminHeader backHref="/admin" backLabel="All Projects" />

      <main style={{ maxWidth: "660px", margin: "0 auto", padding: "40px 24px" }}>

        {/* ── DETAILS FORM ──────────────────────────────────────────────── */}
        {pageState === "details" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a2d6c", margin: "0 0 6px" }}>
              New Project
            </h1>
            <p style={{ color: "#888", fontSize: "14px", margin: "0 0 32px" }}>
              Configure the project and tags, then generate tasks to send to your client.
            </p>

            <form onSubmit={handleGenerate}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Client Company Name *</label>
                    <input value={clientName} onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Acme Corporation" required style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Project Name *</label>
                    <input value={projectName} onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Q1 Work Analysis" required style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Job Title *</label>
                    <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Finance Manager" required style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Function / Profession <span style={{ color: "#bbb", textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
                    <input value={profession} onChange={(e) => setProfession(e.target.value)}
                      placeholder="e.g. Finance" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                      onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                  </div>
                </div>

                {/* ── Tag configurator ──────────────────────────────────── */}
                <div style={{ border: "2px solid #e5e7eb", borderRadius: "10px", padding: "18px 20px", backgroundColor: "white" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <span style={{ ...labelStyle, margin: 0 }}>Tags for this project</span>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>Click name to rename</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {tagDefs.map((tag) => (
                      <div key={tag.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: tag.color, flexShrink: 0 }} />
                        {editingTagId === tag.id ? (
                          <input autoFocus value={editingTagLabel}
                            onChange={(e) => setEditingTagLabel(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingTagId(null); }}
                            style={{ flex: 1, fontSize: "14px", border: `1.5px solid ${tag.color}`, borderRadius: "5px", padding: "3px 8px", outline: "none" }} />
                        ) : (
                          <span onClick={() => startRename(tag)} title="Click to rename"
                            style={{ flex: 1, fontSize: "14px", color: "#1a1a1a", cursor: "text" }}>
                            {tag.label}
                          </span>
                        )}
                        <button type="button" onClick={() => removeTag(tag.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "18px", padding: "0 2px" }}
                          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#be123c")}
                          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#ccc")}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Add a tag..."
                      style={{ flex: 1, padding: "8px 12px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "6px", outline: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = "#1a2d6c")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                    <button type="button" onClick={addTag} disabled={!newTagLabel.trim()}
                      style={{ backgroundColor: newTagLabel.trim() ? "#1a2d6c" : "#e5e7eb", color: newTagLabel.trim() ? "white" : "#aaa", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "14px", fontWeight: 600, cursor: newTagLabel.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
                      + Add
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "14px" }}>
                    {error}
                  </div>
                )}

                <button type="submit"
                  disabled={!clientName.trim() || !projectName.trim() || !jobTitle.trim()}
                  style={{ backgroundColor: (clientName && projectName && jobTitle) ? "#d65a31" : "#ccc", color: "white", border: "none", borderRadius: "8px", padding: "14px 24px", fontSize: "16px", fontWeight: 700, cursor: (clientName && projectName && jobTitle) ? "pointer" : "not-allowed", width: "100%" }}>
                  Generate Tasks →
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── GENERATING ────────────────────────────────────────────────── */}
        {pageState === "generating" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "24px" }}>
            <div style={{ width: "48px", height: "48px", border: "4px solid #e5e7eb", borderTop: "4px solid #d65a31", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#1a2d6c", fontWeight: 600, fontSize: "18px", margin: 0 }}>
              Generating tasks for {jobTitle}...
            </p>
          </div>
        )}

        {/* ── PREVIEW ───────────────────────────────────────────────────── */}
        {pageState === "preview" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a2d6c", margin: 0 }}>
                  Task Preview
                </h1>
                <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0" }}>
                  {clientName} · {projectName} · {tasks.length} tasks generated
                </p>
              </div>
              <button onClick={() => setPageState("details")}
                style={{ color: "#888", background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}>
                ← Edit Details
              </button>
            </div>

            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#92400e" }}>
              These tasks will be sent to your client to review, edit, and tag. You can&apos;t edit them here.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {tasks.map((task, i) => (
                <div key={i} style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 600, flexShrink: 0, marginTop: "2px" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: 1.5 }}>{task}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <button onClick={handleSave}
              style={{ backgroundColor: "#1a2d6c", color: "white", border: "none", borderRadius: "8px", padding: "14px 24px", fontSize: "16px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
              Create Project &amp; Generate Client Link →
            </button>
          </>
        )}

        {/* ── SAVING ────────────────────────────────────────────────────── */}
        {pageState === "saving" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "24px" }}>
            <div style={{ width: "48px", height: "48px", border: "4px solid #e5e7eb", borderTop: "4px solid #1a2d6c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#1a2d6c", fontWeight: 600, fontSize: "18px", margin: 0 }}>
              Creating project...
            </p>
          </div>
        )}

        {/* ── CREATED ───────────────────────────────────────────────────── */}
        {pageState === "created" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a2d6c", margin: "0 0 8px" }}>
              Project Created!
            </h1>
            <p style={{ color: "#666", fontSize: "15px", margin: "0 0 32px" }}>
              Share this link with your client at <strong>{clientName}</strong>
            </p>

            <div style={{ backgroundColor: "white", borderRadius: "10px", border: "2px solid #1a2d6c", padding: "20px", marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>
                Client Link
              </p>
              <p style={{ fontSize: "14px", color: "#1a2d6c", fontFamily: "monospace", wordBreak: "break-all", margin: "0 0 14px" }}>
                {clientUrl}
              </p>
              <button onClick={copyUrl}
                style={{ backgroundColor: copied ? "#2a7f4f" : "#1a2d6c", color: "white", border: "none", borderRadius: "7px", padding: "10px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <a href={`/admin/${projectId}`}
                style={{ backgroundColor: "#d65a31", color: "white", borderRadius: "8px", padding: "11px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                View Project
              </a>
              <a href="/admin/new"
                style={{ backgroundColor: "white", color: "#1a2d6c", border: "2px solid #1a2d6c", borderRadius: "8px", padding: "11px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                + Another Project
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
