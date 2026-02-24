/*
  Date: 2026-02-24 Author: Nikesh
  Allow counselors full CRUD on documents in the documents bucket
  but only for students whose applications are assigned to them.

  Path structure: {student_id}/{filename}
  First folder segment = student_id, checked against applications table.
*/

CREATE POLICY "Counselors can read documents of their assigned students"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.student_id::text = (storage.foldername(name))[1]
      AND applications.counselor_id = auth.uid()
  )
);

CREATE POLICY "Counselors can upload documents for their assigned students"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.student_id::text = (storage.foldername(name))[1]
      AND applications.counselor_id = auth.uid()
  )
);

CREATE POLICY "Counselors can update documents of their assigned students"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.student_id::text = (storage.foldername(name))[1]
      AND applications.counselor_id = auth.uid()
  )
);

CREATE POLICY "Counselors can delete documents of their assigned students"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.applications
    WHERE applications.student_id::text = (storage.foldername(name))[1]
      AND applications.counselor_id = auth.uid()
  )
);