"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { NotificationRow } from "@/lib/repositories/notifications.repo";
import { notificationService } from "../services/notifications.service";

export type NotificationToast = NotificationRow & { toastId: string };

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);
  const isInitialLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await notificationService.getAll(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read_at).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [userId]);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const markRead = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setToasts((prev) => prev.filter((t) => t.id !== notificationId));

      try {
        await notificationService.markRead(notificationId);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        fetchNotifications();
      }
    },
    [fetchNotifications],
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? now })),
    );
    setUnreadCount(0);
    setToasts([]);

    try {
      await notificationService.markAllRead(userId);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    channelRef.current = supabaseRef.current
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationRow;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          if (!isInitialLoad.current) {
            const toastId = `toast-${newNotification.id}-${Date.now()}`;
            const toast: NotificationToast = { ...newNotification, toastId };
            setToasts((prev) => [toast, ...prev].slice(0, 5));
          }
        },
      )
      .subscribe((status) => {
        console.log("[Notifications Realtime]", status);
      });

    return () => {
      if (channelRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
      }
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    toasts,
    dismissToast,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
  };
}
