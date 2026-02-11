import { StudentProfile, StudentDocumentEntry } from "@/lib/types/student";
import {
  EDUCATION_DOCUMENTS,
  getEducationLevelKey,
  DocumentKey,
} from "@/lib/constants/documents";

export interface ChecklistItem {
  id: string;
  label: string;
  step: number;
  category: "personal" | "contact" | "education" | "document";
}

export function getProfileChecklist(
  profile: Partial<StudentProfile> | null,
  documentsMap?: Partial<Record<DocumentKey, StudentDocumentEntry>> | null,
): { completed: ChecklistItem[]; missing: ChecklistItem[] } {
  if (!profile) return { completed: [], missing: [] };

  const completed: ChecklistItem[] = [];
  const missing: ChecklistItem[] = [];

  const checkField = (
    field: keyof StudentProfile,
    label: string,
    step: number,
    category: ChecklistItem["category"],
    elemId?: string,
  ) => {
    const val = profile[field];
    const id = elemId || String(field);
    const item: ChecklistItem = { id, label, step, category };

    if (val && typeof val === "string" && val.trim().length > 0) {
      completed.push(item);
    } else if (val && typeof val === "number") {
      completed.push(item);
    } else {
      missing.push(item);
    }
  };

  checkField("first_name", "First Name", 1, "personal");
  checkField("last_name", "Last Name", 1, "personal");
  checkField("date_of_birth", "Date of Birth", 1, "personal");
  checkField("gender", "Gender", 1, "personal");
  checkField("nationality", "Nationality", 1, "personal");
  checkField("religion", "Religion", 1, "personal");
  checkField("marital_status", "Marital Status", 1, "personal");
  checkField("mother_tongue", "Mother Tongue", 1, "personal");

  checkField("phone_number", "Phone Number", 2, "contact");
  checkField("whatsapp_number", "WhatsApp / WeChat", 2, "contact");
  checkField("address", "Address", 2, "contact");
  checkField("city", "City", 2, "contact");
  checkField("zip_code", "Zip Code", 2, "contact");

  if (
    profile.education_history &&
    Array.isArray(profile.education_history) &&
    profile.education_history.length > 0
  ) {
    completed.push({
      id: "education_history",
      label: "Education History",
      step: 3,
      category: "education",
    });
  } else {
    missing.push({
      id: "education_history",
      label: "Education History",
      step: 3,
      category: "education",
    });
  }

  if (isUploaded(documentsMap?.passport?.status)) {
    completed.push({
      id: "passport",
      label: "Passport Scan",
      step: 4,
      category: "document",
    });
  } else {
    missing.push({
      id: "passport",
      label: "Passport Scan",
      step: 4,
      category: "document",
    });
  }

  if (isUploaded(documentsMap?.photo?.status)) {
    completed.push({
      id: "photo",
      label: "Passport Size Photo",
      step: 4,
      category: "document",
    });
  } else {
    missing.push({
      id: "photo",
      label: "Passport Size Photo",
      step: 4,
      category: "document",
    });
  }

  checkField("passport_number", "Passport Number", 4, "document");
  checkField("passport_expiry", "Passport Expiry Date", 4, "document");

  if (profile.education_history && Array.isArray(profile.education_history)) {
    profile.education_history.forEach((edu) => {
      const levelKey = getEducationLevelKey(edu.level);
      if (levelKey) {
        const levelConfig = EDUCATION_DOCUMENTS[levelKey];
        levelConfig.documents.forEach((doc) => {
          const item: ChecklistItem = {
            id: doc.id,
            label: doc.label,
            step: 4,
            category: "document",
          };

          if (isUploaded(documentsMap?.[doc.id]?.status)) {
            completed.push(item);
          } else {
            missing.push(item);
          }
        });
      }
    });
  }

  return { completed, missing };
}

function isUploaded(status?: string) {
  return status === "uploaded" || status === "verified";
}
