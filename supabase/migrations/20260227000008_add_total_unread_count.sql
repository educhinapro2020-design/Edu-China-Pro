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
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );
$$;