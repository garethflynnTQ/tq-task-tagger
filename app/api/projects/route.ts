import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => chars[b % chars.length]).join("");
}

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// GET /api/projects — list all projects with response counts
export async function GET() {
  try {
    const user = await requireAuth();
    const db = createSupabaseServiceClient();

    const { data: projects, error } = await db
      .from("tq_projects")
      .select("id, client_name, project_name, job_title, profession, client_token, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get response counts per project
    const ids = (projects ?? []).map((p) => p.id);
    const { data: counts } = await db
      .from("tq_responses")
      .select("project_id")
      .in("project_id", ids.length > 0 ? ids : ["none"]);

    const countMap: Record<string, number> = {};
    (counts ?? []).forEach((r) => {
      countMap[r.project_id] = (countMap[r.project_id] ?? 0) + 1;
    });

    const enriched = (projects ?? []).map((p) => ({
      ...p,
      response_count: countMap[p.id] ?? 0,
    }));

    void user; // auth checked above
    return NextResponse.json({ projects: enriched });
  } catch (err) {
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status });
  }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { client_name, project_name, job_title, profession, tasks, tag_definitions } = body;

    if (!client_name || !project_name || !job_title || !tasks?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = createSupabaseServiceClient();
    const client_token = generateToken();

    const { data: project, error } = await db
      .from("tq_projects")
      .insert({
        created_by: user.id,
        client_name,
        project_name,
        job_title,
        profession: profession || null,
        tasks,
        tag_definitions,
        client_token,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status });
  }
}
