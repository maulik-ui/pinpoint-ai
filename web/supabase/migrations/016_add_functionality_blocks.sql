-- Migration: Add functionality_blocks column to tools table
-- This column stores an array of functionality highlight blocks displayed in the overview section
-- Each block has a title and description

ALTER TABLE tools ADD COLUMN IF NOT EXISTS functionality_blocks JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tools.functionality_blocks IS 'Array of functionality highlight blocks. Each block is an object with "title" (string) and "description" (string). Example: [{"title": "Natural Conversations", "description": "Human-like responses that feel authentic"}]';

