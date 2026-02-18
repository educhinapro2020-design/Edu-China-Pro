/*
** Date: 2026-02-18  Author: Nikesh
** Description: Single RPC function for the admin dashboard.
** Returns all KPIs, trend data, and top-8 breakdowns in one call.
*/

CREATE OR REPLACE FUNCTION public.get_admin_dashboard(p_weeks INT DEFAULT 6)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  v_now TIMESTAMPTZ := NOW();
  v_start TIMESTAMPTZ := date_trunc('week', v_now) - (p_weeks * INTERVAL '1 week');
  v_this_week_start TIMESTAMPTZ := date_trunc('week', v_now);
  v_last_week_start TIMESTAMPTZ := v_this_week_start - INTERVAL '1 week';

  -- KPI counts
  v_total_students INT;
  v_total_applications INT;
  v_total_universities INT;
  v_total_programs INT;

  -- Trend % 
  v_students_this_week INT;
  v_students_last_week INT;
  v_apps_this_week INT;
  v_apps_last_week INT;
  v_student_trend NUMERIC;
  v_application_trend NUMERIC;

  -- Aggregated arrays
  v_signup_trend JSONB;
  v_application_trend_arr JSONB;
  v_apps_by_degree JSONB;
  v_apps_by_subject JSONB;
  v_apps_by_city JSONB;
  v_apps_by_university JSONB;
  v_programs_by_degree JSONB;
  v_programs_by_language JSONB;
  v_programs_by_subject JSONB;
  v_universities_by_type JSONB;
  v_universities_by_city JSONB;
BEGIN
  -- KPI Counts
  SELECT count(*) INTO v_total_students
  FROM profiles WHERE role = 'student';

  SELECT count(*) INTO v_total_applications
  FROM applications;

  SELECT count(*) INTO v_total_universities
  FROM universities;

  SELECT count(*) INTO v_total_programs
  FROM programs;

  -- Week-over-week trends
  SELECT count(*) INTO v_students_this_week
  FROM profiles
  WHERE role = 'student'
    AND created_at >= v_this_week_start;

  SELECT count(*) INTO v_students_last_week
  FROM profiles
  WHERE role = 'student'
    AND created_at >= v_last_week_start
    AND created_at < v_this_week_start;

  SELECT count(*) INTO v_apps_this_week
  FROM applications
  WHERE created_at >= v_this_week_start;

  SELECT count(*) INTO v_apps_last_week
  FROM applications
  WHERE created_at >= v_last_week_start
    AND created_at < v_this_week_start;

  -- Calculate % change 
  v_student_trend := CASE
    WHEN v_students_last_week = 0 THEN 0
    ELSE ROUND(((v_students_this_week - v_students_last_week)::NUMERIC / v_students_last_week) * 100, 1)
  END;

  v_application_trend := CASE
    WHEN v_apps_last_week = 0 THEN 0
    ELSE ROUND(((v_apps_this_week - v_apps_last_week)::NUMERIC / v_apps_last_week) * 100, 1)
  END;

  -- Signup Trend 
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB ORDER BY t.week_start), '[]'::JSONB)
  INTO v_signup_trend
  FROM (
    SELECT
      to_char(date_trunc('week', created_at), 'Mon DD') AS label,
      date_trunc('week', created_at) AS week_start,
      count(*)::INT AS value
    FROM profiles
    WHERE role = 'student'
      AND created_at >= v_start
    GROUP BY date_trunc('week', created_at)
    ORDER BY date_trunc('week', created_at)
  ) t;

  -- Application Trend 
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB ORDER BY t.week_start), '[]'::JSONB)
  INTO v_application_trend_arr
  FROM (
    SELECT
      to_char(date_trunc('week', created_at), 'Mon DD') AS label,
      date_trunc('week', created_at) AS week_start,
      count(*)::INT AS value
    FROM applications
    WHERE created_at >= v_start
    GROUP BY date_trunc('week', created_at)
    ORDER BY date_trunc('week', created_at)
  ) t;

  -- ── Applications by Degree (top 8) ─────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_degree
  FROM (
    SELECT
      INITCAP(REPLACE(p.degree_level::TEXT, '_', ' ')) AS label,
      count(*)::INT AS value
    FROM applications a
    JOIN programs p ON p.id = a.program_id
    GROUP BY p.degree_level
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Applications by Subject Area (top 8) ────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_subject
  FROM (
    SELECT
      sa.name_en AS label,
      count(*)::INT AS value
    FROM applications a
    JOIN programs p ON p.id = a.program_id
    JOIN subject_areas sa ON sa.id = p.subject_area_id
    GROUP BY sa.name_en
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Applications by City (top 8) ────────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_city
  FROM (
    SELECT
      c.name_en AS label,
      count(*)::INT AS value
    FROM applications a
    JOIN universities u ON u.id = a.university_id
    JOIN cities c ON c.id = u.city_id
    GROUP BY c.name_en
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Applications by University (top 8) ──────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_apps_by_university
  FROM (
    SELECT
      u.name_en AS label,
      count(*)::INT AS value
    FROM applications a
    JOIN universities u ON u.id = a.university_id
    GROUP BY u.name_en
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Programs by Degree Level (top 8) ────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_programs_by_degree
  FROM (
    SELECT
      INITCAP(REPLACE(degree_level::TEXT, '_', ' ')) AS label,
      count(*)::INT AS value
    FROM programs
    GROUP BY degree_level
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Programs by Language (top 8) ────────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_programs_by_language
  FROM (
    SELECT
      INITCAP(REPLACE(language::TEXT, '_', ' ')) AS label,
      count(*)::INT AS value
    FROM programs
    GROUP BY language
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Programs by Subject Area (top 8) ────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_programs_by_subject
  FROM (
    SELECT
      sa.name_en AS label,
      count(*)::INT AS value
    FROM programs p
    JOIN subject_areas sa ON sa.id = p.subject_area_id
    GROUP BY sa.name_en
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Universities by Type ────────────────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_universities_by_type
  FROM (
    SELECT
      INITCAP(institution_type::TEXT) AS label,
      count(*)::INT AS value
    FROM universities
    GROUP BY institution_type
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  -- ── Universities by City (top 8) ────────────────────────────
  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_universities_by_city
  FROM (
    SELECT
      c.name_en AS label,
      count(*)::INT AS value
    FROM universities u
    JOIN cities c ON c.id = u.city_id
    GROUP BY c.name_en
    ORDER BY count(*) DESC
    LIMIT 8
  ) t;

  result := jsonb_build_object(
    'kpi', jsonb_build_object(
      'total_students', v_total_students,
      'total_applications', v_total_applications,
      'total_universities', v_total_universities,
      'total_programs', v_total_programs,
      'student_trend', v_student_trend,
      'application_trend', v_application_trend
    ),
    'signup_trend', v_signup_trend,
    'application_trend', v_application_trend_arr,
    'apps_by_degree', v_apps_by_degree,
    'apps_by_subject', v_apps_by_subject,
    'apps_by_city', v_apps_by_city,
    'apps_by_university', v_apps_by_university,
    'programs_by_degree', v_programs_by_degree,
    'programs_by_language', v_programs_by_language,
    'programs_by_subject', v_programs_by_subject,
    'universities_by_type', v_universities_by_type,
    'universities_by_city', v_universities_by_city
  );

  RETURN result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard(INT) TO authenticated;
