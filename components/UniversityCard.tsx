import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiMapPin, FiStar } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export interface University {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url?: string;
  ranking?: number;
}

interface UniversityCardProps {
  university: University;
  className?: string;
  featured?: boolean;
}

export default function UniversityCard({
  university,
  className = "",
  featured = false,
}: UniversityCardProps) {
  return (
    <div
      className={twMerge(
        "group h-full flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300",
        featured
          ? "border-2 border-brand-200 shadow-xl hover:shadow-2xl hover:border-brand-300 hover:-translate-y-1 relative"
          : "border border-primary-200 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-brand-200",
        className,
      )}
    >
      {featured && (
        <div className="absolute top-0 right-0 z-10 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
          <FiStar className="fill-current w-3 h-3" />
          Featured
        </div>
      )}

      <div className="relative h-48 w-full overflow-hidden">
        {university.image_url ? (
          <img
            src={university.image_url}
            alt={university.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-brand-50 flex items-center justify-center">
            <span className="text-brand-300 font-bold text-3xl font-serif">
              {university.name.charAt(0)}
            </span>
          </div>
        )}
        {university.ranking && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-sm px-3 py-1.5 rounded-full text-xs font-bold text-brand-600 border border-brand-100">
            Rank #{university.ranking}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex-grow p-5 flex flex-col">
        <h3
          className={twMerge(
            "text-lg font-bold text-primary-900 mb-2 truncate font-serif transition-colors",
            featured && "text-brand-700",
          )}
        >
          {university.name}
        </h3>

        <p className="text-primary-600 text-sm flex items-center gap-1.5 mb-3">
          <FiMapPin className="w-4 h-4 text-brand-500 shrink-0" />
          {university.location}
        </p>

        <p className="text-primary-500 text-sm line-clamp-2 mb-4 flex-grow">
          {university.description}
        </p>

        <div className="pt-4 mt-auto border-t border-primary-100">
          <Link
            href={`/universities/${university.id}`}
            className="w-full block"
          >
            <Button
              variant={featured ? "brand" : "ghost"}
              className={twMerge(
                "w-full transition-colors",
                !featured &&
                  "text-brand-600 hover:text-brand-700 hover:bg-brand-50",
              )}
            >
              {featured ? "View Details" : "View Programs"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
