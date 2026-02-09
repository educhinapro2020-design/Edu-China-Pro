import { Database } from "@/lib/types/supabase";
import { DocumentKey } from "@/lib/constants/documents";

export interface EducationEntry {
  level: "High School" | "Bachelor" | "Master" | "PhD" | "Associate" | "Other";
  schoolName: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface FamilyMember {
  name: string;
  age?: number;
  jobtitle?: string;
  phone?: string;
}

export interface FamilyInfo {
  father?: FamilyMember;
  mother?: FamilyMember;
  guardian?: FamilyMember;
}

type StudentProfileRow =
  Database["public"]["Tables"]["student_profiles"]["Row"];

export interface StudentProfile extends Omit<
  StudentProfileRow,
  "education_history" | "family_info" | "passport_expiry"
> {
  education_history: EducationEntry[];
  family_info: FamilyInfo;
  passport_expiry?: string | null;
}

export type DocumentStatus =
  | "pending"
  | "uploaded"
  | "verified"
  | "rejected"
  | "needs_correction";

export interface StudentDocumentEntry {
  url: string;
  status: DocumentStatus;
  feedback?: string;
  uploaded_at: string;
  file_name?: string;
}

type StudentDocumentsRow =
  Database["public"]["Tables"]["student_documents"]["Row"];

export interface StudentDocuments extends Omit<
  StudentDocumentsRow,
  "documents"
> {
  documents: Partial<Record<DocumentKey, StudentDocumentEntry>>;
}
