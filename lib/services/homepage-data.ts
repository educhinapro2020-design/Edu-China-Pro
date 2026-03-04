/* temporary service file to fetch home page data */

import { createClient } from "@/lib/supabase/server";
import { universityRepository } from "@/lib/repositories/university.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { referenceRepository } from "@/lib/repositories/reference.repo";
import { University, Program, SubjectArea } from "@/lib/types/university";

export interface HomepageData {
  stats: {
    universityCount: number;
    programCount: number;
    cityCount: number;
  };
  featuredUniversities: University[];
  topUniversities: University[];
  popularPrograms: Program[];
  featuredPrograms: Program[];
  subjectAreas: SubjectArea[];
}

export const homepageDataService = {
  async getHomepageData(): Promise<HomepageData> {
    const supabase = await createClient();

    const [
      universityCount,
      programCount,
      cityCount,
      featuredUniversities,
      topUniversities,
      popularPrograms,
      featuredPrograms,
      subjectAreas,
    ] = await Promise.all([
      supabase
        .from("universities")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => count || 800),

      supabase
        .from("programs")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => count || 2500),

      supabase
        .from("cities")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => count || 15),

      universityRepository.getUniversities(
        { labels: ["is_985_project"], limit: 8 },
        supabase,
      ),
      universityRepository.getUniversities({ limit: 8, offset: 8 }, supabase),

      programRepository.getPrograms({ limit: 8 }, supabase),

      programRepository.getFeaturedPrograms(supabase, 8),

      referenceRepository.getSubjectAreas(supabase),
    ]);

    return {
      stats: {
        universityCount,
        programCount,
        cityCount,
      },
      featuredUniversities,
      topUniversities,
      popularPrograms,
      featuredPrograms,
      subjectAreas: subjectAreas.slice(0, 8),
    };
  },
};
