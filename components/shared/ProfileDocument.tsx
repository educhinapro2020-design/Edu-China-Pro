import {
  StudentProfile,
  StudentDocuments,
  StudentDocumentEntry,
} from "@/lib/types/student";
import Image from "next/image";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import React from "react";
import {
  DOCUMENT_REGISTRY,
  DocumentKey,
  GeneralDocumentKey,
  EDUCATION_DOCUMENTS,
  getDocumentMeta,
  getEducationLevelKey,
} from "@/lib/constants/documents";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileDocumentProps {
  profile: Partial<StudentProfile>;
  documents?: StudentDocuments | null;
  email?: string;
}

const PassportCard = ({
  profile,
  document,
}: {
  profile: Partial<StudentProfile>;
  document?: StudentDocumentEntry;
}) => {
  const isUploaded =
    document?.status === "uploaded" || document?.status === "verified";

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

  return (
    <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm mb-6">
      <div className="bg-primary-50/50 px-4 py-3 border-b border-primary-100 flex justify-between items-center">
        <div>
          <h5 className="font-bold text-primary-900 text-sm flex items-center gap-2">
            Passport Details
            {isUploaded && document?.url && (
              <Link
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full size-6 print:hidden bg-white hover:bg-primary-50 text-primary-700 border-primary-200"
                >
                  <FiEye className="size-3" />
                </Button>
              </Link>
            )}
          </h5>
        </div>
        {isUploaded ? (
          <span className="text-success text-xs font-medium bg-white px-2 py-0.5 rounded-full border border-success/20 flex items-center gap-1">
            <FiCheckCircle className="size-3" /> Uploaded
          </span>
        ) : (
          <span className="text-primary-500 text-xs font-normal bg-white px-2 py-0.5 rounded-full border border-primary-200 flex items-center gap-1">
            <FiAlertCircle className="size-3" /> Pending
          </span>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4">
        <div>
          <p className="text-primary-500 text-xs mb-1 uppercase tracking-wider">
            Passport Number
          </p>
          <p className="font-medium text-sm text-primary-900">
            {profile.passport_number || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-primary-500 text-xs mb-1 uppercase tracking-wider">
            Expiry Date
          </p>
          <p className="font-medium text-sm text-primary-900">
            {formatDate(profile.passport_expiry)}
          </p>
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({
  docKey,
  document,
}: {
  docKey: DocumentKey;
  document?: StudentDocumentEntry;
}) => {
  const registryEntry = getDocumentMeta(docKey);
  if (!registryEntry) return null;

  const isUploaded =
    document?.status === "uploaded" || document?.status === "verified";

  return (
    <div className="bg-white rounded-lg p-3 border border-primary-200 flex items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3">
        {isUploaded ? (
          <div className="size-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <FiCheckCircle className="size-4" />
          </div>
        ) : (
          <div className="size-8 rounded-full text-primary-300 flex items-center justify-center shrink-0">
            <FiAlertCircle className="size-5" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-primary-900 text-sm leading-tight">
            {registryEntry.label}
          </span>
          <span
            className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${
              isUploaded ? "text-success" : "text-primary-400"
            }`}
          >
            {isUploaded ? "Uploaded" : "Pending"}
          </span>
        </div>
      </div>

      {isUploaded && document?.url && (
        <Link href={document.url} target="_blank" rel="noopener noreferrer">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full size-8 text-primary-500 hover:text-brand-600 hover:bg-primary-50"
          >
            <FiEye className="size-4" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export const ProfileDocument = React.forwardRef<
  HTMLDivElement,
  ProfileDocumentProps
>(({ profile, documents, email }, ref) => {
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

  const photoUrl = documents?.documents?.["photo"]?.url;

  const otherDocs: GeneralDocumentKey[] = [
    "health_check",
    "police_clearance",
    "english_proficiency",
    "bank_statement",
    "study_plan",
    "recommendation_letter_1",
    "recommendation_letter_2",
  ];

  return (
    <div
      ref={ref}
      className="bg-white p-4 md:p-12 print:p-8 max-w-4xl mx-auto print:shadow-none print:max-w-none print:w-full font-sans text-primary-900"
      id="printable-profile"
    >
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-primary-300 pb-6 mb-8 print:mb-6 print:pb-6 gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-900 tracking-tight uppercase">
            Student Profile
          </h1>
          <p className="text-primary-600 mt-1 text-sm">
            EduChinaPro Student Application Record
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col justify-between md:justify-end md:items-end">
          <div className="hidden print:block mb-2">
            <Image
              src="/images/logo/educhinapro-logo.svg"
              alt="EduChinaPro"
              width={40}
              height={20}
              className="ml-auto"
            />
          </div>
          <div className="font-bold text-lg md:text-xl brand-text print:hidden">
            EduChinaPro
          </div>
          <div className="text-xs text-primary-600 mt-1 hidden print:block">
            Date:{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 print:grid-cols-3">
        <div className="md:col-span-2 print:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-brand-600">
            {profile.first_name} {profile.last_name}
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-primary-700">
              <FiMail className="size-4 text-primary-500" />
              <span>{email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-700">
              <FiPhone className="size-4 text-primary-500" />
              <span>{profile.phone_number || "No phone provided"}</span>
            </div>
            <div className="flex items-start gap-2 text-primary-700">
              <FiMapPin className="size-4 text-primary-500 mt-0.5" />
              <span>
                {profile.address}, {profile.city} {profile.zip_code}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block print:block justify-self-end">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Student Photo"
              className="size-32 object-cover border border-primary-200 bg-primary-50"
            />
          ) : (
            <div className="size-32 bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-300 text-xs text-center p-2">
              Photo Area
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-3 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Nationality</p>
              <p className="font-medium">{profile.nationality || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Gender</p>
              <p className="font-medium text-primary-900 capitalize">
                {profile.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Date of Birth</p>
              <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Marital Status</p>
              <p className="font-medium">{profile.marital_status || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Religion</p>
              <p className="font-medium">{profile.religion || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Mother Tongue</p>
              <p className="font-medium">{profile.mother_tongue || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">Visited China?</p>
              <p className="font-medium">
                {profile.has_visited_china ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-primary-500 text-xs mb-0.5">
                Currently in China?
              </p>
              <p className="font-medium">
                {profile.in_china_now ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4">
            Education History
          </h3>
          {!profile.education_history ||
          profile.education_history.length === 0 ? (
            <p className="text-sm text-primary-500 italic">
              No education history recorded.
            </p>
          ) : (
            <div className="space-y-6">
              {profile.education_history.map((edu, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-4 text-sm pb-4 border-b border-dashed border-primary-100 last:border-0 last:pb-0 break-inside-avoid"
                >
                  <div className="md:col-span-1 print:col-span-1">
                    <p className="font-semibold text-primary-900">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded mt-1 font-sans font-medium">
                      {edu.level}
                    </span>
                  </div>
                  <div className="md:col-span-3 print:col-span-3">
                    <h4 className="font-semibold text-lg text-primary-900">
                      {edu.schoolName}
                    </h4>
                    <p className="text-primary-600 font-medium">
                      {edu.fieldOfStudy}
                    </p>
                    <p className="text-primary-600 text-xs mt-1">
                      GPA/Score: {edu.gpa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="print:break-before-page print:py-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-primary-100 pb-2 mb-4">
            Documents
          </h3>

          <PassportCard
            profile={profile}
            document={documents?.documents?.["passport"]}
          />

          <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3 mt-6">
            Education Documents
          </h4>

          <div className="space-y-6 mb-8">
            {(profile.education_history || []).map((edu, idx) => {
              const levelKey = getEducationLevelKey(edu.level);
              if (!levelKey) return null;

              const docsForLevel = EDUCATION_DOCUMENTS[levelKey].documents;

              return (
                <div
                  key={idx}
                  className="bg-white border border-primary-200 rounded-xl overflow-hidden break-inside-avoid shadow-xs"
                >
                  <div className="bg-primary-50/50 px-4 py-5 border-b border-primary-100 flex flex-col print:flex-row print:items-center md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h5 className="font-semibold text-primary-900 text-base">
                        {edu.schoolName}
                      </h5>
                      <p className="text-xs text-primary-500">
                        {edu.level} • {edu.fieldOfStudy}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {docsForLevel.map((eduDoc) => {
                        const doc = documents?.documents?.[eduDoc.id];
                        const isUploaded =
                          doc?.status === "uploaded" ||
                          doc?.status === "verified";

                        return (
                          <div
                            key={eduDoc.id}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                                isUploaded
                                  ? "bg-white border-success/20 text-success"
                                  : "bg-white border-primary-300 text-primary-400"
                              }`}
                            >
                              {isUploaded ? (
                                <FiCheckCircle className="size-3.5" />
                              ) : null}
                              <span className="font-medium">
                                {eduDoc.label}
                              </span>
                            </div>
                            {isUploaded && doc?.url && (
                              <Link
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <div className="print:hidden rounded-full size-6 bg-white border border-primary-200 hover:bg-primary-50 text-primary-600 flex items-center justify-center transition-colors shadow-sm">
                                  <FiEye className="size-3" />
                                </div>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {(!profile.education_history ||
              profile.education_history.length === 0) && (
              <p className="text-sm text-primary-500 italic">
                No education history found. Please add your education details
                first.
              </p>
            )}
          </div>

          <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">
            Documents Checklist
          </h4>
          <p className="text-xs text-primary-500 mb-4">
            All documents might not be required. Please refer to the program
            details for more information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4">
            {otherDocs.map((key) => (
              <DocumentCard
                key={key}
                docKey={key}
                document={documents?.documents?.[key]}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
});

ProfileDocument.displayName = "ProfileDocument";
