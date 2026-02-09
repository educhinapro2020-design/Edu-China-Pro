-- Add passport_expiry to student_profiles table
ALTER TABLE "public"."student_profiles" 
ADD COLUMN IF NOT EXISTS "passport_expiry" date;
