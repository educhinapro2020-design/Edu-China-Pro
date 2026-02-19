import { createClient } from "@/lib/supabase/client";
import { AdminDashboardData } from "@/lib/types/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const adminDataService = {
  /**
   * Fetch all admin dashboard data in a single RPC call.
   * @param weeks Number of weeks of trend data to return (default: 6)
   */
  async getDashboardData(
    weeks: number = 6,
    client?: SupabaseClient,
  ): Promise<AdminDashboardData> {
    const supabase = client ?? createClient();

    const { data, error } = await supabase.rpc("get_admin_dashboard", {
      p_weeks: weeks,
    });

    if (error) {
      console.error("get_admin_dashboard RPC error:", error);
      throw error;
    }

    return data as unknown as AdminDashboardData;
  },
};
