import { Button } from "@/components/ui/button";
import { University, Program } from "@/lib/types/university";
import { FiCalendar, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

interface UniversitySidebarProps {
  university: University;
  programs: Program[];
}

export function UniversitySidebar({
  university,
  programs,
}: UniversitySidebarProps) {
  const tuitions = programs
    .map((p) => p.tuition_after_scholarship)
    .filter((t): t is number => t !== null && t !== undefined);

  const minTuition = tuitions.length > 0 ? Math.min(...tuitions) : 0;
  const maxTuition = tuitions.length > 0 ? Math.max(...tuitions) : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const intakeLabels = Array.from(
    new Set(
      programs
        .filter((p) => p.intake_season)
        .map((p) => {
          const season =
            p.intake_season!.charAt(0).toUpperCase() +
            p.intake_season!.slice(1);
          return p.intake_year ? `${season} ${p.intake_year}` : season;
        }),
    ),
  );

  const futureDeadlines = programs
    .map((p) => p.application_deadline)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d))
    .filter((d) => d >= today)
    .sort((a, b) => a.getTime() - b.getTime());

  const nearestDeadline =
    futureDeadlines.length > 0 ? futureDeadlines[0] : null;
  const daysUntilDeadline = nearestDeadline
    ? Math.ceil(
        (nearestDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const getUrgencyStyle = () => {
    if (daysUntilDeadline === null) return null;
    if (daysUntilDeadline <= 7)
      return { bg: "bg-error/20", text: "text-error", label: "Closing soon!" };
    if (daysUntilDeadline <= 30)
      return {
        bg: "bg-warning",
        text: "text-warning-foreground",
        label: "Apply soon",
      };
    return { bg: "bg-success/20", text: "text-success", label: "Open" };
  };
  const urgency = getUrgencyStyle();

  const formatDeadline = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="heading-4 mb-6">Key Information</h3>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
              <FiDollarSign className="text-brand-600 w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-primary-500 tracking-wide mb-1">
                Tuition Range
              </div>
              <div className="font-semibold text-primary-900">
                {tuitions.length > 0
                  ? `¥${minTuition.toLocaleString()} - ¥${maxTuition.toLocaleString()}`
                  : "Contact for details"}
                <span className="text-xs font-medium text-primary-600 ml-1">
                  / year
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
              <FiCalendar className="text-brand-600 w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-primary-500 tracking-wide mb-1">
                Application Period
              </div>
              <div className="font-semibold text-primary-900">
                {intakeLabels.length > 0
                  ? intakeLabels.join(", ")
                  : "Contact for details"}
              </div>
              {nearestDeadline ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-primary-500">
                    Deadline: {formatDeadline(nearestDeadline)}
                  </span>
                  {urgency && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text}`}
                    >
                      {daysUntilDeadline! <= 0
                        ? "Today!"
                        : `${daysUntilDeadline}d left`}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-primary-500 mt-1">
                  {intakeLabels.length > 0
                    ? "Deadline to be announced"
                    : "Contact us for intake details"}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
              <FiCheckCircle className="text-brand-600 w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-primary-500 tracking-wide mb-1">
                Admissions
              </div>
              <div className="text-primary-900 font-semibold">
                Good Acceptance
              </div>
              <div className="text-xs text-primary-500 mt-1">
                Early application recommended
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link href="#application" className="block w-full">
            <Button size="lg" className="w-full shadow-lg shadow-brand-500/20">
              Start Application
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-primary-900 bg-white rounded-2xl p-6 shadow-lg">
        <h4 className="font-bold text-lg mb-2">Need Help?</h4>
        <p className="text-primary-600 text-sm mb-4">
          Our expert counselors can help you choose the right program and guide
          you through the application process.
        </p>
        <Button startIcon={<FaWhatsapp />}>WhatsApp Us</Button>
      </div>
    </div>
  );
}
