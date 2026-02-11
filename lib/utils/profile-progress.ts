import {
  StudentProfile,
  StudentDocumentEntry,
  DocumentStatus,
} from "@/lib/types/student";
import {
  EDUCATION_DOCUMENTS,
  getEducationLevelKey,
  DocumentKey,
} from "@/lib/constants/documents";

/**
 * Calculates the completion percentage of the student profile.
 * - Personal Details: 8 fields (8 points)
 * - visited china: 1 point
 * - in china now: 1 point
 * - Contact Info: 4 fields (4 points)
 * - Education History: Present (4 points)
 * - Documents:
 *   - Passport & Photo: 2 points
 *   - Education Documents: varies based on history
 */
export function calculateProfileProgress(
  profile: Partial<StudentProfile> | null,
  documentsMap?: Partial<Record<DocumentKey, StudentDocumentEntry>> | null,
): number {
  if (!profile) return 0;

  const steps = {
    personal: [
      "first_name",
      "last_name",
      "date_of_birth",
      "gender",
      "nationality",
      "religion",
      "marital_status",
      "mother_tongue",
    ],
    contact: ["email", "phone_number", "address", "city", "zip_code"],
  };

  let completedPoints = 0;
  let totalPoints = 0;

  //  Personal Details
  const personalFields = steps.personal;
  totalPoints += personalFields.length;
  personalFields.forEach((field) => {
    const val = profile[field as keyof StudentProfile];
    if (val && typeof val === "string" && val.trim().length > 0) {
      completedPoints++;
    }
  });

  if (
    profile.has_visited_china !== null &&
    profile.has_visited_china !== undefined
  ) {
    completedPoints++;
  }
  totalPoints++;

  if (profile.in_china_now !== null && profile.in_china_now !== undefined) {
    completedPoints++;
  }
  totalPoints++;

  // Contact Info
  const contactFieldsToCheck = ["phone_number", "address", "city", "zip_code"];
  totalPoints += contactFieldsToCheck.length;
  contactFieldsToCheck.forEach((field) => {
    const val = profile[field as keyof StudentProfile];
    if (val && typeof val === "string" && val.trim().length > 0) {
      completedPoints++;
    }
  });

  // Education
  const educationWeight = 4;
  totalPoints += educationWeight;

  if (
    profile.education_history &&
    Array.isArray(profile.education_history) &&
    profile.education_history.length > 0
  ) {
    completedPoints += educationWeight;
  }

  // Documents

  // Mandatory General Docs (Passport, Photo)
  totalPoints += 2;
  if (isUploaded(documentsMap?.passport?.status)) completedPoints++;
  if (isUploaded(documentsMap?.photo?.status)) completedPoints++;

  // Education Docs - dynamically according to what user put in education history
  if (profile.education_history && Array.isArray(profile.education_history)) {
    profile.education_history.forEach((edu) => {
      const levelKey = getEducationLevelKey(edu.level);
      if (levelKey) {
        const levelConfig = EDUCATION_DOCUMENTS[levelKey];
        levelConfig.documents.forEach((doc) => {
          totalPoints++;
          if (isUploaded(documentsMap?.[doc.id]?.status)) {
            completedPoints++;
          }
        });
      }
    });
  }

  if (totalPoints === 0) return 0;

  return Math.min(Math.round((completedPoints / totalPoints) * 100), 100);
}

function isUploaded(status?: DocumentStatus) {
  return status === "uploaded" || status === "verified";
}
