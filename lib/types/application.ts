import { Database } from "@/lib/types/supabase";
import { DocumentKey } from "@/lib/constants/documents";
import { DocumentStatus } from "@/lib/types/student";

export type ApplicationRow =
  Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert =
  Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationUpdate =
  Database["public"]["Tables"]["applications"]["Update"];

export type ApplicationStatus =
  Database["public"]["Enums"]["application_status"];

export type NoteVisibility = Database["public"]["Enums"]["note_visibility"];

export type ApplicationStatusHistory =
  Database["public"]["Tables"]["application_status_history"]["Row"];

export interface ApplicationDocument {
  url: string;
  status: DocumentStatus;
  file_name: string;
  uploaded_at: string;
  feedback?: string;
}

export type ApplicationDocuments = Partial<
  Record<DocumentKey, ApplicationDocument>
>;

export interface UserDownload {
  title: string;
  description?: string;
  url: string;
  uploaded_at: string;
  file_name: string;
}

export interface Application extends Omit<
  ApplicationRow,
  "documents" | "user_downloads"
> {
  documents: ApplicationDocuments;
  user_downloads: UserDownload[];
  program?: {
    id: string;
    name_en: string;
    university: {
      id: string;
      name_en: string;
      logo_url: string | null;
    };
    document_requirements?: DocumentKey[];
    intake_season?: Database["public"]["Enums"]["intake_season"] | null;
    intake_year?: number | null;
    duration?: string | null;
    tuition_original?: number | null;
    tuition_currency?: string | null;
    tuition_per?: string | null;
  };
  student?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export type ApplicationNoteRow =
  Database["public"]["Tables"]["application_notes"]["Row"];
export interface ApplicationNote extends ApplicationNoteRow {
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "reviewing",
  "approved",
  "action_required",
  "application_fee_pending",
  "application_fee_paid",
  "applied_to_university",
  "admission_success",
  "admission_failure",
  "offer_letter",
  "ecp_fee_pending",
  "ecp_fee_paid",
  "jw_form_received",
  "visa_docs_ready",
  "visa_granted",
  "visa_rejected",
];

export const APPLICATION_ADMIN_STATUSES: ApplicationStatus[] = [
  ...APPLICATION_STATUSES,
  "rejected",
  "dropped_off",
  "withdrawn",
  "closed",
];
