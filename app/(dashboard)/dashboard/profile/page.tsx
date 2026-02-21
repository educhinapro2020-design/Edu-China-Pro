"use client";

import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiPrinter,
  FiEdit3,
  FiArrowLeft,
  FiLoader,
  FiUser,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiMail,
  FiSearch,
  FiBookOpen,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { ProfileDocument } from "@/components/shared/ProfileDocument";
import { DocumentUploadField } from "@/components/dashboard/DocumentUploadField";
import { ProfileChecklistModal } from "@/components/dashboard/ProfileChecklistModal";
import Link from "next/link";
import { studentRepository } from "@/lib/repositories/student.repo";
import { createClient } from "@/lib/supabase/client";
import {
  StudentProfile,
  StudentDocuments,
  StudentDocumentEntry,
} from "@/lib/types/student";
import { studentDocumentsRepository } from "@/lib/repositories/student-documents.repo";
import {
  DOCUMENT_REGISTRY,
  GeneralDocumentKey,
  DocumentKey,
  EDUCATION_DOCUMENTS,
  getEducationLevelKey,
} from "@/lib/constants/documents";
import { twMerge } from "tailwind-merge";
import { MdOutlineSchool, MdSchool } from "react-icons/md";

type Tab = "profile" | "documents";

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

function ProfileTab({
  profile,
  email,
  documents,
}: {
  profile: Partial<StudentProfile>;
  email?: string;
  documents?: StudentDocuments | null;
}) {
  const photoUrl = documents?.documents?.["photo"]?.url;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Student Photo"
              className="size-24 md:size-28 object-cover border border-primary-200 bg-primary-50"
            />
          ) : (
            <div className="size-24 md:size-28 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center">
              <FiUser className="size-10 text-primary-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-primary-900">
            {profile.first_name} {profile.last_name}
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-primary-600">
              <FiMail className="size-4 text-primary-400 shrink-0" />
              <span className="truncate">{email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-600">
              <FiPhone className="size-4 text-primary-400 shrink-0" />
              <span>{profile.phone_number || "No phone provided"}</span>
            </div>
            {(profile.address || profile.city) && (
              <div className="flex items-start gap-2 text-primary-600">
                <FiMapPin className="size-4 text-primary-400 mt-0.5 shrink-0" />
                <span>
                  {[profile.address, profile.city, profile.zip_code]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6 text-sm">
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
              label: "Visited China?",
              value: profile.has_visited_china ? "Yes" : "No",
            },
            {
              label: "Currently in China?",
              value: profile.in_china_now ? "Yes" : "No",
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-primary-500 text-xs mb-1">{item.label}</p>
              <p
                className={twMerge(
                  "font-medium text-primary-900",
                  item.capitalize && "capitalize",
                )}
              >
                {item.value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b border-primary-100 pb-2 mb-4">
          Passport
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6 text-sm">
          <div>
            <p className="text-primary-500 text-xs mb-1">Passport Number</p>
            <p className="font-medium text-primary-900">
              {profile.passport_number || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-primary-500 text-xs mb-1">Expiry Date</p>
            <p className="font-medium text-primary-900">
              {formatDate(profile.passport_expiry)}
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
          <div className="space-y-5">
            {profile.education_history.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 bg-primary-50/50 rounded-xl border border-primary-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-primary-900">
                      {edu.schoolName}
                    </h4>
                    <p className="text-sm text-primary-600">
                      {edu.fieldOfStudy}
                    </p>
                  </div>
                  <div className="text-sm text-primary-500">
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                    {edu.level}
                  </span>
                  {edu.gpa && (
                    <span className="text-primary-600 text-xs">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DocumentsTab({
  profile,
  documents,
  onUpload,
}: {
  profile: Partial<StudentProfile>;
  documents: Record<DocumentKey, StudentDocumentEntry | undefined>;
  onUpload: (file: File, key: DocumentKey) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const lowerSearch = search.toLowerCase();

  const generalKeys = (
    Object.keys(DOCUMENT_REGISTRY) as GeneralDocumentKey[]
  ).filter(
    (key) =>
      !search ||
      DOCUMENT_REGISTRY[key].label.toLowerCase().includes(lowerSearch),
  );

  return (
    <>
      <div className="relative max-w-sm mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all placeholder:text-primary-400"
        />
      </div>
      <div className="space-y-10">
        {(profile.education_history || []).map((edu, idx) => {
          const levelKey = getEducationLevelKey(edu.level);
          if (!levelKey) return null;
          const levelConfig = EDUCATION_DOCUMENTS[levelKey];
          const filteredDocs = levelConfig.documents.filter(
            (doc) => !search || doc.label.toLowerCase().includes(lowerSearch),
          );
          if (filteredDocs.length === 0) return null;

          return (
            <section key={idx} className="space-y-4">
              <div className="border-b border-primary-100 pb-2">
                <h3 className="font-bold uppercase tracking-wider text-brand-600">
                  {edu.level} Documents
                </h3>
                <p className="text-sm flex items-center gap-2 text-primary-600 mt-1 font-medium">
                  <MdOutlineSchool className="size-4" /> {edu.schoolName}
                </p>
                <p className="text-sm flex items-center gap-2 text-primary-600 mt-1 font-medium">
                  <FiBookOpen className="size-3" /> {edu.fieldOfStudy}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <DocumentUploadField
                    key={doc.id}
                    label={doc.label}
                    docKey={doc.id}
                    description={doc.description}
                    accept={doc.acceptedFormats?.join(",")}
                    status={documents[doc.id]?.status}
                    currentUrl={documents[doc.id]?.url}
                    onUpload={(f) => onUpload(f, doc.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {generalKeys.length > 0 && (
          <section className="space-y-4">
            <div className="border-b border-primary-100 pb-2">
              <h3 className="font-bold uppercase tracking-wider text-brand-600">
                Documents upload
              </h3>
              <p className="text-sm text-primary-500 mt-1">
                Passport, health, financial, and other supporting documents.
              </p>
              <p className="text-sm text-primary-500 mt-2">
                <b>Note:</b> All documents may not be required for all programs.
                Check program requirements for info.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generalKeys.map((key) => (
                <DocumentUploadField
                  key={key}
                  label={DOCUMENT_REGISTRY[key].label}
                  docKey={key}
                  description={DOCUMENT_REGISTRY[key].description}
                  accept={DOCUMENT_REGISTRY[key].acceptedFormats?.join(",")}
                  status={documents[key]?.status}
                  currentUrl={documents[key]?.url}
                  onUpload={(f) => onUpload(f, key)}
                />
              ))}
            </div>
          </section>
        )}

        {generalKeys.length === 0 &&
          (profile.education_history || []).every((edu) => {
            const levelKey = getEducationLevelKey(edu.level);
            if (!levelKey) return true;
            return EDUCATION_DOCUMENTS[levelKey].documents.every(
              (doc) => !doc.label.toLowerCase().includes(lowerSearch),
            );
          }) && (
            <p className="text-sm text-primary-500 italic text-center py-8">
              No documents match &quot;{search}&quot;
            </p>
          )}
      </div>
    </>
  );
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [profile, setProfile] = useState<Partial<StudentProfile> | null>(null);
  const [documents, setDocuments] = useState<StudentDocuments | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab === "documents" ? "documents" : "profile",
  );
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `EduChinaPro_Profile_${profile?.first_name || "Student"}`,
  });

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email);
        const [profileData, docsData] = await Promise.all([
          studentRepository.getProfile(user.id, supabase),
          studentDocumentsRepository.getDocuments(user.id, supabase),
        ]);
        setProfile(profileData);
        setDocuments(docsData);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleDocumentUpload = async (file: File, docKey: DocumentKey) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await studentDocumentsRepository.uploadDocument(user.id, file, docKey);
    const updatedDocs = await studentDocumentsRepository.getDocuments(user.id);
    setDocuments(updatedDocs);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ProgressiveLoader message="Loading your profile..." />
      </div>
    );
  }

  if (!profile) return <div>Failed to load profile.</div>;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", icon: FiUser },
    { key: "documents", label: "Documents", icon: FiFileText },
  ];

  const docsMap = (documents?.documents || {}) as Record<
    DocumentKey,
    StudentDocumentEntry | undefined
  >;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <FiArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
            <p className="text-base text-primary-500">
              View and manage your profile & documents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none gap-2"
          >
            <FiPrinter className="size-4" /> Print / PDF
          </Button>
          <Link href="/dashboard/profile/build" className="flex-1 sm:flex-none">
            <Button
              size="sm"
              className="w-full gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-brand-100"
            >
              <FiEdit3 className="size-4" /> Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-primary-100 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={twMerge(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-primary-900 shadow-sm"
                  : "text-primary-500 hover:text-primary-700",
              )}
            >
              <Icon
                className={twMerge(
                  "size-4",
                  isActive ? "text-brand-600" : "text-primary-400",
                )}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-primary-100 p-4 md:p-8 shadow-sm">
        {activeTab === "profile" ? (
          <ProfileTab
            profile={profile}
            email={userEmail}
            documents={documents}
          />
        ) : (
          <DocumentsTab
            profile={profile}
            documents={docsMap}
            onUpload={handleDocumentUpload}
          />
        )}
      </div>

      <div className="hidden">
        <ProfileDocument
          ref={componentRef}
          profile={profile}
          documents={documents}
          email={userEmail}
        />
      </div>

      <ProfileChecklistModal profile={profile} documents={docsMap} />
    </div>
  );
}
