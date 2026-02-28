"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { chatService } from "@/lib/services/chat.service";
import { MessageWithSender } from "@/lib/repositories/chat.repo";
import { Database } from "@/lib/types/supabase";
import { FiSend, FiLoader } from "react-icons/fi";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: Database["public"]["Enums"]["user_role"];
  title?: string;
  subtitle?: string;
  isOwner?: boolean;
}

function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-primary-100 animate-pulse" />
      )}
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}
      >
        {!isOwn && (
          <div className="w-20 h-3 bg-primary-100 rounded animate-pulse" />
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl ${isOwn ? "bg-brand-100 rounded-tr-sm" : "bg-primary-50 border border-primary-100 rounded-tl-sm"}`}
        >
          <div className="w-48 h-4 bg-primary-100 rounded animate-pulse" />
        </div>
        <div className="w-8 h-2 bg-primary-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ChatWindow({
  conversationId,
  currentUserId,
  currentUserRole,
  title = "Support Chat",
  subtitle,
  isOwner,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToTyping(
      conversationId,
      currentUserId,
      () => {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      },
    );
    return unsubscribe;
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (isTyping) scrollToBottom();
  }, [isTyping, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data } = await chatService.getMessages(conversationId);
        if (!cancelled) {
          setMessages(data);
          setTimeout(() => scrollToBottom(false), 50);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    if (isOwner) chatService.markAsRead(conversationId, currentUserId);
  }, [conversationId, currentUserId, isOwner]);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setTimeout(() => scrollToBottom(), 50);

        if (newMessage.sender_id !== currentUserId && isOwnerRef.current) {
          chatService.markAsRead(conversationId, currentUserId);
        }
      },
    );

    return unsubscribe;
  }, [conversationId, currentUserId, scrollToBottom]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    if (e.target.value.trim().length > 0) {
      chatService.broadcastTyping(conversationId, currentUserId);
    }
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setSending(true);

    try {
      const sent = await chatService.sendMessage({
        conversationId,
        senderId: currentUserId,
        senderRole: currentUserRole,
        content,
      });

      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      console.error("Failed to send message", err);
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const otherUser = messages.find((m) => m.sender_id !== currentUserId)?.sender;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
        {loading ? (
          <div className="space-y-3">
            <MessageSkeleton isOwn={false} />
            <MessageSkeleton isOwn={true} />
            <MessageSkeleton isOwn={false} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-3">
              <FiSend className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-sm font-medium text-primary-700">
              No messages yet
            </p>
            <p className="text-xs text-primary-500 mt-1">
              Send a message to get started
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
            />
          ))
        )}
        {isTyping && (
          <TypingIndicator
            senderName={otherUser?.full_name}
            avatarUrl={otherUser?.avatar_url}
          />
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 shrink-0">
        <div className="flex items-end gap-2 bg-primary-50 border border-primary-100 rounded-2xl px-3 py-2 focus-within:border-brand-300 focus-within:bg-white transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-primary-900 placeholder:text-primary-300 resize-none outline-none leading-relaxed py-0.5 max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0 size-7.5 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
          >
            {sending ? (
              <FiLoader className="size-4 animate-spin" />
            ) : (
              <FiSend className="size-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-primary-500 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
