/* Migration: Allow students to submit their own draft applications
* Date: 2026-03-01 Author: Nikesh
*/

CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id uuid,
  p_new_status public.application_status,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status public.application_status;
  v_caller_role    public.user_role;
  v_counselor_id   uuid;
  v_student_id     uuid;
BEGIN
  -- Get caller role
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Fetch application
  SELECT status, counselor_id, student_id
  INTO v_current_status, v_counselor_id, v_student_id
  FROM public.applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Guard against no-op
  IF v_current_status = p_new_status THEN
    RAISE EXCEPTION 'Application is already in this status';
  END IF;

  -- Student logic: only own application, only draft -> submitted
  IF v_caller_role = 'student' THEN
    IF v_student_id != auth.uid() THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_new_status != 'submitted' OR v_current_status NOT IN ('draft', 'action_required') THEN
      RAISE EXCEPTION 'Students can only submit draft or action-required applications';
    END IF;
  END IF;

  -- Counselor logic: only their assigned applications
  IF v_caller_role = 'counselor' AND v_counselor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Record history
  INSERT INTO public.application_status_history
    (application_id, from_status, to_status, changed_by, note)
  VALUES
    (p_application_id, v_current_status, p_new_status, auth.uid(), p_note);

  -- Update application
  UPDATE public.applications
  SET
    status       = p_new_status,
    submitted_at = CASE
                     WHEN p_new_status = 'submitted' AND submitted_at IS NULL
                     THEN now()
                     ELSE submitted_at
                   END,
    updated_at   = now()
  WHERE id = p_application_id;
END;
$$;