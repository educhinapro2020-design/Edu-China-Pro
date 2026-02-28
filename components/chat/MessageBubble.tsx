"use client";

import { MessageWithSender } from "@/lib/repositories/chat.repo";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.is_system) {
    return (
      <div className="flex justify-center my-4">
        <div className="flex flex-col items-center gap-3 max-w-[280px] text-center">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-px bg-primary-100" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-400 shrink-0">
              New
            </span>
            <div className="flex-1 h-px bg-primary-100" />
          </div>

          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center ring-4 ring-brand-50 shrink-0">
            {message.sender.avatar_url ? (
              <img
                src={message.sender.avatar_url}
                alt={message.sender.full_name ?? ""}
                className="w-12 h-12 rounded-2xl object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-brand-600">
                {message.sender.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary-700">
              {message.content}
            </p>
            {message.sender.description && (
              <p className="text-[11px] text-primary-400 leading-relaxed">
                {message.sender.description}
              </p>
            )}
          </div>

          <span className="text-[10px] text-primary-400">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center mt-1">
          {message.sender.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name ?? ""}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-bold text-brand-600">
              {message.sender.full_name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
      )}

      <div
        className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}
      >
        {!isOwn && (
          <span className="text-[10px] font-semibold text-primary-400 uppercase tracking-wide px-1">
            {message.sender.full_name ?? message.sender.role}
          </span>
        )}

        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-brand-600 text-white rounded-tr-sm"
              : "bg-primary-50 border border-primary-100 text-primary-800 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>

        <span className="text-[10px] text-primary-400 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  senderName?: string | null;
  avatarUrl?: string | null;
}

export function TypingIndicator({
  senderName,
  avatarUrl,
}: TypingIndicatorProps) {
  return (
    <div className="flex gap-2.5 flex-row">
      <div className="shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center mt-1">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={senderName ?? ""}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <span className="text-[10px] font-bold text-brand-600">
            {senderName?.charAt(0)?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 max-w-[75%] items-start">
        {senderName && (
          <span className="text-[10px] font-semibold text-primary-400 uppercase tracking-wide px-1">
            {senderName}
          </span>
        )}

        <div className="px-3.5 py-2.5 rounded-2xl bg-primary-50 border border-primary-100 text-primary-800 rounded-tl-sm">
          <div className="flex gap-1 items-center h-5">
            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
