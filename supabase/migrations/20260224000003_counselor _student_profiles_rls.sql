/*
* Author: Nikesh
* Description: Allow counselors to read student_profiles only for students
* that are assigned to them via the applications table.
*/

CREATE POLICY "Counselors can view profiles of their assigned students"
ON public.student_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.student_id = student_profiles.id
      AND applications.counselor_id = auth.uid()
  )
);