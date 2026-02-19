"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { FiSave } from "react-icons/fi";
import { universityRepository } from "@/lib/repositories/university.repo";
import { University } from "@/lib/types/university";
import {
  universityFormSchema,
  slugify,
} from "@/lib/validations/adminValidation";
import {
  COUNTRY_SPECIFIC_LABELS,
  INSTITUTION_TYPE_OPTIONS,
} from "@/lib/constants/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { referenceRepository } from "@/lib/repositories/reference.repo";
import { City } from "@/lib/types/university";

interface UniversityFormProps {
  initialData?: University;
  isEditing?: boolean;
}

export function UniversityForm({
  initialData,
  isEditing = false,
}: UniversityFormProps) {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [form, setForm] = useState({
    name_en: initialData?.name_en ?? "",
    name_local: initialData?.name_local ?? "",
    slug: initialData?.slug ?? "",
    city_id: initialData?.city_id ?? "",
    institution_type: initialData?.institution_type ?? "public",
    level: initialData?.level ?? "",
    logo_url: initialData?.logo_url ?? "",
    cover_image_url: initialData?.cover_image_url ?? "",
    shanghai_rank: initialData?.shanghai_rank ?? "",
    shanghai_rank_year: initialData?.shanghai_rank_year ?? "",
    qs_rank: initialData?.qs_rank ?? "",
    qs_rank_year: initialData?.qs_rank_year ?? "",
    majors_count: initialData?.majors_count ?? "",
    profile_html: initialData?.profile_html ?? "",
    profile_text: initialData?.profile_text ?? "",
    advantages_html: initialData?.advantages_html ?? "",
    accommodation_double_room: initialData?.accommodation_double_room ?? "",
    accommodation_single_room: initialData?.accommodation_single_room ?? "",
    accommodation_currency: initialData?.accommodation_currency ?? "RMB",
    self_financed_available: initialData?.self_financed_available ?? false,
    country_specific_data: {
      is_985_project:
        initialData?.country_specific_data?.is_985_project ?? false,
      is_211_project:
        initialData?.country_specific_data?.is_211_project ?? false,
      is_double_first_class:
        initialData?.country_specific_data?.is_double_first_class ?? false,
      is_hot_university:
        initialData?.country_specific_data?.is_hot_university ?? false,
      is_issp_university:
        initialData?.country_specific_data?.is_issp_university ?? false,
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && form.name_en) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name_en) }));
    }
  }, [form.name_en, isEditing]);

  // Fetch cities
  useEffect(() => {
    referenceRepository.getCities().then(setCities);
  }, []);

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

  const handleCountrySpecific = (key: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      country_specific_data: { ...prev.country_specific_data, [key]: checked },
    }));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrors({});

    // Build data for validation — coerce numeric strings
    const payload = {
      name_en: form.name_en,
      name_local: form.name_local || null,
      slug: form.slug,
      city_id: form.city_id,
      institution_type: form.institution_type as "public" | "private",
      level: form.level || null,
      logo_url: form.logo_url || null,
      cover_image_url: form.cover_image_url || null,
      shanghai_rank: form.shanghai_rank ? Number(form.shanghai_rank) : null,
      shanghai_rank_year: form.shanghai_rank_year
        ? Number(form.shanghai_rank_year)
        : null,
      qs_rank: form.qs_rank ? Number(form.qs_rank) : null,
      qs_rank_year: form.qs_rank_year ? Number(form.qs_rank_year) : null,
      majors_count: form.majors_count ? Number(form.majors_count) : null,
      profile_html: form.profile_html || null,
      profile_text: form.profile_text || null,
      advantages_html: form.advantages_html || null,
      accommodation_double_room: form.accommodation_double_room
        ? Number(form.accommodation_double_room)
        : null,
      accommodation_single_room: form.accommodation_single_room
        ? Number(form.accommodation_single_room)
        : null,
      accommodation_currency: form.accommodation_currency,
      self_financed_available: form.self_financed_available,
      country_specific_data: form.country_specific_data,
    };

    const result = universityFormSchema.safeParse(payload);
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
        await universityRepository.updateUniversity(
          initialData.id,
          payload as any,
        );
      } else {
        await universityRepository.createUniversity(payload as any);
      }
      router.push("/admin/universities");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-primary-900 font-serif border-b border-primary-50 pb-2">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              University Name (EN)
            </label>
            <Input
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              placeholder="e.g. Peking University"
            />
            {errors.name_en && (
              <p className="text-sm text-error">{errors.name_en}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Name (Local/Chinese)
            </label>
            <Input
              name="name_local"
              value={form.name_local}
              onChange={handleChange}
              placeholder="e.g. 北京大学"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">Slug</label>
            <Input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="peking-university"
            />
            {errors.slug && <p className="text-sm text-error">{errors.slug}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">City</label>
            <Select
              value={form.city_id}
              onChange={(val) => setForm((prev) => ({ ...prev, city_id: val }))}
              options={cities.map((c) => ({
                label: c.name_en,
                value: c.id,
              }))}
              placeholder="Select City"
            />
            {errors.city_id && (
              <p className="text-sm text-error">{errors.city_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">Type</label>
            <Select
              value={form.institution_type}
              onChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  institution_type: val as typeof prev.institution_type,
                }))
              }
              options={INSTITUTION_TYPE_OPTIONS}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-700">
              Level
            </label>
            <Input
              name="level"
              value={form.level}
              onChange={handleChange}
              placeholder="e.g. National Key University"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <ImageUpload
            label="Logo"
            value={form.logo_url || null}
            onChange={(url) =>
              setForm((prev) => ({ ...prev, logo_url: url ?? "" }))
            }
            folder="universities/logos"
          />
          <ImageUpload
            label="Cover Image"
            value={form.cover_image_url || null}
            onChange={(url) =>
              setForm((prev) => ({ ...prev, cover_image_url: url ?? "" }))
            }
            folder="universities/covers"
            aspectRatio="video"
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-primary-900 font-serif border-b border-primary-50 pb-2">
          Rankings &amp; Stats
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-primary-500">
              QS Rank
            </label>
            <Input
              type="number"
              name="qs_rank"
              value={form.qs_rank}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-primary-500">
              QS Year
            </label>
            <Input
              type="number"
              name="qs_rank_year"
              value={form.qs_rank_year}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-primary-500">
              Shanghai Rank
            </label>
            <Input
              type="number"
              name="shanghai_rank"
              value={form.shanghai_rank}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-primary-500">
              Majors Count
            </label>
            <Input
              type="number"
              name="majors_count"
              value={form.majors_count}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-primary-900 font-serif border-b border-primary-50 pb-2">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {COUNTRY_SPECIFIC_LABELS.map((label) => (
            <label
              key={label.key}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                form.country_specific_data[
                  label.key as keyof typeof form.country_specific_data
                ]
                  ? "bg-brand-50 border-brand-200"
                  : "bg-white border-primary-200 hover:bg-primary-50"
              }`}
            >
              <input
                type="checkbox"
                checked={
                  !!form.country_specific_data[
                    label.key as keyof typeof form.country_specific_data
                  ]
                }
                onChange={(e) =>
                  handleCountrySpecific(label.key, e.target.checked)
                }
                className="size-4 rounded border-primary-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-primary-700">
                {label.label}
              </span>
            </label>
          ))}
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              form.self_financed_available
                ? "bg-brand-50 border-brand-200"
                : "bg-white border-primary-200 hover:bg-primary-50"
            }`}
          >
            <input
              type="checkbox"
              name="self_financed_available"
              checked={form.self_financed_available}
              onChange={handleChange}
              className="size-4 rounded border-primary-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-primary-700">
              Self-Financed Available
            </span>
          </label>
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
              Save University
            </>
          )}
        </Button>
      </div>
      <div className="h-16" /> {/* Spacer for fixed footer */}
    </form>
  );
}
