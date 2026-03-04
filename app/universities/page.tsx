import { universityRepository } from "@/lib/repositories/university.repo";
import { UniversityFilter } from "@/lib/types/university";
import UniversitySearchInterface from "@/components/universities/UniversitySearchInterface";
import { Navbar } from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/shared/Footer";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants/seo";
import { ConsultationSection } from "@/components/homepage/ConsultationSection";

export const metadata: Metadata = {
  title: "Chinese Universities — Browse & Compare Top Institutions",
  description:
    "Explore China's top universities including 985, 211, and Double First-Class institutions. Filter by city, type, and ranking to find your perfect match.",
  alternates: { canonical: `${SITE_URL}/universities` },
  openGraph: {
    title: "Chinese Universities — Browse & Compare",
    description:
      "Explore China's top universities. Filter by city, type, and ranking.",
    url: `${SITE_URL}/universities`,
  },
};

interface UniversitiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildFilter(
  searchParams: Record<string, string | string[] | undefined>,
): UniversityFilter {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const city =
    typeof searchParams.city === "string" ? searchParams.city : undefined;
  const type =
    typeof searchParams.type === "string"
      ? (searchParams.type as UniversityFilter["institutionType"])
      : undefined;

  const labelsParam =
    typeof searchParams.labels === "string" ? searchParams.labels : "";

  const labels = labelsParam
    ? (labelsParam.split(",") as UniversityFilter["labels"])
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
    cityId: city,
    institutionType: type,
    labels,
    limit,
    offset,
  };
}

export default async function UniversitiesPage({
  searchParams,
}: UniversitiesPageProps) {
  const params = await searchParams;
  const filter = buildFilter(params);
  const supabase = await createClient();

  const { data, count } = await universityRepository.getUniversitiesWithCount(
    filter,
    supabase,
  );

  return (
    <>
      <Navbar />
      <UniversitySearchInterface
        initialData={data}
        totalCount={count}
        initialFilter={filter}
        currentPage={
          typeof params.page === "string" ? parseInt(params.page) : 1
        }
        limit={typeof params.limit === "string" ? parseInt(params.limit) : 12}
      />
      <ConsultationSection />
      <Footer />
    </>
  );
}
