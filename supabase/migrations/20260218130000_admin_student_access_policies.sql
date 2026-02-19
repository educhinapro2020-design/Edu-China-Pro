/*
** Date: 2026-02-18
** Description: Allows users with the 'admin' role to view all student profiles and documents.
** Logic: Uses the public.is_admin() helper
*/

-- Allow admins to view student profiles
DROP POLICY IF EXISTS "Admins can view all student profiles" ON public.student_profiles;
CREATE POLICY "Admins can view all student profiles" ON public.student_profiles
    FOR SELECT
    USING (public.is_admin());

-- Allow admins to view student documents
DROP POLICY IF EXISTS "Admins can view all student documents" ON public.student_documents;
CREATE POLICY "Admins can view all student documents" ON public.student_documents
    FOR SELECT
    USING (public.is_admin());

-- Also allow admins to UPDATE documents (e.g. to change status/feedback)
DROP POLICY IF EXISTS "Admins can update all student documents" ON public.student_documents;
CREATE POLICY "Admins can update all student documents" ON public.student_documents
    FOR UPDATE
    USING (public.is_admin());

-- Also allow admins to UPDATE profiles if needed
DROP POLICY IF EXISTS "Admins can update all student profiles" ON public.student_profiles;
CREATE POLICY "Admins can update all student profiles" ON public.student_profiles
    FOR UPDATE
    USING (public.is_admin());
