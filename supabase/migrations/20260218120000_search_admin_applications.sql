/*
** Date: 2026-02-18
** Description: RPC for admin applications page.
**   Server-side search, status filter, pagination, and recently-updated.
*/

CREATE OR REPLACE FUNCTION public.search_admin_applications(
  p_search TEXT DEFAULT '',
  p_status TEXT DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INT := (p_page - 1) * p_page_size;
  v_search TEXT := LOWER(TRIM(p_search));
  v_data JSONB;
  v_total INT;
  v_recently_updated JSONB;
  v_status_counts JSONB;
BEGIN

  SELECT count(*)::INT INTO v_total
  FROM applications a
  JOIN profiles pr ON pr.id = a.student_id
  JOIN programs p ON p.id = a.program_id
  JOIN universities u ON u.id = a.university_id
  WHERE
    (p_status IS NULL OR a.status::TEXT = p_status)
    AND (
      v_search = '' OR
      LOWER(pr.full_name) LIKE '%' || v_search || '%' OR
      LOWER(pr.email) LIKE '%' || v_search || '%' OR
      LOWER(p.name_en) LIKE '%' || v_search || '%' OR
      LOWER(u.name_en) LIKE '%' || v_search || '%' OR
      LOWER(a.status::TEXT) LIKE '%' || v_search || '%'
    );

  SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
  INTO v_data
  FROM (
    SELECT
      a.id,
      a.status,
      a.created_at,
      a.updated_at,
      a.submitted_at,
      jsonb_build_object(
        'full_name', pr.full_name,
        'email', pr.email,
        'avatar_url', pr.avatar_url
      ) AS student,
      jsonb_build_object(
        'id', p.id,
        'name_en', p.name_en,
        'university', jsonb_build_object(
          'id', u.id,
          'name_en', u.name_en,
          'logo_url', u.logo_url
        )
      ) AS program
    FROM applications a
    JOIN profiles pr ON pr.id = a.student_id
    JOIN programs p ON p.id = a.program_id
    JOIN universities u ON u.id = a.university_id
    WHERE
      (p_status IS NULL OR a.status::TEXT = p_status)
      AND (
        v_search = '' OR
        LOWER(pr.full_name) LIKE '%' || v_search || '%' OR
        LOWER(pr.email) LIKE '%' || v_search || '%' OR
        LOWER(p.name_en) LIKE '%' || v_search || '%' OR
        LOWER(u.name_en) LIKE '%' || v_search || '%' OR
        LOWER(a.status::TEXT) LIKE '%' || v_search || '%'
      )
    ORDER BY a.created_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) t;

  IF p_page = 1 AND v_search = '' AND p_status IS NULL THEN
    SELECT COALESCE(jsonb_agg(row_to_json(t)::JSONB), '[]'::JSONB)
    INTO v_recently_updated
    FROM (
      SELECT
        a.id,
        a.status,
        a.created_at,
        a.updated_at,
        jsonb_build_object(
          'full_name', pr.full_name,
          'email', pr.email,
          'avatar_url', pr.avatar_url
        ) AS student,
        jsonb_build_object(
          'id', p.id,
          'name_en', p.name_en,
          'university', jsonb_build_object(
            'id', u.id,
            'name_en', u.name_en,
            'logo_url', u.logo_url
          )
        ) AS program
      FROM applications a
      JOIN profiles pr ON pr.id = a.student_id
      JOIN programs p ON p.id = a.program_id
      JOIN universities u ON u.id = a.university_id
      ORDER BY a.updated_at DESC
      LIMIT 10
    ) t;
  ELSE
    v_recently_updated := '[]'::JSONB;
  END IF;

  SELECT COALESCE(jsonb_object_agg(status::TEXT, cnt), '{}'::JSONB)
  INTO v_status_counts
  FROM (
    SELECT status, count(*)::INT AS cnt
    FROM applications
    GROUP BY status
  ) s;

  RETURN jsonb_build_object(
    'data', v_data,
    'total_count', v_total,
    'recently_updated', v_recently_updated,
    'status_counts', v_status_counts
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_admin_applications(TEXT, TEXT, INT, INT) TO authenticated;
