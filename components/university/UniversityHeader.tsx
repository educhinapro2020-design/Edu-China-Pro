import Link from "next/link";
import { University } from "@/lib/types/university";
import { Button } from "@/components/ui/button";
import {
  FiChevronRight,
  FiMapPin,
  FiAward,
  FiArrowRight,
} from "react-icons/fi";

interface UniversityHeaderProps {
  university: University & { city?: { name_en: string } | null };
}

export function UniversityHeader({ university }: UniversityHeaderProps) {
  return (
    <div className="bg-white pt-8 pb-12 border-b border-primary-100">
      <div className="container mx-auto px-6">
        <nav className="flex items-center gap-2 text-primary-400 text-xs md:text-sm mb-8 font-medium min-w-0">
          <Link
            href="/"
            className="hover:text-brand-600 transition-colors shrink-0"
          >
            Home
          </Link>

          <FiChevronRight className="shrink-0" />

          <Link
            href="/universities"
            className="hover:text-brand-600 transition-colors shrink-0"
          >
            Universities
          </Link>

          <FiChevronRight className="shrink-0" />

          <span className="text-primary-900 truncate min-w-0">
            {university.name_en}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl p-3 flex items-center justify-center shadow-xl border border-primary-100 shrink-0">
            {university.logo_url ? (
              <img
                src={university.logo_url}
                alt={`${university.name_en} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-4xl font-bold text-brand-300 font-serif">
                {university.name_en?.charAt(0) || "U"}
              </span>
            )}
          </div>

          <div className="grow w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {university.country_specific_data?.is_985_project && (
                    <span className="flex items-center gap-1 bg-gold-50 text-gold-700 border border-gold-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <FiAward /> 985 Project
                    </span>
                  )}
                  {university.country_specific_data?.is_211_project && (
                    <span className="flex items-center gap-1 bg-gold-50 text-gold-700 border border-gold-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <FiAward /> 211 Project
                    </span>
                  )}
                  {university.country_specific_data?.is_double_first_class && (
                    <span className="flex items-center gap-1 bg-gold-50 text-gold-700 border border-gold-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <FiAward /> Double First Class
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-bold font-serif text-primary-900 leading-tight mb-2">
                  {university.name_en}
                </h1>
                {university.name_local && (
                  <p className="text-xl md:text-2xl text-primary-400 font-serif opacity-80 mb-6">
                    {university.name_local}
                  </p>
                )}

                <div className="flex items-center gap-2 text-primary-500 bg-primary-50 w-fit px-4 py-2 rounded-2xl border border-primary-100 text-sm font-medium">
                  <FiMapPin className="text-brand-500" />
                  <span>{university.city?.name_en || "China"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link href="#programs" className="w-full sm:w-auto">
                  <Button endIcon={<FiArrowRight />}>Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
