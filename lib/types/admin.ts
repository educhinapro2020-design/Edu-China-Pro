import { Database } from "@/lib/types/supabase";

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

export interface PipelineStatus extends StatBreakdown {
  stage: "early" | "mid" | "urgent" | "late" | "success" | "terminal";
  sort_order: number;
}

export interface CounselorLoad {
  counselor_name: string;
  active_count: number;
}

export interface RecentActivity {
  id: string;
  application_id: string;
  status: string;
  changed_at: string;
  student_name: string | null;
  student_email: string;
}

export interface MonthlyOps {
  new_students: number;
  new_applications: number;
  counselor_load: CounselorLoad[];
  recent_activity: RecentActivity[];
}

export interface AdminDashboardKPI {
  total_students: number;
  total_applications: number;
  needs_action: number;
  pending_review: number;
  visa_granted: number;
  unassigned: number;
  students_this_month: number;
  apps_this_month: number;
  conversion_rate: number;
}

export interface AdminDashboardData {
  kpi: AdminDashboardKPI;
  apps_by_status: PipelineStatus[];
  apps_by_degree: StatBreakdown[];
  apps_by_subject: StatBreakdown[];
  apps_by_city: StatBreakdown[];
  apps_by_university: StatBreakdown[];
  apps_by_program: StatBreakdown[];
  monthly_ops: MonthlyOps;
}
