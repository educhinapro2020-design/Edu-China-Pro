/*
** Date: 2026-02-17  Author: Nikesh
** Admin RLS policies:
**   - is_admin() helper function
**   - INSERT/UPDATE/DELETE on universities, programs, cities, countries, subject_areas
**   - admin-assets storage bucket (public read, admin write)
*/

-- Helper: detect if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Universities: admin write policies
CREATE POLICY "Admins can insert universities" ON public.universities
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update universities" ON public.universities
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete universities" ON public.universities
    FOR DELETE USING (public.is_admin());

-- Programs: admin write policies
CREATE POLICY "Admins can insert programs" ON public.programs
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update programs" ON public.programs
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete programs" ON public.programs
    FOR DELETE USING (public.is_admin());

-- Cities: admin write policies
CREATE POLICY "Admins can insert cities" ON public.cities
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update cities" ON public.cities
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete cities" ON public.cities
    FOR DELETE USING (public.is_admin());

-- Countries: admin write policies
CREATE POLICY "Admins can insert countries" ON public.countries
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update countries" ON public.countries
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete countries" ON public.countries
    FOR DELETE USING (public.is_admin());

-- Subject Areas: admin write policies
CREATE POLICY "Admins can insert subject_areas" ON public.subject_areas
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update subject_areas" ON public.subject_areas
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete subject_areas" ON public.subject_areas
    FOR DELETE USING (public.is_admin());

-- Create new storage bucket for university assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('university-assets', 'university-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to university-assets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'university-assets' );

-- Policy: Allow admins to insert/update/delete objects in university-assets
CREATE POLICY "Admin Write Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'university-assets' AND
  public.is_admin()
);

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'university-assets' AND
  public.is_admin()
);

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'university-assets' AND
  public.is_admin()
);
