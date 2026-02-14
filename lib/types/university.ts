import { Database } from "@/lib/types/supabase";

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export interface CountrySpecificData {
  is_985_project?: boolean;
  is_211_project?: boolean;
  is_double_first_class?: boolean;
  is_hot_university?: boolean;
  is_issp_university?: boolean;
  [key: string]: boolean | undefined;
}

export interface UniversityAlbum {
  label: string;
  images: string[];
}

export type UniversityAlbums = Record<string, UniversityAlbum>;

export interface ProgramEligibility {
  age_range?: { min: number; max: number } | null;
  academic_requirements?: string | null;
  language_requirements?: string | null;
  documents_required?: string[];
  additional_notes?: string | null;
}

export interface Accommodation {
  double_room: number | null;
  single_room: number | null;
  currency: string;
}

export interface Country extends Row<"countries"> {}

export interface City extends Row<"cities"> {}

export interface SubjectArea extends Row<"subject_areas"> {}

export interface University extends Omit<
  Row<"universities">,
  "country_specific_data" | "albums"
> {
  country_specific_data: CountrySpecificData;
  albums: UniversityAlbums | null;
}

export interface Program extends Omit<
  Row<"programs">,
  "eligibility" | "detail_images"
> {
  eligibility: ProgramEligibility | null;
  detail_images: string[];
}

export interface UniversityFilter {
  search?: string;
  cityId?: string;
  institutionType?: Database["public"]["Enums"]["institution_type"];
  labels?: (keyof CountrySpecificData)[];
  limit?: number;
  offset?: number;
}

export interface ProgramFilter {
  search?: string;
  universityId?: string;
  degreeLevel?: Database["public"]["Enums"]["degree_level"];
  intakeSeason?: Database["public"]["Enums"]["intake_season"];
  teachingLanguage?: Database["public"]["Enums"]["teaching_language"];
  scholarshipType?: Database["public"]["Enums"]["scholarship_type"];
  subjectAreaId?: string;
  minTuition?: number;
  maxTuition?: number;
  limit?: number;
  offset?: number;
}
