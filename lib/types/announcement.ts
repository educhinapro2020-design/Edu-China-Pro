import { Database } from "./supabase";

type AnnouncementTable = Database["public"]["Tables"]["announcements"];

export type Announcement = AnnouncementTable["Row"];
export type AnnouncementInsert = AnnouncementTable["Insert"];
export type AnnouncementUpdate = AnnouncementTable["Update"];
