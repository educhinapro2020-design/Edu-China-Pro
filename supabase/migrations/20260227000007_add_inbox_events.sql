-- Create inbox_events table with no RLS so Realtime can broadcast freely
CREATE TABLE public.inbox_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_events;

-- Update trigger to also insert into inbox_events on every new message
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;

  INSERT INTO public.inbox_events DEFAULT VALUES;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Periodic cleanup: delete inbox_events older than 1 hour
CREATE OR REPLACE FUNCTION public.cleanup_inbox_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.inbox_events
  WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;