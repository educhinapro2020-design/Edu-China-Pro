-- Batch unread counts for conversation list
CREATE OR REPLACE FUNCTION public.get_unread_counts(
  p_conversation_ids uuid[],
  p_user_id uuid
)
RETURNS TABLE(conversation_id uuid, unread_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.conversation_id,
    COUNT(*) as unread_count
  FROM public.messages m
  WHERE m.conversation_id = ANY(p_conversation_ids)
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    )
  GROUP BY m.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;