-- ─────────────────────────────────────────────────────────────────────────────
-- TQ Work Analysis — Supabase Tables
-- Run this once in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Projects created by TQ admins
CREATE TABLE IF NOT EXISTS tq_projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name      TEXT NOT NULL,
  project_name     TEXT NOT NULL,
  job_title        TEXT NOT NULL,
  profession       TEXT,
  tasks            JSONB NOT NULL DEFAULT '[]',    -- string[]
  tag_definitions  JSONB NOT NULL DEFAULT '[]',    -- {id,label,color}[]
  client_token     TEXT UNIQUE NOT NULL,           -- used in /session/[token] URL
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Client responses (one row per submission)
CREATE TABLE IF NOT EXISTS tq_responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID REFERENCES tq_projects(id) ON DELETE CASCADE,
  respondent_name  TEXT,
  respondent_email TEXT,
  task_responses   JSONB NOT NULL DEFAULT '[]',   -- {index,originalDescription,description,included,tags[]}[]
  submitted_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE tq_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tq_responses ENABLE ROW LEVEL SECURITY;

-- Authenticated TQ users can do anything with projects
CREATE POLICY "TQ admins manage projects"
  ON tq_projects FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Authenticated TQ users can read all responses
CREATE POLICY "TQ admins read responses"
  ON tq_responses FOR SELECT TO authenticated
  USING (true);

-- Anyone (anonymous clients) can insert a response
CREATE POLICY "Clients submit responses"
  ON tq_responses FOR INSERT TO anon, authenticated
  WITH CHECK (true);
