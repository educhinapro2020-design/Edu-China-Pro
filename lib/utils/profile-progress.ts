import { StudentProfile } from "@/lib/types/student";

/**
 * Calculates the completion percentage of the student profile.
 * Focuses on Personal Details, Contact Info, and Education.
 * Documents are handled separately.
 */
export function calculateProfileProgress(
  profile: Partial<StudentProfile> | null,
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

  const contactFields = steps.contact;
  const contactFieldsToCheck = ["phone_number", "address", "city", "zip_code"];
  totalPoints += contactFieldsToCheck.length;
  contactFieldsToCheck.forEach((field) => {
    const val = profile[field as keyof StudentProfile];
    if (val && typeof val === "string" && val.trim().length > 0) {
      completedPoints++;
    }
  });

  const educationWeight = 4;
  totalPoints += educationWeight;

  if (
    profile.education_history &&
    Array.isArray(profile.education_history) &&
    profile.education_history.length > 0
  ) {
    completedPoints += educationWeight;
  }

  if (totalPoints === 0) return 0;

  return Math.min(Math.round((completedPoints / totalPoints) * 100), 100);
}
