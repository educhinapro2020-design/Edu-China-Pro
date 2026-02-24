"use client";

import { useEffect, useState, useMemo, use } from "react";
import { applicationService } from "@/lib/services/application.service";
import { applicationRepository } from "@/lib/repositories/application.repo";
import { studentRepository } from "@/lib/repositories/student.repo";
import { studentDocumentsRepository } from "@/lib/repositories/student-documents.repo";
import {
  Application,
  ApplicationDocument,
  ApplicationStatusHistory,
  ApplicationNote,
  APPLICATION_STATUSES,
} from "@/lib/types/application";
import { StudentProfile } from "@/lib/types/student";
import { DocumentKey, getDocumentLabel } from "@/lib/constants/documents";
import { getProfileChecklist } from "@/lib/utils/profile-checklist";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiFileText,
  FiClock,
  FiDownload,
  FiX,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
import { MdHistory, MdOutlineSchool, MdPayment } from "react-icons/md";
import {
  getApplicationStatusLabel,
  getApplicationStatusMeta,
  getDocumentStatusMeta,
} from "@/lib/utils/application";
import { GrNote } from "react-icons/gr";

type Tab = "overview" | "documents" | "history";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

function TimelineList({
  currentStatus,
  history,
  onViewHistory,
}: {
  currentStatus: string;
  history: ApplicationStatusHistory[];
  onViewHistory: () => void;
}) {
  const idx = APPLICATION_STATUSES.indexOf(
    currentStatus as (typeof APPLICATION_STATUSES)[number],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-0 relative ml-2">
        <div className="absolute left-2.5 top-3 bottom-0 w-0.5 bg-primary-100" />
        {APPLICATION_STATUSES.map((s, i) => {
          const isCurrent = s === currentStatus;
          const isPast = i < idx;
          const historyEntry = history.find((h) => h.to_status === s);
          const wasExplicitlySet = !!historyEntry;
          const meta = getApplicationStatusMeta(s);

          if (i < idx - 2 || i > idx + 2) return null;

          return (
            <div key={s} className="flex items-start gap-4 relative py-3">
              <div
                className={twMerge(
                  "size-5 rounded-full ring-4 ring-white z-10 shrink-0 flex items-center justify-center transition-all",
                  isCurrent
                    ? "bg-brand-600 ring-brand-50 shadow-sm shadow-brand-200"
                    : wasExplicitlySet && isPast
                      ? "bg-brand-500"
                      : isPast
                        ? "bg-primary-200 ring-primary-50"
                        : "bg-primary-200",
                )}
              />
              <div className="flex flex-col -mt-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={twMerge(
                      "text-sm font-semibold truncate transition-colors",
                      isCurrent
                        ? "text-brand-600"
                        : wasExplicitlySet && isPast
                          ? "text-primary-900"
                          : isPast
                            ? "text-primary-300"
                            : "text-primary-400",
                    )}
                  >
                    {meta.label}
                  </span>
                  {historyEntry && (
                    <span className="text-xs font-medium text-primary-400 shrink-0">
                      {formatRelativeTime(historyEntry.created_at)}
                    </span>
                  )}
                </div>
                {isCurrent && (
                  <p className="text-xs font-medium text-brand-600/80 mt-2 pr-2 leading-relaxed whitespace-normal wrap-break-word">
                    {meta.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 0 && (
        <button
          onClick={onViewHistory}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
        >
          <FiClock className="size-4" />
          View all history
        </button>
      )}

      <Link
        href="/dashboard/guide/student"
        className="w-full flex items-center justify-center gap-2 underline py-2.5 mt-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors"
      >
        <FiInfo className="size-3.5" />
        What do these mean?
      </Link>
    </div>
  );
}

function SectionHeader({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold tracking-wide text-primary-900">
        {children}
      </h2>
      {aside && <span className="text-sm text-primary-400">{aside}</span>}
    </div>
  );
}

function DocumentRow({
  docKey,
  doc,
  uploading,
  onUpload,
}: {
  docKey: DocumentKey;
  doc: ApplicationDocument | undefined;
  uploading: boolean;
  onUpload: (key: DocumentKey, file: File) => void;
}) {
  const status = doc?.status ?? "missing";
  const { icon, color, label } = getDocumentStatusMeta(status);
  const isVerified = status === "verified";

  const rowColors = color
    .split(" ")
    .filter((c) => c.startsWith("bg-") || c.startsWith("border-"))
    .join(" ");

  return (
    <div
      className={twMerge(
        "w-full flex flex-col gap-3 p-5 rounded-2xl border transition-all",
        rowColors,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={twMerge(
              "size-12 rounded-xl flex items-center justify-center border shrink-0",
              color,
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-medium text-primary-900 tracking-tight truncate">
              {getDocumentLabel(docKey)}
            </h4>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span
                className={twMerge(
                  "text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-lg border",
                  color,
                )}
              >
                {label}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {doc?.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Download"
              className="p-2 rounded-lg text-primary-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all active:scale-95"
            >
              <FiDownload className="size-4.5" />
            </a>
          )}
          {isVerified ? null : (
            <label
              className={twMerge(
                "cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                uploading
                  ? "bg-primary-50 text-primary-400 border-primary-200"
                  : "bg-white border-primary-200 text-primary-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 shadow-sm",
              )}
            >
              {uploading ? (
                <>
                  <div className="size-3.5 border border-primary-400 border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                <>{doc ? "Replace" : "Upload"}</>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(docKey, file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {doc?.feedback && (
        <div
          className={twMerge(
            "text-xs font-medium leading-relaxed px-3 flex-col gap-1",
            color,
            "bg-opacity-60",
          )}
        >
          <span className="text-xs font-medium leading-relaxed px-3"></span>
          {doc.feedback}
        </div>
      )}
    </div>
  );
}

export type PendingActionType = "document" | "application_fee" | "ecp_fee";

function ActionRequiredModal({
  isOpen,
  onClose,
  actionType,
  docKey,
  doc,
  uploading,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  actionType: PendingActionType | null;
  docKey?: DocumentKey | null;
  doc?: ApplicationDocument | undefined;
  uploading: boolean;
  onUpload: (key: DocumentKey, file: File) => void;
}) {
  if (!isOpen || !actionType) return null;

  let title = "";
  let description = "";
  let icon = null;
  let color = "";
  let label = "";

  if (actionType === "document" && docKey) {
    const status = doc?.status ?? "missing";
    const meta = getDocumentStatusMeta(status);
    title = getDocumentLabel(docKey);
    description = meta.description;
    icon = meta.icon;
    color = meta.color;
    label = meta.label;
  } else if (actionType === "application_fee") {
    title = "Application Fee";
    description = "Pay the application fee to proceed with the application.";
    icon = <FiFileText className="size-5" />;
    color = "bg-amber-100 text-amber-700 border-amber-200";
    label = "Payment Required";
  } else if (actionType === "ecp_fee") {
    title = "EduChinaPro Service Fee";
    description =
      "Pay the EduChinaPro service fee to proceed with the application.";
    icon = <FiFileText className="size-5" />;
    color = "bg-amber-100 text-amber-700 border-amber-200";
    label = "Payment Required";
  }

  const isVerified = doc?.status === "verified";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-primary-100"
        >
          <div className="flex items-center justify-end py-2 px-3">
            <button
              onClick={onClose}
              className="p-2 text-primary-400 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors"
            >
              <FiX className="size-5" />
            </button>
          </div>

          <div className="px-5 py-2 space-y-6">
            <div className="flex items-start gap-4">
              <div
                className={twMerge(
                  "size-14 rounded-2xl flex items-center justify-center border shrink-0",
                  color,
                )}
              >
                {icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-primary-900 leading-tight">
                  {title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={twMerge(
                      "text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                      color,
                    )}
                  >
                    {label}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-primary-600 leading-relaxed">
              {description}
            </p>

            {doc?.feedback && actionType === "document" && (
              <div
                className={twMerge("p-4 rounded-xl border", "bg-opacity-40")}
              >
                <h5 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                  Feedback from Counselor
                </h5>
                <p
                  className={twMerge(
                    color,
                    "text-sm bg-transparent font-medium leading-relaxed",
                  )}
                >
                  {doc.feedback}
                </p>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 bg-primary-50/50 border-t border-primary-100 flex items-center justify-end gap-3">
            {actionType === "document" ? (
              <>
                {doc?.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-primary-700 font-bold bg-white border border-primary-200 hover:border-primary-300 hover:bg-primary-50 shadow-sm transition-all flex items-center gap-2"
                  >
                    <FiDownload className="size-4" />
                    Download
                  </a>
                )}
                {isVerified ? (
                  <span className="px-4 py-2.5 rounded-xl text-sm font-bold text-success bg-success/10 border border-success/20 flex items-center gap-2">
                    <div className="size-4 bg-success/20 rounded-full flex items-center justify-center">
                      <div className="size-2 bg-success rounded-full" />
                    </div>
                    Verified
                  </span>
                ) : (
                  <label
                    className={twMerge(
                      "cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border shadow-sm",
                      uploading
                        ? "bg-primary-50 text-primary-400 border-primary-200"
                        : "bg-brand-600 border-brand-500 text-white hover:bg-brand-700",
                    )}
                  >
                    {uploading ? (
                      <>
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUploadCloud className="size-4" />
                        {doc ? "Replace File" : "Upload File"}
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && docKey) {
                          onUpload(docKey, file);
                        }
                      }}
                    />
                  </label>
                )}
              </>
            ) : (
              <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-all border border-amber-600">
                Pay Now
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<DocumentKey | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [statusHistory, setStatusHistory] = useState<
    ApplicationStatusHistory[]
  >([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [studentProfile, setStudentProfile] =
    useState<Partial<StudentProfile> | null>(null);
  const [studentDocsMap, setStudentDocsMap] = useState<Record<string, any>>({});

  // Modal state
  const [selectedAction, setSelectedAction] = useState<{
    type: PendingActionType;
    docKey?: DocumentKey;
  } | null>(null);

  const profileChecklist = useMemo(
    () => getProfileChecklist(studentProfile, studentDocsMap as any),
    [studentProfile, studentDocsMap],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const [profile, studentDocs] = await Promise.all([
            studentRepository.getProfile(user.id),
            studentDocumentsRepository.getDocuments(user.id),
          ]);
          if (profile) setStudentProfile(profile);
          if (studentDocs?.documents)
            setStudentDocsMap(studentDocs.documents as any);
        }
        const data = await applicationService.getApplicationById(id);
        setApplication(data);
        const history = await applicationRepository.getStatusHistory(id);
        setStatusHistory(history);
        const fetchedNotes = await applicationRepository.getNotes(id);
        setNotes(fetchedNotes.filter((n) => n.visibility === "public"));
      } catch (err) {
        console.error("Failed to fetch application:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleFileUpload = async (key: DocumentKey, file: File) => {
    if (!application || !userId) return;
    setUploading(key);
    try {
      const url = await applicationService.uploadDocument(
        application.id,
        key,
        file,
        userId,
      );
      setApplication((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          documents: {
            ...prev.documents,
            [key]: {
              url,
              status: "uploaded",
              uploaded_at: new Date().toISOString(),
            } as ApplicationDocument,
          },
        };
      });
    } catch {
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full size-10 border-t-2 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-10 text-center text-primary-500">
        Application not found.
      </div>
    );
  }

  const requirements: DocumentKey[] =
    application.program?.document_requirements ?? [];
  const appDocs = application.documents ?? {};
  const totalDocs = requirements.length;
  const uploadedDocs = requirements.filter((k) => {
    const s = appDocs[k]?.status;
    return s === "uploaded" || s === "verified";
  }).length;

  const statusMeta = getApplicationStatusMeta(application.status);

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: FiFileText },
    { key: "documents", label: "Documents", icon: FiUploadCloud },
    { key: "history", label: "History", icon: FiClock },
  ];

  return (
    <>
      <ActionRequiredModal
        isOpen={selectedAction !== null}
        onClose={() => setSelectedAction(null)}
        actionType={selectedAction?.type ?? null}
        docKey={selectedAction?.docKey}
        doc={
          selectedAction?.docKey ? appDocs[selectedAction.docKey] : undefined
        }
        uploading={
          selectedAction?.type === "document" &&
          selectedAction.docKey === uploading
        }
        onUpload={handleFileUpload}
      />

      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pb-16">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-800 transition-colors mt-2"
        >
          <FiArrowLeft className="size-4 shrink-0" />
          All Applications
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <div className="grow w-full lg:w-2/3 space-y-6 min-w-0">
            <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-br from-brand-100/40 via-primary-50/50 to-white -z-10" />
              <div
                className={twMerge(
                  "h-1.5 w-full",
                  statusMeta.color.split(" ")[0] || "bg-brand-500",
                )}
              />

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-5">
                  <div className="size-16 sm:size-20 shrink-0 bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden flex items-center justify-center p-2">
                    {application.program?.university?.logo_url ? (
                      <img
                        src={application.program.university.logo_url}
                        alt={application.program.university.name_en}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <MdOutlineSchool className="size-8 sm:size-10 text-primary-300" />
                    )}
                  </div>
                  <div className="min-w-0 pt-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-primary-900 leading-tight break-words line-clamp-3">
                      {application.program?.name_en ?? "Unknown Program"}
                    </h1>
                    <p className="text-sm sm:text-base text-primary-500 mt-1 break-words">
                      {application.program?.university?.name_en}
                    </p>
                    <div className="flex flex-col items-start gap-3 mt-3 flex-wrap">
                      <span
                        className={twMerge(
                          "text-xs font-medium px-2.5 py-1 rounded-full border shadow-sm",
                          statusMeta.color,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-xs font-mono font-medium text-brand-600 bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200">
                        ID: {application.id.slice(0, 8).toUpperCase()}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="divide-y divide-primary-50"
                  >
                    {(() => {
                      const isApplicationFeePending =
                        application.status === "application_fee_pending";
                      const isEcpFeePending =
                        application.status === "ecp_fee_pending";
                      const missingDocs = requirements.filter((k) => {
                        const s = appDocs[k]?.status;
                        return (
                          s === undefined ||
                          s === "rejected" ||
                          s === "needs_correction"
                        );
                      });
                      const profileIncomplete =
                        profileChecklist.missing.length > 0;
                      const profileTotal =
                        profileChecklist.completed.length +
                        profileChecklist.missing.length;
                      const profileCompleted =
                        profileChecklist.completed.length;
                      const profileProgress =
                        profileTotal > 0
                          ? Math.round((profileCompleted / profileTotal) * 100)
                          : 100;

                      const hasActions =
                        profileIncomplete ||
                        isApplicationFeePending ||
                        isEcpFeePending ||
                        missingDocs.length > 0;

                      if (!hasActions) return null;

                      return (
                        <div className="p-6 sm:p-8">
                          <SectionHeader>Actions Required</SectionHeader>
                          <div className="space-y-3">
                            {profileIncomplete && (
                              <Link
                                href="/dashboard/profile/build?helper=true"
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-primary-100 bg-white hover:shadow-sm transition-all group"
                              >
                                <div className="relative shrink-0">
                                  <svg
                                    className="size-16 -rotate-90"
                                    viewBox="0 0 36 36"
                                  >
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="15.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      className="text-primary-100"
                                    />
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="15.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeDasharray={`${Math.round((profileProgress / 100) * 97.4)} 97.4`}
                                      className={
                                        profileProgress === 100
                                          ? "text-brand-500"
                                          : "text-brand-400"
                                      }
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-900">
                                      {profileProgress}%
                                    </span>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-bold text-primary-900 group-hover:text-brand-700 transition-colors">
                                    Complete your profile
                                  </p>
                                  <p className="text-sm text-primary-500 font-medium mt-0.5">
                                    {profileCompleted} of {profileTotal} profile
                                    items completed
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-primary-500 group-hover:text-brand-600 transition-colors shrink-0">
                                  <span className="text-sm font-semibold">
                                    Go
                                  </span>
                                  <FiArrowRight className="size-4" />
                                </div>
                              </Link>
                            )}

                            {isApplicationFeePending && (
                              <div className="w-full text-left flex items-center gap-3 p-3 py-4 rounded-xl border border-primary-200 bg-white hover:shadow-sm transition-all group">
                                <div className="size-10 rounded-lg flex items-center justify-center border border-warning/20 bg-warning/10 text-warning shrink-0">
                                  <MdPayment className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-semibold text-primary-700">
                                    Application Fee
                                  </h4>
                                  <span className="text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded-md border bg-warning/10 text-warning border-warning/20 mt-1 inline-block">
                                    Payment Required
                                  </span>
                                </div>
                              </div>
                            )}

                            {isEcpFeePending && (
                              <div className="w-full text-left flex items-center gap-3 p-3 py-4 rounded-xl border border-primary-200 bg-white hover:shadow-sm transition-all group">
                                <div className="size-10 rounded-lg flex items-center justify-center border border-warning/20 bg-warning/10 text-warning shrink-0">
                                  <MdPayment className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-semibold text-primary-700">
                                    EduChinaPro Service Fee
                                  </h4>
                                  <span className="text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded-md border bg-warning/10 text-warning border-warning/20 mt-1 inline-block">
                                    Payment Required
                                  </span>
                                </div>
                              </div>
                            )}

                            {missingDocs.slice(0, 3).map((k) => {
                              const doc = appDocs[k];
                              const status = doc?.status ?? "missing";
                              const { icon, color, label } =
                                getDocumentStatusMeta(status);
                              const isVerified = status === "verified";
                              return (
                                <div
                                  key={k}
                                  className={twMerge(
                                    "w-full flex items-center gap-3 p-4 rounded-xl border",
                                    color
                                      .split(" ")
                                      .filter(
                                        (c) =>
                                          c.startsWith("bg-") ||
                                          c.startsWith("border-"),
                                      )
                                      .join(" "),
                                  )}
                                >
                                  <div
                                    className={twMerge(
                                      "size-10 rounded-lg flex items-center justify-center border shrink-0",
                                      color,
                                    )}
                                  >
                                    {icon}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold text-primary-900 truncate">
                                      {getDocumentLabel(k)}
                                    </h4>
                                    <span
                                      className={twMerge(
                                        "text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded-md border mt-1 inline-block",
                                        color,
                                      )}
                                    >
                                      {label}
                                    </span>
                                    {doc?.feedback && (
                                      <p className="text-xs text-primary-600 mt-1 leading-relaxed">
                                        {doc.feedback}
                                      </p>
                                    )}
                                  </div>
                                  <div className="shrink-0 flex items-center gap-2">
                                    {doc?.url && (
                                      <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg text-primary-400 hover:text-brand-600 hover:bg-white border border-transparent hover:border-brand-200 transition-all"
                                      >
                                        <FiDownload className="size-4" />
                                      </a>
                                    )}
                                    {!isVerified && (
                                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border bg-white border-primary-200 text-primary-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 shadow-sm">
                                        <FiUploadCloud className="size-3.5" />
                                        {doc ? "Replace" : "Upload"}
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          disabled={uploading === k}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(k, file);
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {missingDocs.length > 3 && (
                              <button
                                onClick={() => {
                                  setActiveTab("documents");
                                  window.scrollTo({
                                    top: 300,
                                    behavior: "smooth",
                                  });
                                }}
                                className="w-full py-3 flex items-center justify-center gap-2 bg-white border border-primary-200 hover:border-brand-300 hover:bg-brand-50 text-sm font-semibold text-primary-600 hover:text-brand-700 rounded-xl transition-all"
                              >
                                View {missingDocs.length - 3} more required
                                <FiArrowRight className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="p-6 sm:p-8 border-t border-primary-50">
                      <SectionHeader>User Downloads</SectionHeader>
                      {!application.user_downloads ||
                      application.user_downloads.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-primary-300 p-8 py-12 text-center text-primary-500 text-sm font-medium">
                          <FiDownload className="size-6" />
                          No downloads available.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {application.user_downloads.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 rounded-xl border border-primary-200 bg-white hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="size-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                                  <FiFileText className="size-5 text-brand-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-primary-900 truncate">
                                    {doc.title}
                                  </p>
                                  {doc.description && (
                                    <p className="text-sm text-primary-500 mt-0.5 line-clamp-2">
                                      {doc.description}
                                    </p>
                                  )}
                                  <p className="text-[10px] uppercase tracking-wide text-primary-400 font-medium mt-1">
                                    {new Date(
                                      doc.uploaded_at,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 text-primary-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-200"
                                title="Download Document"
                              >
                                <FiDownload className="size-4.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6 sm:p-8">
                      <SectionHeader>Notes from Counselor</SectionHeader>
                      {notes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-primary-300 p-8 py-12 flex flex-col items-center gap-2 text-center text-primary-500 text-sm font-medium">
                          <GrNote className="size-6" />
                          No notes yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notes.map((note) => {
                            const authorName =
                              note.author?.full_name || "Counselor";
                            return (
                              <div
                                key={note.id}
                                className="flex gap-4 p-5 rounded-2xl bg-brand-50/50 border border-brand-100"
                              >
                                <div className="size-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center shrink-0 text-brand-700 font-bold">
                                  {authorName[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0 pt-0.5">
                                  <div className="flex items-center justify-between gap-4 mb-1">
                                    <span className="text-sm font-bold text-primary-900">
                                      {authorName}
                                    </span>
                                    <span className="text-xs font-medium text-primary-500 whitespace-nowrap">
                                      {formatRelativeTime(note.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-primary-700 leading-relaxed">
                                    {note.note}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 sm:p-8 space-y-8"
                  >
                    <section>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-primary-900 mb-6">
                        Status History
                      </h2>
                      {statusHistory.length === 0 ? (
                        <div className="bg-primary-50/50 rounded-2xl p-8 text-center min-h-[150px] flex items-center justify-center border border-dashed border-primary-200">
                          <p className="text-sm text-primary-500 font-medium flex flex-col items-center gap-2">
                            <MdHistory className="size-6" />
                            No status changes recorded yet.
                          </p>
                        </div>
                      ) : (
                        <div className="relative max-w-2xl">
                          <div className="absolute left-[7px] top-2 bottom-4 w-px bg-primary-200" />
                          <div className="space-y-8">
                            {statusHistory.map((entry, i) => {
                              const meta = getApplicationStatusMeta(
                                entry.to_status,
                              );
                              const isFirst = i === 0;

                              return (
                                <div
                                  key={entry.id}
                                  className="flex gap-6 relative"
                                >
                                  <div
                                    className={twMerge(
                                      "size-[15px] rounded-full shrink-0 ring-[6px] ring-white z-10 mt-1",
                                      isFirst
                                        ? "bg-brand-500"
                                        : "bg-primary-300",
                                    )}
                                  />

                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                      <div>
                                        <div className="flex items-center gap-3">
                                          <span
                                            className={twMerge(
                                              "text-sm font-semibold",
                                              isFirst
                                                ? "text-brand-600"
                                                : "text-primary-700",
                                            )}
                                          >
                                            {meta.label}
                                          </span>
                                          {entry.from_status && (
                                            <div className="flex items-center gap-2 text-primary-500 text-xs font-medium">
                                              <span>from</span>
                                              <span className="px-2 py-0.5 rounded-lg bg-primary-50">
                                                {getApplicationStatusLabel(
                                                  entry.from_status,
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-sm text-primary-500 leading-relaxed mt-1">
                                          {meta.description}
                                        </p>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <p className="text-sm font-medium text-primary-900">
                                          {formatRelativeTime(entry.created_at)}
                                        </p>
                                      </div>
                                    </div>

                                    {entry.note && (
                                      <div className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100/50 mt-3">
                                        <p className="text-sm text-primary-700 italic">
                                          &ldquo;{entry.note}&rdquo;
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full lg:w-1/3 shrink-0 flex flex-col gap-6 lg:sticky lg:top-8">
            <div className="rounded-2xl p-4 sm:p-5 bg-brand-600 border border-brand-200 flex items-center gap-4">
              <FiInfo className="size-4.5 shrink-0 text-white" />
              <p className="text-sm font-medium text-white leading-relaxed">
                {statusMeta.description}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-primary-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary-900 mb-5">
                Status Timeline
              </h3>

              <TimelineList
                currentStatus={application.status}
                history={statusHistory}
                onViewHistory={() => {
                  setActiveTab("history");
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
