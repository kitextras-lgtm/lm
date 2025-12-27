-- Create feedback table for user feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('bug', 'suggestion', 'feature', 'other')),
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id 
  ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category 
  ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status 
  ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at 
  ON feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback (permissive like chat tables)
-- Note: These policies allow all operations for authenticated users. Adjust based on your security needs.

DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;
CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view feedback" ON feedback;
CREATE POLICY "Anyone can view feedback" ON feedback FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can update feedback" ON feedback;
CREATE POLICY "Anyone can update feedback" ON feedback FOR UPDATE TO anon, authenticated USING (true);

-- Add to realtime publication for live updates (optional, for admin dashboard)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

