/*
 * Author: Nikesh
 * Date: 28th Feb 2026
 * Description: Notifications system
 *   - notifications table with RLS
 *   - notification_type enum
 *   - all triggers
 *   - pg_cron cleanup job
 */

-- ENUM

CREATE TYPE notification_type AS ENUM (
  'new_student',
  'application_created',
  'application_submitted',
  'status_changed',
  'counselor_assigned',
  'document_status_changed',
  'admin_upload',
  'note_added'
);

-- Notification Table

CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      text NOT NULL,
  body       text NOT NULL,
  link       text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX notifications_user_id_idx        ON public.notifications(user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx    ON public.notifications(user_id) WHERE read_at IS NULL;

-- RLS

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_see_own_notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_update_own_notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_all_notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (public.is_admin());

-- Service role can insert from triggers 
CREATE POLICY "service_insert_notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Helper: notify a single user

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id  uuid,
  p_type     notification_type,
  p_title    text,
  p_body     text,
  p_link     text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, title, body, link)
  VALUES (p_user_id, p_type, p_title, p_body, p_link);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: new_student
--    INSERT on profiles WHERE role = 'student'
--    → notify all admins + all counselors
-- links
-- /admin/messages - to admins
-- /counselor/messages - to counselors

CREATE OR REPLACE FUNCTION public.notify_new_student()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient RECORD;
  v_name      text;
BEGIN
  v_name := COALESCE(NEW.full_name, NEW.email, 'A new student');

  FOR v_recipient IN
    SELECT id, role FROM public.profiles
    WHERE role IN ('admin', 'counselor')
  LOOP
    PERFORM public.create_notification(
      v_recipient.id,
      'new_student',
      'New student registered',
      v_name || ' has just signed up.',
      CASE v_recipient.role
        WHEN 'admin'     THEN '/admin/messages'
        WHEN 'counselor' THEN '/counselor/messages'
      END
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_student
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'student')
  EXECUTE FUNCTION public.notify_new_student();

-- TRIGGER: application_created
--    INSERT on applications
--    → notify all admins only
-- links
-- /admin/applications/[id] - to admins

CREATE OR REPLACE FUNCTION public.notify_application_created()
RETURNS TRIGGER AS $$
DECLARE
  v_admin     RECORD;
  v_student   public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_student FROM public.profiles WHERE id = NEW.student_id;

  FOR v_admin IN
    SELECT id FROM public.profiles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      v_admin.id,
      'application_created',
      'New application created',
      COALESCE(v_student.full_name, v_student.email, 'A student') || ' created a new application.',
      '/admin/applications/' || NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_created();

-- TRIGGER: application_submitted + status_changed
--    INSERT on application_status_history
--    → if to_status = 'submitted': admins + assigned counselor
--    → all other statuses: student
-- links
-- /admin/applications/[id] - to admins
-- /counselor/applications/[id] - to counselors
-- /dashboard/applications/[id] - to students

CREATE OR REPLACE FUNCTION public.notify_application_status_history()
RETURNS TRIGGER AS $$
DECLARE
  v_app       public.applications%ROWTYPE;
  v_student   public.profiles%ROWTYPE;
  v_admin     RECORD;
  v_label     text;
BEGIN
  SELECT * INTO v_app FROM public.applications WHERE id = NEW.application_id;
  SELECT * INTO v_student FROM public.profiles WHERE id = v_app.student_id;

  v_label := REPLACE(NEW.to_status::text, '_', ' ');
  v_label := INITCAP(v_label);

  IF NEW.to_status = 'submitted' THEN
    -- Notify all admins
    FOR v_admin IN
      SELECT id FROM public.profiles WHERE role = 'admin'
    LOOP
      PERFORM public.create_notification(
        v_admin.id,
        'application_submitted',
        'Application submitted',
        COALESCE(v_student.full_name, v_student.email, 'A student') || ' submitted their application.',
        '/admin/applications/' || v_app.id
      );
    END LOOP;

    -- Notify assigned counselor if exists
    IF v_app.counselor_id IS NOT NULL THEN
      PERFORM public.create_notification(
        v_app.counselor_id,
        'application_submitted',
        'Application submitted',
        COALESCE(v_student.full_name, v_student.email, 'A student') || ' submitted their application.',
        '/counselor/applications/' || v_app.id
      );
    END IF;

  ELSE
    -- Notify student of status change
    PERFORM public.create_notification(
      v_app.student_id,
      'status_changed',
      'Application status updated',
      'Your application status has been updated to: ' || v_label || '.',
      '/dashboard/applications/' || v_app.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_status_history
  AFTER INSERT ON public.application_status_history
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_status_history();

-- TRIGGER: counselor_assigned
--    UPDATE on applications WHERE counselor_id changed
--    → notify student + new counselor
-- links
-- /dashboard/applications/[id] - to student
-- /counselor/applications/[id] - to new counselor

CREATE OR REPLACE FUNCTION public.notify_counselor_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_student       public.profiles%ROWTYPE;
  v_new_counselor public.profiles%ROWTYPE;
  v_old_counselor public.profiles%ROWTYPE;
  v_is_reassignment boolean;
BEGIN
  IF NEW.counselor_id IS NULL OR NEW.counselor_id = OLD.counselor_id THEN
    RETURN NEW;
  END IF;

  v_is_reassignment := OLD.counselor_id IS NOT NULL;

  SELECT * INTO v_student       FROM public.profiles WHERE id = NEW.student_id;
  SELECT * INTO v_new_counselor FROM public.profiles WHERE id = NEW.counselor_id;

  -- Notify student
  PERFORM public.create_notification(
    NEW.student_id,
    'counselor_assigned',
    CASE WHEN v_is_reassignment THEN 'Counselor changed' ELSE 'Counselor assigned' END,
    CASE WHEN v_is_reassignment
      THEN 'Your counselor has been changed to ' || COALESCE(v_new_counselor.full_name, 'a new counselor') || '.'
      ELSE COALESCE(v_new_counselor.full_name, 'A counselor') || ' has been assigned to your application.'
    END,
    '/dashboard/applications/' || NEW.id
  );

  -- Notify new counselor
  PERFORM public.create_notification(
    NEW.counselor_id,
    'counselor_assigned',
    'Application assigned to you',
    'You have been assigned to ' || COALESCE(v_student.full_name, v_student.email, 'a student') || '''s application.',
    '/counselor/applications/' || NEW.id
  );

  -- Notify old counselor if reassignment
  IF v_is_reassignment THEN
    SELECT * INTO v_old_counselor FROM public.profiles WHERE id = OLD.counselor_id;
    PERFORM public.create_notification(
      OLD.counselor_id,
      'counselor_assigned',
      'Application unassigned',
      'You have been removed from ' || COALESCE(v_student.full_name, v_student.email, 'a student') || '''s application.',
      '/counselor/applications/' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_counselor_assigned
  AFTER UPDATE OF counselor_id ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_counselor_assigned();

-- TRIGGER: document_status_changed
--    UPDATE on applications WHERE documents JSON changed
--    Fires when any doc's status field changes
--    → notify student
-- links
-- /dashboard/applications/[id] - to student

CREATE OR REPLACE FUNCTION public.notify_document_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  v_doc_key   text;
  v_old_status text;
  v_new_status text;
  v_changed   boolean := false;
  v_label     text;
BEGIN
  IF NEW.documents IS NOT DISTINCT FROM OLD.documents THEN
    RETURN NEW;
  END IF;
  FOR v_doc_key IN
    SELECT jsonb_object_keys(NEW.documents)
  LOOP
    v_old_status := OLD.documents -> v_doc_key ->> 'status';
    v_new_status := NEW.documents -> v_doc_key ->> 'status';

    IF v_new_status IS NOT NULL AND v_new_status IS DISTINCT FROM v_old_status THEN
      v_changed := true;
      v_label   := REPLACE(v_doc_key, '_', ' ');
      v_label   := INITCAP(v_label);

      PERFORM public.create_notification(
        NEW.student_id,
        'document_status_changed',
        'Document status updated',
        'Your document "' || v_label || '" status changed to: ' || REPLACE(v_new_status, '_', ' ') || '.',
        '/dashboard/applications/' || NEW.id
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_document_status_changed
  AFTER UPDATE OF documents ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_document_status_changed();

-- TRIGGER: admin_upload
--     UPDATE on applications WHERE user_downloads changed
--     Fires when a net-new URL appears (handles delete+add)
--     → notify student
-- links
-- /dashboard/applications/[id] - to student

CREATE OR REPLACE FUNCTION public.notify_admin_upload()
RETURNS TRIGGER AS $$
DECLARE
  v_new_doc   jsonb;
  v_new_url   text;
  v_new_title text;
  v_old_urls  text[];
  v_notified  boolean := false;
BEGIN
  IF NEW.user_downloads IS NOT DISTINCT FROM OLD.user_downloads THEN
    RETURN NEW;
  END IF;

  SELECT ARRAY_AGG(elem ->> 'url')
  INTO v_old_urls
  FROM jsonb_array_elements(COALESCE(OLD.user_downloads, '[]'::jsonb)) AS elem;
  FOR v_new_doc IN
    SELECT * FROM jsonb_array_elements(COALESCE(NEW.user_downloads, '[]'::jsonb))
  LOOP
    v_new_url   := v_new_doc ->> 'url';
    v_new_title := v_new_doc ->> 'title';

    IF v_new_url IS NOT NULL AND (v_old_urls IS NULL OR NOT (v_new_url = ANY(v_old_urls))) THEN
      PERFORM public.create_notification(
        NEW.student_id,
        'admin_upload',
        'New document available',
        'A new document "' || COALESCE(v_new_title, 'Untitled') || '" has been uploaded for you.',
        '/dashboard/applications/' || NEW.id
      );
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_admin_upload
  AFTER UPDATE OF user_downloads ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_upload();

-- TRIGGER: note_added
--     INSERT on application_notes
--     → counselor adds note: notify all admins
--     → admin adds note:
--         always notify assigned counselor (if exists)
--         notify student if visibility = 'public'
-- links
-- /admin/applications/[id] - to admins
-- /counselor/applications/[id] - to counselor
-- /dashboard/applications/[id] - to student

CREATE OR REPLACE FUNCTION public.notify_note_added()
RETURNS TRIGGER AS $$
DECLARE
  v_app        public.applications%ROWTYPE;
  v_author     public.profiles%ROWTYPE;
  v_student    public.profiles%ROWTYPE;
  v_admin      RECORD;
BEGIN
  SELECT * INTO v_app    FROM public.applications WHERE id = NEW.application_id;
  SELECT * INTO v_author FROM public.profiles     WHERE id = NEW.author_id;
  SELECT * INTO v_student FROM public.profiles    WHERE id = v_app.student_id;

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
        COALESCE(v_author.full_name, 'Your counselor') || ' left a note on your application.',
        '/dashboard/applications/' || v_app.id
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_note_added
  AFTER INSERT ON public.application_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_note_added();

-- REALTIME

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- PG_CRON: delete read notifications older than 30 days

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-read-notifications',
  '0 3 * * *',  -- every day at 3am
  $$
    DELETE FROM public.notifications
    WHERE read_at IS NOT NULL
      AND read_at < now() - INTERVAL '30 days';
  $$
);