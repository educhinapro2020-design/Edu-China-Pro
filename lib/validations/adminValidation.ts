import { z } from "zod";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export const universityFormSchema = z.object({
  name_en: z.string().min(2, "University name is required"),
  name_local: z.string().optional().nullable(),
  slug: z.string().min(2, "Slug is required"),
  city_id: z.string().uuid("Please select a city"),
  institution_type: z.enum(["public", "private"]).default("public"),
  level: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  shanghai_rank: z.coerce.number().int().positive().optional().nullable(),
  shanghai_rank_year: z.coerce.number().int().optional().nullable(),
  qs_rank: z.coerce.number().int().positive().optional().nullable(),
  qs_rank_year: z.coerce.number().int().optional().nullable(),
  majors_count: z.coerce.number().int().positive().optional().nullable(),
  profile_html: z.string().optional().nullable(),
  profile_text: z.string().optional().nullable(),
  advantages_html: z.string().optional().nullable(),
  accommodation_double_room: z.coerce.number().int().optional().nullable(),
  accommodation_single_room: z.coerce.number().int().optional().nullable(),
  accommodation_currency: z.string().default("RMB"),
  self_financed_available: z.boolean().default(false),
  country_specific_data: z
    .object({
      is_985_project: z.boolean().optional(),
      is_211_project: z.boolean().optional(),
      is_double_first_class: z.boolean().optional(),
      is_hot_university: z.boolean().optional(),
      is_issp_university: z.boolean().optional(),
    })
    .default({}),
});

export type UniversityFormValues = z.infer<typeof universityFormSchema>;

export const programFormSchema = z.object({
  name_en: z.string().min(2, "Program name is required"),
  name_local: z.string().optional().nullable(),
  slug: z.string().min(2, "Slug is required"),
  university_id: z.string().uuid("Please select a university"),
  subject_area_id: z.string().uuid().optional().nullable(),
  degree_level: z.enum([
    "bachelor",
    "master",
    "doctoral",
    "non_degree",
    "upgrade",
  ]),
  duration: z.string().optional().nullable(),
  language: z
    .enum(["chinese", "english", "chinese_english_bilingual"])
    .default("english"),
  intake_season: z.enum(["spring", "summer", "autumn"]).optional().nullable(),
  intake_year: z.coerce.number().int().optional().nullable(),
  application_deadline: z.string().optional().nullable(),
  accepts_minors: z.boolean().default(false),
  accepts_students_in_china: z.boolean().default(false),
  application_fee_amount: z.coerce.number().int().optional().nullable(),
  application_fee_currency: z.string().optional().nullable(),
  tuition_original: z.coerce.number().int().optional().nullable(),
  tuition_after_scholarship: z.coerce.number().int().optional().nullable(),
  tuition_currency: z.string().default("RMB"),
  tuition_per: z.string().default("year"),
  scholarship_type: z
    .enum(["self_financed", "type_a", "type_b", "type_c", "type_d"])
    .default("self_financed"),
  scholarship_duration: z.string().optional().nullable(),
  scholarship_policy_html: z.string().optional().nullable(),
  scholarship_memo: z.string().optional().nullable(),
  estimated_living_cost: z.coerce.number().int().optional().nullable(),
  estimated_living_currency: z.string().default("RMB"),
  cover_image_url: z.string().optional().nullable(),
  is_self_funded: z.boolean().default(false),
  is_scholarship_program: z.boolean().default(false),
  document_requirements: z.array(z.string()).optional().nullable(),
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;

export { slugify };

export const cityFormSchema = z.object({
  name_en: z.string().min(2, "City name is required"),
  region: z.string().optional().nullable(),
  country_id: z.uuid("Please select a country"),
  slug: z.string().min(2, "Slug is required"),
});

export type CityFormValues = z.infer<typeof cityFormSchema>;
