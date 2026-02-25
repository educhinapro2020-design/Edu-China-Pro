DROP POLICY "Students can view their assigned counselor profile" ON public.profiles;

CREATE OR REPLACE FUNCTION public.student_has_counselor(counselor_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications
    WHERE applications.student_id = auth.uid()
      AND applications.counselor_id = $1
  );
$$;

CREATE POLICY "Students can view their assigned counselor profile"
ON public.profiles
FOR SELECT
USING (
  public.student_has_counselor(profiles.id)
);