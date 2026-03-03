import { createClient } from "@/lib/supabase/client";
import { ADMIN_ASSETS_BUCKET } from "@/lib/constants/admin";

const BUCKET_MARKER = `/object/public/${ADMIN_ASSETS_BUCKET}/`;

export function extractStoragePath(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(BUCKET_MARKER);
  if (idx === -1) return null;
  return publicUrl.slice(idx + BUCKET_MARKER.length);
}

export async function relocateFiles(
  fromPrefix: string,
  toPrefix: string,
  urls: string[],
): Promise<string[]> {
  const supabase = createClient();
  const updated: string[] = [];

  for (const url of urls) {
    const oldPath = extractStoragePath(url);
    if (!oldPath || !oldPath.startsWith(fromPrefix)) {
      updated.push(url);
      continue;
    }

    const filename = oldPath.slice(fromPrefix.length);
    const newPath = `${toPrefix}${filename}`;

    const { error } = await supabase.storage
      .from(ADMIN_ASSETS_BUCKET)
      .move(oldPath, newPath);

    if (error) {
      console.error(`Failed to move ${oldPath} → ${newPath}:`, error);
      updated.push(url);
      continue;
    }

    const { data } = supabase.storage
      .from(ADMIN_ASSETS_BUCKET)
      .getPublicUrl(newPath);
    updated.push(data.publicUrl);
  }

  return updated;
}
