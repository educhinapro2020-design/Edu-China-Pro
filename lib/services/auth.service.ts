import { createClient } from "@/lib/supabase/client";
import { profileRepo } from "@/lib/repositories/profile.repo";

export const authService = {
  async signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  async signInWithPassword(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signUpWithPassword(
    email: string,
    password: string,
    fullName: string,
    role: "student" | "counselor" | "admin" = "student",
  ) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUserWithProfile() {
    const user = await profileRepo.getCurrentUser();
    if (!user) return null;

    const profile = await profileRepo.getProfile(user.id);
    return { ...user, profile };
  },
};
