/*
* Author: Nikesh
* Date: 26th Feb 2026
* Description: Chat System Migration
* Drop unused application_messages table
* Create conversations table (one per student, not per application)
* Create messages table
* RLS policies reflecting unclaimed/claimed/assigned states
*/

-- Drop old unused table
DROP TABLE IF EXISTS public.application_messages;

-- Create conversations table
-- One conversation per student
-- claimed_by_id: first counselor to respond
-- counselor_id: admin-assigned counselor (overrides claim)

CREATE TABLE public.conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_by_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- first counselor to jump in
  counselor_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- admin assigned (overrides claim)
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT conversations_student_id_unique UNIQUE (student_id)  -- one conversation per student
);

-- Create messages table
CREATE TABLE public.messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role      public.user_role NOT NULL,
  content          text NOT NULL CHECK (char_length(content) > 0),
  is_system        boolean NOT NULL DEFAULT false,  -- for system messages like "Counselor X has joined"
  read_at          timestamptz,                     -- null = unread
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX messages_conversation_id_idx ON public.messages(conversation_id, created_at ASC);
CREATE INDEX messages_unread_idx ON public.messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: conversations

-- Admin: full access to everything always
CREATE POLICY "admin_all_conversations"
  ON public.conversations FOR ALL TO authenticated
  USING (public.is_admin());

-- Student: only their own conversation
CREATE POLICY "student_own_conversation"
  ON public.conversations FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- Counselor: can see all conversations (shared inbox)
CREATE POLICY "counselor_read_all_conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'counselor'
    )
  );

-- Counselor: can update conversation (to claim it)
CREATE POLICY "counselor_claim_conversation"
  ON public.conversations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'counselor'
    )
  );

-- RLS Policies: messages

-- Admin: full access always
CREATE POLICY "admin_all_messages"
  ON public.messages FOR ALL TO authenticated
  USING (public.is_admin());

-- Student: read/write in their own conversation
CREATE POLICY "student_own_messages"
  ON public.messages FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND c.student_id = auth.uid()
    )
  );

-- Counselor: can read ALL messages (shared inbox visibility)
CREATE POLICY "counselor_read_all_messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'counselor'
    )
  );

-- Counselor: can write messages only if:
-- (a) conversation is unclaimed (no claimed_by_id, no counselor_id), OR
-- (b) they are the one who claimed it (claimed_by_id = them), OR
-- (c) they are the admin-assigned counselor (counselor_id = them)
CREATE POLICY "counselor_write_messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = messages.conversation_id
      AND p.role = 'counselor'
      AND (
        (c.claimed_by_id IS NULL AND c.counselor_id IS NULL)  
        OR c.claimed_by_id = auth.uid()                        
        OR c.counselor_id = auth.uid()                         
      )
    )
  );

-- Auto-create conversation when student signs up
-- Student gets a conversation from day one
CREATE OR REPLACE FUNCTION public.create_conversation_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.conversations (student_id)
    VALUES (NEW.id)
    ON CONFLICT (student_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_student_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_conversation_on_signup();

-- Auto-claim conversation when counselor sends first message
-- Sets claimed_by_id if conversation is still unclaimed
CREATE OR REPLACE FUNCTION public.auto_claim_conversation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_role = 'counselor' THEN
    UPDATE public.conversations
    SET claimed_by_id = NEW.sender_id
    WHERE id = NEW.conversation_id
    AND claimed_by_id IS NULL
    AND counselor_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_counselor_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_claim_conversation();

-- Sync counselor assignment from applications table
-- When admin assigns counselor to an application,
-- update the student's conversation and insert a system message
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
      -- Override any existing claim with the admin assignment
      UPDATE public.conversations
      SET counselor_id  = NEW.counselor_id,
          claimed_by_id = NEW.counselor_id,
          updated_at    = now()
      WHERE id = v_conversation_id;

      -- Insert system message visible to student
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

CREATE TRIGGER on_application_counselor_assigned
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_assigned_counselor_to_conversation();