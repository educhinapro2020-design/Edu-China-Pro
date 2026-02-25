/*
** Date: 2026-02-21  Author: Nikesh
** Migration: Update application status enum, add status history table, and RPCs
*/

-- Update application_status enum

ALTER TYPE public.application_status RENAME TO application_status_old;

CREATE TYPE public.application_status AS ENUM (
  'draft',
  'submitted',
  'reviewing',
  'approved',
  'action_required',
  'application_fee_pending',
  'application_fee_paid',
  'applied_to_university',
  'admission_success',
  'admission_failure',
  'offer_letter',
  'ecp_fee_pending',
  'ecp_fee_paid',
  'jw_form_received',
  'visa_docs_ready',
  'visa_granted'
);

ALTER TABLE public.applications
  ALTER COLUMN status DROP DEFAULT;

-- migrate existing application to new statuses

ALTER TABLE public.applications
  ALTER COLUMN status TYPE public.application_status
  USING (
    CASE status::text
      WHEN 'document_pending'      THEN 'draft'
      WHEN 'applied'               THEN 'applied_to_university'
      WHEN 'processing'            THEN 'reviewing'
      WHEN 'payment_pending'       THEN 'application_fee_pending'
      WHEN 'payment_received'      THEN 'application_fee_paid'
      WHEN 'admission_success'     THEN 'admission_success'
      WHEN 'admission_failure'     THEN 'admission_failure'
      WHEN 'offer_letter_uploaded' THEN 'offer_letter'
      WHEN 'jw202_processing'      THEN 'jw_form_received'
      WHEN 'visa_docs_ready'       THEN 'visa_docs_ready'
      WHEN 'visa_granted'          THEN 'visa_granted'
      ELSE 'draft'
    END
  )::public.application_status;

ALTER TABLE public.applications
  ALTER COLUMN status SET DEFAULT 'draft'::public.application_status;

DROP TYPE public.application_status_old;


-- Create status history table

CREATE TABLE public.application_status_history (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid        NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status    public.application_status NULL, -- NULL = first ever status set
  to_status      public.application_status NOT NULL,
  changed_by     uuid        NOT NULL REFERENCES public.profiles(id),
  note           text        NULL,
  reverted       boolean     NOT NULL DEFAULT false,
  reverted_by    uuid        REFERENCES public.profiles(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_application_id
  ON public.application_status_history(application_id, created_at DESC);


-- RLS on status history

ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can read all history
CREATE POLICY "admin_read_status_history"
  ON public.application_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Counselors can only read history for their assigned applications
CREATE POLICY "counselor_read_assigned_status_history"
  ON public.application_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = application_status_history.application_id
        AND a.counselor_id = auth.uid()
        AND p.role = 'counselor'
    )
  );

-- Students can only read history for their own applications
CREATE POLICY "student_read_own_status_history"
  ON public.application_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_status_history.application_id
        AND a.student_id = auth.uid()
    )
  );

-- Direct inserts: admin or assigned counselor only
CREATE POLICY "staff_insert_status_history"
  ON public.application_status_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = application_status_history.application_id
        AND a.counselor_id = auth.uid()
        AND p.role = 'counselor'
    )
  );

-- Direct updates (soft-delete/undo): admin or assigned counselor only
CREATE POLICY "staff_update_status_history"
  ON public.application_status_history
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE a.id = application_status_history.application_id
        AND a.counselor_id = auth.uid()
        AND p.role = 'counselor'
    )
  );


-- RPC — update_application_status
-- Allowed: admin (any application) | counselor (assigned only)

CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id uuid,
  p_new_status     public.application_status,
  p_note           text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status public.application_status;
  v_caller_role    public.user_role;
  v_counselor_id   uuid;
BEGIN
  -- Get caller role
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Fetch application
  SELECT status, counselor_id
  INTO v_current_status, v_counselor_id
  FROM public.applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Counselors can only update their assigned applications
  IF v_caller_role = 'counselor' AND v_counselor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_caller_role = 'student' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Guard against no-op
  IF v_current_status = p_new_status THEN
    RAISE EXCEPTION 'Application is already in this status';
  END IF;

  INSERT INTO public.application_status_history
    (application_id, from_status, to_status, changed_by, note)
  VALUES
    (p_application_id, v_current_status, p_new_status, auth.uid(), p_note);

  UPDATE public.applications
  SET
    status     = p_new_status,
    updated_at = now()
  WHERE id = p_application_id;
END;
$$;


-- RPC — undo_last_application_status
-- Allowed: admin (any application) | counselor (assigned only)
-- Soft-deletes the last non-reverted history record and reverts
-- the application status. Full audit trail is always preserved.

CREATE OR REPLACE FUNCTION public.undo_last_application_status(
  p_application_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_history_id uuid;
  v_from_status     public.application_status;
  v_caller_role     public.user_role;
  v_counselor_id    uuid;
BEGIN
  -- Get caller role
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Fetch application counselor assignment
  SELECT counselor_id INTO v_counselor_id
  FROM public.applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_caller_role = 'counselor' AND v_counselor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_caller_role = 'student' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get last non-reverted history record
  SELECT id, from_status
  INTO v_last_history_id, v_from_status
  FROM public.application_status_history
  WHERE application_id = p_application_id
    AND reverted = false
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No status history to undo';
  END IF;

  -- Soft delete: mark as reverted, record who did it
  UPDATE public.application_status_history
  SET
    reverted    = true,
    reverted_by = auth.uid()
  WHERE id = v_last_history_id;

  -- Revert application to previous status
  -- COALESCE handles edge case where this was the very first status change
  UPDATE public.applications
  SET
    status     = COALESCE(v_from_status, 'draft'::public.application_status),
    updated_at = now()
  WHERE id = p_application_id;
END;
$$;