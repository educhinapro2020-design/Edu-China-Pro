-- Update auto_claim_conversation: simple system message, no description in content
CREATE OR REPLACE FUNCTION public.auto_claim_conversation()
RETURNS TRIGGER AS $$
DECLARE
  v_counselor_name text;
BEGIN
  IF NEW.sender_role = 'counselor' THEN
    UPDATE public.conversations
    SET claimed_by_id = NEW.sender_id
    WHERE id = NEW.conversation_id
    AND claimed_by_id IS NULL
    AND counselor_id IS NULL;

    IF FOUND THEN
      SELECT full_name INTO v_counselor_name
      FROM public.profiles
      WHERE id = NEW.sender_id;

      INSERT INTO public.messages (conversation_id, sender_id, sender_role, content, is_system)
      VALUES (
        NEW.conversation_id,
        NEW.sender_id,
        'counselor',
        COALESCE(v_counselor_name, 'A counselor') || ' has joined the conversation.',
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update sync_assigned_counselor_to_conversation: simple system message, no description in content
CREATE OR REPLACE FUNCTION public.sync_assigned_counselor_to_conversation()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation_id uuid;
  v_counselor_name  text;
BEGIN
  IF NEW.counselor_id IS DISTINCT FROM OLD.counselor_id AND NEW.counselor_id IS NOT NULL THEN

    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE student_id = NEW.student_id;

    SELECT full_name INTO v_counselor_name
    FROM public.profiles
    WHERE id = NEW.counselor_id;

    IF v_conversation_id IS NOT NULL THEN
      UPDATE public.conversations
      SET counselor_id  = NEW.counselor_id,
          claimed_by_id = NEW.counselor_id,
          updated_at    = now()
      WHERE id = v_conversation_id;

      INSERT INTO public.messages (conversation_id, sender_id, sender_role, content, is_system)
      VALUES (
        v_conversation_id,
        NEW.counselor_id,
        'counselor',
        COALESCE(v_counselor_name, 'A counselor') || ' has been assigned to your application.',
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_unread_count: scoped to counselor's own + unclaimed conversations
CREATE OR REPLACE FUNCTION public.get_unread_count(
  p_conversation_id uuid,
  p_user_id         uuid
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND (
      c.claimed_by_id IS NULL AND c.counselor_id IS NULL  -- unclaimed
      OR c.claimed_by_id = p_user_id                      -- claimed by me
      OR c.counselor_id  = p_user_id                      -- assigned to me
      OR c.student_id    = p_user_id                      -- i am the student
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
$$;

-- Update get_unread_counts: scoped batch version
CREATE OR REPLACE FUNCTION public.get_unread_counts(
  p_conversation_ids uuid[],
  p_user_id          uuid
)
RETURNS TABLE(conversation_id uuid, unread_count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    m.conversation_id,
    COUNT(*)::bigint AS unread_count
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.conversation_id = ANY(p_conversation_ids)
    AND m.sender_id != p_user_id
    AND (
      c.claimed_by_id IS NULL AND c.counselor_id IS NULL
      OR c.claimed_by_id = p_user_id
      OR c.counselor_id  = p_user_id
      OR c.student_id    = p_user_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    )
  GROUP BY m.conversation_id;
$$;

-- Update get_total_unread_count: scoped version for sidebar badge
CREATE OR REPLACE FUNCTION public.get_total_unread_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.sender_id != p_user_id
    AND (
      c.claimed_by_id IS NULL AND c.counselor_id IS NULL
      OR c.claimed_by_id = p_user_id
      OR c.counselor_id  = p_user_id
      OR c.student_id    = p_user_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
$$;