-- Add company_name column to tools table
ALTER TABLE tools ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN tools.company_name IS 'The name of the company that owns/develops the tool (e.g., "OpenAI" for ChatGPT)';

