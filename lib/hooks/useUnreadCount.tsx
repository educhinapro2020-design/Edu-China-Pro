"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { chatService } from "@/lib/services/chat.service";

export function useUnreadCount(currentUserId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchUnread = useCallback(async () => {
    const { data: convs } = await chatService.getAllConversations({
      pageSize: 100,
    });
    console.log("convs", convs);
    if (convs.length === 0) return;
    const counts = await chatService.getUnreadCounts(
      convs.map((c) => c.id),
      currentUserId,
    );
    console.log("counts", counts);
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    console.log("total", total);
    setUnreadCount(total);
  }, [currentUserId]);

  useEffect(() => {
    fetchUnread();
    const unsubscribe = chatService.subscribeToConversations(
      currentUserId,
      fetchUnread,
    );
    return unsubscribe;
  }, [fetchUnread, currentUserId]);

  return unreadCount;
}
