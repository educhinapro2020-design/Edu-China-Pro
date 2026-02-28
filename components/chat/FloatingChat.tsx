"use client";

import { useState, useEffect, useRef } from "react";
import { ChatWindow } from "./ChatWindow";
import { chatService } from "@/lib/services/chat.service";
import { Conversation } from "@/lib/repositories/chat.repo";
import { Database } from "@/lib/types/supabase";
import { FiMessageCircle, FiX, FiMinus } from "react-icons/fi";

interface FloatingChatProps {
  currentUserId: string;
  currentUserRole: Database["public"]["Enums"]["user_role"];
  counselorName?: string | null;
}

type PanelState = "closed" | "open" | "minimized";

export function FloatingChat({
  currentUserId,
  currentUserRole,
  counselorName,
}: FloatingChatProps) {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const conv = await chatService.getMyConversation(currentUserId);
        setConversation(conv);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUserId]);

  useEffect(() => {
    if (!conversation) return;

    async function fetchUnread() {
      if (!conversation) return;
      const count = await chatService.getUnreadCount(
        conversation.id,
        currentUserId,
      );
      setUnreadCount(count);
    }

    fetchUnread();

    const unsubscribe = chatService.subscribeToConversations(
      currentUserId,
      fetchUnread,
    );
    return unsubscribe;
  }, [conversation, currentUserId]);

  useEffect(() => {
    if (panelState === "open") setUnreadCount(0);
  }, [panelState]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (panelState === "open" && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [panelState]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setPanelState("closed");
      }
    }
    if (panelState === "open" || panelState === "minimized") {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelState]);

  if (loading || !conversation) return null;

  const subtitle = conversation.counselor_id
    ? counselorName
      ? `With ${counselorName}`
      : "With your counselor"
    : "With our support team";

  return (
    <>
      {panelState === "open" && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-white/30 backdrop-blur-sm"
          onClick={() => setPanelState("closed")}
        />
      )}

      <div
        ref={panelRef}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      >
        {panelState !== "closed" && (
          <div
            className={`w-[340px] bg-white border border-primary-100 rounded-3xl shadow-2xl shadow-primary-900/10 overflow-hidden flex flex-col transition-all duration-300 ${
              panelState === "minimized" ? "h-[52px]" : "h-[480px]"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-primary-900">
                    Messages
                  </p>
                  {panelState === "open" && subtitle && (
                    <p className="text-[10px] text-primary-500">{subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setPanelState((s) =>
                      s === "minimized" ? "open" : "minimized",
                    )
                  }
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <FiMinus className="size-4" />
                </button>
                <button
                  onClick={() => setPanelState("closed")}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <FiX className="size-4" />
                </button>
              </div>
            </div>

            {panelState === "open" && (
              <div className="flex-1 min-h-0">
                <ChatWindow
                  conversationId={conversation.id}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  isOwner={true}
                />
              </div>
            )}
          </div>
        )}

        {panelState === "closed" && (
          <button
            onClick={() => setPanelState("open")}
            className="w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-600/30 flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all duration-200 relative"
          >
            <FiMessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </>
  );
}
