/*
** Date: 2026-02-04 Author: Nikesh
** Migration: Update Student Trigger
*/

CREATE OR REPLACE FUNCTION public.handle_new_student_init()
RETURNS TRIGGER AS $$
DECLARE
    _full_name TEXT;
    _first_name TEXT;
    _last_name TEXT;
    _space_index INT;
BEGIN
    _full_name := new.raw_user_meta_data->>'full_name';
    
    IF _full_name IS NOT NULL THEN
        _full_name := TRIM(_full_name);
        _space_index := POSITION(' ' IN _full_name);
        
        IF _space_index > 0 THEN
            _first_name := SUBSTRING(_full_name FROM 1 FOR _space_index - 1);
            _last_name := SUBSTRING(_full_name FROM _space_index + 1);
        ELSE
            _first_name := _full_name;
            _last_name := NULL;
        END IF;
    END IF;

    INSERT INTO public.student_profiles (id, first_name, last_name) 
    VALUES (new.id, _first_name, _last_name);
    
    INSERT INTO public.student_documents (id) VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
