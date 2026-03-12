CREATE TABLE public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  link_url text,
  link_label text,
  is_active boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  starts_at date,
  ends_at date,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read announcements"
  ON public.announcements FOR SELECT USING (true);

CREATE POLICY "Admins can insert announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'counselor')
    )
  );

CREATE POLICY "Admins can update announcements"
  ON public.announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'counselor')
    )
  );

CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'counselor')
    )
  );

CREATE INDEX idx_announcements_active
  ON public.announcements (display_order)
  WHERE is_active = true;
