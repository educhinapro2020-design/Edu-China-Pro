import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { Database } from "../../types/supabase";

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
