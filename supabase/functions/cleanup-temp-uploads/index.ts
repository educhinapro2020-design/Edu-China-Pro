// @ts-nocheck
/**
 * Cleans up orphaned temp uploads in the university-assets bucket.
 * Deletes all files under universities/temp/ and programs/temp/ that are older than 24 hours.
 * Invoked by pg_cron daily
 *
 * @author Nikesh
 * @date 2026-03-03
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKET = "university-assets";
const TEMP_PREFIXES = ["universities/temp", "programs/temp"];
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();
  let totalDeleted = 0;

  for (const prefix of TEMP_PREFIXES) {
    const { data: folders, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(prefix);

    if (listError || !folders) continue;

    for (const folder of folders) {
      const folderPath = `${prefix}/${folder.name}`;

      const { data: files } = await supabase.storage
        .from(BUCKET)
        .list(folderPath);

      if (!files || files.length === 0) continue;

      const staleFiles = files.filter((f) => {
        if (!f.created_at) return false;
        const age = now - new Date(f.created_at).getTime();
        return age > MAX_AGE_MS;
      });

      if (staleFiles.length === 0) continue;

      const paths = staleFiles.map((f) => `${folderPath}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove(paths);

      if (!removeError) {
        totalDeleted += paths.length;
      }
    }
  }

  return new Response(
    JSON.stringify({
      deleted: totalDeleted,
      timestamp: new Date().toISOString(),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
