/*
  Allow students to view public notes on their own applications.
  Previously, only counselors and admins could view application_notes.
*/

CREATE POLICY "Students can view public notes on their applications"
ON public.application_notes
FOR SELECT
USING (
  visibility = 'public' 
  AND 
  application_id IN (
    SELECT id FROM public.applications WHERE student_id = auth.uid()
  )
);
