import { notFound } from "next/navigation";
import { programRepository } from "@/lib/repositories/program.repo";
import { universityDataService } from "@/lib/services/university-data";
import { ProgramHeader } from "@/components/program/ProgramHeader";
import { ProgramBento } from "@/components/program/ProgramBento";
import { ProgramContent } from "@/components/program/ProgramContent";
import { ProgramCTA } from "@/components/program/ProgramCTA";
import { ScrollRow } from "@/components/ui/scroll-row";
import ProgramCard from "@/components/ProgramCard";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string; programSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, programSlug } = await params;
  const program = await programRepository.getProgramBySlug(slug, programSlug);

  if (!program) return { title: "Program Not Found" };

  const university = (program as any).university;

  return {
    title: `${program.name_en} - ${university?.name_en || "Study in China"}`,
    description: `Apply for ${program.name_en} at ${university?.name_en}. Competitive tuition and scholarship opportunities available.`,
  };
}

export default async function ProgramPage({ params }: PageProps) {
  const { slug, programSlug } = await params;
  const program = await programRepository.getProgramBySlug(slug, programSlug);

  if (!program) {
    notFound();
  }

  const university = (program as any).university;
  const similarPrograms =
    await universityDataService.getSimilarPrograms(program);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative">
        <ProgramHeader program={{ ...program, university }} />

        <ProgramBento program={program} />

        <ProgramContent program={program} />

        {similarPrograms.length > 0 && (
          <section className="py-20 border-t border-primary-100 bg-white">
            <div className="container mx-auto px-6">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-primary-900 font-serif mb-4">
                  Similar Programs
                </h2>
                <p className="text-primary-500">
                  Other {program.degree_level} programs you might be interested
                  in.
                </p>
              </div>

              <ScrollRow itemClassName="w-[250px] md:w-[320px]">
                {similarPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} className="h-full" />
                ))}
              </ScrollRow>
            </div>
          </section>
        )}

        <ProgramCTA program={{ ...program, university }} />
      </main>

      <Footer />
    </div>
  );
}
