import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

// GET /api/session/[token] — public, no auth required
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = createSupabaseServiceClient();

    const { data: project, error } = await db
      .from("tq_projects")
      .select("id, client_name, project_name, job_title, profession, tasks, tag_definitions")
      .eq("client_token", token)
      .eq("is_active", true)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: "This link is invalid or has expired." },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
