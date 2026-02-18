/*
** Date: 2026-02-18
** Description: Creates the applications schema:
**   - applications table (with documents JSONB)
**   - application_messages table (student-counselor chat)
**   - application_notes table (internal staff notes)
**   - updates programs table with document_requirements
*/

-- Create Application Status Enum
DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM (
        'document_pending',
        'applied',
        'processing',
        'payment_pending',
        'payment_received',
        'admission_success',
        'admission_failure',
        'offer_letter_uploaded',
        'jw202_processing',
        'visa_docs_ready',
        'visa_granted'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    program_id      UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    counselor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    university_id   UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE, 
    
    status          public.application_status NOT NULL DEFAULT 'document_pending',
    
    documents       JSONB DEFAULT '{}',
    
    submitted_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_counselor_id ON public.applications(counselor_id);
CREATE INDEX IF NOT EXISTS idx_applications_program_id ON public.applications(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_university_id ON public.applications(university_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view/edit own applications" ON public.applications;
CREATE POLICY "Students can view/edit own applications" ON public.applications
    FOR ALL
    USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Counselors can view assigned applications" ON public.applications;
CREATE POLICY "Counselors can view assigned applications" ON public.applications
    FOR SELECT
    USING (
        auth.uid() = counselor_id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('counselor', 'admin')
    );

DROP POLICY IF EXISTS "Counselors can update assigned applications" ON public.applications;
CREATE POLICY "Counselors can update assigned applications" ON public.applications
    FOR UPDATE
    USING (
        auth.uid() = counselor_id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('counselor', 'admin')
    );

-- messages (Student <-> Counselor)
CREATE TABLE IF NOT EXISTS public.application_messages (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_application_id ON public.application_messages(application_id);

ALTER TABLE public.application_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages for their applications" ON public.application_messages;
CREATE POLICY "Users can view messages for their applications" ON public.application_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_messages.application_id
            AND (a.student_id = auth.uid() OR a.counselor_id = auth.uid())
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

DROP POLICY IF EXISTS "Users can send messages to their applications" ON public.application_messages;
CREATE POLICY "Users can send messages to their applications" ON public.application_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_messages.application_id
            AND (a.student_id = auth.uid() OR a.counselor_id = auth.uid())
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Internal Notes (Counselor/Admin only)
CREATE TABLE IF NOT EXISTS public.application_notes (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_application_id ON public.application_notes(application_id);

ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view notes" ON public.application_notes;
CREATE POLICY "Staff can view notes" ON public.application_notes
    FOR SELECT
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('counselor', 'admin'));

DROP POLICY IF EXISTS "Staff can create notes" ON public.application_notes;
CREATE POLICY "Staff can create notes" ON public.application_notes
    FOR INSERT
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('counselor', 'admin'));

-- Update Programs table to include document requirements
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS document_requirements JSONB DEFAULT '[]';

-- Trigger to update updated_at on applications
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_updated ON public.applications;
CREATE TRIGGER on_application_updated
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

