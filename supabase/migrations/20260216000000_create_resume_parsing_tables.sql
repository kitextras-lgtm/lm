-- ============================================================
-- Resume Parsing Pipeline Tables
-- ============================================================

-- 1) resumes — tracks uploaded resume files and processing status
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_key text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  status text NOT NULL DEFAULT 'UPLOADED'
    CHECK (status IN ('UPLOADED','SCANNING','EXTRACTING','PARSING','COMPLETE','FAILED')),
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);

-- 2) resume_artifacts — intermediate outputs for debugging/retries
CREATE TABLE IF NOT EXISTS resume_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  extracted_text text,
  extraction_method text NOT NULL
    CHECK (extraction_method IN ('PDF_TEXT','OCR','DOCX_PARSE')),
  layout_json jsonb,
  raw_llm_output_json jsonb,
  parser_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_artifacts_resume_id ON resume_artifacts(resume_id);

-- 3) profile_drafts — editable draft profiles built from parsed resumes
CREATE TABLE IF NOT EXISTS profile_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','READY_FOR_REVIEW','FINALIZED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_drafts_user_id ON profile_drafts(user_id);

-- 4) draft_work_experiences
CREATE TABLE IF NOT EXISTS draft_work_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES profile_drafts(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  location_city text,
  location_country text,
  employment_type text
    CHECK (employment_type IS NULL OR employment_type IN ('full-time','part-time','contract','intern','freelance')),
  start_month smallint CHECK (start_month IS NULL OR (start_month >= 1 AND start_month <= 12)),
  start_year smallint CHECK (start_year IS NULL OR (start_year >= 1900 AND start_year <= 2100)),
  end_month smallint CHECK (end_month IS NULL OR (end_month >= 1 AND end_month <= 12)),
  end_year smallint CHECK (end_year IS NULL OR (end_year >= 1900 AND end_year <= 2100)),
  is_current boolean NOT NULL DEFAULT false,
  description text,
  source_snippet text,
  confidence_json jsonb,
  needs_review boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_work_exp_draft_id ON draft_work_experiences(draft_id);

-- 5) draft_educations
CREATE TABLE IF NOT EXISTS draft_educations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES profile_drafts(id) ON DELETE CASCADE,
  school text NOT NULL,
  degree text,
  field_of_study text,
  start_year smallint CHECK (start_year IS NULL OR (start_year >= 1900 AND start_year <= 2100)),
  end_year smallint CHECK (end_year IS NULL OR (end_year >= 1900 AND end_year <= 2100)),
  graduation_month smallint CHECK (graduation_month IS NULL OR (graduation_month >= 1 AND graduation_month <= 12)),
  graduation_year smallint CHECK (graduation_year IS NULL OR (graduation_year >= 1900 AND graduation_year <= 2100)),
  confidence_json jsonb,
  needs_review boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_edu_draft_id ON draft_educations(draft_id);

-- 6) draft_certifications
CREATE TABLE IF NOT EXISTS draft_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES profile_drafts(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text,
  issue_month smallint CHECK (issue_month IS NULL OR (issue_month >= 1 AND issue_month <= 12)),
  issue_year smallint CHECK (issue_year IS NULL OR (issue_year >= 1900 AND issue_year <= 2100)),
  confidence_json jsonb,
  needs_review boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_cert_draft_id ON draft_certifications(draft_id);

-- 7) draft_publications
CREATE TABLE IF NOT EXISTS draft_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES profile_drafts(id) ON DELETE CASCADE,
  title text NOT NULL,
  publisher text,
  pub_month smallint CHECK (pub_month IS NULL OR (pub_month >= 1 AND pub_month <= 12)),
  pub_year smallint CHECK (pub_year IS NULL OR (pub_year >= 1900 AND pub_year <= 2100)),
  confidence_json jsonb,
  needs_review boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_pub_draft_id ON draft_publications(draft_id);

-- 8) draft_community_roles
CREATE TABLE IF NOT EXISTS draft_community_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES profile_drafts(id) ON DELETE CASCADE,
  title text NOT NULL,
  organization text,
  year smallint CHECK (year IS NULL OR (year >= 1900 AND year <= 2100)),
  confidence_json jsonb,
  needs_review boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_community_draft_id ON draft_community_roles(draft_id);

-- 9) draft_skills
CREATE TABLE IF NOT EXISTS draft_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES profile_drafts(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency text
    CHECK (proficiency IS NULL OR proficiency IN ('Beginner','Intermediate','Advanced')),
  confidence real DEFAULT 0.0,
  source text NOT NULL DEFAULT 'RESUME'
    CHECK (source IN ('RESUME','USER_ADDED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_skills_draft_id ON draft_skills(draft_id);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_community_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_skills ENABLE ROW LEVEL SECURITY;

-- resumes: users can read/manage their own
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE USING (auth.uid() = user_id);

-- Service role full access on resumes
DROP POLICY IF EXISTS "Service role full access on resumes" ON resumes;
CREATE POLICY "Service role full access on resumes"
  ON resumes FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- resume_artifacts: service role only (internal pipeline data)
DROP POLICY IF EXISTS "Service role full access on resume_artifacts" ON resume_artifacts;
CREATE POLICY "Service role full access on resume_artifacts"
  ON resume_artifacts FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );
DROP POLICY IF EXISTS "Users can view own resume_artifacts" ON resume_artifacts;
CREATE POLICY "Users can view own resume_artifacts"
  ON resume_artifacts FOR SELECT USING (
    EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_artifacts.resume_id AND resumes.user_id = auth.uid())
  );

-- profile_drafts: users can read/manage their own
DROP POLICY IF EXISTS "Users can view own profile_drafts" ON profile_drafts;
CREATE POLICY "Users can view own profile_drafts"
  ON profile_drafts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile_drafts" ON profile_drafts;
CREATE POLICY "Users can insert own profile_drafts"
  ON profile_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile_drafts" ON profile_drafts;
CREATE POLICY "Users can update own profile_drafts"
  ON profile_drafts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own profile_drafts" ON profile_drafts;
CREATE POLICY "Users can delete own profile_drafts"
  ON profile_drafts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on profile_drafts" ON profile_drafts;
CREATE POLICY "Service role full access on profile_drafts"
  ON profile_drafts FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Helper function for draft entity RLS
CREATE OR REPLACE FUNCTION user_owns_draft(p_draft_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profile_drafts WHERE id = p_draft_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- draft_work_experiences
DROP POLICY IF EXISTS "Users can view own draft_work_experiences" ON draft_work_experiences;
CREATE POLICY "Users can view own draft_work_experiences"
  ON draft_work_experiences FOR SELECT USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can insert own draft_work_experiences" ON draft_work_experiences;
CREATE POLICY "Users can insert own draft_work_experiences"
  ON draft_work_experiences FOR INSERT WITH CHECK (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can update own draft_work_experiences" ON draft_work_experiences;
CREATE POLICY "Users can update own draft_work_experiences"
  ON draft_work_experiences FOR UPDATE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can delete own draft_work_experiences" ON draft_work_experiences;
CREATE POLICY "Users can delete own draft_work_experiences"
  ON draft_work_experiences FOR DELETE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Service role full access on draft_work_experiences" ON draft_work_experiences;
CREATE POLICY "Service role full access on draft_work_experiences"
  ON draft_work_experiences FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- draft_educations
DROP POLICY IF EXISTS "Users can view own draft_educations" ON draft_educations;
CREATE POLICY "Users can view own draft_educations"
  ON draft_educations FOR SELECT USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can insert own draft_educations" ON draft_educations;
CREATE POLICY "Users can insert own draft_educations"
  ON draft_educations FOR INSERT WITH CHECK (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can update own draft_educations" ON draft_educations;
CREATE POLICY "Users can update own draft_educations"
  ON draft_educations FOR UPDATE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can delete own draft_educations" ON draft_educations;
CREATE POLICY "Users can delete own draft_educations"
  ON draft_educations FOR DELETE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Service role full access on draft_educations" ON draft_educations;
CREATE POLICY "Service role full access on draft_educations"
  ON draft_educations FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- draft_certifications
DROP POLICY IF EXISTS "Users can view own draft_certifications" ON draft_certifications;
CREATE POLICY "Users can view own draft_certifications"
  ON draft_certifications FOR SELECT USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can insert own draft_certifications" ON draft_certifications;
CREATE POLICY "Users can insert own draft_certifications"
  ON draft_certifications FOR INSERT WITH CHECK (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can update own draft_certifications" ON draft_certifications;
CREATE POLICY "Users can update own draft_certifications"
  ON draft_certifications FOR UPDATE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can delete own draft_certifications" ON draft_certifications;
CREATE POLICY "Users can delete own draft_certifications"
  ON draft_certifications FOR DELETE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Service role full access on draft_certifications" ON draft_certifications;
CREATE POLICY "Service role full access on draft_certifications"
  ON draft_certifications FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- draft_publications
DROP POLICY IF EXISTS "Users can view own draft_publications" ON draft_publications;
CREATE POLICY "Users can view own draft_publications"
  ON draft_publications FOR SELECT USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can insert own draft_publications" ON draft_publications;
CREATE POLICY "Users can insert own draft_publications"
  ON draft_publications FOR INSERT WITH CHECK (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can update own draft_publications" ON draft_publications;
CREATE POLICY "Users can update own draft_publications"
  ON draft_publications FOR UPDATE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can delete own draft_publications" ON draft_publications;
CREATE POLICY "Users can delete own draft_publications"
  ON draft_publications FOR DELETE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Service role full access on draft_publications" ON draft_publications;
CREATE POLICY "Service role full access on draft_publications"
  ON draft_publications FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- draft_community_roles
DROP POLICY IF EXISTS "Users can view own draft_community_roles" ON draft_community_roles;
CREATE POLICY "Users can view own draft_community_roles"
  ON draft_community_roles FOR SELECT USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can insert own draft_community_roles" ON draft_community_roles;
CREATE POLICY "Users can insert own draft_community_roles"
  ON draft_community_roles FOR INSERT WITH CHECK (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can update own draft_community_roles" ON draft_community_roles;
CREATE POLICY "Users can update own draft_community_roles"
  ON draft_community_roles FOR UPDATE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can delete own draft_community_roles" ON draft_community_roles;
CREATE POLICY "Users can delete own draft_community_roles"
  ON draft_community_roles FOR DELETE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Service role full access on draft_community_roles" ON draft_community_roles;
CREATE POLICY "Service role full access on draft_community_roles"
  ON draft_community_roles FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- draft_skills
DROP POLICY IF EXISTS "Users can view own draft_skills" ON draft_skills;
CREATE POLICY "Users can view own draft_skills"
  ON draft_skills FOR SELECT USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can insert own draft_skills" ON draft_skills;
CREATE POLICY "Users can insert own draft_skills"
  ON draft_skills FOR INSERT WITH CHECK (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can update own draft_skills" ON draft_skills;
CREATE POLICY "Users can update own draft_skills"
  ON draft_skills FOR UPDATE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Users can delete own draft_skills" ON draft_skills;
CREATE POLICY "Users can delete own draft_skills"
  ON draft_skills FOR DELETE USING (user_owns_draft(draft_id));
DROP POLICY IF EXISTS "Service role full access on draft_skills" ON draft_skills;
CREATE POLICY "Service role full access on draft_skills"
  ON draft_skills FOR ALL USING (
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- ============================================================
-- Updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_resumes_updated_at ON resumes;
CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_profile_drafts_updated_at ON profile_drafts;
CREATE TRIGGER set_profile_drafts_updated_at
  BEFORE UPDATE ON profile_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
