import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicKey } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const { jobTitle, profession } = await request.json();

    if (!jobTitle?.trim()) {
      return NextResponse.json(
        { error: "Job title is required" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey: getAnthropicKey() });

    const professionContext = profession?.trim()
      ? ` in the ${profession.trim()} function`
      : "";

    const prompt = `Generate exactly 22 specific, realistic work tasks and activities for a ${jobTitle.trim()}${professionContext}.

Return ONLY a valid JSON array of strings. No markdown, no explanation, no code fences — just the raw JSON array.

Requirements for each task:
- Written in Australian English
- Starts with an action verb (e.g. "Prepare", "Review", "Facilitate", "Analyse", "Coordinate")
- Specific and concrete — describes an actual activity, not a vague responsibility
- Realistic and relevant to the role
- Varied across different aspects of the role (meetings, reporting, stakeholder management, operational work, strategic tasks, etc.)

Example format:
["Prepare monthly budget variance reports for the finance committee", "Facilitate weekly team standup meetings to align on priorities", ...]`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Strip any accidental markdown fences
    const raw = content.text.trim().replace(/^```json?\s*/i, "").replace(/```\s*$/i, "");
    const tasks: string[] = JSON.parse(raw);

    if (!Array.isArray(tasks)) {
      throw new Error("Claude did not return an array");
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("generate-tasks error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate tasks" },
      { status: 500 }
    );
  }
}
