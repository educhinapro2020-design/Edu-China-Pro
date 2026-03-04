import Image from "next/image";
import Link from "next/link";
import {
  FiAward,
  FiMapPin,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ConsultationSection } from "@/components/homepage/ConsultationSection";
import { FeaturedProgramsBento } from "@/components/homepage/FeaturedProgramsBento";
import { createClient } from "@/lib/supabase/server";
import { universityRepository } from "@/lib/repositories/university.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { University, Program } from "@/lib/types/university";

const UNIS_PER_PAGE = 3;

interface UniversityWithPrograms extends University {
  programs: Program[];
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function getScholarshipsData(): Promise<UniversityWithPrograms[]> {
  const supabase = await createClient();
  const featuredUniversities =
    await universityRepository.getFeaturedUniversities(supabase);

  const results = await Promise.all(
    featuredUniversities.map(async (uni) => {
      const programs = await programRepository.getPrograms(
        { universityId: uni.id },
        supabase,
      );

      const rawAlbums = uni.albums;
      const albumList = Array.isArray(rawAlbums)
        ? rawAlbums
        : rawAlbums && typeof rawAlbums === "object"
          ? Object.values(rawAlbums)
          : [];

      const imagePool = [uni.cover_image_url, ...albumList].filter(
        Boolean,
      ) as string[];

      const programsWithUni = programs.map((p, i) => ({
        ...p,
        university: uni,
        cover_image_url:
          imagePool.length > 0 ? imagePool[i % imagePool.length] : null,
      }));

      return { ...uni, programs: programsWithUni } as UniversityWithPrograms;
    }),
  );

  return results.filter((uni) => uni.programs.length > 0);
}

function UniversityShowcase({ uni }: { uni: UniversityWithPrograms }) {
  const csd = uni.country_specific_data ?? {};
  const city = (uni as any).city;
  const labels: string[] = [];
  if (csd.is_985_project) labels.push("985 Project");
  if (csd.is_211_project) labels.push("211 Project");
  if (csd.is_double_first_class) labels.push("Double First Class");

  return (
    <div>
      <div className="container mx-auto px-6 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {uni.logo_url && (
              <div className="size-16 rounded-2xl bg-white border border-primary-100 shadow-sm flex items-center justify-center p-2 shrink-0">
                <Image
                  src={uni.logo_url}
                  alt={uni.name_en}
                  width={52}
                  height={52}
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {labels.map((l) => (
                  <span
                    key={l}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-700 border border-gold-200 uppercase tracking-wider"
                  >
                    {l}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-950 font-serif leading-tight">
                {uni.name_en}
              </h2>
              {city && (
                <p className="flex items-center gap-1.5 text-sm text-primary-400 font-medium mt-1">
                  <FiMapPin className="size-3.5" />
                  {city.name_en}, China
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/universities/${uni.slug}`}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-200 text-primary-700 font-semibold text-sm hover:border-brand-400 hover:text-brand-600 transition-all shrink-0"
          >
            View University
            <FiArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <FeaturedProgramsBento programs={uni.programs} hideHeader={true} />
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-12">
      {currentPage > 1 ? (
        <Link
          href={`/scholarships?page=${currentPage - 1}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-200 text-primary-700 font-semibold text-sm hover:border-brand-400 hover:text-brand-600 transition-all"
        >
          <FiChevronLeft className="size-4" />
          Previous
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-100 text-primary-300 font-semibold text-sm cursor-not-allowed">
          <FiChevronLeft className="size-4" />
          Previous
        </span>
      )}

      <div className="flex items-center gap-1 mx-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`/scholarships?page=${page}`}
            className={`size-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
              page === currentPage
                ? "bg-brand-600 text-white shadow-sm"
                : "text-primary-600 hover:bg-primary-100"
            }`}
          >
            {page}
          </Link>
        ))}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={`/scholarships?page=${currentPage + 1}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-200 text-primary-700 font-semibold text-sm hover:border-brand-400 hover:text-brand-600 transition-all"
        >
          Next
          <FiChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-100 text-primary-300 font-semibold text-sm cursor-not-allowed">
          Next
          <FiChevronRight className="size-4" />
        </span>
      )}
    </div>
  );
}

export default async function ScholarshipsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const allUniversities = await getScholarshipsData();

  const totalPages = Math.ceil(allUniversities.length / UNIS_PER_PAGE);
  const currentPage = Math.min(
    Math.max(1, parseInt(pageParam || "1") || 1),
    Math.max(1, totalPages),
  );

  const startIdx = (currentPage - 1) * UNIS_PER_PAGE;
  const universities = allUniversities.slice(
    startIdx,
    startIdx + UNIS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative pt-20 pb-16 bg-gradient-to-b from-gold-50/50 to-white overflow-hidden">
        <div className="absolute -top-24 -right-24 size-96 bg-gold-100/30 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 -left-24 size-72 bg-brand-100/20 rounded-full blur-[80px] -z-10" />
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-950 leading-[1.05] tracking-tight mb-6">
              Study in China with{" "}
              <span className="text-gold-600 font-serif">Scholarships</span>
            </h1>
            <p className="text-lg text-primary-500 max-w-2xl leading-relaxed">
              Explore scholarship opportunities at China&apos;s top
              universities. From CSC government scholarships to
              university-specific grants, find the right financial support for
              your education journey.
            </p>
            {allUniversities.length > 0 && (
              <p className="text-sm text-primary-400 mt-4">
                Showing {startIdx + 1}–
                {Math.min(startIdx + UNIS_PER_PAGE, allUniversities.length)} of{" "}
                {allUniversities.length} universities
              </p>
            )}
          </div>
        </div>
      </section>

      {universities.map((uni, uniIdx) => (
        <div
          key={uni.id}
          className={uniIdx % 2 === 0 ? "bg-white" : "bg-primary-50/30"}
        >
          <UniversityShowcase uni={uni} />
        </div>
      ))}

      {allUniversities.length === 0 && (
        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <FiAward className="size-16 text-primary-300 mx-auto mb-6" />
            <h2 className="heading-2 mb-4">No Featured Universities Yet</h2>
            <p className="body text-primary-500 max-w-md mx-auto">
              We&apos;re working on adding featured scholarship programs. Check
              back soon!
            </p>
          </div>
        </section>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />

      <ConsultationSection />
      <Footer />
    </div>
  );
}
