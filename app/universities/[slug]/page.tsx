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
import { SITE_URL, SITE_NAME } from "@/lib/constants/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const university = await universityRepository.getUniversityBySlug(slug);

  if (!university) {
    return { title: "University Not Found" };
  }

  const title = `${university.name_en} — Study in China`;
  const description =
    university.profile_text?.slice(0, 160) ||
    `Explore programs and admission details for ${university.name_en}. Apply with EduChinaPro.`;
  const url = `${SITE_URL}/universities/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: university.cover_image_url
        ? [{ url: university.cover_image_url, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: university.cover_image_url
        ? [university.cover_image_url]
        : undefined,
    },
  };
}

function buildJsonLd(university: any, programCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: university.name_en,
    url: `${SITE_URL}/universities/${university.slug}`,
    logo: university.logo_url || undefined,
    image: university.cover_image_url || undefined,
    description:
      university.profile_text?.slice(0, 300) ||
      `${university.name_en} — a leading Chinese university.`,
    address: university.city
      ? {
          "@type": "PostalAddress",
          addressLocality: university.city.name,
          addressCountry: "CN",
        }
      : undefined,
    numberOfStudents: university.total_students || undefined,
    foundingDate: university.founded_year
      ? String(university.founded_year)
      : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Academic Programs",
      numberOfItems: programCount,
    },
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

  const jsonLd = buildJsonLd(university, programs.length);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
