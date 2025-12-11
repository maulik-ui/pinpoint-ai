-- Reset saved tools table
-- Drop existing table and recreate cleanly

-- Drop existing table and related objects
DROP TABLE IF EXISTS user_saved_tools CASCADE;

-- Recreate the table cleanly
CREATE TABLE user_saved_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Create indexes
CREATE INDEX idx_user_saved_tools_user_id ON user_saved_tools(user_id);
CREATE INDEX idx_user_saved_tools_tool_id ON user_saved_tools(tool_id);
CREATE INDEX idx_user_saved_tools_created_at ON user_saved_tools(created_at DESC);

-- Enable RLS
ALTER TABLE user_saved_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved tools"
  ON user_saved_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved tools"
  ON user_saved_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved tools"
  ON user_saved_tools FOR DELETE
  USING (auth.uid() = user_id);

