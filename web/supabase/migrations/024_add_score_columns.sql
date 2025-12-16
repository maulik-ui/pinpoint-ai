-- Add individual score columns to tools table
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS pinpoint_score NUMERIC(3, 1) CHECK (pinpoint_score IS NULL OR (pinpoint_score >= 0 AND pinpoint_score <= 10)),
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3, 1) CHECK (sentiment_score IS NULL OR (sentiment_score >= 0 AND sentiment_score <= 10)),
ADD COLUMN IF NOT EXISTS features_score NUMERIC(3, 1) CHECK (features_score IS NULL OR (features_score >= 0 AND features_score <= 10)),
ADD COLUMN IF NOT EXISTS adoption_score NUMERIC(3, 1) CHECK (adoption_score IS NULL OR (adoption_score >= 0 AND adoption_score <= 10)),
ADD COLUMN IF NOT EXISTS pricing_score NUMERIC(3, 1) CHECK (pricing_score IS NULL OR (pricing_score >= 0 AND pricing_score <= 10)),
ADD COLUMN IF NOT EXISTS verification_score NUMERIC(3, 1) CHECK (verification_score IS NULL OR (verification_score >= 0 AND verification_score <= 10)),
ADD COLUMN IF NOT EXISTS users_score NUMERIC(3, 1) CHECK (users_score IS NULL OR (users_score >= 0 AND users_score <= 10)),
ADD COLUMN IF NOT EXISTS trust_score NUMERIC(3, 1) CHECK (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 10));

-- Add score_visibility JSONB column for controlling score visibility
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS score_visibility JSONB DEFAULT '{
  "pinpoint_score": true,
  "sentiment_score": true,
  "features_score": true,
  "adoption_score": true,
  "pricing_score": true,
  "verification_score": true,
  "users_score": true,
  "trust_score": true
}'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tools_score_visibility ON tools USING GIN (score_visibility);

-- Migrate existing overall_score to pinpoint_score if pinpoint_score is null
UPDATE tools 
SET pinpoint_score = overall_score 
WHERE pinpoint_score IS NULL AND overall_score IS NOT NULL;
