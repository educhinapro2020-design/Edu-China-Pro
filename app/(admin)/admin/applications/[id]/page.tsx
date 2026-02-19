"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiUser,
  FiBookOpen,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiExternalLink,
  FiMail,
  FiDownload,
} from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import { applicationRepository } from "@/lib/repositories/application.repo";
import { studentRepository } from "@/lib/repositories/student.repo";
import { Application, ApplicationStatus } from "@/lib/types/application";
import { StudentProfile, StudentDocuments } from "@/lib/types/student";
import { DocumentKey, getDocumentLabel } from "@/lib/constants/documents";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getDocumentStatusInfo,
  formatRelativeTime,
  getStudentInitials,
} from "@/lib/utils/application";
import { ProfileDocument } from "@/components/shared/ProfileDocument";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";

const STATUS_ORDER: ApplicationStatus[] = [
  "document_pending",
  "applied",
  "processing",
  "payment_pending",
  "payment_received",
  "admission_success",
  "admission_failure",
  "offer_letter_uploaded",
  "jw202_processing",
  "visa_docs_ready",
  "visa_granted",
];

const STATUS_LABELS: { value: ApplicationStatus; label: string }[] =
  STATUS_ORDER.map((s) => ({
    value: s,
    label: getApplicationStatusLabel(s),
  }));

type Tab = "overview" | "profile";

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [app, setApp] = useState<Application | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [docs, setDocs] = useState<StudentDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const application = await applicationRepository.getApplicationById(id);
      setApp(application);

      if (application.student_id) {
        const [studentProfile, studentDocs] = await Promise.all([
          studentRepository.getProfile(application.student_id),
          studentRepository.getDocuments(application.student_id),
        ]);
        setProfile(studentProfile);
        setDocs(studentDocs);
      }
    } catch (err) {
      console.error("Failed to load application:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!app) return;
    setUpdatingStatus(true);
    try {
      await applicationRepository.updateStatus(app.id, newStatus);
      setApp((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
      setStatusOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <ProgressiveLoader message="Loading application…" isAdmin />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-brand-600"
        >
          <FiArrowLeft className="size-4" /> Back
        </button>
        <div className="bg-white rounded-2xl p-10 text-center border border-primary-100 shadow-sm">
          <div className="mx-auto size-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
            <FiFileText className="size-7 text-primary-400" />
          </div>
          <h3 className="text-base font-semibold text-primary-900 font-serif mb-1">
            Application not found
          </h3>
          <p className="text-primary-500 text-sm">
            This application may have been deleted or you don&apos;t have
            access.
          </p>
        </div>
      </div>
    );
  }

  const studentName =
    app.student?.full_name || profile?.first_name
      ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
      : "Unknown Student";
  const studentEmail = app.student?.email ?? "";
  const initials = getStudentInitials(studentName);
  const programName = app.program?.name_en ?? "Unknown Program";
  const universityName = app.program?.university?.name_en ?? "";
  const universityLogo = app.program?.university?.logo_url;

  const requiredDocs: DocumentKey[] = app.program?.document_requirements ?? [];
  const appDocs = app.documents ?? {};

  const totalDocs = requiredDocs.length;
  const uploadedDocs = requiredDocs.filter((k) => {
    const d = appDocs[k];
    return d && (d.status === "uploaded" || d.status === "verified");
  }).length;
  const docProgress =
    totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;

  console.log(appDocs);

  return (
    <div className="w-full max-w-full p-4 sm:p-6 pb-12 space-y-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.push("/admin/applications")}
          className="flex items-center gap-2 text-sm text-primary-500 hover:text-brand-600 transition-colors group"
        >
          <FiArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          All Applications
        </button>

        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="size-14 shrink-0 bg-primary-50 rounded-xl overflow-hidden border border-primary-100 flex items-center justify-center">
                {universityLogo ? (
                  <img
                    src={universityLogo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <MdOutlineSchool className="size-7 text-primary-300" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <h1 className="text-xl font-bold text-primary-900 font-serif truncate">
                  {programName}
                </h1>
                <p className="text-sm text-primary-500 truncate">
                  {universityName}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-sm text-primary-600">
                    <FiUser className="size-3.5 text-primary-500" />
                    <span className="capitalize font-medium">
                      {studentName}
                    </span>
                  </div>
                  {studentEmail && (
                    <div className="flex items-center gap-1.5 text-sm text-primary-500">
                      <FiMail className="size-3.5 text-primary-500" />
                      <span>{studentEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative shrink-0 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => setStatusOpen(!statusOpen)}
                  disabled={updatingStatus}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all border ${getApplicationStatusColor(app.status)} ${updatingStatus ? "opacity-60" : "hover:opacity-90 cursor-pointer"}`}
                >
                  {updatingStatus
                    ? "Updating…"
                    : getApplicationStatusLabel(app.status)}
                  <FiChevronDown
                    className={`size-3.5 transition-transform ${statusOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {statusOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-primary-200 rounded-2xl shadow-lg py-2 z-50 max-h-72 overflow-y-auto"
                    >
                      {STATUS_LABELS.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => handleStatusChange(s.value)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${app.status === s.value ? "bg-brand-50 text-brand-700 font-medium" : "text-primary-700 hover:bg-primary-50"}`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`inline-block size-2 rounded-full ${getApplicationStatusColor(s.value).split(" ")[0]}`}
                            />
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex border-b border-primary-100">
            {(
              [
                {
                  key: "overview" as Tab,
                  label: "Application",
                  icon: FiFileText,
                },
                {
                  key: "profile" as Tab,
                  label: "Profile Form",
                  icon: FiUser,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all relative ${
                  activeTab === tab.key
                    ? "text-brand-600"
                    : "text-primary-500 hover:text-primary-700"
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="p-5 sm:p-6 space-y-8"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoCard
                    icon={<FiCalendar className="size-4" />}
                    label="Applied"
                    value={
                      app.created_at
                        ? new Date(app.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"
                    }
                  />
                  <InfoCard
                    icon={<FiClock className="size-4" />}
                    label="Last Updated"
                    value={formatRelativeTime(app.updated_at)}
                  />
                  <InfoCard
                    icon={<FiBookOpen className="size-4" />}
                    label="Program"
                    value={programName}
                    truncate
                  />
                  <InfoCard
                    icon={<MdOutlineSchool className="size-4" />}
                    label="University"
                    value={universityName || "N/A"}
                    truncate
                  />
                </div>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700">
                      Document Checklist
                    </h2>
                    {totalDocs > 0 && (
                      <span className="text-xs text-primary-500 font-medium">
                        {uploadedDocs}/{totalDocs} uploaded ({docProgress}%)
                      </span>
                    )}
                  </div>

                  {totalDocs > 0 && (
                    <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden mb-5">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${docProgress}%` }}
                      />
                    </div>
                  )}

                  {totalDocs === 0 ? (
                    <div className="bg-primary-50/50 rounded-xl p-6 text-center border border-primary-100">
                      <FiFileText className="size-6 text-primary-300 mx-auto mb-2" />
                      <p className="text-sm text-primary-500">
                        No document requirements configured for this program.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {requiredDocs.map((docKey) => {
                        const doc = appDocs[docKey];
                        const { icon, colorClass } = getDocumentStatusInfo(
                          doc?.status ?? "missing",
                        );
                        const isUploaded =
                          doc?.status === "uploaded" ||
                          doc?.status === "verified";

                        return (
                          <div
                            key={docKey}
                            className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                              isUploaded
                                ? "bg-green-50/50 border-green-100"
                                : "bg-white border-primary-100"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`shrink-0 ${colorClass}`}>
                                {icon}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-primary-900 truncate">
                                  {getDocumentLabel(docKey)}
                                </p>
                                <p
                                  className={`text-[10px] font-medium uppercase tracking-wider ${
                                    isUploaded
                                      ? "text-green-600"
                                      : "text-primary-400"
                                  }`}
                                >
                                  {doc?.status
                                    ? doc.status.replace(/_/g, " ")
                                    : "Missing"}
                                </p>
                              </div>
                            </div>
                            {doc?.url && (
                              <Link
                                href={doc.url}
                                target="_blank"
                                className="shrink-0 p-1.5 rounded-full text-primary-400 hover:text-brand-600 hover:bg-primary-50 transition-colors"
                              >
                                <FiDownload className="size-3.5" />
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 mb-3">
                    Application Timeline
                  </h2>
                  <div className="space-y-3">
                    {app.submitted_at && (
                      <TimelineItem
                        label="Submitted"
                        date={app.submitted_at}
                        icon={<FiCheckCircle className="size-3.5" />}
                        color="text-green-600 bg-green-50"
                      />
                    )}
                    <TimelineItem
                      label="Created"
                      date={app.created_at}
                      icon={<FiFileText className="size-3.5" />}
                      color="text-brand-600 bg-brand-50"
                    />
                    <TimelineItem
                      label="Last Modified"
                      date={app.updated_at}
                      icon={<FiClock className="size-3.5" />}
                      color="text-primary-500 bg-primary-50"
                    />
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {profile ? (
                  <ProfileDocument
                    profile={profile}
                    documents={docs}
                    email={studentEmail}
                    appDocuments={app.documents ?? null}
                    docRequirements={requiredDocs}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <div className="mx-auto size-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                      <FiUser className="size-7 text-primary-300" />
                    </div>
                    <h3 className="text-base font-semibold text-primary-900 font-serif mb-1">
                      No student profile
                    </h3>
                    <p className="text-primary-500 text-sm max-w-xs mx-auto">
                      The student has not completed their profile yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  truncate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="bg-primary-50/50 rounded-xl p-3.5 border border-primary-100 space-y-1.5">
      <div className="flex items-center gap-1.5 text-primary-400">{icon}</div>
      <p className="text-[10px] uppercase tracking-wider text-primary-400 font-medium">
        {label}
      </p>
      <p
        className={`text-sm capitalize font-medium text-primary-900 ${truncate ? "truncate" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  icon,
  color,
}: {
  label: string;
  date: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`size-7 rounded-full flex items-center justify-center shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary-800">{label}</p>
      </div>
      <span className="text-xs text-primary-500 shrink-0">
        {new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
