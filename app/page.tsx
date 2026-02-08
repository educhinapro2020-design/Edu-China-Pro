import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollRow } from "@/components/ui/scroll-row";
import UniversityCard, { University } from "@/components/UniversityCard";
import {
  FiChevronRight,
  FiSearch,
  FiZap,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";

import { Navbar } from "@/components/shared/Navbar";

const topUniversities: University[] = [
  {
    id: "tsinghua",
    name: "Tsinghua University",
    location: "Beijing",
    description:
      "One of China's most prestigious universities, renowned for engineering, science, and technology programs.",
    image_url:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80",
    ranking: 1,
  },
  {
    id: "peking",
    name: "Peking University",
    location: "Beijing",
    description:
      "A comprehensive research university with excellence in humanities, social sciences, and natural sciences.",
    image_url:
      "https://images.unsplash.com/photo-1569152811536-fb47aced8409?w=800&q=80",
    ranking: 2,
  },
  {
    id: "fudan",
    name: "Fudan University",
    location: "Shanghai",
    description:
      "Leading university known for medicine, economics, and international relations programs.",
    image_url:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    ranking: 3,
  },
  {
    id: "zhejiang",
    name: "Zhejiang University",
    location: "Hangzhou",
    description:
      "Top-tier research university excelling in computer science, engineering, and business.",
    image_url:
      "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80",
    ranking: 4,
  },
  {
    id: "sjtu",
    name: "Shanghai Jiao Tong University",
    location: "Shanghai",
    description:
      "Renowned for engineering, medicine, and management programs with global partnerships.",
    image_url:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    ranking: 5,
  },
  {
    id: "nanjing",
    name: "Nanjing University",
    location: "Nanjing",
    description:
      "Historic institution with strong programs in physics, chemistry, and Chinese literature.",
    image_url:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    ranking: 6,
  },
];

const featuredUniversities: University[] = [
  {
    id: "wuhan",
    name: "Wuhan University",
    location: "Wuhan",
    description:
      "Known for its beautiful cherry blossom campus and strong programs in law, literature, and life sciences.",
    image_url:
      "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800&q=80",
  },
  {
    id: "xian",
    name: "Xi'an Jiaotong University",
    location: "Xi'an",
    description:
      "A pioneer in western China for engineering, medicine, and economics research.",
    image_url:
      "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80",
  },
  {
    id: "harbin",
    name: "Harbin Institute of Technology",
    location: "Harbin",
    description:
      "Premier institution for aerospace, robotics, and advanced manufacturing technologies.",
    image_url:
      "https://images.unsplash.com/photo-1559135197-8a45ea74d367?w=800&q=80",
  },
  {
    id: "beihang",
    name: "Beihang University",
    location: "Beijing",
    description:
      "Leading aerospace and aeronautical engineering university with cutting-edge research facilities.",
    image_url:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-primary-50 pt-24 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-primary-900 mb-6 leading-tight font-serif tracking-tight">
              Your Gateway to
              <span className="block brand-text">Studying in China</span>
            </h1>
            <p className="text-xl text-primary-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover top universities, explore diverse programs, and apply
              with confidence. We make your dream of studying in China a
              reality.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/universities">
                <Button size="lg">Explore Universities</Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Start Application
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      </section>

      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="heading-2 mb-4">
                Top Ranked Universities in China
              </h2>
              <p className="body-large">
                Explore the most prestigious institutions in China, recognized
                worldwide for academic excellence.
              </p>
            </div>
            <Link
              href="/universities"
              className="hidden lg:flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-all group"
            >
              View All Universities
              <FiChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ScrollRow itemClassName="w-[300px] md:w-[350px]">
            {topUniversities.map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </ScrollRow>

          <Link href="/universities" className="inline-block mt-8 lg:hidden">
            <Button variant="outline">View All Universities</Button>
          </Link>
        </div>
      </section>

      <section className="py-20 bg-primary-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Featured Institutions</h2>
            <p className="body-large max-w-2xl mx-auto">
              Hand-picked universities offering exceptional programs and unique
              campus experiences.
            </p>
          </div>

          <ScrollRow itemClassName="w-[300px] md:w-[400px]">
            {featuredUniversities.map((uni) => (
              <UniversityCard
                key={uni.id}
                university={uni}
                featured
                className="h-full"
              />
            ))}
          </ScrollRow>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="heading-1 mb-6">
              Why Choose <span className="brand-text">EduChinaPro?</span>
            </h2>
            <p className="body-large">
              We've combined world-class technology with localized expertise to
              create the ultimate gateway for your academic success in China.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-full md:h-[600px]">
            {/* Main Feature: Smart Discovery */}
            <div className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-3xl bg-primary-900 p-8 flex flex-col justify-end text-white border border-primary-800 shadow-2xl transition-all duration-500 hover:shadow-brand-500/10 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-brand-500/30">
                  <FiSearch className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-serif">
                  Smart Discovery System
                </h3>
                <p className="text-primary-300 max-w-md leading-relaxed">
                  Real-time access to 2,500+ programs across China's elite C9
                  League universities with intelligent matching based on your
                  profile.
                </p>
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-600 to-brand-800 p-8 flex flex-col text-white shadow-2xl transition-all duration-500 hover:shadow-brand-600/20 hover:-translate-y-1">
              <div className="absolute inset-0 opacity-10"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20">
                    <FiZap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 font-serif">
                    One-Click Apply
                  </h3>
                  <p className="text-brand-100 leading-relaxed">
                    Upload your documents once. We'll handle translation,
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
                  24/7 Expert Support
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

      <section className="py-24 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have successfully started their
            academic adventure in China with EduChinaPro.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-brand-600 hover:bg-brand-50 shadow-xl"
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/universities">
              <Button
                size="lg"
                className="bg-white text-brand-600 hover:bg-brand-50 shadow-xl"
              >
                Browse Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
