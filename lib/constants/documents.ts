export type DocumentKey =
  | "passport"
  | "photo"
  | "transcript_highschool"
  | "transcript_bachelors"
  | "transcript_masters"
  | "degree_highschool"
  | "degree_bachelors"
  | "degree_masters"
  | "health_check"
  | "police_clearance"
  | "english_proficiency"
  | "bank_statement"
  | "study_plan"
  | "recommendation_letter_1"
  | "recommendation_letter_2"
  | "other";

export interface DocumentMetadata {
  id: DocumentKey;
  label: string;
  description?: string;
  category: "identity" | "education" | "health" | "financial" | "other";
  acceptedFormats?: string[];
}

export const DOCUMENT_REGISTRY: Record<DocumentKey, DocumentMetadata> = {
  passport: {
    id: "passport",
    label: "Passport Scan",
    description:
      "Clear scan of the bio-data page. Must be valid for at least 6 months.",
    category: "identity",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  photo: {
    id: "photo",
    label: "Passport Size Photo",
    description: "Recent photo with white background. No glasses/hats.",
    category: "identity",
    acceptedFormats: [".jpg", ".png"],
  },
  transcript_highschool: {
    id: "transcript_highschool",
    label: "High School Transcript",
    description:
      "Official grade sheets for Year 10, 11, and 12 (or equivalent).",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  degree_highschool: {
    id: "degree_highschool",
    label: "High School Diploma",
    description: "Certificate of graduation.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  transcript_bachelors: {
    id: "transcript_bachelors",
    label: "Bachelor's Transcript",
    description: "Transcript of Bachelor's degree.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  degree_bachelors: {
    id: "degree_bachelors",
    label: "Bachelor's Degree",
    description: "Certificate of graduation.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  transcript_masters: {
    id: "transcript_masters",
    label: "Master's Transcript",
    description: "Required for PhD applicants.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  degree_masters: {
    id: "degree_masters",
    label: "Master's Degree",
    description: "Certificate of graduation.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  health_check: {
    id: "health_check",
    label: "Foreigner Physical Examination Form",
    description:
      "Official medical report format for China. Must be recent (<6 months).",
    category: "health",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  police_clearance: {
    id: "police_clearance",
    label: "Police Clearance Certificate",
    description: "Non-criminal record report.",
    category: "other",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  english_proficiency: {
    id: "english_proficiency",
    label: "English Proficiency Certificate",
    description: "IELTS, TOEFL, or Medium of Instruction certificate.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  bank_statement: {
    id: "bank_statement",
    label: "Bank Statement",
    description: "Proof of financial support.",
    category: "financial",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  study_plan: {
    id: "study_plan",
    label: "Study Plan / Personal Statement",
    description: "Minimum 800 words detailing your academic goals.",
    category: "other",
    acceptedFormats: [".pdf", ".doc", ".docx"],
  },
  recommendation_letter_1: {
    id: "recommendation_letter_1",
    label: "Recommendation Letter 1",
    description: "From a professor or associate professor.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  recommendation_letter_2: {
    id: "recommendation_letter_2",
    label: "Recommendation Letter 2",
    description: "From a professor or associate professor.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  other: {
    id: "other",
    label: "Other Documents",
    description: "Any other supporting documents.",
    category: "other",
    acceptedFormats: [".pdf", ".jpg", ".png", ".doc", ".docx"],
  },
};
