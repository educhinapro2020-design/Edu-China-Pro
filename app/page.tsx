import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollRow } from "@/components/ui/scroll-row";
import UniversityCard from "@/components/UniversityCard";
import ProgramCard from "@/components/ProgramCard";
import {
  FiChevronRight,
  FiSearch,
  FiZap,
  FiMessageCircle,
  FiUsers,
  FiTarget,
  FiCheckCircle,
} from "react-icons/fi";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { homepageDataService } from "@/lib/services/homepage-data";
import { FiUser } from "react-icons/fi";

export default async function HomePage() {
  const data = await homepageDataService.getHomepageData();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-linear-to-br from-brand-50 via-white to-primary-50 pt-24 pb-24 lg:pt-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="hero mb-6 py-2">
              Your Gateway to
              <span className="block brand-text mt-2">Studying in China</span>
            </h1>
            <p className="body-large text-primary-600 mb-10 max-w-2xl mx-auto">
              We connect ambitious students to China's excellent universities.
              Get personalized guidance, and end-to-end application support.
            </p>

            <div className="flex justify-center gap-8 md:gap-16 mb-12 py-6 border-y border-primary-200/60 bg-white/50 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 font-serif">
                  1000
                </div>
                <div className="text-xs uppercase tracking-wider text-primary-500 font-semibold mt-1">
                  Universities
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 font-serif">
                  5000+
                </div>
                <div className="text-xs uppercase tracking-wider text-primary-500 font-semibold mt-1">
                  Programs
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 font-serif">
                  100+
                </div>
                <div className="text-xs uppercase tracking-wider text-primary-500 font-semibold mt-1">
                  Cities
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup">
                <Button size="lg" className="shadow-lg shadow-brand-500/20">
                  Get Free Consultation
                </Button>
              </Link>
              <Link href="/programs">
                <Button size="lg" variant="outline">
                  Explore Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-200 rounded-full filter blur-[120px] opacity-20 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-200 rounded-full filter blur-[120px] opacity-20 -z-10"></div>
      </section>

      <section className="py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="heading-2 mb-3">Trusted by Elite Institutions</h2>
              <p className="body text-primary-500 max-w-xl">
                We partner directly with China's "Double First-Class" and
                Project 985 universities to ensure you get the best education.
              </p>
            </div>
            <Link
              href="/universities"
              className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-all group"
            >
              View All Universities
              <FiChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ScrollRow itemClassName="w-[250px] md:w-[320px]">
            {data.featuredUniversities.map((uni) => (
              <UniversityCard
                key={uni.id}
                university={uni}
                featured
                className="h-full"
              />
            ))}
          </ScrollRow>

          <Link href="/universities" className="inline-block mt-8 md:hidden">
            <Button variant="outline" className="w-full">
              View All Universities
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="heading-1 mb-6">
              Why Choose <span className="brand-text">EduChinaPro?</span>
            </h2>
            <p className="body-large">
              We combine world-class technology with localized expertise to
              create the ultimate gateway for your academic success in China.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-full md:h-[600px]">
            <div className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-3xl bg-primary-700 p-8 flex flex-col justify-end text-white border border-primary-800 shadow-2xl transition-all duration-500 hover:shadow-brand-500/10 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-brand-500/30">
                  <FiSearch className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-serif">
                  Personalized University Matching
                </h3>
                <p className="text-primary-300 max-w-md leading-relaxed">
                  Real-time access to 5000+ programs across China's elite C9
                  League universities with intelligent matching based on your
                  profile.
                </p>
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-2 group relative overflow-hidden rounded-3xl bg-linear-to-b from-brand-600 to-brand-800 p-8 flex flex-col text-white shadow-2xl transition-all duration-500 hover:shadow-brand-600/20 hover:-translate-y-1">
              <div className="absolute inset-0 opacity-10"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20">
                    <FiZap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 font-serif">
                    End-to-End Management
                  </h3>
                  <p className="text-brand-100 leading-relaxed">
                    Upload your documents once. We handle translation,
                    verification, and multi-university submissions
                    automatically.
                  </p>
                </div>
                <div className="mt-auto pt-8">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="w-full bg-white text-brand-600 hover:bg-brand-50 border-none shadow-xl shadow-black/20 font-bold"
                    >
                      Start Free Application
                    </Button>
                  </Link>
                  <p className="mt-4 text-xs text-brand-200 text-center font-medium opacity-80">
                    Trusted by 12,000+ international students
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-3xl bg-primary-100 p-8 border border-primary-200 transition-all duration-500 hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-500/20">
                  <FiMessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2 font-serif">
                  Dedicated Counselor
                </h3>
                <p className="text-primary-600 text-sm leading-relaxed">
                  Real humans, real answers. Our consultants are based in
                  Beijing and Shanghai to provide on-the-ground support.
                </p>
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-3xl bg-primary-50 p-8 border border-primary-200 transition-all duration-500 hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-brand-100 overflow-hidden flex items-center justify-center"
                      >
                        <FiUsers className="w-5 h-5 text-brand-500" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-primary-900">
                    12k+ Success Cases
                  </div>
                </div>
                <p className="text-primary-600 text-sm leading-relaxed">
                  Join a community of international students from over 120
                  countries who trust EduChinaPro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="heading-2 mb-3">Popular Programs</h2>
              <p className="body text-primary-500 max-w-xl">
                Discover courses that international students are applying to
                right now.
              </p>
            </div>
            <Link
              href="/programs"
              className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-all group"
            >
              Browse All Programs
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
              Browse All Programs
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-900 px-8 py-16 md:px-16 md:py-20 text-center">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-brand-500/30 rounded-full blur-[80px]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800/20 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-[100px] -right-[100px] w-[400px] h-[400px] bg-gold-500/20 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-block bg-gold-400/20 text-gold-300 font-bold px-4 py-1.5 rounded-full text-sm mb-6 border border-gold-400/30 backdrop-blur-sm">
                💰 Financial Aid Available
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-6 leading-tight">
                Concerned about costs? <br />
                <span className="text-white">
                  We help you secure up to
                </span>{" "}
                <span className="text-gold-400">100% Scholarships.</span>
              </h2>
              <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed">
                From CSC Government Scholarships to University-specific grants,
                our team identifies every financial opportunity you're eligible
                for.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gold-500 hover:bg-gold-600 text-white border-none shadow-xl shadow-gold-500/20"
                >
                  Check Your Eligibility
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
