import { createClient } from "@/lib/supabase/server";
import { Announcement } from "@/lib/types/announcement";
import HeroClient from "./HeroClient";

export async function getActiveAnnouncements(
  supabase: ReturnType<typeof createClient> extends Promise<infer T>
    ? T
    : never,
): Promise<Announcement[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !data) return [];

  return (data as Announcement[]).filter((a) => {
    if (a.starts_at && a.starts_at > today) return false;
    if (a.ends_at && a.ends_at < today) return false;
    return true;
  });
}

export default async function Hero() {
  const supabase = await createClient();
  const announcements = await getActiveAnnouncements(supabase);

  return <HeroClient announcements={announcements} />;
}
