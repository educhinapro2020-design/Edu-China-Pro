ALTER TABLE public.universities
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN featured_order integer;

ALTER TABLE public.programs
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN featured_order integer;

CREATE INDEX idx_universities_featured ON public.universities (featured_order) WHERE is_featured = true;
CREATE INDEX idx_programs_featured ON public.programs (featured_order) WHERE is_featured = true;