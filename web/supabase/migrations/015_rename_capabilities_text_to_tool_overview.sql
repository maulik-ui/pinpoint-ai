-- Migration: Rename capabilities_text column to tool_overview
-- This renames the column to better reflect its purpose as a tool overview section

ALTER TABLE tools RENAME COLUMN capabilities_text TO tool_overview;

COMMENT ON COLUMN tools.tool_overview IS 'Stores detailed tool overview including core features, use cases, and pricing details extracted during tool enrichment. Pricing details are stored in a "Pricing Details:" section.';

