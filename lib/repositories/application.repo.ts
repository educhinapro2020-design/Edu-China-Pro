import { createClient } from "@/lib/supabase/client";
import {
  Application,
  ApplicationInsert,
  ApplicationStatus,
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
    return data as Application;
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
    return data as Application[];
  },

  async getApplicationById(id: string, client?: SupabaseClient) {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        program:programs(id, name_en, document_requirements, university:universities(id, name_en, logo_url)),
        student:profiles!applications_student_id_fkey(full_name, email, avatar_url)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Application;
  },

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    client?: SupabaseClient,
  ) {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
  },

  // --- Documents ---

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
};
