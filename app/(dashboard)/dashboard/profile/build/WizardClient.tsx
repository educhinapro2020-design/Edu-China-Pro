"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiMapPin,
  FiBookOpen,
  FiLoader,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { twMerge } from "tailwind-merge";
import { StudentProfile, EducationEntry } from "@/lib/types/student";
import { studentRepository } from "@/lib/repositories/student.repo";
import { Modal } from "@/components/ui/modal";
import { builderProfileSchema } from "@/lib/validations/profileValidation";
import { z } from "zod";
import { calculateProfileProgress } from "@/lib/utils/profile-progress";
import { DocumentUploadField } from "@/components/dashboard/DocumentUploadField";
import { studentDocumentsRepository } from "@/lib/repositories/student-documents.repo";
import { DOCUMENT_REGISTRY, DocumentKey } from "@/lib/constants/documents";
import { StudentDocumentEntry } from "@/lib/types/student";

const COUNTRIES = [
  { label: "Nepal", value: "Nepal" },
  { label: "India", value: "India" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "China", value: "China" },
  { label: "Other", value: "Other" },
];

const GENDERS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const MARITAL_STATUS = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
];

const RELIGIONS = [
  { label: "Hinduism", value: "Hinduism" },
  { label: "Buddhism", value: "Buddhism" },
  { label: "Islam", value: "Islam" },
  { label: "Christianity", value: "Christianity" },
  { label: "Other", value: "Other" },
];

const DEGREES = [
  { label: "High School", value: "High School" },
  { label: "Bachelor", value: "Bachelor" },
  { label: "Master", value: "Master" },
  { label: "PhD", value: "PhD" },
  { label: "Associate", value: "Associate" },
  { label: "Other", value: "Other" },
];

interface WizardClientProps {
  initialProfile: Partial<StudentProfile>;
  userEmail: string;
  userId: string;
}

const STEPS = [
  {
    id: 1,
    label: "Personal Details",
    icon: FiUser,
    description: "Basic details & personal information",
  },
  {
    id: 2,
    label: "Contact Info",
    icon: FiMapPin,
    description: "Address & contact Information",
  },
  {
    id: 3,
    label: "Education",
    icon: FiBookOpen,
    description: "Academic history and Education Background",
  },
  {
    id: 4,
    label: "Documents",
    icon: FiFileText,
    description: "Upload supporting documents for your profile.",
  },
];

export function WizardClient({
  initialProfile,
  userEmail,
  userId,
}: WizardClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<Partial<StudentProfile>>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [expandedEduIndex, setExpandedEduIndex] = useState<number | null>(null);
  const [deleteConfirmationIndex, setDeleteConfirmationIndex] = useState<
    number | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  const [progress, setProgress] = useState(() =>
    calculateProfileProgress(initialProfile),
  );

  const [documents, setDocuments] = useState<
    Record<DocumentKey, StudentDocumentEntry>
  >({} as any);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsFetched, setDocsFetched] = useState(false);

  const fetchDocuments = async () => {
    if (docsFetched) return;
    setDocsLoading(true);
    try {
      const docs = await studentDocumentsRepository.getDocuments(userId);
      if (docs?.documents) setDocuments(docs.documents as any);
      setDocsFetched(true);
    } catch (e) {
      console.error("Failed to fetch documents", e);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File, docKey: DocumentKey) => {
    const result = await studentDocumentsRepository.uploadDocument(
      userId,
      file,
      docKey,
    );
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        status: "uploaded",
        url: result.url,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
      },
    }));
  };

  const validateField = (name: string, value: any) => {
    try {
      const fieldSchema = (builderProfileSchema.shape as any)[name];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: error.issues[0].message }));
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    setLoading(true);
    await saveToDb(formData);
    setLoading(false);

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/dashboard");
    }
  };

  const updateField = (field: keyof StudentProfile, value: any) => {
    validateField(field, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveToDb = async (data: Partial<StudentProfile>) => {
    const fieldsToSave = Object.keys(data);
    const hasBlockingError = fieldsToSave.some((key) => errorsRef.current[key]);

    if (hasBlockingError) {
      console.log("Validation error present, skipping auto-save");
      return;
    }

    setSaveStatus("saving");
    try {
      await studentRepository.updateProfile(userId, data);
      setProgress(calculateProfileProgress({ ...formData, ...data }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1000);
    } catch (error) {
      setSaveStatus("idle");
      console.error("Auto-save failed", error);
    }
  };

  const handleBlur = () => {
    saveToDb(formData);
  };

  const confirmDeleteEducation = () => {
    if (deleteConfirmationIndex === null) return;
    const currentHistory = formData.education_history || [];
    const newHistory = currentHistory.filter(
      (_, i) => i !== deleteConfirmationIndex,
    );
    updateField("education_history", newHistory);
    saveToDb({ education_history: newHistory });
    if (expandedEduIndex === deleteConfirmationIndex) setExpandedEduIndex(null);
    setDeleteConfirmationIndex(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  First Name
                </label>
                <Input
                  placeholder="e.g. John"
                  value={formData.first_name || ""}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Last Name
                </label>
                <Input
                  placeholder="e.g. Doe"
                  value={formData.last_name || ""}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Gender
                </label>
                <Select
                  options={GENDERS}
                  value={formData.gender || ""}
                  onChange={(val) => {
                    updateField("gender", val);
                    saveToDb({ ...formData, gender: val });
                  }}
                  placeholder="Select Gender"
                />
              </div>
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Marital Status
                </label>
                <Select
                  options={MARITAL_STATUS}
                  value={formData.marital_status || ""}
                  onChange={(val) => {
                    updateField("marital_status", val);
                    saveToDb({ ...formData, marital_status: val });
                  }}
                  placeholder="Select Status"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Nationality
                </label>
                <Select
                  options={COUNTRIES}
                  value={formData.nationality || ""}
                  onChange={(val) => {
                    updateField("nationality", val);
                    saveToDb({ ...formData, nationality: val });
                  }}
                  placeholder="Select Country"
                />
              </div>
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Religion
                </label>
                <Select
                  options={RELIGIONS}
                  value={formData.religion || ""}
                  onChange={(val) => {
                    updateField("religion", val);
                    saveToDb({ ...formData, religion: val });
                  }}
                  placeholder="Select Religion"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Mother Tongue
                </label>
                <Input
                  placeholder="e.g. Nepali"
                  value={formData.mother_tongue || ""}
                  onChange={(e) => updateField("mother_tongue", e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.mother_tongue && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.mother_tongue}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={
                    formData.date_of_birth
                      ? new Date(formData.date_of_birth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) => updateField("date_of_birth", e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-primary-100 space-y-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Have you visited China before?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => {
                        updateField("has_visited_china", val);
                        saveToDb({ ...formData, has_visited_china: val });
                      }}
                      className={twMerge(
                        "px-4 py-3 rounded-xl border text-center transition-all font-medium text-sm",
                        formData.has_visited_china === val
                          ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500"
                          : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50",
                      )}
                    >
                      {val ? "Yes, I have" : "No, never"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Are you currently in China?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => {
                        updateField("in_china_now", val);
                        saveToDb({ ...formData, in_china_now: val });
                      }}
                      className={twMerge(
                        "px-4 py-3 rounded-xl border text-center transition-all font-medium text-sm",
                        formData.in_china_now === val
                          ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500"
                          : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50",
                      )}
                    >
                      {val ? "Yes, I am there now" : "No, I am abroad"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Email Address
                </label>
                <Input type="email" value={userEmail} disabled className="" />
              </div>
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Phone Number
                </label>
                <Input
                  placeholder="+977 9800000000"
                  value={formData.phone_number || ""}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone_number}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="inline-block text-sm font-semibold text-primary-700">
                WhatsApp / WeChat
              </label>
              <Input
                placeholder="e.g. +977 9800000000"
                value={formData.whatsapp_number || ""}
                onChange={(e) => updateField("whatsapp_number", e.target.value)}
                onBlur={handleBlur}
              />
              {errors.whatsapp_number && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.whatsapp_number}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-block text-sm font-semibold text-primary-700">
                Address
              </label>
              <Input
                placeholder="Street Address, Ward No."
                value={formData.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
                onBlur={handleBlur}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  City
                </label>
                <Input
                  placeholder="e.g. Kathmandu"
                  value={formData.city || ""}
                  onChange={(e) => updateField("city", e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-block text-sm font-semibold text-primary-700">
                  Zip Code
                </label>
                <Input
                  placeholder="e.g. 44600"
                  value={formData.zip_code || ""}
                  onChange={(e) => updateField("zip_code", e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.zip_code && (
                  <p className="text-sm text-red-500 mt-1">{errors.zip_code}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        const educationHistory = formData.education_history || [];

        const addEducation = () => {
          const newEntry: EducationEntry = {
            level: "High School",
            schoolName: "",
            startDate: "",
            endDate: "",
            fieldOfStudy: "",
            gpa: "",
          };
          const newHistory = [...educationHistory, newEntry];
          updateField("education_history", newHistory);
          saveToDb({ education_history: newHistory });
          setExpandedEduIndex(newHistory.length - 1);
        };

        const confirmDeleteEducation = () => {
          if (deleteConfirmationIndex === null) return;
          const newHistory = educationHistory.filter(
            (_, i) => i !== deleteConfirmationIndex,
          );
          updateField("education_history", newHistory);
          saveToDb({ education_history: newHistory });
          if (expandedEduIndex === deleteConfirmationIndex)
            setExpandedEduIndex(null);
          setDeleteConfirmationIndex(null);
        };

        const removeEducation = (index: number) => {
          setDeleteConfirmationIndex(index);
        };

        const updateEducationEntry = (
          index: number,
          key: keyof EducationEntry,
          val: any,
        ) => {
          const newHistory = [...educationHistory];
          newHistory[index] = { ...newHistory[index], [key]: val };
          setFormData((prev) => ({ ...prev, education_history: newHistory }));
        };

        const saveEducationChanges = () => {
          saveToDb({ education_history: formData.education_history });
        };

        const handleSaveEntry = (index: number) => {
          setExpandedEduIndex(null);
        };

        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl flex gap-3 text-brand-700 text-sm">
              <FiBookOpen className="size-5 shrink-0 mt-0.5" />
              <p>
                Please list your educational qualifications, starting with the
                most recent.
              </p>
            </div>

            <div className="space-y-6">
              {educationHistory.length === 0 && (
                <div className="text-center py-8 text-primary-400">
                  No education added yet. Click below to add.
                </div>
              )}

              {educationHistory.map((edu, index) => {
                const isExpanded = expandedEduIndex === index;

                return (
                  <div
                    key={index}
                    className={twMerge(
                      "rounded-2xl border transition-all duration-300 overflow-hidden",
                      isExpanded
                        ? "bg-white border-brand-200 shadow-md ring-1 ring-brand-100"
                        : "bg-white border-primary-200 hover:border-brand-200 hover:shadow-sm",
                    )}
                  >
                    {!isExpanded ? (
                      <div
                        className="p-5 flex items-start justify-between gap-4 group cursor-pointer"
                        onClick={() => setExpandedEduIndex(index)}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wide">
                              {edu.level || "Degree"}
                            </span>
                          </div>
                          <h4 className="font-bold text-primary-900 leading-tight text-lg">
                            {edu.fieldOfStudy || "Enter Degree Name"}
                          </h4>
                          <p className="text-sm text-primary-500 font-medium">
                            {edu.gpa || "__"}{" "}
                            <span className="text-primary-500 font-medium">
                              Gpa/Percentage
                            </span>
                          </p>
                          <p className="text-sm text-primary-500 font-medium">
                            {edu.schoolName || "Enter Education Institution"}
                          </p>
                          <p className="text-xs text-primary-500 font-medium">
                            {edu.startDate || "Start"} - {edu.endDate || "End"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedEduIndex(index);
                            }}
                            className="p-2 text-primary-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="size-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEducation(index);
                            }}
                            className="p-2 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-primary-900 uppercase tracking-wide">
                            Edit Education
                          </h4>
                          <button
                            onClick={() => setExpandedEduIndex(null)}
                            className="text-xs text-primary-500 hover:text-primary-700 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="inline-block text-sm font-semibold text-primary-700">
                            School / University
                          </label>
                          <Input
                            placeholder="e.g. Kathmandu University"
                            value={edu.schoolName}
                            onChange={(e) =>
                              updateEducationEntry(
                                index,
                                "schoolName",
                                e.target.value,
                              )
                            }
                            onBlur={saveEducationChanges}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="inline-block text-sm font-semibold text-primary-700">
                            Field of Study
                          </label>
                          <Input
                            placeholder="e.g. Science / Management"
                            value={edu.fieldOfStudy || ""}
                            onChange={(e) =>
                              updateEducationEntry(
                                index,
                                "fieldOfStudy",
                                e.target.value,
                              )
                            }
                            onBlur={saveEducationChanges}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="inline-block text-sm font-semibold text-primary-700">
                              Start Date
                            </label>
                            <Input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) =>
                                updateEducationEntry(
                                  index,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              onBlur={saveEducationChanges}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="inline-block text-sm font-semibold text-primary-700">
                              End Date
                            </label>
                            <Input
                              type="date"
                              value={edu.endDate}
                              onChange={(e) =>
                                updateEducationEntry(
                                  index,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              onBlur={saveEducationChanges}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="inline-block text-sm font-semibold text-primary-700">
                              Degree Level
                            </label>
                            <Select
                              options={DEGREES}
                              value={edu.level}
                              onChange={(val) => {
                                updateEducationEntry(index, "level", val);
                                const newHist = [...educationHistory];
                                newHist[index].level = val as any;
                                saveToDb({ education_history: newHist });
                              }}
                              placeholder="Select Level"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="inline-block text-sm font-semibold text-primary-700">
                            GPA or Percentage
                          </label>
                          <Input
                            placeholder="e.g. 3.6 or 80%"
                            value={edu.gpa || ""}
                            onChange={(e) =>
                              updateEducationEntry(index, "gpa", e.target.value)
                            }
                            onBlur={saveEducationChanges}
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button
                            onClick={() => handleSaveEntry(index)}
                            className="px-6 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm text-sm"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={addEducation}
              className="w-full py-4 border-dashed border-2 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 text-primary-500"
              startIcon={<FiPlus className="size-4" />}
            >
              Add Education
            </Button>
          </div>
        );

      case 4:
        if (!docsFetched && !docsLoading) fetchDocuments();

        const educationLevels = (formData.education_history || []).map(
          (e) => e.level,
        );
        const hasBachelor = educationLevels.includes("Bachelor");
        const hasMaster = educationLevels.includes("Master");

        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-primary-900 border-b border-primary-100 pb-2">
                Passport Photo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUploadField
                  label={DOCUMENT_REGISTRY.photo.label}
                  docKey="photo"
                  description={DOCUMENT_REGISTRY.photo.description}
                  accept={DOCUMENT_REGISTRY.photo.acceptedFormats?.join(",")}
                  status={documents.photo?.status}
                  currentUrl={documents.photo?.url}
                  onUpload={(f) => handleDocumentUpload(f, "photo")}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-bold text-primary-900 border-b border-primary-100 pb-2">
                Passport Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="inline-block text-sm font-semibold text-primary-700">
                    Passport Number
                  </label>
                  <Input
                    placeholder="e.g. A12345678"
                    value={formData.passport_number || ""}
                    onChange={(e) =>
                      updateField("passport_number", e.target.value)
                    }
                    onBlur={handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <label className="inline-block text-sm font-semibold text-primary-700">
                    Passport Expiry
                  </label>
                  <Input
                    type="date"
                    placeholder="Enter expiry date"
                    value={
                      formData.passport_expiry
                        ? new Date(formData.passport_expiry)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateField("passport_expiry", e.target.value)
                    }
                    onBlur={handleBlur}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUploadField
                  label={DOCUMENT_REGISTRY.passport.label}
                  docKey="passport"
                  description={DOCUMENT_REGISTRY.passport.description}
                  accept={DOCUMENT_REGISTRY.passport.acceptedFormats?.join(",")}
                  status={documents.passport?.status}
                  currentUrl={documents.passport?.url}
                  onUpload={(f) => handleDocumentUpload(f, "passport")}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-bold text-primary-900 border-b border-primary-100 pb-2">
                Education Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUploadField
                  label={DOCUMENT_REGISTRY.transcript_highschool.label}
                  docKey="transcript_highschool"
                  description={
                    DOCUMENT_REGISTRY.transcript_highschool.description
                  }
                  accept={DOCUMENT_REGISTRY.transcript_highschool.acceptedFormats?.join(
                    ",",
                  )}
                  status={documents.transcript_highschool?.status}
                  currentUrl={documents.transcript_highschool?.url}
                  onUpload={(f) =>
                    handleDocumentUpload(f, "transcript_highschool")
                  }
                />
                <DocumentUploadField
                  label={DOCUMENT_REGISTRY.degree_highschool.label}
                  docKey="degree_highschool"
                  description={DOCUMENT_REGISTRY.degree_highschool.description}
                  accept={DOCUMENT_REGISTRY.degree_highschool.acceptedFormats?.join(
                    ",",
                  )}
                  status={documents.degree_highschool?.status}
                  currentUrl={documents.degree_highschool?.url}
                  onUpload={(f) => handleDocumentUpload(f, "degree_highschool")}
                />
                {hasBachelor && (
                  <>
                    <DocumentUploadField
                      label={DOCUMENT_REGISTRY.transcript_bachelors.label}
                      docKey="transcript_bachelors"
                      description={
                        DOCUMENT_REGISTRY.transcript_bachelors.description
                      }
                      accept={DOCUMENT_REGISTRY.transcript_bachelors.acceptedFormats?.join(
                        ",",
                      )}
                      status={documents.transcript_bachelors?.status}
                      currentUrl={documents.transcript_bachelors?.url}
                      onUpload={(f) =>
                        handleDocumentUpload(f, "transcript_bachelors")
                      }
                    />
                    <DocumentUploadField
                      label={DOCUMENT_REGISTRY.degree_bachelors.label}
                      docKey="degree_bachelors"
                      description={
                        DOCUMENT_REGISTRY.degree_bachelors.description
                      }
                      accept={DOCUMENT_REGISTRY.degree_bachelors.acceptedFormats?.join(
                        ",",
                      )}
                      status={documents.degree_bachelors?.status}
                      currentUrl={documents.degree_bachelors?.url}
                      onUpload={(f) =>
                        handleDocumentUpload(f, "degree_bachelors")
                      }
                    />
                  </>
                )}
                {hasMaster && (
                  <>
                    <DocumentUploadField
                      label={DOCUMENT_REGISTRY.transcript_masters.label}
                      docKey="transcript_masters"
                      description={
                        DOCUMENT_REGISTRY.transcript_masters.description
                      }
                      accept={DOCUMENT_REGISTRY.transcript_masters.acceptedFormats?.join(
                        ",",
                      )}
                      status={documents.transcript_masters?.status}
                      currentUrl={documents.transcript_masters?.url}
                      onUpload={(f) =>
                        handleDocumentUpload(f, "transcript_masters")
                      }
                    />
                    <DocumentUploadField
                      label={DOCUMENT_REGISTRY.degree_masters.label}
                      docKey="degree_masters"
                      description={DOCUMENT_REGISTRY.degree_masters.description}
                      accept={DOCUMENT_REGISTRY.degree_masters.acceptedFormats?.join(
                        ",",
                      )}
                      status={documents.degree_masters?.status}
                      currentUrl={documents.degree_masters?.url}
                      onUpload={(f) =>
                        handleDocumentUpload(f, "degree_masters")
                      }
                    />
                  </>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="border-b border-primary-100 pb-2 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-primary-900">
                    Other Documents
                  </h3>
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <p className="text-sm text-primary-600">
                  Upload any additional documents that may support your
                  application.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(
                  [
                    "health_check",
                    "police_clearance",
                    "bank_statement",
                    "english_proficiency",
                    "study_plan",
                  ] as DocumentKey[]
                ).map((key) => (
                  <DocumentUploadField
                    key={key}
                    label={DOCUMENT_REGISTRY[key].label}
                    docKey={key}
                    description={DOCUMENT_REGISTRY[key].description}
                    accept={DOCUMENT_REGISTRY[key].acceptedFormats?.join(",")}
                    status={documents[key]?.status}
                    currentUrl={documents[key]?.url}
                    onUpload={(f) => handleDocumentUpload(f, key)}
                  />
                ))}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 py-4 md:py-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 px-1">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full text-primary-500 hover:text-primary-700 transition-colors"
            >
              <FiArrowLeft className="size-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              Step {currentStep} of {STEPS.length}
            </span>
            <div className="size-9" />
          </div>

          <div className="flex items-start">
            {STEPS.map((step, idx) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex items-start flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-3 group cursor-default">
                    <div
                      className={twMerge(
                        "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm bg-white",
                        isCurrent
                          ? "border-brand-500 text-brand-600 ring-4 ring-brand-100"
                          : isCompleted
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "border-primary-200 text-primary-300",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="text-center hidden md:block">
                      <p
                        className={twMerge(
                          "text-sm font-bold transition-colors",
                          isCurrent ? "text-primary-900" : "text-primary-400",
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mt-5 mx-2 bg-primary-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{
                          width: step.id < currentStep ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full min-w-0">
            <div className="bg-white rounded-4xl shadow-xl shadow-primary-900/5 overflow-hidden border border-primary-100">
              <div className="p-6 md:p-10 min-h-[400px]">
                <label className="text-primary-500 font-medium text-sm inline-block mb-4">
                  Step {currentStep}
                </label>
                <h2 className="heading-3 mb-2">
                  {STEPS[currentStep - 1].label}
                </h2>
                <p className="body text-primary-500 mb-5 max-w-lg">
                  {STEPS[currentStep - 1].description}
                </p>
                <p className="text-sm brand-text font-medium mb-4">
                  * Your progress is automatically saved.
                </p>

                {renderStepContent()}
              </div>

              <div className="px-6 md:px-10 pt-6 pb-4 border-primary-100">
                <p className="text-xs text-primary-500 text-center">
                  * By proceeding, I confirm that the information provided is
                  accurate and I agree to the terms of service.
                </p>
              </div>

              <div className="p-6 md:px-10 md:py-6 bg-primary-50 border-t border-primary-100 flex justify-between items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                  className="text-primary-500 hover:text-primary-900"
                >
                  Back
                </Button>

                <div className="flex items-center gap-4">
                  <Button
                    variant="brand"
                    onClick={handleNext}
                    loading={loading}
                    endIcon={<FiArrowRight className="size-4" />}
                    className="px-8 shadow-brand-500/20 shadow-lg"
                  >
                    {currentStep === STEPS.length ? "Save" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteConfirmationIndex !== null}
        onClose={() => setDeleteConfirmationIndex(null)}
        title="Delete Education Entry"
        description="Are you sure you want to delete this education entry?"
      >
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirmationIndex(null)}
          >
            Cancel
          </Button>
          <Button
            variant="brand"
            onClick={confirmDeleteEducation}
            className="bg-red-600 hover:bg-red-700 text-white shadow-none ring-0 border-0"
          >
            Delete
          </Button>
        </div>
      </Modal>

      <AnimatePresence>
        {saveStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white border border-primary-200 text-primary-700 rounded-full shadow-xl shadow-primary-900/10 font-medium text-sm"
          >
            {saveStatus === "saving" ? (
              <>
                <FiLoader className="size-4 animate-spin text-brand-500" />
                Saving...
              </>
            ) : (
              <>
                <FiCheckCircle className="size-4 text-success" />
                Saved
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
