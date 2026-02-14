import { createClient } from "@/lib/supabase/client";
import { University, UniversityFilter } from "@/lib/types/university";
import type { SupabaseClient } from "@supabase/supabase-js";

export const universityRepository = {
  async getUniversities(
    filter: UniversityFilter = {},
    client?: SupabaseClient,
  ): Promise<University[]> {
    const supabase = client ?? createClient();
    let query = supabase
      .from("universities")
      .select("*, city:cities(name_en, slug)");

    if (filter.search) {
      query = query.ilike("name_en", `%${filter.search}%`);
    }

    if (filter.cityId) {
      query = query.eq("city_id", filter.cityId);
    }

    if (filter.institutionType) {
      query = query.eq("institution_type", filter.institutionType);
    }

    if (filter.labels && filter.labels.length > 0) {
      const jsonFilter: Record<string, boolean> = {};
      filter.labels.forEach((label) => {
        jsonFilter[label] = true;
      });
      query = query.contains("country_specific_data", jsonFilter);
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(
        filter.offset,
        filter.offset + (filter.limit || 10) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching universities:", error);
      return [];
    }

    return data as unknown as University[];
  },

  async getUniversityBySlug(
    slug: string,
    client?: SupabaseClient,
  ): Promise<University | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("universities")
      .select("*, city:cities(*)")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching university by slug ${slug}:`, error);
      return null;
    }

    return data as unknown as University;
  },
};
