import { University, Program } from "@/lib/types/university";
import {
  FiAward,
  FiBook,
  FiHome,
  FiCalendar,
  FiUsers,
  FiMapPin,
} from "react-icons/fi";
import { MdOutlinePublic } from "react-icons/md";
import { twMerge } from "tailwind-merge";

interface UniversityBentoProps {
  university: University & { city?: { name_en: string } | null };
  programs?: Program[];
}

export function UniversityBento({
  university,
  programs = [],
}: UniversityBentoProps) {
  const rank = university.shanghai_rank || university.qs_rank;
  const rankLabel = university.shanghai_rank ? "ARWU Rank" : "QS Rank";

  // Calculate dynamic intakes from programs
  const getDynamicIntakes = () => {
    if (!programs || programs.length === 0) return "Sep / Mar";

    const seasonMap: Record<string, string> = {
      autumn: "Sep",
      spring: "Mar",
      summer: "Jul",
    };

    const uniqueSeasons = Array.from(
      new Set(
        programs
          .map((p) => p.intake_season)
          .filter((s): s is NonNullable<typeof s> => !!s),
      ),
    );

    if (uniqueSeasons.length === 0) return "Sep / Mar";

    return uniqueSeasons
      .map((s) => seasonMap[s as string] || s)
      .sort((a, b) => (a === "autumn" ? -1 : 1))
      .join(" / ");
  };

  const cards = [
    ...(rank && rank <= 300
      ? [
          {
            label: "Rank",
            value: `${rank}`,
            subValue: rankLabel,
            icon: FiAward,
            color: "text-gold-600 bg-gold-50",
          },
        ]
      : []),
    {
      label: "Majors Count",
      value: university.majors_count ? `${university.majors_count}+` : "N/A",
      subValue: "English/Chinese Taught",
      icon: FiBook,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Institution Type",
      value: university.institution_type
        ? university.institution_type.charAt(0).toUpperCase() +
          university.institution_type.slice(1)
        : "Public",
      subValue: "University Type",
      icon: MdOutlinePublic,
      color: "text-brand-600 bg-brand-50",
    },
    {
      label: "Accommodation",
      value:
        university.accommodation_single_room ||
        university.accommodation_double_room
          ? "Available"
          : "On-Campus",
      subValue: "Dormitory Housing",
      icon: FiHome,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Intakes",
      value: getDynamicIntakes(),
      subValue: "Application Cycles",
      icon: FiCalendar,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Acceptance",
      value: "High",
      subValue: "International Friendly",
      icon: FiUsers,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-6">
          At a Glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-primary-50/50 hover:bg-white border border-primary-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 rounded-4xl p-5 group flex flex-col gap-2"
            >
              <div
                className={twMerge(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  card.color,
                )}
              >
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-primary-400 uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-lg font-semibold text-primary-900 leading-tight mb-1">
                {card.value}
              </p>
              <p className="text-xs font-medium text-primary-500">
                {card.subValue}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
