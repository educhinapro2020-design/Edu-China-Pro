/*
* Author: Nikesh
* Date: 27th Feb 2026
* Description: Fix broken references after removing read_at column
* Adds message_reads table and updates all dependent functions
*/

-- Drop old trigger that references read_at 
DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
DROP FUNCTION IF EXISTS public.update_conversation_timestamp();

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- Create message_reads table
CREATE TABLE IF NOT EXISTS public.message_reads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at       timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(message_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS message_reads_message_id_idx ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS message_reads_user_id_idx ON public.message_reads(user_id, read_at);

-- Enable RLS
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "user_own_reads_select" ON public.message_reads;
DROP POLICY IF EXISTS "user_own_reads_insert" ON public.message_reads;
DROP POLICY IF EXISTS "admin_all_reads" ON public.message_reads;

CREATE POLICY "user_own_reads_select"
  ON public.message_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_own_reads_insert"
  ON public.message_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_all_reads"
  ON public.message_reads FOR ALL TO authenticated
  USING (public.is_admin());

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.message_reads (message_id, user_id)
  SELECT m.id, p_user_id
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    )
  ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_count(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix messages table - ensure no read_at references remain

DROP INDEX IF EXISTS messages_unread_idx;
CREATE INDEX messages_conversation_created_idx ON public.messages(conversation_id, created_at ASC);