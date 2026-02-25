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

export default async function HomePage() {
  const data = await homepageDataService.getHomepageData();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-6 py-20 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-200 blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-brand-100 blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto md:text-center space-y-12">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Your Complete <span className="brand-text">Study-in-China</span>{" "}
              Partner
            </h1>
            <p className="body-large max-w-2xl mx-auto text-primary-500">
              Scholarships, Admissions, Visa, Settlement, China Support. Our
              dual-country presence ensures smooth, reliable guidance at every
              step of your journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="#smart-score"
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
            >
              Take the SmartScore™
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#consultation"
              className="w-full sm:w-auto px-8 py-4 border-2 border-brand-200 text-brand-700 hover:text-brand-800 text-center font-semibold rounded-xl hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
            >
              Book Free Consultation
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            {[
              "Full Scholarship Strategy (CSC, BRI, Provincial)",
              "Personalized Counseling & Career Guidance",
              "Graduation-to-Graduation Support",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-base md:text-sm font-medium text-primary-800">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <div className="glass-panel p-6 md:p-10 rounded-2xl grid grid-cols-2 sm:grid-cols-3 divide-x max-md:divide-none border-brand-100">
            {[
              { value: "100%", label: "China Specialized" },
              { value: "5000+", label: "Programs" },
              { value: "24/7", label: "Dual-Country Support" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="py-6 sm:py-0 sm:px-10 text-center sm:text-left space-y-2"
              >
                <h3 className="heading-2 text-brand-900">{stat.value}</h3>
                <p className="caption text-primary-500 uppercase tracking-widest font-bold">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
