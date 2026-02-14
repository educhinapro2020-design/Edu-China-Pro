/*
** Date: 2026-02-14  Author: Nikesh
** Creates the university catalogue schema:
**   countries → cities → universities → programs
**   + subject_areas lookup table
**   + EAV/JSON for country-specific university metadata
*/

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enums
DO $$ BEGIN
    CREATE TYPE public.degree_level AS ENUM (
        'bachelor', 'master', 'doctoral', 'non_degree', 'upgrade'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.scholarship_type AS ENUM (
        'self_financed', 'type_a', 'type_b', 'type_c', 'type_d'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.intake_season AS ENUM (
        'spring', 'summer', 'autumn'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.teaching_language AS ENUM (
        'chinese', 'english', 'chinese_english_bilingual'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.institution_type AS ENUM (
        'public', 'private'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Countries
CREATE TABLE IF NOT EXISTS public.countries (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en     TEXT NOT NULL UNIQUE,
    name_local  TEXT,
    slug        TEXT NOT NULL UNIQUE,
    flag_url    TEXT,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Countries are publicly readable" ON public.countries;
CREATE POLICY "Countries are publicly readable" ON public.countries
    FOR SELECT USING (true);

-- Cities
CREATE TABLE IF NOT EXISTS public.cities (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_id      UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    name_en         TEXT NOT NULL,
    slug            TEXT NOT NULL,
    region          TEXT,              
    description     TEXT,
    cover_image_url TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (country_id, slug)
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Cities are publicly readable" ON public.cities;
CREATE POLICY "Cities are publicly readable" ON public.cities
    FOR SELECT USING (true);

-- Subject Areas
CREATE TABLE IF NOT EXISTS public.subject_areas (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en     TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subject_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subject areas are publicly readable" ON public.subject_areas;
CREATE POLICY "Subject areas are publicly readable" ON public.subject_areas
    FOR SELECT USING (true);

-- Universities
CREATE TABLE IF NOT EXISTS public.universities (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id                 UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name_en                 TEXT NOT NULL,
    name_local              TEXT,
    slug                    TEXT NOT NULL UNIQUE,
    institution_type        public.institution_type NOT NULL DEFAULT 'public',
    level                   TEXT,                       
    logo_url                TEXT,
    cover_image_url         TEXT,

    -- Rankings
    shanghai_rank           INT,
    shanghai_rank_year      INT,
    qs_rank                 INT,
    qs_rank_year            INT,

    -- Stats
    majors_count            INT,

    -- Descriptions
    profile_html            TEXT,
    profile_text            TEXT,
    advantages_html         TEXT,

    -- Media
    albums                  JSONB DEFAULT '{}',

    -- EAV: country-specific metadata
    country_specific_data   JSONB DEFAULT '{}',

    -- Accommodation 
    accommodation_double_room   INT,        
    accommodation_single_room   INT,        
    accommodation_currency      TEXT DEFAULT 'RMB',

    self_financed_available BOOLEAN DEFAULT false,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Universities are publicly readable" ON public.universities;
CREATE POLICY "Universities are publicly readable" ON public.universities
    FOR SELECT USING (true);

-- Programs
CREATE TABLE IF NOT EXISTS public.programs (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id               UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    subject_area_id             UUID REFERENCES public.subject_areas(id) ON DELETE SET NULL,
    name_en                     TEXT NOT NULL,
    name_local                  TEXT,
    slug                        TEXT NOT NULL,

    -- Education
    degree_level                public.degree_level NOT NULL,
    duration                    TEXT,
    language                    public.teaching_language NOT NULL DEFAULT 'english',

    -- Intake
    intake_season               public.intake_season,
    intake_year                 INT,

    -- Application
    application_deadline        DATE,
    accepts_minors              BOOLEAN DEFAULT false,
    accepts_students_in_china   BOOLEAN DEFAULT false,
    application_fee_amount      INT,
    application_fee_currency    TEXT,

    -- Financials
    tuition_original            INT,
    tuition_after_scholarship   INT,
    tuition_currency            TEXT DEFAULT 'RMB',
    tuition_per                 TEXT DEFAULT 'year',

    -- Scholarship
    scholarship_type            public.scholarship_type DEFAULT 'self_financed',
    scholarship_duration        TEXT,
    scholarship_policy_html     TEXT,
    scholarship_memo            TEXT,

    -- Living costs
    estimated_living_cost       INT,
    estimated_living_currency   TEXT DEFAULT 'RMB',

    -- Media
    cover_image_url             TEXT,
    detail_images               JSONB DEFAULT '[]',

    -- Eligibility (semi-structured)
    eligibility                 JSONB DEFAULT '{}',

    -- Flags
    is_self_funded              BOOLEAN DEFAULT false,
    is_scholarship_program      BOOLEAN DEFAULT false,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (university_id, slug)
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Programs are publicly readable" ON public.programs;
CREATE POLICY "Programs are publicly readable" ON public.programs
    FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_programs_name_trgm
    ON public.programs USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_universities_name_trgm
    ON public.universities USING gin (name_en gin_trgm_ops);

-- Program filters
CREATE INDEX IF NOT EXISTS idx_programs_degree_level
    ON public.programs (degree_level);
CREATE INDEX IF NOT EXISTS idx_programs_subject_area
    ON public.programs (subject_area_id);
CREATE INDEX IF NOT EXISTS idx_programs_scholarship_type
    ON public.programs (scholarship_type);
CREATE INDEX IF NOT EXISTS idx_programs_intake_season
    ON public.programs (intake_season);
CREATE INDEX IF NOT EXISTS idx_programs_language
    ON public.programs (language);
CREATE INDEX IF NOT EXISTS idx_programs_tuition
    ON public.programs (tuition_after_scholarship);

-- University filters
CREATE INDEX IF NOT EXISTS idx_universities_city
    ON public.universities (city_id);
CREATE INDEX IF NOT EXISTS idx_universities_institution_type
    ON public.universities (institution_type);
CREATE INDEX IF NOT EXISTS idx_universities_qs_rank
    ON public.universities (qs_rank);
CREATE INDEX IF NOT EXISTS idx_universities_shanghai_rank
    ON public.universities (shanghai_rank);

-- Country-specific JSON (GIN for @> queries)
CREATE INDEX IF NOT EXISTS idx_universities_country_data
    ON public.universities USING gin (country_specific_data);

-- Composite indexes for common multi-filter queries
CREATE INDEX IF NOT EXISTS idx_programs_degree_subject
    ON public.programs (degree_level, subject_area_id);
CREATE INDEX IF NOT EXISTS idx_programs_degree_scholarship
    ON public.programs (degree_level, scholarship_type);

-- City lookups
CREATE INDEX IF NOT EXISTS idx_cities_country
    ON public.cities (country_id);
CREATE INDEX IF NOT EXISTS idx_cities_region
    ON public.cities (region);
