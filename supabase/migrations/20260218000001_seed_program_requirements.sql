/*
** Date: 2026-02-18
** Description: Seeds the document_requirements column in programs table based on degree_level.
** This is a data migration separate from the schema migration.
*/

DO $$ 
DECLARE
    -- Base documents required for ALL levels (excluding degree-specific)
    -- As per: "passport", "photo", "health_check", "police_clearance"
    -- "cv", "study_plan", "recommendation_letter_1", "recommendation_letter_2", "english_proficiency"
    base_docs jsonb := '["passport", "photo", "health_check", "police_clearance", "cv", "study_plan", "recommendation_letter_1", "recommendation_letter_2", "english_proficiency"]';
BEGIN
    -- Bachelor
    -- "Highest Degree Certificate" -> High School Certificate
    -- "Academic Transcripts" -> High School Transcripts
    -- "HSK 4" or "English Proficiency" (covered by base)
    
    UPDATE public.programs 
    SET document_requirements = base_docs || '["transcript_highschool", "degree_highschool"]'::jsonb
    WHERE degree_level = 'bachelor';

    -- Master
    -- "Bachelor Degree Certificate"
    -- "Bachelor Transcripts"
    -- "Research Proposal" (for research-based) -> Optional? User says "for research-based programs". We'll stick to mandatory base.
    -- "Acceptance Letter" (strongly recommended) -> Leaving out of mandatory for now.
    UPDATE public.programs 
    SET document_requirements = base_docs || '["transcript_bachelors", "degree_bachelors", "research_proposal"]'::jsonb
    WHERE degree_level = 'master';

    -- Doctoral
    -- "Master Degree Certificate"
    -- "Master Transcripts"
    -- "Detailed Research Proposal" (1500-3000 words) -> Essential
    -- "Acceptance Letter" (highly recommended / often essential) -> Essential
    UPDATE public.programs 
    SET document_requirements = base_docs || '["transcript_masters", "degree_masters", "research_proposal", "acceptance_letter"]'::jsonb
    WHERE degree_level = 'doctoral';

    -- Non-Degree

    UPDATE public.programs 
    SET document_requirements = base_docs || '["study_training_plan", "academic_background_certificate"]'::jsonb
    WHERE degree_level = 'non_degree';
    
    -- Upgrade 
    UPDATE public.programs 
    SET document_requirements = base_docs || '["transcript_bachelors", "degree_bachelors"]'::jsonb
    WHERE degree_level = 'upgrade';
END $$;
