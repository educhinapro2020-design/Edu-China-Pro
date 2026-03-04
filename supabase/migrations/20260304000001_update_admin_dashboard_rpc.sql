/*
** Migration: admin_dashboard_rpc_v2
** Description: Redesigned admin dashboard RPC with pipeline, operational urgency,
**              monthly ops summary, and KPI deltas.
*/

CREATE OR REPLACE FUNCTION public.get_admin_dashboard(p_weeks INT DEFAULT 6)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  v_now TIMESTAMPTZ := NOW();
  v_month_start TIMESTAMPTZ := date_trunc('month', v_now);
  v_last_month_start TIMESTAMPTZ := date_trunc('month', v_now) - INTERVAL '1 month';

  -- KPIs
  v_total_students INT;
  v_total_applications INT;
  v_needs_action INT;
  v_pending_review INT;
  v_visa_granted INT;
  v_unassigned INT;

  -- Monthly deltas
  v_students_this_month INT;
  v_apps_this_month INT;

  -- Pipeline + breakdowns
  v_apps_by_status JSONB;
  v_apps_by_degree JSONB;
  v_apps_by_subject JSONB;
  v_apps_by_city JSONB;
  v_apps_by_university JSONB;
  v_apps_by_program JSONB;

  -- Monthly ops
  v_monthly_ops JSONB;
  v_counselor_load JSONB;
  v_status_movements JSONB;

BEGIN

  -- ── KPI Counts ───────────────────────────────────────────────
  SELECT count(*) INTO v_total_students
  FROM profiles WHERE role = 'student';

  SELECT count(*) INTO v_total_applications
  FROM applications;

  SELECT count(*) INTO v_needs_action
  FROM applications WHERE status = 'action_required';

  SELECT count(*) INTO v_pending_review
  FROM applications WHERE status IN ('submitted', 'reviewing');

  SELECT count(*) INTO v_visa_granted
  FROM applications WHERE status = 'visa_granted';

  SELECT count(*) INTO v_unassigned
  FROM applications WHERE counselor_id IS NULL AND status NOT IN ('draft', 'withdrawn', 'closed', 'dropped_off');

  -- ── Monthly deltas ───────────────────────────────────────────
  SELECT count(*) INTO v_students_this_month
  FROM profiles
  WHERE role = 'student' AND created_at >= v_month_start;

  SELECT count(*) INTO v_apps_this_month
  FROM applications
  WHERE created_at >= v_month_start;

  -- Pipeline: apps by status
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB ORDER BY t.sort_order), '[]'::JSONB)
  INTO v_apps_by_status
  FROM (
    SELECT
      s.status AS label,
      s.sort_order,
      s.stage,
      COALESCE(a.value, 0) AS value
    FROM (
      VALUES
        ('draft',                    1,  'early'),
        ('submitted',                2,  'early'),
        ('reviewing',                3,  'early'),
        ('approved',                 4,  'mid'),
        ('action_required',          5,  'urgent'),
        ('application_fee_pending',  6,  'mid'),
        ('application_fee_paid',     7,  'mid'),
        ('applied_to_university',    8,  'mid'),
        ('admission_success',        9,  'late'),
        ('admission_failure',        10, 'terminal'),
        ('offer_letter',             11, 'late'),
        ('ecp_fee_pending',          12, 'late'),
        ('ecp_fee_paid',             13, 'late'),
        ('jw_form_received',         14, 'late'),
        ('visa_docs_ready',          15, 'late'),
        ('visa_granted',             16, 'success'),
        ('visa_rejected',            17, 'terminal'),
        ('rejected',                 18, 'terminal'),
        ('dropped_off',              19, 'terminal'),
        ('withdrawn',                20, 'terminal'),
        ('closed',                   21, 'terminal')
    ) AS s(status, sort_order, stage)
    LEFT JOIN (
      SELECT status::TEXT AS status, count(*)::INT AS value
      FROM applications
      GROUP BY status
    ) a ON a.status = s.status
  ) t;

  -- Application Insights breakdowns
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB ORDER BY t.value DESC), '[]'::JSONB)
  INTO v_apps_by_degree
  FROM (
    SELECT
      d.label,
      COALESCE(a.value, 0) AS value
    FROM (VALUES ('Bachelor'),('Master'),('Doctoral'),('Non Degree')) AS d(label)
    LEFT JOIN (
      SELECT INITCAP(REPLACE(p.degree_level::TEXT, '_', ' ')) AS label, count(*)::INT AS value
      FROM applications a JOIN programs p ON p.id = a.program_id
      GROUP BY p.degree_level
    ) a ON a.label = d.label
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_subject
  FROM (
    SELECT sa.name_en AS label, count(*)::INT AS value
    FROM applications a
    JOIN programs p ON p.id = a.program_id
    JOIN subject_areas sa ON sa.id = p.subject_area_id
    GROUP BY sa.name_en ORDER BY count(*) DESC LIMIT 8
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_city
  FROM (
    SELECT c.name_en AS label, count(*)::INT AS value
    FROM applications a
    JOIN universities u ON u.id = a.university_id
    JOIN cities c ON c.id = u.city_id
    GROUP BY c.name_en ORDER BY count(*) DESC LIMIT 8
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_university
  FROM (
    SELECT u.name_en AS label, count(*)::INT AS value
    FROM applications a JOIN universities u ON u.id = a.university_id
    GROUP BY u.name_en ORDER BY count(*) DESC LIMIT 8
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_program
  FROM (
    SELECT p.name_en AS label, count(*)::INT AS value
    FROM applications a JOIN programs p ON p.id = a.program_id
    GROUP BY p.name_en ORDER BY count(*) DESC LIMIT 8
  ) t;

  -- Counselor load (active applications per counselor)
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB ORDER BY t.active_count DESC), '[]'::JSONB)
  INTO v_counselor_load
  FROM (
    SELECT
      pr.full_name AS counselor_name,
      count(*)::INT AS active_count
    FROM applications a
    JOIN profiles pr ON pr.id = a.counselor_id
    WHERE a.counselor_id IS NOT NULL
      AND a.status NOT IN ('draft', 'withdrawn', 'closed', 'dropped_off', 'visa_granted', 'rejected', 'admission_failure', 'visa_rejected')
    GROUP BY pr.full_name
    ORDER BY count(*) DESC
    LIMIT 6
  ) t;

  -- Status movements this month
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB ORDER BY t.count DESC), '[]'::JSONB)
  INTO v_status_movements
  FROM (
    SELECT
      to_status::TEXT AS status,
      count(*)::INT AS count
    FROM application_status_history
    WHERE created_at >= v_month_start
      AND reverted = false
    GROUP BY to_status
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- Monthly ops summary
  v_monthly_ops := jsonb_build_object(
    'new_students',       v_students_this_month,
    'new_applications',   v_apps_this_month,
    'counselor_load',     v_counselor_load,
    'status_movements',   v_status_movements
  );

  result := jsonb_build_object(
    'kpi', jsonb_build_object(
      'total_students',       v_total_students,
      'total_applications',   v_total_applications,
      'needs_action',         v_needs_action,
      'pending_review',       v_pending_review,
      'visa_granted',         v_visa_granted,
      'unassigned',           v_unassigned,
      'students_this_month',  v_students_this_month,
      'apps_this_month',      v_apps_this_month,
      'conversion_rate',      CASE WHEN v_total_applications = 0 THEN 0
                              ELSE ROUND((v_visa_granted::NUMERIC / v_total_applications) * 100, 1) END
    ),
    'apps_by_status',     v_apps_by_status,
    'apps_by_degree',     v_apps_by_degree,
    'apps_by_subject',    v_apps_by_subject,
    'apps_by_city',       v_apps_by_city,
    'apps_by_university', v_apps_by_university,
    'apps_by_program',    v_apps_by_program,
    'monthly_ops',        v_monthly_ops
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard(INT) TO authenticated;