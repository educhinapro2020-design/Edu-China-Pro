import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollRow } from "@/components/ui/scroll-row";
import UniversityCard from "@/components/UniversityCard";
import ProgramCard from "@/components/ProgramCard";
import { FiChevronRight } from "react-icons/fi";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { homepageDataService } from "@/lib/services/homepage-data";
import { SmartScoreSection } from "@/components/homepage/SmartScore";
import WhyChooseECP from "@/components/homepage/WhyChooseECP";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { ClosingCTA } from "@/components/homepage/ClosingCTA";
import { ConsultationSection } from "@/components/homepage/ConsultationSection";
import { FeaturedProgramsBento } from "@/components/homepage/FeaturedProgramsBento";
import Hero from "@/components/homepage/Hero";
import { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  OG_IMAGE,
} from "@/lib/constants/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Study in China from Nepal | Scholarships & Admissions`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — Study in China from Nepal`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo/educhinapro-logo.svg`,
      description: SITE_DESCRIPTION,
      sameAs: ["https://www.facebook.com/profile.php?id=61583342317872"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "NP",
        availableLanguage: ["English", "Nepali"],
      },
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/universities?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function HomePage() {
  const data = await homepageDataService.getHomepageData();

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <Hero />

      <FeaturedProgramsBento programs={data.featuredPrograms} />

      <WhyChooseECP />

      <SmartScoreSection />

      <section className="py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="heading-2 mb-3">Trusted by Elite Institutions</h2>
              <p className="body text-primary-500 max-w-2xl">
                We partner directly with China's "Double First-Class" and
                Project 985 universities to ensure you get the best education.
              </p>
            </div>
            <Link
              href="/universities"
              className="hidden md:flex items-center gap-2 text-brand-600 font-medium text-sm hover:text-brand-700 transition-all group"
            >
              View All
              <FiChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ScrollRow itemClassName="w-[250px] md:w-[320px]">
            {data.featuredUniversities.map((uni) => (
              <UniversityCard
                key={uni.id}
                university={uni}
                className="h-full"
              />
            ))}
          </ScrollRow>

          <Link href="/universities" className="inline-block mt-8 md:hidden">
            <Button variant="outline" className="w-full">
              View All
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="heading-2 mb-3">Popular Programs</h2>
              <p className="body text-primary-500 max-w-2xl">
                Discover courses that international students are applying to
                right now.
              </p>
            </div>
            <Link
              href="/programs"
              className="hidden md:flex items-center gap-2 text-brand-600 text-sm font-semibold hover:text-brand-700 transition-all group"
            >
              View all
              <FiChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ScrollRow itemClassName="w-[300px] md:w-[320px]">
            {data.popularPrograms.map((prog) => (
              <ProgramCard key={prog.id} program={prog} className="h-full" />
            ))}
          </ScrollRow>

          <Link href="/programs" className="inline-block mt-8 md:hidden">
            <Button variant="outline" className="w-full">
              View All
            </Button>
          </Link>
        </div>
      </section>

      <ClosingCTA />
      <ConsultationSection />
      <Footer />
    </div>
  );
}
