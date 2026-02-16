import Link from "next/link";
import { University, Program } from "@/lib/types/university";
import { Button } from "@/components/ui/button";
import { FiChevronRight, FiArrowRight } from "react-icons/fi";
import { getTuition } from "@/lib/utils/program";

interface ProgramHeaderProps {
  program: Program & { university?: University };
}

export function ProgramHeader({ program }: ProgramHeaderProps) {
  const university = program.university;
  const { hasScholarship } = getTuition(program);

  return (
    <div className="bg-white pt-8 pb-12 border-b border-primary-100">
      <div className="container mx-auto px-6">
        <nav className="flex items-center gap-2 text-primary-400 text-xs mb-8 font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <FiChevronRight className="shrink-0" />
          <Link
            href="/universities"
            className="hover:text-brand-600 transition-colors"
          >
            Universities
          </Link>
          <FiChevronRight className="shrink-0" />
          {university && (
            <>
              <Link
                href={`/universities/${university.slug}`}
                className="hover:text-brand-600 transition-colors truncate max-w-[150px]"
              >
                {university.name_en}
              </Link>
              <FiChevronRight className="shrink-0" />
            </>
          )}
          <span className="text-primary-900 truncate max-w-[200px]">
            {program.name_en}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex flex-col gap-2 md:gap-4">
            <div className="flex flex-wrap items-center gap-3 gap-y-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wider">
                {program.degree_level} Degree
              </span>
              {program.language && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 uppercase tracking-wider">
                  {program.language} Taught
                </span>
              )}
              {hasScholarship && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-50 text-gold-700 border border-gold-200 uppercase tracking-wider">
                  Scholarship Available
                </span>
              )}
            </div>

            <div className="max-w-4xl mt-4 md:mt-2">
              <h1 className="text-3xl md:text-5xl font-bold font-serif text-primary-900 leading-tight mb-4">
                {program.name_en}
              </h1>
              {program.name_local && (
                <p className="text-xl md:text-2xl text-primary-400 font-serif opacity-80 mb-4">
                  {program.name_local}
                </p>
              )}
            </div>

            {university && (
              <Link
                href={`/universities/${university.slug}`}
                className="active:scale-95 group inline-flex items-center gap-4 p-2 pr-6 hover:bg-white border border-transparent rounded-2xl transition-all w-fit"
              >
                <div className="w-12 h-12 bg-white rounded-xl p-2 flex items-center justify-center border border-primary-100 shadow-sm group-hover:scale-105 transition-transform">
                  {university.logo_url ? (
                    <img
                      src={university.logo_url}
                      alt={university.name_en}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-brand-500 font-bold">
                      {university.name_en.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-400 uppercase tracking-widest leading-none mb-1">
                    Offered by
                  </p>
                  <p className="text-base font-bold text-primary-900 group-hover:text-brand-600 transition-colors">
                    {university.name_en}
                  </p>
                </div>
              </Link>
            )}
          </div>

          <div className="shrink-0">
            <Link href="#application" className="w-full sm:w-auto">
              <Button endIcon={<FiArrowRight />}>Apply Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
