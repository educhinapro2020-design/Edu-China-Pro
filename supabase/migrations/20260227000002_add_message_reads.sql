/*
* Author: Nikesh
* Date: 27th Feb 2026
* Description: Add per-user message read tracking
* Fixes: Single read_at field causes cross-user read status leaks
*/

-- Create message_reads table for per-user tracking
CREATE TABLE public.message_reads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at       timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(message_id, user_id)  -- one read record per user per message
);

-- Index for fast lookups
CREATE INDEX message_reads_message_id_idx ON public.message_reads(message_id);
CREATE INDEX message_reads_user_id_idx ON public.message_reads(user_id, read_at);

-- Enable RLS
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see their own read records
CREATE POLICY "user_own_reads_select"
  ON public.message_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_own_reads_insert"
  ON public.message_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can see all
CREATE POLICY "admin_all_reads"
  ON public.message_reads FOR ALL TO authenticated
  USING (public.is_admin());

-- Drop old read_at column from messages 
ALTER TABLE public.messages DROP COLUMN read_at;

-- Function to mark messages as read for current user
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
    AND m.sender_id != p_user_id  -- don't mark own messages
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count for user in conversation
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
