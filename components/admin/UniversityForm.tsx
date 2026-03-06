"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import {
  FiSave,
  FiCheck,
  FiRefreshCw,
  FiSettings,
  FiX,
  FiPlus,
  FiChevronDown,
  FiStar,
} from "react-icons/fi";
import { universityRepository } from "@/lib/repositories/university.repo";
import { University, UniversityAlbums } from "@/lib/types/university";
import {
  universityFormSchema,
  slugify,
  cityFormSchema,
} from "@/lib/validations/adminValidation";
import {
  COUNTRY_SPECIFIC_LABELS,
  INSTITUTION_TYPE_OPTIONS,
} from "@/lib/constants/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { City, Country } from "@/lib/types/university";
import { referenceRepository } from "@/lib/repositories/reference.repo";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiAssetsUpload";
import { relocateFiles } from "@/lib/utils/storage";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface UniversityFormProps {
  initialData?: University;
  isEditing?: boolean;
  basePath?: string;
}

interface AddCityDialogProps {
  initialSearch: string;
  countries: Country[];
  onCreated: (city: City) => void;
  onClose: () => void;
}

interface CityComboboxProps {
  value: string; // city_id UUID
  onChange: (cityId: string) => void;
  error?: string;
}

function AddCityDialog({
  initialSearch,
  countries,
  onCreated,
  onClose,
}: AddCityDialogProps) {
  const [form, setForm] = useState({
    name_en: initialSearch,
    region: "",
    country_id: countries[0]?.id ?? "",
    slug: slugify(initialSearch),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name_en") next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    const result = cityFormSchema.safeParse({
      name_en: form.name_en,
      region: form.region || null,
      country_id: form.country_id,
      slug: form.slug,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const city = await referenceRepository.createCity(result.data);
      onCreated(city);
    } catch {
      setErrors({ root: "Failed to create city. The slug may already exist." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-primary-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="heading-4">Add New City</h3>
            <p className="body-small text-primary-500 mt-0.5">
              Available immediately after saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-primary-50 text-primary-400 hover:text-primary-700 transition-colors"
          >
            <FiX className="size-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="label">City Name (EN)</label>
            <Input
              autoFocus
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              placeholder="e.g. Shanghai"
            />
            {errors.name_en && (
              <p className="caption text-error">{errors.name_en}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="label">Region / Province</label>
            <Input
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="e.g. Shanghai Municipality"
            />
          </div>

          <div className="space-y-2">
            <label className="label">Country</label>
            <Select
              value={form.country_id}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, country_id: val }))
              }
              options={countries.map((c) => ({
                label: c.name_en,
                value: c.id,
              }))}
              placeholder="Select country"
            />
            {errors.country_id && (
              <p className="caption text-error">{errors.country_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">Slug</label>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, slug: slugify(p.name_en) }))
                }
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 transition-colors"
              >
                <FiRefreshCw className="size-3" /> Regenerate
              </button>
            </div>
            <Input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="e.g. shanghai"
              className="font-mono"
            />
            {errors.slug && <p className="caption text-error">{errors.slug}</p>}
          </div>

          {errors.root && (
            <p className="caption text-error bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {errors.root}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-6 rounded-xl border border-primary-200 text-base text-primary-700 hover:bg-primary-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-base font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            <FiPlus className="size-4" />
            {isSubmitting ? "Saving..." : "Add City"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CitySelector({ value, onChange, error }: CityComboboxProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    referenceRepository.getCities().then(setCities);
    referenceRepository.getCountries().then(setCountries);
  }, []);

  const selectedCity = cities.find((c) => c.id === value);

  const filtered = search.trim()
    ? cities.filter(
        (c) =>
          c.name_en.toLowerCase().includes(search.toLowerCase()) ||
          (c.region ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : cities;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (city: City) => {
    onChange(city.id);
    setSearch("");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const handleCityCreated = (city: City) => {
    setCities((prev) =>
      [...prev, city].sort((a, b) => a.name_en.localeCompare(b.name_en)),
    );
    onChange(city.id);
    setShowAddDialog(false);
    setSearch("");
  };

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={handleOpen}
          className={twMerge(
            "flex w-full items-center justify-between rounded-xl border border-primary-200 bg-white px-4 h-12 text-base text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500",
            isOpen && "border-brand-500 ring-4 ring-brand-500/10",
            error && !isOpen && "border-error",
          )}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type to search..."
              className="flex-1 bg-transparent text-base text-primary-900 placeholder:text-primary-400 focus:outline-none"
            />
          ) : (
            <span
              className={twMerge(
                "flex-1 truncate",
                !selectedCity ? "text-primary-400" : "text-primary-900",
              )}
            >
              {selectedCity ? selectedCity.name_en : "Select city..."}
            </span>
          )}

          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            {value && !isOpen && (
              <span
                role="button"
                onClick={handleClear}
                className="p-0.5 rounded text-primary-400 hover:text-primary-700 transition-colors"
              >
                <FiX className="size-3.5" />
              </span>
            )}
            <FiChevronDown
              className={twMerge(
                "size-4 text-primary-400 transition-transform duration-200",
                isOpen && "rotate-180 text-brand-500",
              )}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-primary-100 bg-white p-2 shadow-xl shadow-primary-900/10"
            >
              <ul className="max-h-60 overflow-y-auto">
                {filtered.length === 0 && (
                  <li className="p-3 text-center text-sm text-primary-400">
                    No cities found
                  </li>
                )}
                {filtered.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(city)}
                      className={twMerge(
                        "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-base font-medium transition-colors text-left",
                        city.id === value
                          ? "bg-brand-50 text-brand-700"
                          : "text-primary-600 hover:bg-primary-50 hover:text-primary-900",
                      )}
                    >
                      <span>{city.name_en}</span>
                      <span className="flex items-center gap-2">
                        {city.region && (
                          <span className="text-xs font-normal text-primary-400">
                            {city.region}
                          </span>
                        )}
                        {city.id === value && (
                          <FiCheck className="size-4 text-brand-500" />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-primary-100 mt-1 pt-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setIsOpen(false);
                    setShowAddDialog(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-base font-medium text-brand-600 hover:bg-brand-50 transition-colors text-left"
                >
                  <FiPlus className="size-4" />
                  {search ? `Add "${search}"` : "Add new city"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="caption text-error mt-1">{error}</p>}

      {showAddDialog && (
        <AddCityDialog
          initialSearch={search}
          countries={countries}
          onCreated={handleCityCreated}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </>
  );
}

export function UniversityForm({
  initialData,
  isEditing = false,
  basePath = "/admin",
}: UniversityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sessionId = useRef(crypto.randomUUID());
  const uploadFolder = `universities/${initialData?.id ?? `temp/${sessionId.current}`}`;

  const [form, setForm] = useState({
    name_en: initialData?.name_en ?? "",
    name_local: initialData?.name_local ?? "",
    slug: initialData?.slug ?? "",
    city_id: initialData?.city_id ?? "",
    institution_type: initialData?.institution_type ?? "public",
    level: initialData?.level ?? "",
    logo_url: initialData?.logo_url ?? null,
    cover_image_url: initialData?.cover_image_url ?? null,
    shanghai_rank: initialData?.shanghai_rank ?? "",
    shanghai_rank_year: initialData?.shanghai_rank_year ?? "",
    qs_rank: initialData?.qs_rank ?? "",
    qs_rank_year: initialData?.qs_rank_year ?? "",
    majors_count: initialData?.majors_count ?? "",
    profile_html: initialData?.profile_html ?? "",
    profile_text: initialData?.profile_text ?? "",
    advantages_html: initialData?.advantages_html ?? "",
    scholarship_policy_html: initialData?.scholarship_policy_html ?? "",
    accommodation_double_room: initialData?.accommodation_double_room ?? "",
    accommodation_single_room: initialData?.accommodation_single_room ?? "",
    accommodation_currency: initialData?.accommodation_currency ?? "RMB",
    self_financed_available: initialData?.self_financed_available ?? false,
    is_featured: initialData?.is_featured ?? false,
    albums: (initialData?.albums as UniversityAlbums) ?? [],
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

  const handleCountrySpecific = (key: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      country_specific_data: { ...prev.country_specific_data, [key]: checked },
    }));
  };

  const handleGenerateSlug = () => {
    const baseName = form.name_en || form.name_local;
    if (baseName) {
      setForm((prev) => ({ ...prev, slug: slugify(baseName) }));
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrors({});

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
      scholarship_policy_html: form.scholarship_policy_html || null,
      accommodation_double_room: form.accommodation_double_room
        ? Number(form.accommodation_double_room)
        : null,
      accommodation_single_room: form.accommodation_single_room
        ? Number(form.accommodation_single_room)
        : null,
      accommodation_currency: form.accommodation_currency,
      self_financed_available: form.self_financed_available,
      is_featured: form.is_featured,
      country_specific_data: form.country_specific_data,
      albums: form.albums,
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
        const created = await universityRepository.createUniversity(
          payload as any,
        );

        const tempPrefix = `universities/temp/${sessionId.current}/`;
        const realPrefix = `universities/${created.id}/`;

        const allUrls = [
          form.logo_url,
          form.cover_image_url,
          ...(Array.isArray(form.albums) ? form.albums : []),
        ].filter(Boolean) as string[];

        if (allUrls.length > 0) {
          const relocated = await relocateFiles(
            tempPrefix,
            realPrefix,
            allUrls,
          );

          const singleCount = [form.logo_url, form.cover_image_url].filter(
            Boolean,
          ).length;
          const newLogoUrl = form.logo_url ? relocated[0] : null;
          const newCoverUrl = form.cover_image_url
            ? relocated[form.logo_url ? 1 : 0]
            : null;
          const newAlbums = relocated.slice(singleCount);

          await universityRepository.updateUniversity(created.id, {
            logo_url: newLogoUrl,
            cover_image_url: newCoverUrl,
            albums: newAlbums,
          });
        }
      }
      router.refresh();
      toast.success(isEditing ? "University updated!" : "University created!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-6xl mx-auto pb-6">
      <div className="flex flex-col gap-8 pb-12">
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex items-center gap-3">
            <FiStar
              className={twMerge(
                "size-4",
                form.is_featured
                  ? "text-amber-400 fill-amber-400"
                  : "text-primary-400",
              )}
            />
            <div>
              <p className="font-semibold text-primary-900">
                Featured on Homepage
              </p>
              <p className="text-sm text-primary-400">
                This university will appear in the featured section
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({ ...prev, is_featured: !prev.is_featured }))
            }
            className={twMerge(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              form.is_featured ? "bg-amber-400" : "bg-primary-200",
            )}
          >
            <span
              className={twMerge(
                "pointer-events-none inline-block size-5 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out",
                form.is_featured ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
          <div>
            <h2 className="heading-4">Basic Information</h2>
            <p className="body-small text-primary-500 mt-1">
              Core details and primary identifiers for the university.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2.5">
              <label className="label">University Name (EN)</label>
              <Input
                name="name_en"
                value={form.name_en}
                onChange={handleChange}
                placeholder="e.g. Peking University"
              />
              {errors.name_en && (
                <p className="caption text-error">{errors.name_en}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="label">Name (Local/Chinese)</label>
              <Input
                name="name_local"
                value={form.name_local}
                onChange={handleChange}
                placeholder="e.g. 北京大学"
              />
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
                placeholder="peking-university"
                className="bg-white font-mono text-sm"
              />
              <p className="caption text-primary-500 mt-2">
                This determines the web address for the university (e.g.,
                educhinapro.com/universities/<strong>your-slug</strong>). It
                must be unique, lowercase, and use hyphens instead of spaces. A
                good slug improves SEO.
              </p>
              {errors.slug && (
                <p className="caption text-error mt-1">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2.5 md:col-span-2">
              <label className="label">Profile / Description</label>
              <textarea
                name="profile_text"
                value={form.profile_text}
                onChange={handleChange}
                placeholder="Brief description of the university..."
                rows={6}
                className="flex w-full rounded-xl border border-primary-200 bg-white px-4 py-3 max-w-5xl mx-auto text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 resize-none"
              />
            </div>

            <div className="space-y-2.5">
              <ImageUpload
                uploadFolder={uploadFolder}
                value={form.logo_url}
                label="University Logo"
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, logo_url: url }))
                }
                onSync={async (url) => {
                  if (initialData?.id) {
                    await universityRepository.updateUniversity(
                      initialData.id,
                      {
                        logo_url: url,
                      },
                    );
                  }
                }}
              />
            </div>
            <div className="space-y-2.5">
              <ImageUpload
                uploadFolder={uploadFolder}
                value={form.cover_image_url}
                label="Cover Image"
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, cover_image_url: url }))
                }
                onSync={async (url) => {
                  if (initialData?.id) {
                    await universityRepository.updateUniversity(
                      initialData.id,
                      {
                        cover_image_url: url,
                      },
                    );
                  }
                }}
              />
            </div>
            <div className="space-y-2.5">
              <label className="label">City</label>
              <CitySelector
                value={form.city_id}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, city_id: val }))
                }
                error={errors.city_id}
              />
            </div>
            <div className="space-y-2.5">
              <label className="label">Institution Type</label>
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
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
          <div>
            <h2 className="heading-4">Rankings &amp; Stats</h2>
            <p className="body-small text-primary-500 mt-1">
              Global prestige and academic metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2.5">
              <label className="label">QS Rank</label>
              <Input
                type="number"
                name="qs_rank"
                value={form.qs_rank}
                onChange={handleChange}
                placeholder="e.g. 1"
              />
            </div>
            <div className="space-y-2.5">
              <label className="label">QS Year</label>
              <Input
                type="number"
                name="qs_rank_year"
                value={form.qs_rank_year}
                onChange={handleChange}
                placeholder={new Date().getFullYear().toString()}
              />
            </div>
            <div className="space-y-2.5">
              <label className="label">Shanghai Rank</label>
              <Input
                type="number"
                name="shanghai_rank"
                value={form.shanghai_rank}
                onChange={handleChange}
                placeholder="e.g. 1"
              />
            </div>
            <div className="space-y-2.5">
              <label className="label">Majors Count</label>
              <Input
                type="number"
                name="majors_count"
                value={form.majors_count}
                onChange={handleChange}
                placeholder="e.g. 120"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-6">
          <div>
            <h2 className="heading-4">Features &amp; Recognition</h2>
            <p className="body-small text-primary-500 mt-1">
              Select applicable country-specific distinctions and availability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUNTRY_SPECIFIC_LABELS.map((label) => {
              const isSelected =
                !!form.country_specific_data[
                  label.key as keyof typeof form.country_specific_data
                ];
              return (
                <label
                  key={label.key}
                  className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? "bg-brand-50 border-brand-500 shadow-sm"
                      : "bg-white border-primary-100 hover:border-brand-200 hover:bg-primary-50"
                  }`}
                >
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        handleCountrySpecific(label.key, e.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <div
                      className={`flex size-5 items-center justify-center rounded border transition-colors ${
                        isSelected
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
                        isSelected
                          ? "text-brand-900"
                          : "text-primary-700 group-hover:text-primary-900"
                      }`}
                    >
                      {label.label}
                    </span>
                  </div>
                </label>
              );
            })}

            <label
              className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                form.self_financed_available
                  ? "bg-brand-50 border-brand-500 shadow-sm"
                  : "bg-white border-primary-100 hover:border-brand-200 hover:bg-primary-50"
              }`}
            >
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  name="self_financed_available"
                  checked={form.self_financed_available}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div
                  className={`flex size-5 items-center justify-center rounded border transition-colors ${
                    form.self_financed_available
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
                    form.self_financed_available
                      ? "text-brand-900"
                      : "text-primary-700 group-hover:text-primary-900"
                  }`}
                >
                  Self-Financed Available
                </span>
              </div>
            </label>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-6">
            <div>
              <h2 className="heading-4">Scholarship Policy</h2>
              <p className="body-small text-primary-500 mt-1">
                Detailed funding information and criteria for all programs in
                this university.
              </p>
            </div>
            <div className="max-w-4xl">
              <RichTextEditor
                value={form.scholarship_policy_html}
                onChange={(html) =>
                  setForm((prev) => ({
                    ...prev,
                    scholarship_policy_html: html,
                  }))
                }
                placeholder="Detail the scholarship coverage, stipend, and terms..."
              />
            </div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-sm space-y-8">
            <div>
              <h2 className="heading-4">Photo Album</h2>
              <p className="body-small text-primary-500 mt-1">
                Gallery images shown on the university page.
              </p>
            </div>
            <MultiImageUpload
              uploadFolder={uploadFolder}
              value={form.albums}
              onChange={(urls) =>
                setForm((prev) => ({ ...prev, albums: urls }))
              }
              onSync={async (urls) => {
                if (initialData?.id) {
                  await universityRepository.updateUniversity(initialData.id, {
                    albums: urls,
                  });
                }
              }}
            />
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
          {isSubmitting ? "Saving..." : <>Save</>}
        </Button>
      </div>
    </form>
  );
}
