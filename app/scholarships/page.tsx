import Link from "next/link";
import { FiAward } from "react-icons/fi";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ConsultationSection } from "@/components/homepage/ConsultationSection";
import { FeaturedProgramsBento } from "@/components/homepage/FeaturedProgramsBento";
import { createClient } from "@/lib/supabase/server";
import { universityRepository } from "@/lib/repositories/university.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { University, Program } from "@/lib/types/university";

interface UniversityWithPrograms extends University {
  programs: Program[];
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
      // Ensure programs have the university object for the Bento component
      const programsWithUni = programs.map((p) => ({ ...p, university: uni }));
      return { ...uni, programs: programsWithUni } as UniversityWithPrograms;
    }),
  );

  return results.filter((uni) => uni.programs.length > 0);
}

export default async function ScholarshipsPage() {
  const universities = await getScholarshipsData();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-16 bg-gradient-to-b from-gold-50/50 to-white overflow-hidden">
        <div className="absolute -top-24 -right-24 size-96 bg-gold-100/30 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 -left-24 size-72 bg-brand-100/20 rounded-full blur-[80px] -z-10" />

        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-gold-100 text-gold-700 mb-6">
              <FiAward className="size-4" />
              Financial Aid & Scholarships
            </span>
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
          </div>
        </div>
      </section>

      {/* Featured Universities & Their Program Bento Carousels */}
      {universities.map((uni, uniIdx) => (
        <section
          key={uni.id}
          className={uniIdx % 2 === 0 ? "bg-white" : "bg-primary-50/20"}
        >
          {/* Scholarship Policy (shared for the university) */}
          <div className="container mx-auto px-6 py-12">
            {(() => {
              const policyProgram = uni.programs.find(
                (p) => p.scholarship_policy_html,
              );
              if (!policyProgram?.scholarship_policy_html) return null;

              return (
                <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6 md:p-10 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <FiAward className="size-6 text-gold-600" />
                    <h3 className="text-xl font-bold text-gold-800 font-serif">
                      {uni.name_en} Scholarship Policy
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm md:prose-base max-w-none text-primary-700 
                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
                    [&_th]:text-left [&_th]:p-3 [&_th]:bg-gold-100 [&_th]:border [&_th]:border-gold-200
                    [&_td]:p-3 [&_td]:border [&_td]:border-gold-100"
                    dangerouslySetInnerHTML={{
                      __html: policyProgram.scholarship_policy_html,
                    }}
                  />
                </div>
              );
            })()}
          </div>

          <FeaturedProgramsBento programs={uni.programs} hideHeader={true} />
        </section>
      ))}

      {/* Empty state */}
      {universities.length === 0 && (
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

      <ConsultationSection />
      <Footer />
    </div>
  );
}
