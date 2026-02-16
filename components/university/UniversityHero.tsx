import Link from "next/link";
import { Button } from "@/components/ui/button";
import { University } from "@/lib/types/university";
import { FiMapPin, FiAward, FiUsers, FiChevronRight } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";

interface UniversityHeroProps {
  university: University & { city?: { name_en: string } | null };
}

export function UniversityHero({ university }: UniversityHeroProps) {
  const rank = university.shanghai_rank || university.qs_rank;
  const rankLabel = university.shanghai_rank
    ? "ARWU World Rank"
    : "QS World Rank";

  return (
    <div className="relative bg-primary-800 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/university-hero/campus-bg.png"
          alt="University Campus Background"
          className="w-full h-full object-cover opacity-40 blur-sm scale-105 transform"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-950 via-primary-900/60 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-10 pb-16 md:pt-36 md:pb-24">
        <div className="flex items-center gap-2 text-primary-300 text-sm mb-8 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <Link
            href="/universities"
            className="hover:text-white transition-colors"
          >
            Universities
          </Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-white truncate max-w-[200px] md:max-w-none">
            {university.name_en}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl p-4 flex items-center justify-center shadow-2xl shrink-0">
            {university.logo_url ? (
              <img
                src={university.logo_url}
                alt={`${university.name_en} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-5xl font-bold text-brand-300 font-serif">
                {university.name_en?.charAt(0) || "U"}
              </span>
            )}
          </div>

          <div className="grow">
            <div className="flex flex-wrap gap-3 mb-4">
              {university.country_specific_data?.is_985_project && (
                <span className="bg-gold-600 flex items-center justify-center text-white border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                  <FiAward className="size-4 mr-1" />
                  985 Project
                </span>
              )}
              {university.country_specific_data?.is_211_project && (
                <span className="bg-gold-600 flex items-center justify-center text-white border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                  <FiAward className="size-4 mr-1" />
                  211 Project
                </span>
              )}
              {university.country_specific_data?.is_double_first_class && (
                <span className="bg-gold-600 flex items-center justify-center text-white border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                  <FiAward className="size-4 mr-1" />
                  Double First Class
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-2 leading-tight">
              {university.name_en}
            </h1>
            {university.name_local && (
              <h2 className="text-xl md:text-2xl text-primary-300 font-serif mb-6 opacity-90">
                {university.name_local}
              </h2>
            )}

            <div className="flex flex-wrap mt-4 gap-y-4 gap-x-8 text-sm md:text-base text-primary-200 mb-8">
              <div className="flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-brand-400" />
                <span>{university.city?.name_en}, China</span>
              </div>
              {rank && (
                <div className="flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-gold-400" />
                  <span>
                    {rank} <span className="opacity-70">({rankLabel})</span>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-brand-400" />
                <span>International Friendly</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="#application">
                <Button className="shadow-xl shadow-brand-500/20 border-none">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
