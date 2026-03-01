"use client";

import {
  StudentProfile,
  StudentDocuments,
  StudentDocumentEntry,
} from "@/lib/types/student";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import React, { useRef, useCallback } from "react";
import {
  DocumentKey,
  GeneralDocumentKey,
  EDUCATION_DOCUMENTS,
  getDocumentMeta,
  getEducationLevelKey,
} from "@/lib/constants/documents";
import Link from "next/link";

interface ProfileDocumentProps {
  profile: Partial<StudentProfile>;
  documents?: StudentDocuments | null;
  appDocuments?: Record<string, StudentDocumentEntry> | null;
  email?: string;
  docRequirements?: DocumentKey[];
}

type DocEntry = {
  key: string;
  label: string;
  status: "uploaded" | "verified" | "needs_correction" | "rejected" | "missing";
  url?: string;
  schoolName?: string;
};

function getStatusMeta(status: DocEntry["status"]) {
  switch (status) {
    case "verified":
      return {
        icon: <FiCheckCircle className="size-4 text-emerald-600" />,
        label: "Verified",
        textColor: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
      };
    case "uploaded":
      return {
        icon: <FiCheckCircle className="size-4 text-brand-600" />,
        label: "Uploaded",
        textColor: "text-brand-700",
        bg: "bg-brand-50",
        border: "border-brand-100",
      };
    case "needs_correction":
      return {
        icon: <FiAlertCircle className="size-4 text-amber-600" />,
        label: "Needs Correction",
        textColor: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-100",
      };
    case "rejected":
      return {
        icon: <FiXCircle className="size-4 text-red-500" />,
        label: "Rejected",
        textColor: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
      };
    default:
      return {
        icon: <FiClock className="size-4 text-primary-400" />,
        label: "Pending",
        textColor: "text-primary-500",
        bg: "bg-primary-50",
        border: "border-primary-100",
      };
  }
}

function DocumentRow({ entry }: { entry: DocEntry }) {
  const meta = getStatusMeta(entry.status);
  const isSubmitted =
    entry.status === "uploaded" || entry.status === "verified";

  return (
    <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-primary-100 last:border-0">
      <div className="shrink-0 size-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center">
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary-800 wrap-break-word leading-snug">
          {entry.label}
        </p>
        {entry.schoolName && (
          <p className="text-xs text-primary-400 mt-0.5 wrap-break-word font-medium">
            {entry.schoolName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <span
          className={`text-[11px] font-semibold px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap ${meta.bg} ${meta.border} ${meta.textColor}`}
        >
          {meta.label}
        </span>
        {isSubmitted && entry.url && (
          <Link
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="print:hidden"
          >
            <button className="p-1.5 rounded-lg text-primary-400 hover:text-brand-600 hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-200">
              <FiEye className="size-3.5" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export const ProfileDocument = React.forwardRef<
  HTMLDivElement,
  ProfileDocumentProps
>(({ profile, documents, appDocuments, email, docRequirements }, ref) => {
  const docSource = appDocuments ?? documents?.documents;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const photoUrl = docSource?.["photo"]?.url;

  const otherDocKeys: GeneralDocumentKey[] = [
    "health_check",
    "police_clearance",
    "english_proficiency",
    "bank_statement",
    "study_plan",
    "recommendation_letter_1",
    "recommendation_letter_2",
  ];

  const printRef = useRef<HTMLDivElement>(null);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (printRef as React.RefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  const passportRequired =
    !docRequirements || docRequirements.includes("passport");
  const allDocEntries: DocEntry[] = [];

  if (passportRequired) {
    const passportDoc = docSource?.["passport"];
    const passportStatus =
      (passportDoc?.status as DocEntry["status"]) ?? "missing";
    if (passportStatus === "uploaded" || passportStatus === "verified") {
      allDocEntries.push({
        key: "passport",
        label: "Passport",
        status: passportStatus,
        url: passportDoc?.url,
      });
    }
  }

  for (const edu of profile.education_history ?? []) {
    const levelKey = getEducationLevelKey(edu.level);
    if (!levelKey) continue;
    for (const eduDoc of EDUCATION_DOCUMENTS[levelKey].documents) {
      const isRequired =
        !docRequirements || docRequirements.includes(eduDoc.id);
      if (!isRequired) continue;
      const doc = docSource?.[eduDoc.id];
      const status = (doc?.status as DocEntry["status"]) ?? "missing";
      if (status === "uploaded" || status === "verified") {
        allDocEntries.push({
          key: eduDoc.id,
          label: eduDoc.label,
          status,
          url: doc?.url,
          schoolName: edu.schoolName,
        });
      }
    }
  }

  for (const key of otherDocKeys) {
    const isRequired = !docRequirements || docRequirements.includes(key);
    if (!isRequired) continue;
    const doc = docSource?.[key];
    const status = (doc?.status as DocEntry["status"]) ?? "missing";
    if (status === "uploaded" || status === "verified") {
      const meta = getDocumentMeta(key);
      if (!meta) continue;
      allDocEntries.push({ key, label: meta.label, status, url: doc?.url });
    }
  }

  const totalRequired =
    (passportRequired ? 1 : 0) +
    (profile.education_history ?? []).reduce((acc, edu) => {
      const levelKey = getEducationLevelKey(edu.level);
      if (!levelKey) return acc;
      return (
        acc +
        EDUCATION_DOCUMENTS[levelKey].documents.filter(
          (d) => !docRequirements || docRequirements.includes(d.id),
        ).length
      );
    }, 0) +
    otherDocKeys.filter((k) => !docRequirements || docRequirements.includes(k))
      .length;

  const uploadedCount = allDocEntries.length;
  const circumference = 97.4;
  const progress =
    totalRequired > 0 ? (uploadedCount / totalRequired) * circumference : 0;

  return (
    <div
      ref={mergedRef}
      className="bg-white p-4 py-8 md:p-12 print:p-8 max-w-4xl mx-auto print:shadow-none print:max-w-none print:w-full font-sans text-primary-900"
      id="printable-profile"
    >
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-2 md:gap-4 pb-4 border-b border-primary-100 mb-6">
          <div>
            <h1 className="text-xl font-bold text-primary-900 tracking-tight">
              <span className="brand-text">EduChinaPro </span>
              Application Record
            </h1>
          </div>
          <div className="text-right shrink-0 self-end">
            <p className="text-xs font-medium text-primary-400">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold brand-text tracking-tight leading-none">
              {profile.first_name} {profile.last_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-3 text-sm text-primary-600">
              {email && (
                <span className="flex items-center gap-1.5">
                  <FiMail className="size-3.5 text-primary-400" />
                  {email}
                </span>
              )}
              {profile.phone_number && (
                <span className="flex items-center gap-1.5">
                  <FiPhone className="size-3.5 text-primary-400" />
                  {profile.phone_number}
                </span>
              )}

              {profile.address && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="size-3.5 text-primary-400" />
                  {profile.address}
                  {profile.city ? `, ${profile.city}` : ""}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student Photo"
                className="size-24 object-cover border border-primary-200"
              />
            ) : (
              <div className="size-24 bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-300 text-[10px] text-center">
                Photo Area
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          {(() => {
            const profileFields = [
              profile.nationality,
              profile.gender,
              profile.date_of_birth,
              profile.marital_status,
              profile.religion,
              profile.mother_tongue,
              profile.phone_number,
              profile.address,
              profile.passport_number,
              profile.passport_expiry,
            ];
            const filled = profileFields.filter(Boolean).length;
            const total = profileFields.length;
            const pct = total > 0 ? (filled / total) * 97.4 : 0;
            return (
              <div className="flex flex-col gap-4 pb-2.5 mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600 flex-1">
                  Personal Information
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <svg className="size-11 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-primary-100"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.round(pct)} 97.4`}
                        className="text-brand-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary-900 leading-none">
                        {filled}/{total}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary-800">
                      {filled === total
                        ? "Profile complete"
                        : `${filled} of ${total} filled`}
                    </p>
                    <p className="text-[11px] text-primary-400 font-medium">
                      fields completed
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">
            {[
              { label: "Nationality", value: profile.nationality },
              { label: "Gender", value: profile.gender, capitalize: true },
              {
                label: "Date of Birth",
                value: formatDate(profile.date_of_birth),
              },
              { label: "Marital Status", value: profile.marital_status },
              { label: "Religion", value: profile.religion },
              { label: "Mother Tongue", value: profile.mother_tongue },
              {
                label: "Visited China",
                value: profile.has_visited_china ? "Yes" : "No",
              },
              {
                label: "Currently in China",
                value: profile.in_china_now ? "Yes" : "No",
              },
              { label: "Passport Number", value: profile.passport_number },
              {
                label: "Passport Expiry",
                value: formatDate(profile.passport_expiry),
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1.5">
                  {item.label}
                </p>
                <p
                  className={`font-semibold text-primary-900 ${(item as any).capitalize ? "capitalize" : ""}`}
                >
                  {item.value || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600 border-b border-primary-100 pb-2.5 mb-5">
            Education History
          </h3>
          {!profile.education_history ||
          profile.education_history.length === 0 ? (
            <p className="text-sm text-primary-400 italic">
              No education history recorded.
            </p>
          ) : (
            <div className="space-y-5">
              {profile.education_history.map((edu, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-4 text-sm pb-5 border-b border-dashed border-primary-100 last:border-0 last:pb-0 break-inside-avoid"
                >
                  <div className="md:col-span-1 print:col-span-1">
                    <p className="font-semibold text-primary-700 text-xs leading-relaxed">
                      {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-600 text-[11px] rounded mt-1.5 font-medium border border-primary-100">
                      {edu.level}
                    </span>
                  </div>
                  <div className="md:col-span-3 print:col-span-3">
                    <h4 className="font-bold text-base text-primary-900 leading-snug">
                      {edu.schoolName}
                    </h4>
                    <p className="text-primary-600 font-medium mt-0.5">
                      {edu.fieldOfStudy}
                    </p>
                    <p className="text-primary-400 text-xs mt-1 font-medium">
                      GPA / Score: {edu.gpa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="print:break-before-page print:py-8">
          <div className="flex items-center gap-4 pb-3 mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600 flex-1">
              Documents
            </h3>
            {totalRequired > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <svg className="size-11 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-primary-100"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.round(progress)} ${circumference}`}
                      className="text-brand-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary-900 leading-none">
                      {uploadedCount}/{totalRequired}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-800">
                    {uploadedCount === totalRequired
                      ? "All documents submitted"
                      : `${uploadedCount} of ${totalRequired} submitted`}
                  </p>
                  <p className="text-[11px] text-primary-400 font-medium">
                    documents uploaded
                  </p>
                </div>
              </div>
            )}
          </div>

          {allDocEntries.length === 0 ? (
            <p className="text-sm text-primary-400 italic">
              No documents submitted yet.
            </p>
          ) : (
            <div className="border border-primary-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-primary-100">
                {allDocEntries.map((entry) => (
                  <DocumentRow
                    key={`${entry.key}-${entry.schoolName ?? ""}`}
                    entry={entry}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

ProfileDocument.displayName = "ProfileDocument";
