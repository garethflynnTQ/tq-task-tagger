import * as fs from "fs";
import * as path from "path";

// Reads a value from process.env first, then falls back to reading .env.local
// directly. This is needed because a parent-directory package.json can confuse
// Next.js root detection, causing process.env to be empty at runtime.
function getEnvVar(key: string): string | undefined {
  if (process.env[key]) return process.env[key];

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (match) return match[1].trim();
  } catch {
    // File doesn't exist or can't be read
  }

  return undefined;
}

export function getAnthropicKey(): string {
  const val = getEnvVar("ANTHROPIC_API_KEY");
  if (val) return val;
  throw new Error("ANTHROPIC_API_KEY not found in environment or .env.local");
}

export function getSupabaseUrl(): string {
  const val = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  if (val) return val;
  throw new Error("NEXT_PUBLIC_SUPABASE_URL not found in environment or .env.local");
}

export function getSupabaseAnonKey(): string {
  const val = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (val) return val;
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment or .env.local");
}

export function getSupabaseServiceKey(): string {
  const val = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
  if (val) return val;
  throw new Error("SUPABASE_SERVICE_ROLE_KEY not found in environment or .env.local");
}
