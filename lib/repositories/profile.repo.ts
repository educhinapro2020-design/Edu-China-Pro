import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { Database } from "@/lib/types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profileRepo = {
  async getProfile(userId: string, client?: SupabaseClient<Database>) {
    const supabase = client ?? createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return profile;
  },

  async getUsers(
    params: {
      search?: string;
      role?: Database["public"]["Enums"]["user_role"] | "all";
      page?: number;
      pageSize?: number;
    },
    client?: SupabaseClient<Database>,
  ): Promise<{ data: Profile[]; total_count: number }> {
    const supabase = client ?? createClient();
    const { search = "", role = "all", page = 1, pageSize = 20 } = params;

    let query = supabase.from("profiles").select("*", { count: "exact" });

    if (role !== "all") {
      query = query.eq("role", role);
    }

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    query = query.range(start, end).order("created_at", { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }

    return {
      data: data as Profile[],
      total_count: count ?? 0,
    };
  },

  async getCurrentUser() {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (error.message.includes("Auth session missing")) return null;
      throw error;
    }

    return user;
  },

  async updateProfile(
    userId: string,
    updates: ProfileUpdate,
    client?: SupabaseClient<Database>,
  ) {
    const supabase: SupabaseClient<Database> = client ?? createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async createProfile(
    profile: ProfileInsert,
    client?: SupabaseClient<Database>,
  ) {
    const supabase: SupabaseClient<Database> = client ?? createClient();

    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};
