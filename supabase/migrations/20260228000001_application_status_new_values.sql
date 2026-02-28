/*
** Date: 2026-02-27  Author: Nikesh
** Adds new application_status enum values:
**   visa_rejected, rejected, dropped_off, withdrawn, closed
*/

ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'visa_rejected';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'dropped_off';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'withdrawn';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'closed';