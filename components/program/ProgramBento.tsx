import { Program } from "@/lib/types/university";
import { FiClock, FiGlobe, FiCalendar, FiAward } from "react-icons/fi";
import { IoCashOutline, IoHourglassOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import {
  getDeadlineStatus,
  formatShortDate,
  getTuition,
} from "@/lib/utils/program";

interface ProgramBentoProps {
  program: Program;
}

export function ProgramBento({ program }: ProgramBentoProps) {
  const { urgencyColorClass, urgencyText, isUrgent } = getDeadlineStatus(
    program.application_deadline,
  );

  const { hasScholarship, displayAmt, originalAmt, tuitionPer, currency } =
    getTuition(program);

  const cards = [
    {
      label: "Degree",
      value: program.degree_level,
      subValue: "Academic Level",
      icon: FiAward,
      color: "text-gold-600 bg-gold-50",
    },
    {
      label: "Tuition Fees",
      value:
        displayAmt != null
          ? `${displayAmt.toLocaleString()} ${currency} / ${tuitionPer}`
          : null,
      subValue: hasScholarship
        ? `was ${originalAmt?.toLocaleString()} ${currency}`
        : null,
      icon: IoCashOutline,
      color: "text-success bg-brand-50",
    },
    {
      label: "Duration",
      value: program.duration,
      subValue: "Program Length",
      icon: FiClock,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Teaching Language",
      value: program.language,
      subValue: "Instruction Med.",
      icon: FiGlobe,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Intake Period",
      value: program.intake_season,
      icon: FiCalendar,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Deadline",
      value: formatShortDate(program.application_deadline),
      subValue: urgencyText,
      icon: IoHourglassOutline,
      color: urgencyColorClass,
      isDeadline: true,
    },
  ].filter(
    (card) => card.value && card.value !== "N/A" && card.value !== "TBD",
  );

  if (cards.length === 0) return null;

  return (
    <section className="py-6 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-6 border-b border-primary-50 pb-2 inline-block">
          At a Glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-primary-50/50 hover:bg-white border border-primary-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 rounded-3xl p-5 group flex flex-col gap-1"
            >
              <div
                className={twMerge(
                  "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  card.color,
                )}
              >
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-lg capitalize font-bold text-primary-900 leading-tight mb-1">
                {card.value}
              </p>
              {card.subValue && (
                <p
                  className={twMerge(
                    "text-xs font-medium",
                    card.isDeadline && isUrgent
                      ? "text-red-500 font-bold"
                      : "text-primary-500",
                  )}
                >
                  {card.subValue}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
