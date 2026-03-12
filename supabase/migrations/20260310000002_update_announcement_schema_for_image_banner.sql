-- Date: 2026-03-10
-- Make banner title optional, require image_url, and drop link_label

-- First, provide a default value for any existing announcements to satisfy the NOT NULL constraint
UPDATE public.announcements
SET image_url = ''
WHERE image_url IS NULL;

-- Now apply the constraints
ALTER TABLE public.announcements
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN image_url SET NOT NULL,
  DROP COLUMN IF EXISTS link_label;
