import { createClient } from "@/lib/supabase/server";
import { universityRepository } from "@/lib/repositories/university.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { University, Program } from "@/lib/types/university";

export const universityDataService = {
  /**
   * Fetches universities related to the given one.
   * Logic: Same city first, then same institution type, excluding current ID.
   */
  async getRelatedUniversities(
    university: University,
    limit: number = 6,
  ): Promise<University[]> {
    const supabase = await createClient();

    let relatedByCity = await universityRepository.getUniversities(
      { cityId: university.city_id, limit: limit + 1 },
      supabase,
    );

    let related = relatedByCity.filter((u) => u.id !== university.id);

    if (related.length < limit && university.institution_type) {
      const moreRelated = await universityRepository.getUniversities(
        { institutionType: university.institution_type, limit: limit },
        supabase,
      );

      const existingIds = new Set(related.map((u) => u.id));
      existingIds.add(university.id);

      for (const u of moreRelated) {
        if (!existingIds.has(u.id) && related.length < limit) {
          related.push(u);
          existingIds.add(u.id);
        }
      }
    }

    return related.slice(0, limit);
  },

  /**
   * Fetches programs similar to the given one.
   * Logic: Same degree level + same subject area, excluding current ID.
   */
  async getSimilarPrograms(
    program: Program,
    limit: number = 6,
  ): Promise<Program[]> {
    const supabase = await createClient();

    const similar = await programRepository.getPrograms(
      {
        degreeLevel: program.degree_level,
        subjectAreaId: program.subject_area_id as string,
        limit: limit + 1,
      },
      supabase,
    );

    return similar.filter((p) => p.id !== program.id).slice(0, limit);
  },
};
