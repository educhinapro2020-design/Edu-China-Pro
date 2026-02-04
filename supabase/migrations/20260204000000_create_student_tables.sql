/*
** Date: 2026-02-04 Author: Nikesh
** Migration: Create Student Profiles and Documents Tables
*/

-- Create student_profiles table 
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    nationality TEXT,
    date_of_birth DATE,
    gender TEXT,
    marital_status TEXT,
    religion TEXT,
    mother_tongue TEXT,
    
    -- Contact Info
    phone_number TEXT,
    whatsapp_number TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    
    -- China Context
    has_visited_china BOOLEAN DEFAULT FALSE,
    in_china_now BOOLEAN DEFAULT FALSE,
    
    -- Extended Data 
    education_history JSONB DEFAULT '[]'::JSONB, 
    family_info JSONB DEFAULT '{}'::JSONB, 
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create student_documents table
-- using JSONB to allow flexibility, as programs will have flexible document requirements
-- Structure: { "passport": { "url": "...", "status": "pending", "feedback": "..." }, ... }

CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    documents JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Users can view own student profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can update own student profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can insert own student profile" ON public.student_profiles;

DROP POLICY IF EXISTS "Users can view own student documents" ON public.student_documents;
DROP POLICY IF EXISTS "Users can update own student documents" ON public.student_documents;
DROP POLICY IF EXISTS "Users can insert own student documents" ON public.student_documents;

-- Profiles: Users can view/edit their own
CREATE POLICY "Users can view own student profile" ON public.student_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own student profile" ON public.student_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own student profile" ON public.student_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Documents: Users can view/edit their own
CREATE POLICY "Users can view own student documents" ON public.student_documents
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own student documents" ON public.student_documents
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own student documents" ON public.student_documents
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to automatically create empty rows in these tables when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_student_init()
RETURNS TRIGGER AS $$
BEGIN
     INSERT INTO public.student_profiles (id) VALUES (new.id);
    INSERT INTO public.student_documents (id) VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created_extended ON auth.users;

CREATE OR REPLACE TRIGGER on_auth_user_created_extended
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_student_init();
