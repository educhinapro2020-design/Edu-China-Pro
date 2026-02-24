/*
  Counselor Section - Phase 1
  
  * Add `description` column to profiles (nullable,for bio/excerpt)
  * Add `search_counselor_applications` RPC (counselor-scoped, filters by counselor_id)
*/

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;


-- RPC: search_counselor_applications
--    - Scoped strictly to the calling counselor's assigned applications
--    - Includes status_counts for their own applications only

CREATE OR REPLACE FUNCTION public.search_counselor_applications(
  p_counselor_id  UUID,
  p_search        TEXT    DEFAULT '',
  p_status        TEXT    DEFAULT NULL,
  p_page          INT     DEFAULT 1,
  p_page_size     INT     DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset        INT;
  v_total_count   INT;
  v_data          JSON;
  v_status_counts JSON;
BEGIN
  -- Security: ensure the caller IS the counselor they're querying for
  IF auth.uid() IS DISTINCT FROM p_counselor_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  -- Total count 
  SELECT COUNT(*)
  INTO v_total_count
  FROM applications a
  JOIN programs     pr ON pr.id = a.program_id
  JOIN universities u  ON u.id  = pr.university_id
  JOIN profiles     st ON st.id = a.student_id
  WHERE a.counselor_id = p_counselor_id
    AND (
      p_status IS NULL
      OR a.status = p_status::application_status
    )
    AND (
      p_search = ''
      OR st.full_name ILIKE '%' || p_search || '%'
      OR st.email     ILIKE '%' || p_search || '%'
      OR pr.name_en   ILIKE '%' || p_search || '%'
      OR u.name_en    ILIKE '%' || p_search || '%'
      OR a.status::TEXT ILIKE '%' || p_search || '%'
    );

  -- Paginated application rows
  SELECT JSON_AGG(row_data ORDER BY row_data->>'updated_at' DESC)
  INTO v_data
  FROM (
    SELECT JSON_BUILD_OBJECT(
      'id',           a.id,
      'status',       a.status,
      'created_at',   a.created_at,
      'updated_at',   a.updated_at,
      'submitted_at', a.submitted_at,
      'student', JSON_BUILD_OBJECT(
        'full_name',  st.full_name,
        'email',      st.email,
        'avatar_url', st.avatar_url
      ),
      'program', JSON_BUILD_OBJECT(
        'id',      pr.id,
        'name_en', pr.name_en,
        'university', JSON_BUILD_OBJECT(
          'id',       u.id,
          'name_en',  u.name_en,
          'logo_url', u.logo_url
        )
      )
    ) AS row_data
    FROM applications a
    JOIN programs     pr ON pr.id = a.program_id
    JOIN universities u  ON u.id  = pr.university_id
    JOIN profiles     st ON st.id = a.student_id
    WHERE a.counselor_id = p_counselor_id
      AND (
        p_status IS NULL
        OR a.status = p_status::application_status
      )
      AND (
        p_search = ''
        OR st.full_name ILIKE '%' || p_search || '%'
        OR st.email     ILIKE '%' || p_search || '%'
        OR pr.name_en   ILIKE '%' || p_search || '%'
        OR u.name_en    ILIKE '%' || p_search || '%'
        OR a.status::TEXT ILIKE '%' || p_search || '%'
      )
    ORDER BY a.updated_at DESC
    LIMIT  p_page_size
    OFFSET v_offset
  ) sub;

  -- Status counts (across ALL this counselor's applications)
  SELECT JSON_OBJECT_AGG(status_key, cnt)
  INTO v_status_counts
  FROM (
    SELECT a.status::TEXT AS status_key, COUNT(*) AS cnt
    FROM applications a
    WHERE a.counselor_id = p_counselor_id
    GROUP BY a.status
  ) sc;

  RETURN JSON_BUILD_OBJECT(
    'data',          COALESCE(v_data, '[]'::JSON),
    'total_count',   v_total_count,
    'status_counts', COALESCE(v_status_counts, '{}'::JSON)
  );
END;
$$;

-- Only authenticated users can call this;
REVOKE ALL ON FUNCTION public.search_counselor_applications(UUID, TEXT, TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_counselor_applications(UUID, TEXT, TEXT, INT, INT) TO authenticated;