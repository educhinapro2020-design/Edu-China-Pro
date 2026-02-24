import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a cropped avatar file to Supabase storage and returns the public URL.
 * Path: avatars/{userId}/{timestamp}.{ext}
 */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const supabase = createClient();

  const ext = file.type.split("/")[1] ?? "jpg";
  const fileName = `${Date.now()}.${ext}`;
  const path = `${userId}/${fileName}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
