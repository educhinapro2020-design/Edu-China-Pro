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
import { SITE_URL, SITE_NAME } from "@/lib/constants/seo";
import { ImageGallery } from "@/components/shared/ImageGallery";

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
  const uniName = university?.name_en || "Study in China";
  const title = `${program.name_en} — ${uniName}`;
  const description =
    program.description?.slice(0, 160) ||
    `Apply for ${program.name_en} at ${uniName}. Competitive tuition and scholarship opportunities available.`;
  const url = `${SITE_URL}/universities/${slug}/programs/${programSlug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: university?.cover_image_url
        ? [
            {
              url: university.cover_image_url,
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: university?.cover_image_url
        ? [{ url: university.cover_image_url, width: 1200, height: 630 }]
        : undefined,
    },
  };
}

function buildJsonLd(program: any) {
  const university = program.university;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name_en,
    url: `${SITE_URL}/universities/${university?.slug}/programs/${program.slug}`,
    description:
      program.description?.slice(0, 300) ||
      `${program.name_en} at ${university?.name_en}.`,
    provider: {
      "@type": "EducationalOrganization",
      name: university?.name_en,
      url: `${SITE_URL}/universities/${university?.slug}`,
    },
    educationalLevel: program.degree_level?.replace(/_/g, " "),
    inLanguage: program.language === "chinese" ? "zh" : "en",
    ...(program.duration_years
      ? { timeRequired: `P${program.duration_years}Y` }
      : {}),
    image: university?.cover_image_url || undefined,
    offers: program.tuition_fee_cny
      ? {
          "@type": "Offer",
          price: program.tuition_fee_cny,
          priceCurrency: "CNY",
          category: "Tuition",
        }
      : undefined,
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

  const jsonLd = buildJsonLd(program);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="relative">
        <ProgramHeader program={{ ...program, university }} />

        <ProgramBento program={program} />

        <ProgramContent program={program} />

        {university?.is_featured && (
          <section className="py-12 border-t border-primary-100 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
              <ImageGallery
                images={[
                  ...(university.cover_image_url
                    ? [university.cover_image_url]
                    : []),
                  ...(Array.isArray(university.albums)
                    ? university.albums
                        .map((img: any) =>
                          typeof img === "string" ? img : img.url,
                        )
                        .filter(Boolean)
                    : []),
                ]}
                title="University Campus & Life"
              />
            </div>
          </section>
        )}

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
