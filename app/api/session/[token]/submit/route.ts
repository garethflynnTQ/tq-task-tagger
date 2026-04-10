import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

// POST /api/session/[token]/submit — public, no auth required
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { respondent_name, respondent_email, task_responses } = body;

    if (!task_responses?.length) {
      return NextResponse.json({ error: "No task responses provided" }, { status: 400 });
    }

    const db = createSupabaseServiceClient();

    // Look up project by token
    const { data: project, error: projError } = await db
      .from("tq_projects")
      .select("id")
      .eq("client_token", token)
      .eq("is_active", true)
      .single();

    if (projError || !project) {
      return NextResponse.json({ error: "Invalid session link" }, { status: 404 });
    }

    // Save response
    const { data: response, error: insertError } = await db
      .from("tq_responses")
      .insert({
        project_id: project.id,
        respondent_name: respondent_name || null,
        respondent_email: respondent_email || null,
        task_responses,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ response }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
