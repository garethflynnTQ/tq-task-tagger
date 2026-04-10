import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// GET /api/projects/[id]/responses
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const db = createSupabaseServiceClient();

    const { data: responses, error } = await db
      .from("tq_responses")
      .select("*")
      .eq("project_id", id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ responses: responses ?? [] });
  } catch (err) {
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status });
  }
}
