import { createClient } from "@/lib/supabase/client";
import { Program, ProgramFilter } from "@/lib/types/university";
import type { SupabaseClient } from "@supabase/supabase-js";

export const programRepository = {
  async getPrograms(
    filter: ProgramFilter = {},
    client?: SupabaseClient,
  ): Promise<Program[]> {
    const supabase = client ?? createClient();
    let query = supabase
      .from("programs")
      .select("*, university:universities(name_en, slug)");

    if (filter.search) {
      query = query.ilike("name_en", `%${filter.search}%`);
    }

    if (filter.universityId) {
      query = query.eq("university_id", filter.universityId);
    }

    if (filter.degreeLevel) {
      query = query.eq("degree_level", filter.degreeLevel);
    }

    if (filter.intakeSeason) {
      query = query.eq("intake_season", filter.intakeSeason);
    }

    if (filter.teachingLanguage) {
      query = query.eq("language", filter.teachingLanguage);
    }

    if (filter.scholarshipType) {
      query = query.eq("scholarship_type", filter.scholarshipType);
    }

    if (filter.subjectAreaId) {
      query = query.eq("subject_area_id", filter.subjectAreaId);
    }

    if (filter.minTuition) {
      query = query.gte("tuition_after_scholarship", filter.minTuition);
    }

    if (filter.maxTuition) {
      query = query.lte("tuition_after_scholarship", filter.maxTuition);
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
      console.error("Error fetching programs:", error);
      return [];
    }

    return data as unknown as Program[];
  },

  async getProgramBySlug(
    slug: string,
    client?: SupabaseClient,
  ): Promise<Program | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*, university:universities(*)")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching program by slug ${slug}:`, error);
      return null;
    }

    return data as unknown as Program;
  },

  async getProgramsByUniversity(
    universityId: string,
    limit: number = 10,
    offset: number = 0,
    client?: SupabaseClient,
  ): Promise<Program[]> {
    return this.getPrograms({ universityId, limit, offset }, client);
  },
};
