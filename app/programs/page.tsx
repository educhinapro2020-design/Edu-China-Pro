import { programRepository } from "@/lib/repositories/program.repo";
import { ProgramFilter } from "@/lib/types/university";
import ProgramSearchInterface from "@/components/programs/ProgramSearchInterface";
import { Navbar } from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/shared/Footer";

interface ProgramsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildFilter(
  searchParams: Record<string, string | string[] | undefined>,
): ProgramFilter {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const degreeLevel =
    typeof searchParams.degree === "string"
      ? (searchParams.degree as ProgramFilter["degreeLevel"])
      : undefined;
  const intakeSeason =
    typeof searchParams.intake === "string"
      ? (searchParams.intake as ProgramFilter["intakeSeason"])
      : undefined;
  const teachingLanguage =
    typeof searchParams.language === "string"
      ? (searchParams.language as ProgramFilter["teachingLanguage"])
      : undefined;
  const scholarshipType =
    typeof searchParams.scholarship === "string"
      ? (searchParams.scholarship as ProgramFilter["scholarshipType"])
      : undefined;
  const minTuition =
    typeof searchParams.minTuition === "string"
      ? parseInt(searchParams.minTuition)
      : undefined;
  const maxTuition =
    typeof searchParams.maxTuition === "string"
      ? parseInt(searchParams.maxTuition)
      : undefined;

  const page =
    typeof searchParams.page === "string"
      ? Math.max(parseInt(searchParams.page), 1)
      : 1;
  const limit =
    typeof searchParams.limit === "string"
      ? Math.min(parseInt(searchParams.limit), 36)
      : 12;
  const offset = (page - 1) * limit;

  return {
    search: q,
    degreeLevel,
    intakeSeason,
    teachingLanguage,
    scholarshipType,
    minTuition,
    maxTuition,
    limit,
    offset,
  };
}

export default async function ProgramsPage({
  searchParams,
}: ProgramsPageProps) {
  const params = await searchParams;
  const filter = buildFilter(params);
  const supabase = await createClient();

  const { data, count } = await programRepository.getProgramsWithCount(
    filter,
    supabase,
  );

  return (
    <>
      <Navbar />
      <ProgramSearchInterface
        initialData={data}
        totalCount={count}
        initialFilter={filter}
        currentPage={
          typeof params.page === "string" ? parseInt(params.page) : 1
        }
        limit={typeof params.limit === "string" ? parseInt(params.limit) : 12}
      />
      <Footer />
    </>
  );
}
