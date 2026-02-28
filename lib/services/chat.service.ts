import { createClient } from "@/lib/supabase/client";
import {
  chatRepo,
  Conversation,
  ConversationWithMeta,
  MessageWithSender,
} from "@/lib/repositories/chat.repo";
import { Database } from "@/lib/types/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

const activeTypingChannels = new Map<string, RealtimeChannel>();

let channelCounter = 0;
function uniqueId() {
  return ++channelCounter;
}

export const chatService = {
  async getMyConversation(studentId: string): Promise<Conversation | null> {
    return chatRepo.getConversationByStudentId(studentId);
  },

  async getAllConversations(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<{ data: ConversationWithMeta[]; hasMore: boolean }> {
    return chatRepo.getAllConversations(params);
  },

  async getMessages(
    conversationId: string,
    params: { page?: number; pageSize?: number } = {},
  ): Promise<{ data: MessageWithSender[]; total_count: number }> {
    return chatRepo.getMessages(conversationId, params);
  },

  async sendMessage(params: {
    conversationId: string;
    senderId: string;
    senderRole: Database["public"]["Enums"]["user_role"];
    content: string;
  }): Promise<MessageWithSender> {
    return chatRepo.sendMessage({
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      sender_role: params.senderRole,
      content: params.content,
      is_system: false,
    });
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    return chatRepo.markAsRead(conversationId, userId);
  },

  async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    return chatRepo.getUnreadCount(conversationId, userId);
  },

  async getUnreadCounts(
    conversationIds: string[],
    userId: string,
  ): Promise<Map<string, number>> {
    return chatRepo.getUnreadCounts(conversationIds, userId);
  },

  subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: MessageWithSender) => void,
  ): () => void {
    const supabase = createClient();
    const channelName = `messages:${conversationId}:${uniqueId()}`;

    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data, error } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles!messages_sender_id_fkey (
                id, full_name, avatar_url, role
              )
            `,
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            onNewMessage(data as unknown as MessageWithSender);

            supabase.channel(`inbox:*`).send({
              type: "broadcast",
              event: "inbox_update",
              payload: {},
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToConversations(userId: string, onUpdate: () => void): () => void {
    const supabase = createClient();
    const channelName = `inbox:${userId}:${uniqueId()}`;

    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inbox_events",
        },
        () => {
          onUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToTyping(
    conversationId: string,
    currentUserId: string,
    onTyping: () => void,
  ): () => void {
    const supabase = createClient();
    const channelName = `typing:${conversationId}`;

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId === currentUserId) return;
        onTyping();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          activeTypingChannels.set(conversationId, channel);
        }
      });

    return () => {
      activeTypingChannels.delete(conversationId);
      supabase.removeChannel(channel);
    };
  },

  broadcastTyping(conversationId: string, userId: string): void {
    const channel = activeTypingChannels.get(conversationId);
    if (!channel) return;

    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId },
    });
  },

  async getTotalUnreadCount(userId: string): Promise<number> {
    return chatRepo.getTotalUnreadCount(userId);
  },
};
