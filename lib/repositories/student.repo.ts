import { createClient } from "@/lib/supabase/client";
import { StudentProfile, StudentDocuments } from "@/lib/types/student";
import type { SupabaseClient } from "@supabase/supabase-js";

export const studentRepository = {
  async getProfile(
    userId: string,
    client?: SupabaseClient,
  ): Promise<StudentProfile | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("Error fetching student profile:", error);
      return null;
    }

    return data as unknown as StudentProfile;
  },

  async updateProfile(
    userId: string,
    updates: Partial<StudentProfile>,
    client?: SupabaseClient,
  ): Promise<StudentProfile | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("student_profiles")
      .update(updates as any)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating student profile:", error);
      throw error;
    }

    return data as unknown as StudentProfile;
  },

  async getDocuments(
    userId: string,
    client?: SupabaseClient,
  ): Promise<StudentDocuments | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching student documents:", error);
      return null;
    }

    return data as unknown as StudentDocuments;
  },
};
