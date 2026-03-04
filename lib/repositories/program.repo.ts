import { createClient } from "@/lib/supabase/client";
import { Program, ProgramFilter } from "@/lib/types/university";
import { ProgramInsert, ProgramUpdate } from "@/lib/types/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const programRepository = {
  async getPrograms(
    filter: ProgramFilter = {},
    client?: SupabaseClient,
  ): Promise<Program[]> {
    const supabase = client ?? createClient();
    let query = supabase
      .from("programs")
      .select(
        "*, university:universities(name_en, slug, logo_url, cover_image_url, albums, scholarship_policy_html)",
      );

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

  async getProgramsWithCount(
    filter: ProgramFilter = {},
    client?: SupabaseClient,
  ): Promise<{ data: Program[]; count: number }> {
    const supabase = client ?? createClient();
    let query = supabase
      .from("programs")
      .select(
        "*, university:universities(name_en, slug, logo_url, cover_image_url, albums, scholarship_policy_html)",
        {
          count: "exact",
        },
      );

    if (filter.search) {
      query = query.ilike("name_en", `%${filter.search}%`);
    }
    if (filter.universityId) {
      query = query.eq("university_id", filter.universityId);
    }
    if (filter.degreeLevel) {
      query = query.eq("degree_level", filter.degreeLevel);
    }
    if (filter.scholarshipType) {
      query = query.eq("scholarship_type", filter.scholarshipType);
    }
    if (filter.teachingLanguage) {
      query = query.eq("language", filter.teachingLanguage);
    }
    if (filter.subjectAreaId) {
      query = query.eq("subject_area_id", filter.subjectAreaId);
    }

    query = query.order("name_en", { ascending: true });

    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset !== undefined) {
      query = query.range(
        filter.offset,
        filter.offset + (filter.limit || 10) - 1,
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching programs with count:", error);
      return { data: [], count: 0 };
    }

    return { data: data as unknown as Program[], count: count || 0 };
  },

  async getProgramBySlug(
    universitySlug: string,
    programSlug: string,
    client?: SupabaseClient,
  ): Promise<Program | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("programs")
      .select("*, university:universities!inner(*)")
      .eq("university.slug", universitySlug)
      .eq("slug", programSlug)
      .single();

    if (error) {
      console.error(
        `Error fetching program ${programSlug} at ${universitySlug}:`,
        error,
      );
      return null;
    }

    return data as unknown as Program;
  },

  async getProgramById(
    id: string,
    client?: SupabaseClient,
  ): Promise<Program | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(
        "*, university:universities(name_en, slug, logo_url, cover_image_url, albums, scholarship_policy_html)",
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching program by id ${id}:`, error);
      return null;
    }

    return data as unknown as Program;
  },

  async createProgram(
    input: ProgramInsert,
    client?: SupabaseClient,
  ): Promise<Program> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("programs")
      .insert(input)
      .select(
        "*, university:universities(name_en, slug, logo_url, cover_image_url, albums, scholarship_policy_html)",
      )
      .single();

    if (error) {
      console.error("Error creating program:", error);
      throw error;
    }

    return data as unknown as Program;
  },

  async updateProgram(
    id: string,
    updates: ProgramUpdate,
    client?: SupabaseClient,
  ): Promise<Program> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("programs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        "*, university:universities(name_en, slug, logo_url, cover_image_url, albums, scholarship_policy_html)",
      )
      .single();

    if (error) {
      console.error("Error updating program:", error);
      throw error;
    }

    return data as unknown as Program;
  },

  async getFeaturedPrograms(
    client?: SupabaseClient,
    limit?: number,
  ): Promise<Program[]> {
    const supabase = client ?? createClient();
    let query = supabase
      .from("programs")
      .select(
        "*, university:universities(name_en, slug, logo_url, cover_image_url, albums, scholarship_policy_html)",
      )
      .eq("is_featured", true)
      .order("featured_order", { ascending: true, nullsFirst: false });

    if (limit) {
      query = query.not("featured_order", "is", null).limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching featured programs:", error);
      return [];
    }
    return data as unknown as Program[];
  },

  async updateFeatured(
    id: string,
    isFeatured: boolean,
    order: number | null,
    client?: SupabaseClient,
  ): Promise<void> {
    const supabase = client ?? createClient();
    const { error } = await supabase
      .from("programs")
      .update({
        is_featured: isFeatured,
        featured_order: order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async deleteProgram(id: string, client?: SupabaseClient): Promise<void> {
    const supabase = client ?? createClient();
    const { error } = await supabase.from("programs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting program:", error);
      throw error;
    }
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
