-- Add scholarship_policy_html to universities
ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS scholarship_policy_html TEXT;

-- Update scholarship_type enum to include full and partial
-- We use a DO block to safely add new values if they don't exist
DO $$
BEGIN
    ALTER TYPE public.scholarship_type ADD VALUE 'full';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE public.scholarship_type ADD VALUE 'partial';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


UPDATE public.universities u
SET scholarship_policy_html = p.scholarship_policy_html
FROM (
    SELECT DISTINCT ON (university_id) university_id, scholarship_policy_html
    FROM public.programs
    WHERE scholarship_policy_html IS NOT NULL
    ORDER BY university_id, created_at ASC
) p
WHERE u.id = p.university_id
AND u.scholarship_policy_html IS NULL;

ALTER TABLE public.programs DROP COLUMN IF EXISTS scholarship_policy_html;
ALTER TABLE public.programs DROP COLUMN IF EXISTS scholarship_memo;
ALTER TABLE public.programs DROP COLUMN IF EXISTS cover_image_url;
ALTER TABLE public.programs DROP COLUMN IF EXISTS detail_images;
