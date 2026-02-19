import { Database } from "@/lib/types/supabase";

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type UniversityInsert =
  Database["public"]["Tables"]["universities"]["Insert"];
export type UniversityUpdate =
  Database["public"]["Tables"]["universities"]["Update"];
export type ProgramInsert = Database["public"]["Tables"]["programs"]["Insert"];
export type ProgramUpdate = Database["public"]["Tables"]["programs"]["Update"];

export interface AdminDashboardFilter {
  cityId?: string;
  degreeLevel?: Database["public"]["Enums"]["degree_level"];
  subjectAreaId?: string;
  scholarshipType?: Database["public"]["Enums"]["scholarship_type"];
  teachingLanguage?: Database["public"]["Enums"]["teaching_language"];
}

export interface AdminPaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatBreakdown {
  label: string;
  value: number;
}

export interface AdminDashboardKPI {
  total_students: number;
  total_applications: number;
  total_universities: number;
  total_programs: number;
  student_trend: number;
  application_trend: number;
}

export interface AdminDashboardData {
  kpi: AdminDashboardKPI;
  signup_trend: StatBreakdown[];
  application_trend: StatBreakdown[];
  apps_by_degree: StatBreakdown[];
  apps_by_subject: StatBreakdown[];
  apps_by_city: StatBreakdown[];
  apps_by_university: StatBreakdown[];
  programs_by_degree: StatBreakdown[];
  programs_by_language: StatBreakdown[];
  programs_by_subject: StatBreakdown[];
  universities_by_type: StatBreakdown[];
  universities_by_city: StatBreakdown[];
}
