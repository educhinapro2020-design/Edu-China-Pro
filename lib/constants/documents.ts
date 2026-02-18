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
  | "cv"
  | "acceptance_letter"
  | "research_proposal"
  | "academic_background_certificate"
  | "financial_guarantee"
  | "study_training_plan"
  | "portfolio"
  | "academic_publications"
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
    description: "Valid Passport Copy (bio page, must be valid).",
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
    label: "Foreigner Physical Examination Form",
    description:
      "Official medical report. Must be issued within the last 6 months.",
    category: "health",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  police_clearance: {
    id: "police_clearance",
    label: "Non-Criminal Record / Police Clearance Certificate",
    description: "Must be issued within the last 6 months.",
    category: "other",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  english_proficiency: {
    id: "english_proficiency",
    label: "Language Proficiency Proof",
    description:
      "IELTS / TOEFL (for English-taught) OR HSK Certificate (for Chinese-taught) OR English Medium of Instruction Letter.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  bank_statement: {
    id: "bank_statement",
    label: "Bank Statement / Financial Guarantee",
    description: "Proof of financial support.",
    category: "financial",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  study_plan: {
    id: "study_plan",
    label: "Study Plan / Personal Statement",
    description:
      "Personal statement or study plan detailing your academic goals.",
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
  cv: {
    id: "cv",
    label: "Curriculum Vitae (CV) / Resume",
    description: "Updated CV or Resume.",
    category: "other",
    acceptedFormats: [".pdf", ".doc", ".docx"],
  },
  acceptance_letter: {
    id: "acceptance_letter",
    label: "Acceptance Letter from Supervisor",
    description: "Strongly recommended for Master's, essential for PhD.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  research_proposal: {
    id: "research_proposal",
    label: "Research Proposal",
    description: "Detailed research proposal (1500–3000 words).",
    category: "education",
    acceptedFormats: [".pdf", ".doc", ".docx"],
  },
  academic_background_certificate: {
    id: "academic_background_certificate",
    label: "Academic Background Certificate",
    description: "For Non-Degree programs.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  financial_guarantee: {
    id: "financial_guarantee",
    label: "Financial Guarantee",
    description:
      "Required in rare cases for Non-Degree programs or if self-funded.",
    category: "financial",
    acceptedFormats: [".pdf", ".jpg", ".png"],
  },
  study_training_plan: {
    id: "study_training_plan",
    label: "Study/Training Plan",
    description: "For Non-Degree programs.",
    category: "education",
    acceptedFormats: [".pdf", ".doc", ".docx"],
  },
  portfolio: {
    id: "portfolio",
    label: "Portfolio",
    description: "For Art/Design programs.",
    category: "education",
    acceptedFormats: [".pdf", ".jpg", ".png", ".zip"],
  },
  academic_publications: {
    id: "academic_publications",
    label: "Academic Publications",
    description: "If available (for PhD).",
    category: "education",
    acceptedFormats: [".pdf"],
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

export function getDocumentLabel(key: DocumentKey): string {
  const meta = getDocumentMeta(key);
  return meta ? meta.label : key.replace(/_/g, " ");
}
