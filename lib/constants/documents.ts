export type GeneralDocumentKey =
  | "passport"
  | "photo"
  | "health_check"
  | "police_clearance"
  | "english_proficiency"
  | "bank_statement"
  | "study_plan"
  | "recommendation_letter_1"
  | "recommendation_letter_2"
  | "other";

export type EducationDocumentKey =
  | "transcript_highschool"
  | "transcript_bachelors"
  | "transcript_masters"
  | "degree_highschool"
  | "degree_bachelors"
  | "degree_masters";

export type DocumentKey = GeneralDocumentKey | EducationDocumentKey;

export interface DocumentMetadata {
  id: DocumentKey;
  label: string;
  description?: string;
  category: "identity" | "education" | "health" | "financial" | "other";
  acceptedFormats?: string[];
}

export interface EducationDocConfig {
  id: EducationDocumentKey;
  label: string;
  description?: string;
  acceptedFormats?: string[];
}

export const DOCUMENT_REGISTRY: Record<GeneralDocumentKey, DocumentMetadata> = {
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
  health_check: {
    id: "health_check",
    label: "Health Check Report",
    description: "Official medical report. Must be recent (<6 months).",
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

export type EducationLevel = "high_school" | "bachelors" | "masters";

export interface EducationLevelConfig {
  value: string;
  label: string;
  documents: EducationDocConfig[];
}

export const EDUCATION_DOCUMENTS: Record<EducationLevel, EducationLevelConfig> =
  {
    high_school: {
      value: "High School",
      label: "High School",
      documents: [
        {
          id: "transcript_highschool",
          label: "High School Transcript",
          description:
            "Official grade sheets for Year 10, 11, and 12 (or equivalent).",
          acceptedFormats: [".pdf", ".jpg", ".png"],
        },
        {
          id: "degree_highschool",
          label: "High School Diploma",
          description: "Certificate of graduation.",
          acceptedFormats: [".pdf", ".jpg", ".png"],
        },
      ],
    },
    bachelors: {
      value: "Bachelor",
      label: "Bachelor's Degree",
      documents: [
        {
          id: "transcript_bachelors",
          label: "Bachelor's Transcript",
          description: "Transcript of Bachelor's degree.",
          acceptedFormats: [".pdf", ".jpg", ".png"],
        },
        {
          id: "degree_bachelors",
          label: "Bachelor's Degree",
          description: "Certificate of graduation.",
          acceptedFormats: [".pdf", ".jpg", ".png"],
        },
      ],
    },
    masters: {
      value: "Master",
      label: "Master's Degree",
      documents: [
        {
          id: "transcript_masters",
          label: "Master's Transcript",
          description: "Required for PhD applicants.",
          acceptedFormats: [".pdf", ".jpg", ".png"],
        },
        {
          id: "degree_masters",
          label: "Master's Degree",
          description: "Certificate of graduation.",
          acceptedFormats: [".pdf", ".jpg", ".png"],
        },
      ],
    },
  };

export function getDocumentMeta(
  key: DocumentKey,
): { label: string; description?: string; acceptedFormats?: string[] } | null {
  if (key in DOCUMENT_REGISTRY) {
    return DOCUMENT_REGISTRY[key as GeneralDocumentKey];
  }
  for (const level of Object.values(EDUCATION_DOCUMENTS)) {
    const doc = level.documents.find((d) => d.id === key);
    if (doc) return doc;
  }
  return null;
}

export function getEducationLevelKey(
  levelValue: string,
): EducationLevel | null {
  for (const [key, config] of Object.entries(EDUCATION_DOCUMENTS)) {
    if (config.value === levelValue || config.label === levelValue) {
      return key as EducationLevel;
    }
  }
  return null;
}
