import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Announcement,
  AnnouncementInsert,
  AnnouncementUpdate,
} from "@/lib/types/announcement";
import { ADMIN_ASSETS_BUCKET } from "@/lib/constants/admin";

export const announcementRepository = {
  async getAll(client?: SupabaseClient): Promise<Announcement[]> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }
    return data as Announcement[];
  },

  async getActive(client?: SupabaseClient): Promise<Announcement[]> {
    const supabase = client ?? createClient();
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching active announcements:", error);
      return [];
    }

    return (data as Announcement[]).filter((a) => {
      if (a.starts_at && a.starts_at > today) return false;
      if (a.ends_at && a.ends_at < today) return false;
      return true;
    });
  },

  async create(
    input: AnnouncementInsert,
    client?: SupabaseClient,
  ): Promise<Announcement> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("announcements")
      .insert(input)
      .select("*")
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  async update(
    id: string,
    updates: AnnouncementUpdate,
    client?: SupabaseClient,
  ): Promise<Announcement> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  async delete(id: string, client?: SupabaseClient): Promise<void> {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async updateOrder(
    id: string,
    order: number,
    client?: SupabaseClient,
  ): Promise<void> {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("announcements")
      .update({ display_order: order })
      .eq("id", id);

    if (error) throw error;
  },

  async toggleActive(
    id: string,
    isActive: boolean,
    client?: SupabaseClient,
  ): Promise<void> {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;
  },

  async uploadImage(file: File, client?: SupabaseClient): Promise<string> {
    const supabase = client ?? createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `announcements/banner-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(ADMIN_ASSETS_BUCKET)
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(ADMIN_ASSETS_BUCKET).getPublicUrl(fileName);

    return publicUrl;
  },

  async deleteImage(url: string, client?: SupabaseClient): Promise<void> {
    const supabase = client ?? createClient();
    try {
      // Extract path from public URL
      // Example URL: https://.../storage/v1/object/public/admin-assets/announcements/banner-123.png
      const pathPart = url.split(`${ADMIN_ASSETS_BUCKET}/`).pop();
      if (!pathPart) return;

      const { error } = await supabase.storage
        .from(ADMIN_ASSETS_BUCKET)
        .remove([pathPart]);

      if (error) {
        console.error("Error deleting image from storage:", error);
      }
    } catch (err) {
      console.error("Failed to parse image URL for deletion:", err);
    }
  },
};
