import { createClient } from "@/lib/supabase/client";
import {
  Application,
  ApplicationInsert,
  ApplicationStatus,
  ApplicationStatusHistory,
  ApplicationNote,
  ApplicationMessage,
  NoteVisibility,
  UserDownload,
} from "@/lib/types/application";
import type { SupabaseClient } from "@supabase/supabase-js";

export const applicationRepository = {
  async createApplication(
    application: ApplicationInsert,
    client?: SupabaseClient,
  ): Promise<Application> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("applications")
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Application;
  },

  async getApplications(studentId: string, client?: SupabaseClient) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        program:programs(id, name_en, university:universities(id, name_en, logo_url))
      `,
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as Application[];
  },

  async getApplicationById(id: string, client?: SupabaseClient) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        program:programs(id, name_en, document_requirements, intake_season, intake_year, duration, tuition_original, tuition_currency, tuition_per, university:universities(id, name_en, logo_url)),
        student:profiles!applications_student_id_fkey(full_name, email, avatar_url)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as unknown as Application;
  },

  async getApplicationWithDocuments(
    applicationId: string,
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("applications")
      .select("documents")
      .eq("id", applicationId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateApplicationDocuments(
    applicationId: string,
    documents: any,
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("applications")
      .update({ documents })
      .eq("id", applicationId);

    if (error) throw error;
  },

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    note?: string,
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { error } = await supabase.rpc("update_application_status", {
      p_application_id: id,
      p_new_status: status,
      p_note: note ?? undefined,
    });

    if (error) throw error;
  },

  async undoLastStatus(id: string, client?: SupabaseClient) {
    const supabase = client ?? createClient();
    const { error } = await supabase.rpc("undo_last_application_status", {
      p_application_id: id,
    });

    if (error) throw error;
  },

  async getStatusHistory(
    applicationId: string,
    client?: SupabaseClient,
  ): Promise<ApplicationStatusHistory[]> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("application_status_history")
      .select("*")
      .eq("application_id", applicationId)
      .eq("reverted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ApplicationStatusHistory[];
  },

  async searchApplications(
    params: {
      search?: string;
      status?: ApplicationStatus | null;
      page?: number;
      pageSize?: number;
    },
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase.rpc("search_admin_applications", {
      p_search: params.search || "",
      p_status: (params.status as any) || null,
      p_page: params.page || 1,
      p_page_size: params.pageSize || 20,
    });

    if (error) throw error;
    return data as {
      data: Array<{
        id: string;
        status: ApplicationStatus;
        created_at: string;
        updated_at: string;
        submitted_at: string | null;
        student: {
          full_name: string;
          email: string;
          avatar_url: string | null;
        };
        program: {
          id: string;
          name_en: string;
          university: { id: string; name_en: string; logo_url: string | null };
        };
      }>;
      total_count: number;
      recently_updated: Array<{
        id: string;
        status: ApplicationStatus;
        created_at: string;
        updated_at: string;
        student: {
          full_name: string;
          email: string;
          avatar_url: string | null;
        };
        program: {
          id: string;
          name_en: string;
          university: { id: string; name_en: string; logo_url: string | null };
        };
      }>;
      status_counts: Record<string, number>;
    };
  },

  async searchCounselorApplications(
    params: {
      counselorId: string;
      search?: string;
      status?: ApplicationStatus | null;
      page?: number;
      pageSize?: number;
    },
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase.rpc(
      "search_counselor_applications",
      {
        p_counselor_id: params.counselorId,
        p_search: params.search || "",
        p_status: (params.status as any) || null,
        p_page: params.page || 1,
        p_page_size: params.pageSize || 20,
      },
    );

    if (error) throw error;
    return data as {
      data: Array<{
        id: string;
        status: ApplicationStatus;
        created_at: string;
        updated_at: string;
        submitted_at: string | null;
        student: {
          full_name: string;
          email: string;
          avatar_url: string | null;
        };
        program: {
          id: string;
          name_en: string;
          university: { id: string; name_en: string; logo_url: string | null };
        };
      }>;
      total_count: number;
      status_counts: Record<string, number>;
    };
  },

  async getNotes(applicationId: string, client?: SupabaseClient) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("application_notes")
      .select("*, author:profiles!author_id(full_name, avatar_url)")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ApplicationNote[];
  },

  async addNote(
    applicationId: string,
    note: string,
    visibility: NoteVisibility,
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("application_notes")
      .insert({
        application_id: applicationId,
        note,
        visibility,
        author_id: userData.user.id,
      })
      .select("*, author:profiles!author_id(full_name, avatar_url)")
      .single();

    if (error) throw error;
    return data as ApplicationNote;
  },

  async getMessages(applicationId: string, client?: SupabaseClient) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("application_messages")
      .select("*, sender:profiles!sender_id(full_name, avatar_url)")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as ApplicationMessage[];
  },

  async sendMessage(
    applicationId: string,
    message: string,
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("application_messages")
      .insert({
        application_id: applicationId,
        message,
        sender_id: userData.user.id,
      })
      .select("*, sender:profiles!sender_id(full_name, avatar_url)")
      .single();

    if (error) throw error;
    return data as ApplicationMessage;
  },

  async updateUserDownloads(
    applicationId: string,
    downloads: UserDownload[],
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("applications")
      .update({ user_downloads: downloads as unknown as any })
      .eq("id", applicationId);

    if (error) throw error;
  },
};
