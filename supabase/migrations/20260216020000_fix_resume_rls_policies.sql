/*
  # Fix RLS policies on resume/draft tables
  
  The app uses localStorage for user IDs, not Supabase Auth sessions.
  auth.uid() returns null, so all inserts/selects fail.
  
  Fix: use permissive policies matching the rest of the app
  (users, feedback, announcements tables).
*/

-- ============================================================
-- resumes
-- ============================================================
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
DROP POLICY IF EXISTS "Service role full access on resumes" ON resumes;

CREATE POLICY "Authenticated users can view resumes" ON resumes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert resumes" ON resumes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update resumes" ON resumes
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete resumes" ON resumes
  FOR DELETE TO authenticated USING (true);
-- Allow anon too since the app may not have a Supabase Auth session
CREATE POLICY "Anon can view resumes" ON resumes
  FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert resumes" ON resumes
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update resumes" ON resumes
  FOR UPDATE TO anon USING (true);

-- ============================================================
-- resume_artifacts
-- ============================================================
DROP POLICY IF EXISTS "Service role full access on resume_artifacts" ON resume_artifacts;
DROP POLICY IF EXISTS "Users can view own resume_artifacts" ON resume_artifacts;

CREATE POLICY "Anyone can view resume_artifacts" ON resume_artifacts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert resume_artifacts" ON resume_artifacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update resume_artifacts" ON resume_artifacts
  FOR UPDATE TO anon, authenticated USING (true);

-- ============================================================
-- profile_drafts
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile_drafts" ON profile_drafts;
DROP POLICY IF EXISTS "Users can insert own profile_drafts" ON profile_drafts;
DROP POLICY IF EXISTS "Users can update own profile_drafts" ON profile_drafts;
DROP POLICY IF EXISTS "Users can delete own profile_drafts" ON profile_drafts;
DROP POLICY IF EXISTS "Service role full access on profile_drafts" ON profile_drafts;

CREATE POLICY "Anyone can view profile_drafts" ON profile_drafts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert profile_drafts" ON profile_drafts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update profile_drafts" ON profile_drafts
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete profile_drafts" ON profile_drafts
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- draft_work_experiences
-- ============================================================
DROP POLICY IF EXISTS "Users can view own draft_work_experiences" ON draft_work_experiences;
DROP POLICY IF EXISTS "Users can insert own draft_work_experiences" ON draft_work_experiences;
DROP POLICY IF EXISTS "Users can update own draft_work_experiences" ON draft_work_experiences;
DROP POLICY IF EXISTS "Users can delete own draft_work_experiences" ON draft_work_experiences;
DROP POLICY IF EXISTS "Service role full access on draft_work_experiences" ON draft_work_experiences;

CREATE POLICY "Anyone can view draft_work_experiences" ON draft_work_experiences
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert draft_work_experiences" ON draft_work_experiences
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update draft_work_experiences" ON draft_work_experiences
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete draft_work_experiences" ON draft_work_experiences
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- draft_educations
-- ============================================================
DROP POLICY IF EXISTS "Users can view own draft_educations" ON draft_educations;
DROP POLICY IF EXISTS "Users can insert own draft_educations" ON draft_educations;
DROP POLICY IF EXISTS "Users can update own draft_educations" ON draft_educations;
DROP POLICY IF EXISTS "Users can delete own draft_educations" ON draft_educations;
DROP POLICY IF EXISTS "Service role full access on draft_educations" ON draft_educations;

CREATE POLICY "Anyone can view draft_educations" ON draft_educations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert draft_educations" ON draft_educations
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update draft_educations" ON draft_educations
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete draft_educations" ON draft_educations
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- draft_certifications
-- ============================================================
DROP POLICY IF EXISTS "Users can view own draft_certifications" ON draft_certifications;
DROP POLICY IF EXISTS "Users can insert own draft_certifications" ON draft_certifications;
DROP POLICY IF EXISTS "Users can update own draft_certifications" ON draft_certifications;
DROP POLICY IF EXISTS "Users can delete own draft_certifications" ON draft_certifications;
DROP POLICY IF EXISTS "Service role full access on draft_certifications" ON draft_certifications;

CREATE POLICY "Anyone can view draft_certifications" ON draft_certifications
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert draft_certifications" ON draft_certifications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update draft_certifications" ON draft_certifications
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete draft_certifications" ON draft_certifications
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- draft_publications
-- ============================================================
DROP POLICY IF EXISTS "Users can view own draft_publications" ON draft_publications;
DROP POLICY IF EXISTS "Users can insert own draft_publications" ON draft_publications;
DROP POLICY IF EXISTS "Users can update own draft_publications" ON draft_publications;
DROP POLICY IF EXISTS "Users can delete own draft_publications" ON draft_publications;
DROP POLICY IF EXISTS "Service role full access on draft_publications" ON draft_publications;

CREATE POLICY "Anyone can view draft_publications" ON draft_publications
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert draft_publications" ON draft_publications
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update draft_publications" ON draft_publications
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete draft_publications" ON draft_publications
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- draft_community_roles
-- ============================================================
DROP POLICY IF EXISTS "Users can view own draft_community_roles" ON draft_community_roles;
DROP POLICY IF EXISTS "Users can insert own draft_community_roles" ON draft_community_roles;
DROP POLICY IF EXISTS "Users can update own draft_community_roles" ON draft_community_roles;
DROP POLICY IF EXISTS "Users can delete own draft_community_roles" ON draft_community_roles;
DROP POLICY IF EXISTS "Service role full access on draft_community_roles" ON draft_community_roles;

CREATE POLICY "Anyone can view draft_community_roles" ON draft_community_roles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert draft_community_roles" ON draft_community_roles
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update draft_community_roles" ON draft_community_roles
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete draft_community_roles" ON draft_community_roles
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- draft_skills
-- ============================================================
DROP POLICY IF EXISTS "Users can view own draft_skills" ON draft_skills;
DROP POLICY IF EXISTS "Users can insert own draft_skills" ON draft_skills;
DROP POLICY IF EXISTS "Users can update own draft_skills" ON draft_skills;
DROP POLICY IF EXISTS "Users can delete own draft_skills" ON draft_skills;
DROP POLICY IF EXISTS "Service role full access on draft_skills" ON draft_skills;

CREATE POLICY "Anyone can view draft_skills" ON draft_skills
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert draft_skills" ON draft_skills
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update draft_skills" ON draft_skills
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete draft_skills" ON draft_skills
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- Notify PostgREST to reload schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';
