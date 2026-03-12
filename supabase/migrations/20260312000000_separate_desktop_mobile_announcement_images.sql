-- Date: 2026-03-12
-- Rename existing image to desktop, and add optional mobile image
-- This ensures existing announcements don't break

-- Rename existing image_url to desktop_image_url
ALTER TABLE public.announcements RENAME COLUMN image_url TO desktop_image_url;

-- Add a new optional mobile_image_url column
ALTER TABLE public.announcements ADD COLUMN mobile_image_url text;
