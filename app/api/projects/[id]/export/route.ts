import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// GET /api/projects/[id]/export — download all responses as CSV
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const db = createSupabaseServiceClient();

    const [{ data: project }, { data: responses }] = await Promise.all([
      db.from("tq_projects").select("*").eq("id", id).single(),
      db.from("tq_responses").select("*").eq("project_id", id).order("submitted_at", { ascending: true }),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const tagLabelMap: Record<string, string> = Object.fromEntries(
      (project.tag_definitions ?? []).map((t: { id: string; label: string }) => [t.id, t.label])
    );

    interface TaskResponse {
      index: number;
      description: string;
      originalDescription: string;
      included: boolean;
      tags: string[];
    }

    interface DbResponse {
      respondent_name: string;
      respondent_email: string;
      submitted_at: string;
      task_responses: TaskResponse[];
    }

    const headers = [
      "respondent_name",
      "respondent_email",
      "submitted_at",
      "role_title",
      "description",
      "original_description",
      "hours",
      "tags",
    ];

    const rows: string[][] = [];
    (responses ?? []).forEach((resp: DbResponse) => {
      (resp.task_responses ?? [])
        .filter((t: TaskResponse) => t.included)
        .forEach((task: TaskResponse) => {
          rows.push([
            resp.respondent_name ?? "",
            resp.respondent_email ?? "",
            new Date(resp.submitted_at).toLocaleDateString("en-AU"),
            project.job_title,
            task.description,
            task.description !== task.originalDescription ? task.originalDescription : "",
            "1.00",
            (task.tags ?? []).map((tid: string) => tagLabelMap[tid] ?? tid).join(","),
          ]);
        });
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const filename = `management-task-analysis-${project.client_name.replace(/\s+/g, "-").toLowerCase()}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status });
  }
}
