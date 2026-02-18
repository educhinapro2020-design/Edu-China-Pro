import { notFound } from "next/navigation";
import { universityRepository } from "@/lib/repositories/university.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { universityDataService } from "@/lib/services/university-data";

import { UniversityHeader } from "@/components/university/UniversityHeader";
import { UniversityBento } from "@/components/university/UniversityBento";
import { UniversityContent } from "@/components/university/UniversityContent";
import { UniversityCTA } from "@/components/university/UniversityCTA";
import { RelatedUniversities } from "@/components/university/RelatedUniversities";

import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const university = await universityRepository.getUniversityBySlug(slug);

  if (!university) {
    return {
      title: "University Not Found",
    };
  }

  return {
    title: `${university.name_en} - Study in China | EduChinaPro`,
    description:
      university.profile_text?.slice(0, 160) ||
      `Explore programs and admission details for ${university.name_en}. apply with EduChinaPro.`,
  };
}

export default async function UniversityPage({ params }: PageProps) {
  const { slug } = await params;
  const university = await universityRepository.getUniversityBySlug(slug);

  if (!university) {
    notFound();
  }

  const [programs, relatedUniversities] = await Promise.all([
    programRepository.getPrograms({
      universityId: university.id,
      limit: 100,
    }),
    universityDataService.getRelatedUniversities(university),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative">
        <UniversityHeader university={university} />

        <UniversityBento university={university} programs={programs} />

        <UniversityContent university={university} programs={programs} />

        <div className="border-t border-primary-100">
          <RelatedUniversities universities={relatedUniversities} />
        </div>

        {/*<UniversityCTA university={university} /> temporarily hidden*/}
      </main>

      <Footer />
    </div>
  );
}
