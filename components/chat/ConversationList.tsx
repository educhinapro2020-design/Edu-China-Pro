"use client";

import { ConversationWithMeta } from "@/lib/repositories/chat.repo";
import { Database } from "@/lib/types/supabase";
import { twMerge } from "tailwind-merge";

interface ConversationListProps {
  conversations: ConversationWithMeta[];
  selectedId: string | null;
  currentUserId: string;
  currentUserRole: Database["public"]["Enums"]["user_role"];
  onSelect: (conversation: ConversationWithMeta) => void;
  unreadCounts?: Map<string, number>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ConversationStatus({
  conversation,
}: {
  conversation: ConversationWithMeta;
}) {
  if (conversation.counselor_id) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-500/20">
        Assigned
      </span>
    );
  }
  if (conversation.claimed_by_id) {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-600/20">
        Received
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide text-success bg-success-foreground px-2 py-0.5 rounded-full border border-success/20">
      Pending
    </span>
  );
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  unreadCounts,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <p className="text-sm font-medium text-primary-700">No conversations</p>
        <p className="text-xs text-primary-400 mt-1">
          Conversations will appear here when students message
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-primary-50">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const lastMsg = conv.last_message;
        const unread = unreadCounts?.get(conv.id) ?? 0;
        const hasUnread = unread > 0;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`relative w-full text-left px-4 py-3.5 hover:bg-brand-50 transition-colors ${
              isSelected ? "bg-brand-50" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 w-9 h-9">
                <div
                  className={twMerge(
                    "w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center",
                    isSelected
                      ? "ring-2 ring-white bg-brand-600 text-white"
                      : "",
                  )}
                >
                  <span className="text-xs font-bold">
                    {conv.student.full_name?.charAt(0)?.toUpperCase() ?? ""}
                    {conv.student.full_name?.charAt(1)?.toUpperCase() ?? ""}
                  </span>
                </div>

                {hasUnread && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-brand-500 text-white text-[10px] font-semibold flex items-center justify-center shadow-sm">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p
                    className={`text-sm truncate ${
                      hasUnread
                        ? "font-semibold text-primary-900"
                        : "font-medium text-primary-700"
                    }`}
                  >
                    {conv.student.full_name ?? conv.student.email}
                  </p>

                  {lastMsg && (
                    <span className="text-[10px] text-primary-400 shrink-0">
                      {timeAgo(lastMsg.created_at)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p
                    className={`text-xs truncate ${
                      hasUnread
                        ? "text-primary-600 font-medium"
                        : "text-primary-500"
                    }`}
                  >
                    {lastMsg
                      ? lastMsg.is_system
                        ? "System message"
                        : lastMsg.content
                      : "No messages yet"}
                  </p>

                  <div className="shrink-0">
                    <ConversationStatus conversation={conv} />
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
