-- Create tool_ratings table
CREATE TABLE IF NOT EXISTS tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tool_ratings_tool_id ON tool_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_user_id ON tool_ratings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tool_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tool_ratings_updated_at
  BEFORE UPDATE ON tool_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_ratings_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE tool_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all ratings
CREATE POLICY "Anyone can read ratings"
  ON tool_ratings FOR SELECT
  USING (true);

-- Policy: Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON tool_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON tool_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON tool_ratings FOR DELETE
  USING (auth.uid() = user_id);





