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

export interface ApplicationDocument {
  url: string;
  status: DocumentStatus;
  uploaded_at: string;
  feedback?: string;
}

export type ApplicationDocuments = Partial<
  Record<DocumentKey, ApplicationDocument>
>;

export interface Application extends Omit<ApplicationRow, "documents"> {
  documents: ApplicationDocuments;
  program?: {
    id: string;
    name_en: string;
    university: {
      id: string;
      name_en: string;
      logo_url: string | null;
    };
    document_requirements?: DocumentKey[];
  };
  student?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export type ApplicationMessageRow =
  Database["public"]["Tables"]["application_messages"]["Row"];
export interface ApplicationMessage extends ApplicationMessageRow {
  sender?: {
    full_name: string | null;
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
