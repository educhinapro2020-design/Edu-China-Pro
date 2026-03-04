import Link from "next/link";
import { University } from "@/lib/types/university";
import { twMerge } from "tailwind-merge";
import { FiAward, FiMapPin, FiStar } from "react-icons/fi";
import { HiOutlineExternalLink } from "react-icons/hi";

interface UniversityCardProps {
  university: University & { city?: { name_en: string } | null };
  className?: string;
  featured?: boolean;
}

export default function UniversityCard({
  university,
  className = "",
  featured = false,
}: UniversityCardProps) {
  const displayLogo = university.logo_url;
  const rank = university.shanghai_rank || university.qs_rank;
  const rankLabel = university.shanghai_rank ? "ARWU" : "QS";

  return (
    <Link
      href={`/universities/${university.slug}`}
      className={twMerge(
        "group bg-white border border-primary-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-brand-300 transition-all duration-300 flex flex-col h-full relative",
        featured && "border-brand-200 shadow-md",
        className,
      )}
    >
      {featured && (
        <div className="absolute top-0 right-0 z-10 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-sm flex items-center gap-1">
          <FiStar className="fill-current w-3 h-3" />
          Featured
        </div>
      )}

      <div className="relative w-full h-24 mb-6 bg-white p-4 rounded-lg flex items-center justify-center border border-primary-100/50 transition-colors">
        {displayLogo ? (
          <img
            src={displayLogo}
            alt={`${university.name_en} logo`}
            className="w-full h-full object-contain transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50 rounded-lg">
            <span className="text-4xl font-bold text-brand-300 font-serif">
              {university.name_en?.charAt(0) || "U"}
            </span>
          </div>
        )}

        {rank && (
          <div className="absolute flex items-center gap-1 top-2 left-2 bg-gold-600 text-white border border-gold-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <FiAward /> {rank} {rankLabel}
          </div>
        )}
      </div>

      <div className="flex flex-col grow">
        <h3 className="text-xl font-bold text-primary-900 font-serif mb-2 group-hover:text-brand-600 transition-colors duration-300 line-clamp-2">
          {university.name_en}
        </h3>

        <p className="text-primary-500 text-sm flex items-center gap-1.5 mb-3">
          <FiMapPin className="w-4 h-4 text-brand-500 shrink-0" />
          {university.city?.name_en || "China"}
        </p>

        <p className="text-sm text-primary-600 leading-relaxed grow line-clamp-4 mb-4">
          {university.profile_text ||
            "A prestigious university offering comprehensive programs for international students."}
        </p>

        <div className="mt-auto pt-4 border-t border-primary-100">
          <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700 flex items-center gap-2 transition-colors">
            View University
            <HiOutlineExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
