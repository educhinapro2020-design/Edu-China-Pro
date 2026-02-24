/*
  Date: 2026-02-24 Author: Nikesh
  Allow students to view the profile of their assigned counselor.

  A student can read a profile row only if there exists an application
  where:
    - student_id matches the logged-in student (auth.uid())
    - counselor_id matches the profile they are trying to read
*/

CREATE POLICY "Students can view their assigned counselor profile"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.student_id = auth.uid()
      AND applications.counselor_id = profiles.id
  )
);