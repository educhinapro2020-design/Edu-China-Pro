import { University } from "@/lib/types/university";
import { FiBook, FiHome, FiMapPin, FiCalendar } from "react-icons/fi";
import { IoMapOutline } from "react-icons/io5";
import { MdOutlinePublic } from "react-icons/md";

interface UniversityStatsProps {
  university: University & { city?: { name_en: string } | null };
}

export function UniversityStats({ university }: UniversityStatsProps) {
  const stats = [
    {
      label: "Institution Type",
      value: university.institution_type
        ? university.institution_type.charAt(0).toUpperCase() +
          university.institution_type.slice(1)
        : null,
      icon: MdOutlinePublic,
    },
    {
      label: "Available Programs",
      value: university.majors_count ? `${university.majors_count}+` : null,
      icon: FiBook,
    },
    {
      label: "Accommodation",
      value:
        university.accommodation_single_room ||
        university.accommodation_double_room
          ? "On-Campus"
          : null,
      icon: FiHome,
    },
    {
      label: "Location",
      value: university.city?.name_en || null,
      icon: IoMapOutline,
    },
    {
      label: "Intakes",
      value: "Sep / Mar",
      icon: FiCalendar,
    },
  ].filter((s) => s.value !== null);

  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl border border-primary-100 flex flex-col items-center text-center hover:border-brand-200 transition-colors flex-1 min-w-[140px] md:min-w-[180px]"
        >
          <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center mb-3 text-brand-600">
            <stat.icon className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-primary-900 mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-primary-500 uppercase tracking-wide font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
