import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/supabase";
import {
  notificationRepo,
  NotificationRow,
} from "../repositories/notifications.repo";

export const notificationService = {
  async getAll(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<NotificationRow[]> {
    return notificationRepo.getAll(userId, client);
  },

  async getUnreadCount(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<number> {
    return notificationRepo.getUnreadCount(userId, client);
  },

  async markRead(
    notificationId: string,
    client?: SupabaseClient<Database>,
  ): Promise<void> {
    await notificationRepo.markRead(notificationId, client);
  },

  async markAllRead(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<void> {
    await notificationRepo.markAllRead(userId, client);
  },
};
