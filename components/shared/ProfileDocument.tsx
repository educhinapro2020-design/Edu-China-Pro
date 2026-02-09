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
  FiAlertCircle,
} from "react-icons/fi";
import React from "react";
import {
  DOCUMENT_REGISTRY,
  DocumentKey,
  EDUCATION_DOCUMENTS,
  EducationLevel,
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
    <div className="bg-primary-50 rounded-xl p-5 border border-primary-100 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-lg text-primary-900 flex items-center gap-2">
          Passport
          {isUploaded ? (
            <span className="text-success text-xs font-normal bg-white px-2 py-0.5 rounded-full border border-success/20 flex items-center gap-1">
              <FiCheckCircle className="size-3" /> Uploaded
            </span>
          ) : (
            <span className="text-primary-400 text-xs font-normal bg-white px-2 py-0.5 rounded-full border border-primary-200 flex items-center gap-1">
              <FiAlertCircle className="size-3" /> Pending
            </span>
          )}
        </h4>
        {isUploaded && document?.url && (
          <Link href={document.url} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-2 bg-white hover:bg-primary-50 text-primary-700 border-primary-200"
            >
              <FiEye className="size-3.5" /> View
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-primary-400 text-xs mb-1 uppercase tracking-wider">
            Passport Number
          </p>
          <p className="font-mono font-semibold text-lg text-primary-900">
            {profile.passport_number || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-primary-400 text-xs mb-1 uppercase tracking-wider">
            Expiry Date
          </p>
          <p className="font-mono font-semibold text-lg text-primary-900">
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
  const registryEntry = DOCUMENT_REGISTRY[docKey];
  if (!registryEntry) return null;

  const isUploaded =
    document?.status === "uploaded" || document?.status === "verified";

  return (
    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 flex flex-col justify-between h-full min-h-[100px]">
      <div className="flex justify-between items-start gap-2 mb-3">
        <span className="font-medium text-primary-800 text-sm leading-tight">
          {registryEntry.label}
        </span>
        {isUploaded ? (
          <FiCheckCircle className="size-4 text-success shrink-0" />
        ) : (
          <div className="size-4 border-2 border-primary-200 rounded-full shrink-0" />
        )}
      </div>

      <div className="flex justify-between items-end mt-auto">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${isUploaded ? "bg-success/10 text-success" : "bg-primary-100/50 text-primary-400"}`}
        >
          {isUploaded ? "Uploaded" : "Pending"}
        </span>

        {isUploaded && document?.url && (
          <Link href={document.url} target="_blank" rel="noopener noreferrer">
            <button className="text-primary-500 hover:text-brand-600 transition-colors p-1">
              <FiEye className="size-4" />
            </button>
          </Link>
        )}
      </div>
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

  const getEducationLevelKey = (levelValue: string): EducationLevel | null => {
    for (const [key, config] of Object.entries(EDUCATION_DOCUMENTS)) {
      if (config.value === levelValue || config.label === levelValue) {
        return key as EducationLevel;
      }
    }
    return null;
  };

  const educationDocs: DocumentKey[] = (profile.education_history || [])
    .map((edu) => getEducationLevelKey(edu.level))
    .filter((key): key is EducationLevel => key !== null)
    .flatMap((levelKey) => EDUCATION_DOCUMENTS[levelKey].documents);

  const otherDocs: DocumentKey[] = [
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
      className="bg-white p-8 md:p-12 max-w-4xl mx-auto print:shadow-none print:max-w-none print:w-full font-serif text-primary-900"
      id="printable-profile"
    >
      <div className="flex justify-between items-start border-b-2 border-brand-600 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight uppercase">
            Student Profile
          </h1>
          <p className="text-primary-500 mt-1 text-sm">
            EduChinaPro Application Record
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl brand-text">EduChinaPro</div>
          <div className="text-xs text-primary-400 mt-1 hidden print:block">
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
          <h2 className="text-2xl font-bold mb-4 brand-text">
            {profile.first_name} {profile.last_name}
          </h2>

          <div className="space-y-2 font-sans text-sm">
            <div className="flex items-center gap-2 text-primary-700">
              <FiMail className="size-4 text-primary-400" />
              <span>{email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-700">
              <FiPhone className="size-4 text-primary-400" />
              <span>{profile.phone_number || "No phone provided"}</span>
            </div>
            <div className="flex items-start gap-2 text-primary-700">
              <FiMapPin className="size-4 text-primary-400 mt-0.5" />
              <span>
                {profile.address}, {profile.city} {profile.zip_code}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block print:block justify-self-end">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4 font-sans">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Nationality</p>
              <p className="font-semibold">{profile.nationality || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Gender</p>
              <p className="font-semibold font-manrope capitalize">
                {profile.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Date of Birth</p>
              <p className="font-semibold">
                {formatDate(profile.date_of_birth)}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Marital Status</p>
              <p className="font-semibold">{profile.marital_status || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Religion</p>
              <p className="font-semibold">{profile.religion || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Mother Tongue</p>
              <p className="font-semibold">{profile.mother_tongue || "N/A"}</p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">Visited China?</p>
              <p className="font-semibold">
                {profile.has_visited_china ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-primary-400 text-xs mb-0.5">
                Currently in China?
              </p>
              <p className="font-semibold">
                {profile.in_china_now ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4 font-sans">
            Education History
          </h3>
          {!profile.education_history ||
          profile.education_history.length === 0 ? (
            <p className="text-sm text-primary-400 italic">
              No education history recorded.
            </p>
          ) : (
            <div className="space-y-6">
              {profile.education_history.map((edu, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm pb-4 border-b border-dashed border-primary-100 last:border-0 last:pb-0 break-inside-avoid"
                >
                  <div className="md:col-span-1">
                    <p className="font-bold text-primary-900">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded mt-1 font-sans font-medium">
                      {edu.level}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <h4 className="font-bold text-lg text-primary-900">
                      {edu.schoolName}
                    </h4>
                    <p className="text-primary-600 font-medium">
                      {edu.fieldOfStudy}
                    </p>
                    <p className="text-primary-500 text-xs mt-1">
                      GPA/Score: {edu.gpa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="print:break-before-page">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4 font-sans">
            Documents Status
          </h3>

          {/* Passport Card */}
          <PassportCard
            profile={profile}
            document={documents?.documents?.["passport"]}
          />

          <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3 mt-6">
            Education Documents
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {educationDocs.map((key) => (
              <DocumentCard
                key={key}
                docKey={key}
                document={documents?.documents?.[key]}
              />
            ))}
          </div>

          <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">
            Other Documents
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherDocs.map((key) => (
              <DocumentCard
                key={key}
                docKey={key}
                document={documents?.documents?.[key]}
              />
            ))}
          </div>
        </section>

        <div className="hidden print:block fixed bottom-0 left-0 right-0 p-8 text-center text-xs text-primary-400 border-t border-primary-100">
          Confidential Document • EduChinaPro
        </div>
      </div>
    </div>
  );
});

ProfileDocument.displayName = "ProfileDocument";
