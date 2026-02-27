/*
** Date: 2026-02-27  Author: Nikesh
** Counselor RLS policies:
**   - INSERT/UPDATE/DELETE on universities, programs, cities, countries, subject_areas
**   - university-assets storage bucket write access
*/

-- Universities
CREATE POLICY "Counselors can insert universities" ON public.universities
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can update universities" ON public.universities
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can delete universities" ON public.universities
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );

-- Programs
CREATE POLICY "Counselors can insert programs" ON public.programs
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can update programs" ON public.programs
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can delete programs" ON public.programs
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );

-- Cities
CREATE POLICY "Counselors can insert cities" ON public.cities
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can update cities" ON public.cities
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can delete cities" ON public.cities
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );

-- Countries
CREATE POLICY "Counselors can insert countries" ON public.countries
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can update countries" ON public.countries
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can delete countries" ON public.countries
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );

-- Subject Areas
CREATE POLICY "Counselors can insert subject_areas" ON public.subject_areas
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can update subject_areas" ON public.subject_areas
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );
CREATE POLICY "Counselors can delete subject_areas" ON public.subject_areas
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
    );

-- Storage: university-assets
CREATE POLICY "Counselor Write Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'university-assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
);

CREATE POLICY "Counselor Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'university-assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
);

CREATE POLICY "Counselor Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'university-assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counselor')
);