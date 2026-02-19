import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Program } from "@/lib/types/university";
import { FiBookOpen, FiClock, FiMapPin, FiDollarSign } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { getTuition } from "@/lib/utils/program";
import { IoCashOutline } from "react-icons/io5";

interface ProgramCardProps {
  program: Program;
  className?: string;
  featured?: boolean;
}

export default function ProgramCard({
  program,
  className = "",
  featured = false,
}: ProgramCardProps) {
  const university = (program as any).university;
  const {
    hasScholarship,
    displayAmt,
    originalAmt,
    currency,
    tuitionPer,
    scholarshipType,
    savings,
  } = getTuition(program);

  return (
    <div
      className={twMerge(
        "group h-full flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-primary-200 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-brand-200",
        className,
      )}
    >
      <div className="p-5 flex flex-col grow">
        <Link
          href={`/universities/${university?.slug || "unknown"}`}
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
            {university.logo_url ? (
              <img
                src={university.logo_url}
                alt={university.name_en}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-brand-500 font-bold text-xs">
                {university?.name_en?.charAt(0) || "U"}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-primary-500 truncate uppercase tracking-wider">
              {university?.name_en || "University"}
            </p>
          </div>
        </Link>

        <Link
          href={`/universities/${university?.slug || "unknown"}/programs/${program.slug}`}
          className="flex flex-col grow"
        >
          <h3 className="text-lg capitalize font-bold text-primary-900 mb-2 font-serif line-clamp-2 min-h-14 group-hover:text-brand-700 transition-colors">
            {program.name_en}
          </h3>

          <div className="space-y-2 mt-2 mb-4 text-sm text-primary-600">
            <div className="flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="capitalize">{program.degree_level} Degree</span>
            </div>
            {program.duration && (
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{program.duration}</span>
              </div>
            )}
            {displayAmt != null && (
              <div className="flex items-center gap-2">
                <IoCashOutline className="size-5 text-brand-400 shrink-0" />
                <div className="flex items-center gap-2 flex-wrap">
                  {hasScholarship ? (
                    <>
                      <span className="font-bold text-emerald-600">
                        {displayAmt === 0
                          ? `${
                              program.scholarship_type
                                ?.replace("_", " ")
                                .toUpperCase() || "Full/Partial"
                            }`
                          : `${displayAmt.toLocaleString()} ${currency}`}
                      </span>
                      {originalAmt && (
                        <span className="text-xs text-primary-400 line-through decoration-primary-300">
                          {originalAmt.toLocaleString()} {currency}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-bold">
                      {displayAmt.toLocaleString()} {currency}
                    </span>
                  )}
                  <span className="text-xs text-primary-400">
                    / {tuitionPer}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>

        <div className="mt-auto pt-4 border-t border-primary-100/50">
          <Link
            href={`/universities/${(program as any).university?.slug || "unknown"}/programs/${program.slug}`}
            className="block w-full"
          >
            <Button endIcon={<span className="text-xl leading-none">→</span>}>
              View Program
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
