"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
  useRef,
} from "react";
import { FiSave, FiCheck, FiRefreshCw, FiSettings } from "react-icons/fi";
import { programRepository } from "@/lib/repositories/program.repo";
import { universityRepository } from "@/lib/repositories/university.repo";
import { referenceRepository } from "@/lib/repositories/reference.repo";
import { University, SubjectArea, Program } from "@/lib/types/university";
import { programFormSchema, slugify } from "@/lib/validations/adminValidation";
import {
  DEGREE_LEVEL_OPTIONS,
  SCHOLARSHIP_TYPE_OPTIONS,
  INTAKE_SEASON_OPTIONS,
  TEACHING_LANGUAGE_OPTIONS,
} from "@/lib/constants/admin";
import { DOCUMENT_REGISTRY } from "@/lib/constants/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ProgramFormProps {
  initialData?: Program;
  isEditing?: boolean;
}

export function ProgramForm({
  initialData,
  isEditing = false,
}: ProgramFormProps) {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    universityRepository.getUniversities({ limit: 100 }).then(setUniversities);
    referenceRepository.getSubjectAreas().then(setSubjectAreas);
  }, []);

  const [form, setForm] = useState({
    name_en: initialData?.name_en ?? "",
    name_local: initialData?.name_local ?? "",
    slug: initialData?.slug ?? "",
    university_id: initialData?.university_id ?? "",
    subject_area_id: initialData?.subject_area_id ?? "",
    degree_level: initialData?.degree_level ?? "bachelor",
    duration: initialData?.duration ?? "",
    language: initialData?.language ?? "english",
    intake_season: initialData?.intake_season ?? "",
    intake_year: initialData?.intake_year ?? "",
    application_deadline: initialData?.application_deadline ?? "",
    accepts_minors: initialData?.accepts_minors ?? false,
    accepts_students_in_china: initialData?.accepts_students_in_china ?? false,
    application_fee_amount: initialData?.application_fee_amount ?? "",
    application_fee_currency: initialData?.application_fee_currency ?? "",
    tuition_original: initialData?.tuition_original ?? "",
    tuition_after_scholarship: initialData?.tuition_after_scholarship ?? "",
    tuition_currency: initialData?.tuition_currency ?? "RMB",
    tuition_per: initialData?.tuition_per ?? "year",
    scholarship_type: initialData?.scholarship_type ?? "self_financed",
    scholarship_duration: initialData?.scholarship_duration ?? "",
    scholarship_policy_html: initialData?.scholarship_policy_html ?? "",
    scholarship_memo: initialData?.scholarship_memo ?? "",
    estimated_living_cost: initialData?.estimated_living_cost ?? "",
    estimated_living_currency: initialData?.estimated_living_currency ?? "RMB",
    cover_image_url: initialData?.cover_image_url ?? "",
    is_self_funded: initialData?.is_self_funded ?? false,
    is_scholarship_program: initialData?.is_scholarship_program ?? false,
    document_requirements:
      initialData?.document_requirements ?? ([] as string[]),
  });

  const handleDocumentChange = (docId: string, checked: boolean) => {
    setForm((prev) => {
      const current = prev.document_requirements || [];
      if (checked) {
        return { ...prev, document_requirements: [...current, docId] };
      }
      return {
        ...prev,
        document_requirements: current.filter((id) => id !== docId),
      };
    });
  };

  const handleGenerateSlug = () => {
    const baseName = form.name_en || form.name_local;
    if (baseName) {
      setForm((prev) => ({ ...prev, slug: slugify(baseName) }));
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name_en: form.name_en,
      name_local: form.name_local || null,
      slug: form.slug,
      university_id: form.university_id,
      subject_area_id: form.subject_area_id || null,
      degree_level: form.degree_level as any,
      duration: form.duration || null,
      language: form.language as any,
      intake_season: form.intake_season || null,
      intake_year: form.intake_year ? Number(form.intake_year) : null,
      application_deadline: form.application_deadline || null,
      accepts_minors: form.accepts_minors,
      accepts_students_in_china: form.accepts_students_in_china,
      application_fee_amount: form.application_fee_amount
        ? Number(form.application_fee_amount)
        : null,
      application_fee_currency: form.application_fee_currency || null,
      tuition_original: form.tuition_original
        ? Number(form.tuition_original)
        : null,
      tuition_after_scholarship: form.tuition_after_scholarship
        ? Number(form.tuition_after_scholarship)
        : null,
      tuition_currency: form.tuition_currency,
      tuition_per: form.tuition_per,
      scholarship_type: form.scholarship_type as any,
      scholarship_duration: form.scholarship_duration || null,
      scholarship_policy_html: form.scholarship_policy_html || null,
      scholarship_memo: form.scholarship_memo || null,
      estimated_living_cost: form.estimated_living_cost
        ? Number(form.estimated_living_cost)
        : null,
      estimated_living_currency: form.estimated_living_currency,
      cover_image_url: form.cover_image_url || null,
      is_self_funded: form.is_self_funded,
      is_scholarship_program: form.is_scholarship_program,
      document_requirements: form.document_requirements,
    };

    const result = programFormSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && initialData?.id) {
        await programRepository.updateProgram(initialData.id, payload as any);
      } else {
        await programRepository.createProgram(payload as any);
      }
      router.push("/admin/programs");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-6xl mx-auto">
      <div className="flex flex-col gap-8 pb-12">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
          <div>
            <h2 className="heading-4">Program Basics</h2>
            <p className="body-small text-primary-500 mt-1">
              Core academic details and categorical information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2.5">
              <label className="label">Program Name (EN)</label>
              <Input
                name="name_en"
                value={form.name_en}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
              {errors.name_en && (
                <p className="caption text-error">{errors.name_en}</p>
              )}
            </div>

            <div className="space-y-2.5 md:col-span-2 bg-primary-50/50 p-5 rounded-2xl border border-primary-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <FiSettings className="text-brand-600 size-4" />
                  <label className="label mb-0">URL Slug</label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSlug}
                  className="h-8 text-xs bg-white border-primary-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200"
                >
                  <FiRefreshCw className="mr-1.5 size-3" />
                  Generate Slug
                </Button>
              </div>
              <Input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="computer-science"
                className="bg-white font-mono text-sm"
              />
              <p className="caption text-primary-500 mt-2">
                This determines the web address for the program. It must be
                unique, lowercase, and use hyphens instead of spaces. A good
                slug improves SEO.
              </p>
              {errors.slug && (
                <p className="caption text-error mt-1">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="label">University</label>
              <Select
                value={form.university_id}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, university_id: val }))
                }
                options={universities.map((u) => ({
                  label: u.name_en,
                  value: u.id,
                }))}
                placeholder="Select University"
              />
              {errors.university_id && (
                <p className="caption text-error">{errors.university_id}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="label">Subject Area</label>
              <Select
                value={form.subject_area_id}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, subject_area_id: val }))
                }
                options={subjectAreas.map((s) => ({
                  label: s.name_en,
                  value: s.id,
                }))}
                placeholder="Select Subject"
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Degree Level</label>
              <Select
                value={form.degree_level}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    degree_level: val as typeof prev.degree_level,
                  }))
                }
                options={DEGREE_LEVEL_OPTIONS}
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Teaching Language</label>
              <Select
                value={form.language}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    language: val as typeof prev.language,
                  }))
                }
                options={TEACHING_LANGUAGE_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
          <div>
            <h2 className="heading-4">Intake &amp; Application</h2>
            <p className="body-small text-primary-500 mt-1">
              Admissions timeline and student eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2.5">
              <label className="label">Intake Season</label>
              <Select
                value={form.intake_season}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, intake_season: val }))
                }
                options={INTAKE_SEASON_OPTIONS}
                placeholder="Select Season"
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Duration</label>
              <Input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 4 years"
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Application Deadline</label>
              <Input
                type="date"
                name="application_deadline"
                value={form.application_deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                form.accepts_minors
                  ? "bg-brand-50 border-brand-500 shadow-sm"
                  : "bg-white border-primary-100 hover:border-brand-200 hover:bg-primary-50"
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  name="accepts_minors"
                  checked={form.accepts_minors}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div
                  className={`flex size-5 items-center justify-center rounded border transition-colors ${
                    form.accepts_minors
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-primary-300 bg-white text-transparent group-hover:border-brand-400"
                  }`}
                >
                  <FiCheck className="size-3.5" />
                </div>
              </div>
              <div className="flex-1">
                <span
                  className={`block text-sm font-semibold transition-colors ${
                    form.accepts_minors
                      ? "text-brand-900"
                      : "text-primary-700 group-hover:text-primary-900"
                  }`}
                >
                  Accepts Minors (Under 18)
                </span>
              </div>
            </label>

            <label
              className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                form.accepts_students_in_china
                  ? "bg-brand-50 border-brand-500 shadow-sm"
                  : "bg-white border-primary-100 hover:border-brand-200 hover:bg-primary-50"
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  name="accepts_students_in_china"
                  checked={form.accepts_students_in_china}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div
                  className={`flex size-5 items-center justify-center rounded border transition-colors ${
                    form.accepts_students_in_china
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-primary-300 bg-white text-transparent group-hover:border-brand-400"
                  }`}
                >
                  <FiCheck className="size-3.5" />
                </div>
              </div>
              <div className="flex-1">
                <span
                  className={`block text-sm font-semibold transition-colors ${
                    form.accepts_students_in_china
                      ? "text-brand-900"
                      : "text-primary-700 group-hover:text-primary-900"
                  }`}
                >
                  Accepts Students Currently in China
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
          <div>
            <h2 className="heading-4">Tuition &amp; Scholarship</h2>
            <p className="body-small text-primary-500 mt-1">
              Financial requirements and funding options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2.5">
              <label className="label">
                Original Tuition ({form.tuition_currency})
              </label>
              <Input
                type="number"
                name="tuition_original"
                value={form.tuition_original}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Final Tuition (After Scholarship)</label>
              <Input
                type="number"
                name="tuition_after_scholarship"
                value={form.tuition_after_scholarship}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Scholarship Type</label>
              <Select
                value={form.scholarship_type}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    scholarship_type: val as typeof prev.scholarship_type,
                  }))
                }
                options={SCHOLARSHIP_TYPE_OPTIONS}
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Scholarship Policy (Memo)</label>
              <Input
                type="textarea"
                name="scholarship_memo"
                value={form.scholarship_memo}
                onChange={handleChange}
                placeholder="Additional details about the scholarship..."
                className="h-10"
              />
            </div>

            <div className="space-y-2.5">
              <label className="label">Estimated Living Cost (Monthly)</label>
              <div className="flex gap-2">
                <Select
                  value={form.estimated_living_currency}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      estimated_living_currency: val as string,
                    }))
                  }
                  options={[
                    { label: "RMB", value: "RMB" },
                    { label: "USD", value: "USD" },
                  ]}
                  className="w-24 shrink-0"
                />
                <Input
                  type="number"
                  name="estimated_living_cost"
                  value={form.estimated_living_cost}
                  onChange={handleChange}
                  placeholder="e.g. 2000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-6">
          <div>
            <h2 className="heading-4">Document Requirements</h2>
            <p className="body-small text-primary-500 mt-1">
              Select all documents typically required for this program&apos;s
              application.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(DOCUMENT_REGISTRY).map((doc) => (
              <label
                key={doc.id}
                className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${
                  form.document_requirements?.includes(doc.id)
                    ? "bg-brand-50 border-brand-500 shadow-sm"
                    : "bg-white border-primary-100 hover:border-brand-200 hover:bg-primary-50"
                }`}
              >
                <div className="flex h-5 items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={
                      form.document_requirements?.includes(doc.id) || false
                    }
                    onChange={(e) =>
                      handleDocumentChange(doc.id, e.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <div
                    className={`flex size-4 items-center justify-center rounded border transition-colors ${
                      form.document_requirements?.includes(doc.id)
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-primary-300 bg-white text-transparent group-hover:border-brand-400"
                    }`}
                  >
                    <FiCheck className="size-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <span
                    className={`block text-[13px] font-medium mb-0.5 transition-colors ${
                      form.document_requirements?.includes(doc.id)
                        ? "text-brand-900"
                        : "text-primary-700 group-hover:text-primary-900"
                    }`}
                  >
                    {doc.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-primary-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-xl px-6 border-primary-200 bg-white hover:bg-primary-50 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="rounded-xl px-6 gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <FiSave className="size-3.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
