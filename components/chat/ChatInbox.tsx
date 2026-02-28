"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { chatService } from "@/lib/services/chat.service";
import { ConversationWithMeta } from "@/lib/repositories/chat.repo";
import { Database } from "@/lib/types/supabase";
import {
  FiMessageCircle,
  FiArrowLeft,
  FiSearch,
  FiLoader,
} from "react-icons/fi";

interface ChatInboxProps {
  currentUserId: string;
  currentUserRole: Database["public"]["Enums"]["user_role"];
}

export function ChatInbox({ currentUserId, currentUserRole }: ChatInboxProps) {
  const [conversations, setConversations] = useState<ConversationWithMeta[]>(
    [],
  );
  const [selected, setSelected] = useState<ConversationWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map(),
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationsRef = useRef<ConversationWithMeta[]>([]);
  conversationsRef.current = conversations;

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(
      () => setDebouncedSearch(search),
      300,
    );
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const fetchAndSetUnreads = useCallback(
    async (convs: ConversationWithMeta[]) => {
      if (convs.length === 0) return;
      const counts = await chatService.getUnreadCounts(
        convs.map((c) => c.id),
        currentUserId,
      );
      setUnreadCounts(counts);
    },
    [currentUserId],
  );

  const loadConversations = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page;
      if (reset) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data, hasMore: more } = await chatService.getAllConversations({
          page: currentPage,
          pageSize: 20,
          search: debouncedSearch || undefined,
        });

        if (reset) {
          setConversations(data);
          setPage(1);
          fetchAndSetUnreads(data);
        } else {
          setConversations((prev) => {
            const merged = [...prev, ...data];
            fetchAndSetUnreads(merged);
            return merged;
          });
        }
        setHasMore(more);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page, debouncedSearch, fetchAndSetUnreads],
  );

  useEffect(() => {
    loadConversations(true);
  }, [debouncedSearch]);

  useEffect(() => {
    if (page > 1) loadConversations();
  }, [page]);

  useEffect(() => {
    if (loading || loadingMore) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
    });
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
  }, [loading, loadingMore, hasMore, conversations.length]);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToConversations(
      currentUserId,
      async () => {
        const { data } = await chatService.getAllConversations({
          page: 1,
          pageSize: Math.max(conversationsRef.current.length, 20),
          search: debouncedSearch || undefined,
        });
        setConversations(data);
        fetchAndSetUnreads(data);
      },
    );
    return unsubscribe;
  }, [currentUserId, debouncedSearch, fetchAndSetUnreads]);

  function handleSelect(conv: ConversationWithMeta) {
    setSelected(conv);
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      next.set(conv.id, 0);
      return next;
    });
  }

  function handleBack() {
    setSelected(null);
  }

  const isOwner =
    currentUserRole === "admin" ||
    currentUserRole === "student" ||
    selected?.counselor_id === currentUserId ||
    selected?.claimed_by_id === currentUserId;

  return (
    <div className="flex h-full bg-white border border-primary-100 rounded-3xl shadow-sm overflow-hidden">
      <div
        className={`
          flex flex-col border-r border-primary-100
          w-full md:w-[300px] md:shrink-0 h-full
          ${selected ? "hidden md:flex" : "flex"}
        `}
      >
        <div className="px-4 py-4 border-b border-primary-100 shrink-0 space-y-3">
          <h3 className="heading-4">Messages</h3>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-2 bg-primary-50 border border-primary-100 rounded-xl text-sm focus:outline-none focus:border-brand-300 focus:bg-white transition-colors"
            />
          </div>

          {!loading && (
            <p className="text-xs text-primary-400">
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-px p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-3 py-3.5 rounded-2xl animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-primary-100 rounded-full w-2/3" />
                      <div className="h-2.5 bg-primary-50 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ConversationList
                conversations={conversations}
                selectedId={selected?.id ?? null}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onSelect={handleSelect}
                unreadCounts={unreadCounts}
              />
              {hasMore && (
                <div ref={loadMoreRef} className="py-4 flex justify-center">
                  {loadingMore && (
                    <FiLoader className="w-5 h-5 text-primary-300 animate-spin" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className={`
          flex-1 flex flex-col min-w-0 h-full
          ${selected ? "flex" : "hidden md:flex"}
        `}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-primary-100 shrink-0">
              <button
                onClick={handleBack}
                className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-brand-50 ring-2 ring-white flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-600">
                    {selected.student.full_name?.charAt(0)?.toUpperCase() ?? ""}
                    {selected.student.full_name?.charAt(1)?.toUpperCase() ?? ""}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-900 truncate">
                  {selected.student.full_name ?? selected.student.email}
                </p>
                <p className="text-xs text-primary-500 mt-0.5">
                  {selected.counselor
                    ? `Assigned to ${selected.counselor.full_name}`
                    : selected.claimed_by
                      ? `Received by ${selected.claimed_by.full_name}`
                      : "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ChatWindow
                key={selected.id}
                conversationId={selected.id}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                isOwner={isOwner}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <FiMessageCircle className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm font-semibold text-primary-700">
              Select a conversation
            </p>
            <p className="text-xs text-primary-500 mt-1">
              Choose a student from the list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
