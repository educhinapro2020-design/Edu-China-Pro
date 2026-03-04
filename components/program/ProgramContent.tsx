import { Program } from "@/lib/types/university";
import { getTuition } from "@/lib/utils/program";
import { DocumentKey } from "@/lib/constants/documents";
import { ProgramRequirements } from "./ProgramRequirements";

import {
  FiCheckCircle,
  FiShield,
  FiPieChart,
  FiAlertCircle,
  FiAward,
} from "react-icons/fi";

interface ProgramContentProps {
  program: Program;
}

export function ProgramContent({ program }: ProgramContentProps) {
  const eligibility = program.eligibility;
  const {
    hasScholarship,
    originalAmt,
    displayAmt,
    savings,
    livingCost,
    livingCurrency,
    tuitionPer,
    currency,
  } = getTuition(program);

  const hasScholarshipPolicy = !!(
    program as any
  ).university?.scholarship_policy_html
    ?.replace(/<[^>]*>/g, "")
    .trim();

  const hasSpecificScholarshipType = ["type_a", "type_b", "type_c"].includes(
    program.scholarship_type ?? "",
  );

  return (
    <div className="bg-primary-50/30 py-6 md:py-16">
      <div className="container mx-auto px-6 max-w-6xl space-y-12">
        {program.description && (
          <section className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 md:p-12">
            <h2 className="heading-4 mb-4">About This Program</h2>
            <p className="text-primary-600 leading-relaxed text-base max-w-3xl">
              {program.description}
            </p>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                <FiCheckCircle className="size-5" />
              </div>
              <h2 className="heading-4">Eligibility Requirements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-primary-500 uppercase tracking-widest mb-4">
                    Academic & Age
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-primary-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-primary-500 uppercase mb-2 tracking-wide">
                        Age Range
                      </p>
                      <p className="text-primary-900 font-medium font-serif">
                        {eligibility?.age_range
                          ? `${eligibility.age_range.min} - ${eligibility.age_range.max} years`
                          : "18-35 years"}
                      </p>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-primary-500 uppercase mb-2 tracking-wide">
                        Academic Background
                      </p>
                      <p className="text-primary-900 leading-relaxed font-medium">
                        {eligibility?.academic_requirements ||
                          `Standard ${program.degree_level} level entry requirements apply.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-primary-500 uppercase tracking-widest mb-4">
                    Language Proficiency
                  </h4>
                  <div className="bg-brand-50/30 border border-brand-100 rounded-xl p-4">
                    <p className="text-primary-800 leading-relaxed font-medium">
                      {eligibility?.language_requirements ||
                        `Program is taught in ${program.language}.`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <ProgramRequirements
                  requirements={
                    (program.document_requirements || [
                      "passport",
                      "transcript",
                      "degree_certificate",
                      "personal_statement",
                      "recommendation_letters",
                      "physical_exam",
                    ]) as DocumentKey[]
                  }
                />
              </div>
            </div>

            {eligibility?.additional_notes && (
              <div className="mt-10 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                <FiAlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div className="text-sm text-amber-900 leading-relaxed">
                  <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Special Notes
                  </p>
                  {eligibility.additional_notes}
                </div>
              </div>
            )}
          </div>
        </section>

        {hasScholarship || hasScholarshipPolicy ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-primary-100 shadow-sm p-8 md:p-12 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600">
                  <FiShield className="w-6 h-6" />
                </div>
                <h2 className="heading-4">Scholarship & Funding</h2>
              </div>

              {program.scholarship_type === "type_a" && (
                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">Type A - CSC Scholarship</p>
                    <p className="leading-relaxed">
                      This is a fully funded government scholarship. Competition
                      is extremely high.
                    </p>
                  </div>
                </div>
              )}

              {program.scholarship_type === "type_b" && (
                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">
                      Type B - University Scholarship
                    </p>
                    <p className="leading-relaxed">
                      This is a fully funded University scholarship. Competition
                      will be very high.
                    </p>
                  </div>
                </div>
              )}

              {program.scholarship_type === "type_c" && (
                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">
                      Type C - University Scholarship
                    </p>
                    <p className="leading-relaxed">
                      This is a partially funded University scholarship. Will
                      typically require residency in China.
                    </p>
                  </div>
                </div>
              )}

              {hasScholarshipPolicy ? (
                <div className="mt-8">
                  <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-7 rounded-lg bg-gold-100 flex items-center justify-center text-gold-600">
                        <FiAward className="size-4" />
                      </div>
                      <h3 className="text-base font-bold text-gold-800 font-serif">
                        Scholarship Policy
                      </h3>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-primary-700
                                 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                                 [&_th]:text-left [&_th]:p-2 [&_th]:bg-gold-100 [&_th]:border [&_th]:border-gold-200
                                 [&_td]:p-2 [&_td]:border [&_td]:border-gold-100"
                      dangerouslySetInnerHTML={{
                        __html: (program as any).university
                          .scholarship_policy_html,
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* FALLBACK PRAISE: Show if NO specific Type A/B/C AND no Policy exists */
                !hasSpecificScholarshipType && <ScholarshipPraiseContent />
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-brand-700 text-white rounded-2xl p-8 shadow-xl flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                    Funding Details
                  </p>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs text-white/90 mb-1">Benefit Type</p>
                      <p className="text-xl font-bold font-serif">
                        {program.scholarship_type
                          ?.replace("_", " ")
                          .toUpperCase() || "Full/Partial"}
                      </p>
                    </div>

                    {originalAmt != null && (
                      <div className="pt-5 border-t border-white/10">
                        <p className="text-xs text-white/90 mb-1">
                          Original Tuition
                        </p>
                        <p className="text-lg font-serif line-through text-white/70">
                          {originalAmt.toLocaleString()} {currency}/{tuitionPer}
                        </p>
                      </div>
                    )}

                    {displayAmt != null && (
                      <div>
                        <p className="text-xs text-white/90 mb-1">
                          Tuition After Scholarship
                        </p>
                        <p className="text-2xl font-bold font-serif text-white">
                          {displayAmt === 0
                            ? "Tuition Covered"
                            : `${displayAmt.toLocaleString()} ${currency}/${tuitionPer}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-50/50 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600">
                    <FiAward className="w-6 h-6" />
                  </div>
                  <h2 className="heading-4">
                    Maximize Your Scholarship Chances
                  </h2>
                </div>
                <ScholarshipPraiseContent isStandalone={true} />
              </div>
              <div className="w-full md:w-72 aspect-square rounded-2xl bg-brand-900 p-8 flex flex-col justify-center text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gold-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FiShield className="size-12 text-gold-500 mx-auto mb-4" />
                <p className="text-white font-bold text-xl mb-2">
                  EduChinaPro Guarantee
                </p>
                <p className="text-white/70 text-sm">
                  We negotiate the best terms for your future.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl  border border-primary-100 shadow-sm p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FiPieChart className="size-5" />
              </div>
              <h2 className="heading-4">Annual Cost Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-primary-50 p-6 rounded-3xl">
                <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-4">
                  Total Tuition
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-2xl font-bold text-primary-950 font-serif">
                    {displayAmt != null ? displayAmt.toLocaleString() : "N/A"}{" "}
                    {currency}
                  </span>
                  <span className="text-primary-500 mb-1">/{tuitionPer}</span>
                </div>
                {hasScholarship && savings && (
                  <p className="text-xs text-primary-400">
                    Saved{" "}
                    <span className="text-success font-semibold">
                      {savings.toLocaleString()} {currency}
                    </span>{" "}
                    via scholarship
                  </p>
                )}
              </div>

              {livingCost && (
                <div className="bg-primary-50 p-6 rounded-3xl">
                  <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-4">
                    Living (Est.)
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-bold text-primary-950 font-serif">
                      {livingCost?.toLocaleString()} {livingCurrency}
                    </span>
                    <span className="text-primary-500 mb-1">/year</span>
                  </div>
                  <p className="text-xs text-primary-400 italic">
                    Avg cost for students
                  </p>
                </div>
              )}

              <div className="bg-brand-600 text-white p-6 rounded-3xl shadow-lg shadow-brand-500/20">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
                  Total Estimate
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold font-serif">
                    {((displayAmt || 0) + (livingCost ?? 0)).toLocaleString()}{" "}
                    {currency}
                  </span>
                  <span className="text-white/60 mb-1">/year</span>
                </div>
                <p className="text-xs text-white/70">
                  Inclusive of tuition & basic living
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ScholarshipPraiseContent({
  isStandalone = false,
}: {
  isStandalone?: boolean;
}) {
  return (
    <div
      className={
        isStandalone
          ? "space-y-4 text-primary-600 leading-relaxed"
          : "space-y-6"
      }
    >
      <p
        className={
          isStandalone
            ? "text-base font-serif italic text-primary-900"
            : "p-6 bg-primary-50 rounded-2xl border border-primary-100 relative overflow-hidden group font-serif text-base leading-relaxed text-primary-900"
        }
      >
        &quot;Our mission is to ensure every qualified student has access to the
        best possible financial support in China.&quot;
      </p>

      {isStandalone && (
        <p>
          Even for programs without automatic or published scholarships,
          EduChinaPro works directly with university admissions to identify
          exclusive funding opportunities, grants, and stipends.
        </p>
      )}

      <div
        className={
          isStandalone
            ? "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
            : "grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8"
        }
      >
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-success size-5 shrink-0" />
          <span
            className={
              isStandalone
                ? "text-sm font-medium"
                : "text-sm font-semibold text-primary-700"
            }
          >
            Expert Application Strategy
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-success size-5 shrink-0" />
          <span
            className={
              isStandalone
                ? "text-sm font-medium"
                : "text-sm font-semibold text-primary-700"
            }
          >
            Internal Funding Access
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-success size-5 shrink-0" />
          <span
            className={
              isStandalone
                ? "text-sm font-medium"
                : "text-sm font-semibold text-primary-700"
            }
          >
            High Success Rate
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-success size-5 shrink-0" />
          <span
            className={
              isStandalone
                ? "text-sm font-medium"
                : "text-sm font-semibold text-primary-700"
            }
          >
            Full Support Guidance
          </span>
        </div>
      </div>
    </div>
  );
}
