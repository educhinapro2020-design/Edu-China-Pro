-- Add user_downloads column to applications table
ALTER TABLE applications ADD COLUMN user_downloads JSONB DEFAULT '[]'::jsonb;
