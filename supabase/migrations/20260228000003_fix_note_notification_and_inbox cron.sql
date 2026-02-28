/*
 * Author: Nikesh
 * Date: 28th Feb 2026
 * Description:
 *   - Fix counselor public note → student notification gap
 *   - pg_cron job for cleanup_inbox_events
 */

-- FIX: notify_note_added
--  Counselor adds public note → also notify student

CREATE OR REPLACE FUNCTION public.notify_note_added()
RETURNS TRIGGER AS $$
DECLARE
  v_app        public.applications%ROWTYPE;
  v_author     public.profiles%ROWTYPE;
  v_student    public.profiles%ROWTYPE;
  v_admin      RECORD;
BEGIN
  SELECT * INTO v_app     FROM public.applications WHERE id = NEW.application_id;
  SELECT * INTO v_author  FROM public.profiles     WHERE id = NEW.author_id;
  SELECT * INTO v_student FROM public.profiles     WHERE id = v_app.student_id;

  IF v_author.role = 'counselor' THEN
    -- Notify all admins
    FOR v_admin IN
      SELECT id FROM public.profiles WHERE role = 'admin'
    LOOP
      PERFORM public.create_notification(
        v_admin.id,
        'note_added',
        'New note added',
        COALESCE(v_author.full_name, 'A counselor') || ' added a note on ' ||
          COALESCE(v_student.full_name, v_student.email, 'a student') || '''s application.',
        '/admin/applications/' || v_app.id
      );
    END LOOP;

    -- Notify student if public note
    IF NEW.visibility = 'public' THEN
      PERFORM public.create_notification(
        v_app.student_id,
        'note_added',
        'New note on your application',
        COALESCE(v_author.full_name, 'Your counselor') || ' left a note on your application.',
        '/dashboard/applications/' || v_app.id
      );
    END IF;

  ELSIF v_author.role = 'admin' THEN
    -- Notify assigned counselor if exists
    IF v_app.counselor_id IS NOT NULL THEN
      PERFORM public.create_notification(
        v_app.counselor_id,
        'note_added',
        'New note added',
        COALESCE(v_author.full_name, 'An admin') || ' added a note on ' ||
          COALESCE(v_student.full_name, v_student.email, 'a student') || '''s application.',
        '/counselor/applications/' || v_app.id
      );
    END IF;

    -- Notify student if public note
    IF NEW.visibility = 'public' THEN
      PERFORM public.create_notification(
        v_app.student_id,
        'note_added',
        'New note on your application',
        COALESCE(v_author.full_name, 'Your admin') || ' left a note on your application.',
        '/dashboard/applications/' || v_app.id
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PG_CRON: cleanup_inbox_events every hour

SELECT cron.schedule(
  'cleanup-inbox-events',
  '0 * * * *',
  $$
    SELECT public.cleanup_inbox_events();
  $$
);