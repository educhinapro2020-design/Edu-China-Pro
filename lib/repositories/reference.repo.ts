import { createClient } from "@/lib/supabase/client";
import { Country, City, SubjectArea } from "@/lib/types/university";
import type { SupabaseClient } from "@supabase/supabase-js";

export const referenceRepository = {
  async getCountries(client?: SupabaseClient): Promise<Country[]> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("name_en");

    if (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
    return data;
  },

  async getCities(
    countryId?: string,
    client?: SupabaseClient,
  ): Promise<City[]> {
    const supabase = client ?? createClient();
    let query = supabase.from("cities").select("*").order("name_en");

    if (countryId) {
      query = query.eq("country_id", countryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
    return data;
  },

  async getSubjectAreas(client?: SupabaseClient): Promise<SubjectArea[]> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("subject_areas")
      .select("*")
      .order("name_en");

    if (error) {
      console.error("Error fetching subject areas:", error);
      return [];
    }
    return data;
  },
};
