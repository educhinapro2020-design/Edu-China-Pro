import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { Database } from "@/lib/types/supabase";

export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];

export type NotificationType = Database["public"]["Enums"]["notification_type"];

export const notificationRepo = {
  async getAll(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<NotificationRow[]> {
    const supabase = client ?? createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data ?? [];
  },

  async getUnreadCount(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<number> {
    const supabase = client ?? createClient();

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) throw error;
    return count ?? 0;
  },

  async markRead(
    notificationId: string,
    client?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = client ?? createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .is("read_at", null);

    if (error) throw error;
  },

  async markAllRead(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = client ?? createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) throw error;
  },
};
