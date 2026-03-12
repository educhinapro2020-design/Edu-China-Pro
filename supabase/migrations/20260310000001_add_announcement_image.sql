-- Date: 2026-03-10
-- Add optional image_url to announcements banner table

ALTER TABLE public.announcements
  ADD COLUMN image_url text;
