"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { FiSave } from "react-icons/fi";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";

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

  // Fetch dependencies
  useEffect(() => {
    universityRepository.getUniversities({ limit: 100 }).then(setUniversities);
    referenceRepository.getSubjectAreas().then(setSubjectAreas);
  }, []);

  // Form state
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
  });

  // Auto-generate slug
  useEffect(() => {
    if (!isEditing && form.name_en) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name_en) }));
    }
  }, [form.name_en, isEditing]);

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

    // Build payload with proper types
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-primary-900 font-serif border-b border-primary-50 pb-2">
          Program Basics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Program Name (EN)
            </label>
            <Input
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
            />
            {errors.name_en && (
              <p className="text-sm text-error">{errors.name_en}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">Slug</label>
            <Input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="computer-science"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              University
            </label>
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
              <p className="text-sm text-error">{errors.university_id}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Subject Area
            </label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Degree Level
            </label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Teaching Language
            </label>
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

      {/* Intake & Application */}
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-primary-900 font-serif border-b border-primary-50 pb-2">
          Intake &amp; Deadlines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Intake Season
            </label>
            <Select
              value={form.intake_season}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, intake_season: val }))
              }
              options={INTAKE_SEASON_OPTIONS}
              placeholder="Select Season"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Duration
            </label>
            <Input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 4 years"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Deadline
            </label>
            <Input
              type="date"
              name="application_deadline"
              value={form.application_deadline}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="accepts_minors"
              checked={form.accepts_minors}
              onChange={handleChange}
              className="rounded border-primary-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-primary-700">Accepts Minors</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="accepts_students_in_china"
              checked={form.accepts_students_in_china}
              onChange={handleChange}
              className="rounded border-primary-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-primary-700">
              Accepts Students in China
            </span>
          </label>
        </div>
      </div>

      {/* Tuition & Scholarship */}
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-primary-900 font-serif border-b border-primary-50 pb-2">
          Tuition &amp; Scholarship
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Final Tuition (After Scholarship)
            </label>
            <Input
              type="number"
              name="tuition_after_scholarship"
              value={form.tuition_after_scholarship}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Original Tuition
            </label>
            <Input
              type="number"
              name="tuition_original"
              value={form.tuition_original}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Scholarship Type
            </label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Scholarship Policy (Memo)
            </label>
            <Input
              type="textarea"
              name="scholarship_memo"
              value={form.scholarship_memo}
              onChange={handleChange}
              className="h-10"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t border-primary-100 flex items-center justify-end gap-3 z-30">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <FiSave className="size-4" />
              Save Program
            </>
          )}
        </Button>
      </div>
      <div className="h-16" />
    </form>
  );
}
