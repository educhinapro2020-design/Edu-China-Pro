import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { Database } from "@/lib/types/supabase";

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationUpdate =
  Database["public"]["Tables"]["conversations"]["Update"];

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export type MessageWithSender = Message & {
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: Database["public"]["Enums"]["user_role"];
    description: string | null;
  };
};

export type ConversationWithMeta = Conversation & {
  student: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  claimed_by: {
    id: string;
    full_name: string | null;
  } | null;
  counselor: {
    id: string;
    full_name: string | null;
  } | null;
  last_message: MessageWithSender | null;
  unread_count: number;
};

export const chatRepo = {
  async getConversationByStudentId(
    studentId: string,
    client?: SupabaseClient<Database>,
  ): Promise<Conversation | null> {
    const supabase = client ?? createClient();

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return data;
  },

  async getAllConversations(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
    } = {},
    client?: SupabaseClient<Database>,
  ): Promise<{ data: ConversationWithMeta[]; hasMore: boolean }> {
    const supabase = client ?? createClient();
    const { page = 1, pageSize = 20, search } = params;

    let query = supabase
      .from("conversations")
      .select(
        `
        *,
        student:profiles!conversations_student_id_fkey (
          id, full_name, avatar_url, email
        ),
        claimed_by:profiles!conversations_claimed_by_id_fkey (
          id, full_name
        ),
        counselor:profiles!conversations_counselor_id_fkey (
          id, full_name
        )
      `,
      )
      .order("updated_at", { ascending: false });

    if (search) {
      const { data: matchingStudents } = await supabase
        .from("profiles")
        .select("id")
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
        .eq("role", "student");

      const studentIds = matchingStudents?.map((s) => s.id) ?? [];

      if (studentIds.length > 0) {
        query = query.in("student_id", studentIds);
      } else {
        return { data: [], hasMore: false };
      }
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error } = await query.range(start, end);

    if (error) throw error;

    const conversations = (data ?? []) as unknown as ConversationWithMeta[];

    if (conversations.length === 0) {
      return { data: [], hasMore: false };
    }

    const conversationIds = conversations.map((c) => c.id);

    const { data: lastMessages } = await supabase
      .from("messages")
      .select(
        "*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role, description)",
      )
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    const lastMessageMap = new Map();
    lastMessages?.forEach((msg) => {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, msg);
      }
    });

    const enriched = conversations.map((conv) => ({
      ...conv,
      last_message: lastMessageMap.get(conv.id) || null,
      unread_count: 0,
    }));

    return {
      data: enriched,
      hasMore: conversations.length === pageSize,
    };
  },

  async getMessages(
    conversationId: string,
    params: { page?: number; pageSize?: number } = {},
    client?: SupabaseClient<Database>,
  ): Promise<{ data: MessageWithSender[]; total_count: number }> {
    const supabase = client ?? createClient();
    const { page = 1, pageSize = 50 } = params;

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, count, error } = await supabase
      .from("messages")
      .select(
        `*,
        sender:profiles!messages_sender_id_fkey (
          id, full_name, avatar_url, role, description
        )`,
        { count: "exact" },
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: ((data ?? []) as unknown as MessageWithSender[]).reverse(),
      total_count: count ?? 0,
    };
  },

  async sendMessage(
    message: MessageInsert,
    client?: SupabaseClient<Database>,
  ): Promise<MessageWithSender> {
    const supabase = client ?? createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey (
          id, full_name, avatar_url, role, description
        )
      `,
      )
      .single();

    if (error) throw error;

    return data as unknown as MessageWithSender;
  },

  async markAsRead(
    conversationId: string,
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = client ?? createClient();

    const { error } = await supabase.rpc("mark_messages_read", {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });

    if (error) throw error;

    await supabase.from("inbox_events").insert({});
  },

  async getUnreadCount(
    conversationId: string,
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<number> {
    const supabase = client ?? createClient();

    const { data, error } = await supabase.rpc("get_unread_count", {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });

    if (error) throw error;
    return data ?? 0;
  },

  async getUnreadCounts(
    conversationIds: string[],
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<Map<string, number>> {
    const supabase = client ?? createClient();

    const { data, error } = await supabase.rpc("get_unread_counts", {
      p_conversation_ids: conversationIds,
      p_user_id: userId,
    });

    if (error) throw error;

    const counts = new Map<string, number>();
    conversationIds.forEach((id) => counts.set(id, 0));

    data?.forEach((row: any) => {
      counts.set(row.conversation_id, parseInt(row.unread_count));
    });

    return counts;
  },

  async getTotalUnreadCount(
    userId: string,
    client?: SupabaseClient<Database>,
  ): Promise<number> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase.rpc("get_total_unread_count", {
      p_user_id: userId,
    });
    if (error) throw error;
    return data ?? 0;
  },
};
