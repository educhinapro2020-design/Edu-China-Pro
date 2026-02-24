/* 
  AUTHOR: Nikesh Feb 22
  Add visibility to application_notes 
  - Creates the 'note_visibility' enum (public, private)
  - Adds the 'visibility' column to 'application_notes', defaulting to 'private'
*/

-- Create the enum type
CREATE TYPE public.note_visibility AS ENUM ('public', 'private');

-- Add the column to application_notes
ALTER TABLE public.application_notes
ADD COLUMN visibility public.note_visibility NOT NULL DEFAULT 'private';
