/*
 * Author: Nikesh
 * Date: 3rd Mar 2026
 * Description:
 *   - pg_cron job to invoke cleanup-temp-uploads Edge Function daily at 3 AM UTC
 *   - Removes orphaned files from universities/temp/ and programs/temp/ older than 24h
 */

SELECT cron.schedule(
  'cleanup-temp-uploads',
  '0 3 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/cleanup-temp-uploads',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);
