"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiUser,
  FiBookOpen,
  FiFileText,
  FiMail,
  FiRotateCcw,
  FiMessageSquare,
  FiAlertTriangle,
  FiDownload,
  FiCalendar,
  FiEdit,
  FiUploadCloud,
} from "react-icons/fi";
import { MdHistory, MdOutlineSchool } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { applicationRepository } from "@/lib/repositories/application.repo";
import { applicationService } from "@/lib/services/application.service";
import { studentRepository } from "@/lib/repositories/student.repo";
import {
  Application,
  ApplicationStatus,
  ApplicationStatusHistory,
  APPLICATION_STATUSES,
  ApplicationNote,
  NoteVisibility,
} from "@/lib/types/application";
import {
  StudentProfile,
  StudentDocuments,
  DocumentStatus,
} from "@/lib/types/student";
import { DocumentKey, getDocumentLabel } from "@/lib/constants/documents";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getApplicationStatusMeta,
  getDocumentStatusMeta,
  formatRelativeTime,
} from "@/lib/utils/application";
import { ProfileDocument } from "@/components/shared/ProfileDocument";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GrNote } from "react-icons/gr";
import { createClient } from "@/lib/supabase/client";

type Tab = "documents" | "form" | "profile" | "history";

export default function CounselorApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [counselorId, setCounselorId] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [docs, setDocs] = useState<StudentDocuments | null>(null);
  const [statusHistory, setStatusHistory] = useState<
    ApplicationStatusHistory[]
  >([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(
    null,
  );
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteVisibility, setNoteVisibility] =
    useState<NoteVisibility>("private");

  const [selectedDocKey, setSelectedDocKey] = useState<DocumentKey | null>(
    null,
  );
  const [docNewStatus, setDocNewStatus] = useState<DocumentStatus | "">("");
  const [docFeedback, setDocFeedback] = useState("");
  const [updatingDoc, setUpdatingDoc] = useState(false);

  const [uploadingAdminDoc, setUploadingAdminDoc] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Get counselor id on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCounselorId(user.id);
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!id || !counselorId) return;
    setLoading(true);
    try {
      const application = await applicationRepository.getApplicationById(id);

      // Guard: counselor may only view their assigned applications
      if (application.counselor_id !== counselorId) {
        setNotFound(true);
        return;
      }

      setApp(application);

      const [studentProfile, studentDocs, history, fetchedNotes] =
        await Promise.all([
          application.student_id
            ? studentRepository.getProfile(application.student_id)
            : Promise.resolve(null),
          application.student_id
            ? studentRepository.getDocuments(application.student_id)
            : Promise.resolve(null),
          applicationRepository.getStatusHistory(id),
          applicationRepository.getNotes(id),
        ]);

      setProfile(studentProfile);
      setDocs(studentDocs);
      setStatusHistory(history);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error("Failed to load application:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, counselorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusSelect = (status: ApplicationStatus) => {
    if (status === app?.status) return;
    setPendingStatus(status);
    setStatusNote("");
  };

  const handleStatusConfirm = async () => {
    if (!app || !pendingStatus) return;
    setUpdatingStatus(true);
    try {
      await applicationRepository.updateStatus(
        app.id,
        pendingStatus,
        statusNote || undefined,
      );
      setApp((prev) => (prev ? { ...prev, status: pendingStatus } : prev));
      const history = await applicationRepository.getStatusHistory(app.id);
      setStatusHistory(history);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
      setPendingStatus(null);
      setStatusNote("");
    }
  };

  const handleUndo = async () => {
    if (!app) return;
    setUndoing(true);
    try {
      await applicationRepository.undoLastStatus(app.id);
      const updated = await applicationRepository.getApplicationById(app.id);
      setApp(updated);
      const history = await applicationRepository.getStatusHistory(app.id);
      setStatusHistory(history);
    } catch (err) {
      console.error("Failed to undo status:", err);
    } finally {
      setUndoing(false);
      setConfirmUndo(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const added = await applicationRepository.addNote(
        app.id,
        newNote.trim(),
        noteVisibility,
      );
      setNotes((prev) => [added, ...prev]);
      setIsAddingNote(false);
      setNewNote("");
      setNoteVisibility("private");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateDocStatus = async () => {
    if (!app || !selectedDocKey || !docNewStatus) return;
    setUpdatingDoc(true);
    try {
      const currentDocs = { ...(app.documents ?? {}) };
      const existing = currentDocs[selectedDocKey] ?? {};
      const existingDoc = existing as any;
      currentDocs[selectedDocKey] = {
        url: existingDoc.url ?? "",
        file_name: existingDoc.file_name ?? "",
        uploaded_at: existingDoc.uploaded_at ?? new Date().toISOString(),
        ...existing,
        status: docNewStatus as DocumentStatus,
        ...(docFeedback.trim()
          ? { feedback: docFeedback.trim() }
          : { feedback: undefined }),
      };
      await applicationRepository.updateApplicationDocuments(
        app.id,
        currentDocs,
      );
      setApp((prev) => (prev ? { ...prev, documents: currentDocs } : prev));
      setSelectedDocKey(null);
      setDocNewStatus("");
      setDocFeedback("");
    } catch (err) {
      console.error("Failed to update document status:", err);
    } finally {
      setUpdatingDoc(false);
    }
  };

  const handleAdminUpload = async () => {
    if (!app || !profile || !uploadFile || !uploadTitle.trim()) return;
    setUploadingAdminDoc(true);
    try {
      await applicationService.uploadAdminDocument(
        app.id,
        uploadFile,
        profile.id,
        uploadTitle.trim(),
        uploadDescription.trim(),
      );
      const updatedApp = await applicationRepository.getApplicationById(app.id);
      setApp(updatedApp);
      setUploadTitle("");
      setUploadDescription("");
      setUploadFile(null);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Failed to upload document:", error);
    } finally {
      setUploadingAdminDoc(false);
    }
  };

  const focusHistory = () => {
    setActiveTab("history");
    const historySection = document.getElementById("history");
    if (historySection) historySection.scrollIntoView({ behavior: "smooth" });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ProgressiveLoader message="Loading application…" isAdmin />
      </div>
    );
  }

  // ── Not found / not assigned ───────────────────────────────────────────────
  if (notFound || !app) {
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
            This application may not be assigned to you.
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

  const lastHistory = statusHistory[0] ?? null;
  const canUndo = statusHistory.length > 0;

  return (
    <>
      <ConfirmModal
        isOpen={!!pendingStatus}
        onClose={() => {
          setPendingStatus(null);
          setStatusNote("");
        }}
        onConfirm={handleStatusConfirm}
        title={`Change Status to ${getApplicationStatusLabel(pendingStatus)}`}
        confirmLabel="Confirm"
        isLoading={updatingStatus}
        variant="warning"
      >
        <div className="space-y-2 mt-2">
          <label className="text-sm flex flex-col gap-1 font-semibold text-primary-900">
            Add a Note (Optional)
            <span className="text-xs font-medium text-primary-500">
              This note will be visible to the student.
            </span>
          </label>
          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            className="w-full h-24 px-3 py-2 rounded-xl border mt-2 border-primary-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none text-sm placeholder:text-primary-300"
            placeholder="E.g., Missing documents"
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirmUndo}
        onClose={() => setConfirmUndo(false)}
        onConfirm={handleUndo}
        title="Undo Last Status Change"
        message={
          lastHistory
            ? `This will revert the status back to "${getApplicationStatusLabel(lastHistory.from_status)}". The change will be marked as reverted in the audit log.`
            : "Undo the last status change?"
        }
        confirmLabel="Undo"
        isLoading={undoing}
        variant="warning"
      />

      {(() => {
        const dk = selectedDocKey;
        if (!dk) return null;
        const currentDoc = appDocs[dk];
        const { color } = getDocumentStatusMeta(
          currentDoc?.status ?? "missing",
        );
        const statusChanged =
          docNewStatus !== "" && docNewStatus !== currentDoc?.status;
        return (
          <ConfirmModal
            isOpen={!!dk}
            onClose={() => {
              setSelectedDocKey(null);
              setDocNewStatus("");
              setDocFeedback("");
            }}
            onConfirm={handleUpdateDocStatus}
            title={getDocumentLabel(dk)}
            confirmLabel="Save Changes"
            isLoading={updatingDoc}
            variant="default"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-lg border ${color}`}
                >
                  {currentDoc?.status
                    ? currentDoc.status.replace(/_/g, " ")
                    : "Missing"}
                </span>
              </div>
              <div className="rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 border border-primary-100">
                <div className="space-y-1">
                  {currentDoc?.file_name && (
                    <p className="text-xs font-medium text-primary-600 truncate max-w-[200px]">
                      {currentDoc.file_name}
                    </p>
                  )}
                  {currentDoc?.uploaded_at && (
                    <div className="flex items-center gap-1.5 text-xs text-primary-500">
                      <FiCalendar className="size-3" />
                      <span>
                        {new Date(currentDoc.uploaded_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                  {!currentDoc && (
                    <p className="text-xs text-primary-400">N/A</p>
                  )}
                </div>
                {currentDoc?.url ? (
                  <Link
                    href={currentDoc.url}
                    target="_blank"
                    download={currentDoc.file_name ?? true}
                    className="flex items-center justify-center p-2 rounded-lg bg-white border border-primary-200 hover:border-brand-400 text-brand-600 hover:text-brand-700 transition-all shadow-sm"
                  >
                    <FiDownload className="size-4" />
                  </Link>
                ) : (
                  <span className="text-xs text-primary-400 font-medium">
                    No file uploaded
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-primary-900">
                  Change Status
                </label>
                <Select
                  textClassName="text-sm"
                  value={docNewStatus || (currentDoc?.status ?? "")}
                  onChange={(val) => setDocNewStatus(val as DocumentStatus)}
                  options={[
                    { value: "uploaded", label: "Uploaded" },
                    { value: "verified", label: "Verified" },
                    { value: "needs_correction", label: "Needs Correction" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                  placeholder="Select status…"
                />
              </div>
              {statusChanged && (
                <div className="space-y-1.5">
                  <label className="text-sm mb-1.5 font-semibold text-primary-900 flex flex-col gap-1">
                    Note / Feedback
                    <span className="text-xs font-medium text-warning">
                      This will be visible to the student.
                    </span>
                  </label>
                  <textarea
                    value={docFeedback}
                    onChange={(e) => setDocFeedback(e.target.value)}
                    className="w-full h-24 px-3 py-2 rounded-xl border border-primary-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none text-sm placeholder:text-primary-300 mt-1"
                    placeholder={
                      docNewStatus === "needs_correction"
                        ? "E.g., Please upload a clearer scan of page 1."
                        : "Optional note for the student…"
                    }
                    autoFocus
                  />
                </div>
              )}
            </div>
          </ConfirmModal>
        );
      })()}

      {isAddingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-primary-200 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-primary-100 flex items-center justify-between bg-primary-50/50">
              <h3 className="text-lg font-bold text-primary-900">Add Note</h3>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-primary-400 hover:text-primary-700 transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddNote} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary-900">
                  Note Visibility
                </label>
                <div className="flex gap-4">
                  {(["private", "public"] as NoteVisibility[]).map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={v}
                        checked={noteVisibility === v}
                        onChange={(e) =>
                          setNoteVisibility(e.target.value as NoteVisibility)
                        }
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-primary-700 capitalize">
                        {v === "private"
                          ? "Private (Counselors Only)"
                          : "Public (Visible to Student)"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary-900">
                  Message
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-primary-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none text-sm placeholder:text-primary-300"
                  placeholder="Type your note here..."
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-900 bg-white border border-primary-200 hover:border-primary-300 hover:bg-primary-50 rounded-xl transition-all"
                  disabled={addingNote}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  disabled={!newNote.trim() || addingNote}
                >
                  {addingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pb-16">
        <button
          type="button"
          onClick={() => router.push("/counselor/applications")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mt-2 uppercase tracking-wider group"
        >
          <FiArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          My Applications
        </button>

        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
          <div className="grow w-full xl:w-2/3 space-y-6 min-w-0">
            <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-br from-brand-100/40 via-primary-50/50 to-white -z-10" />
              <div
                className={`h-1.5 w-full ${getApplicationStatusColor(app.status).split(" ")[0] || "bg-brand-500"}`}
              />
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-5">
                  <div className="size-16 sm:size-20 shrink-0 bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden flex items-center justify-center p-2">
                    {universityLogo ? (
                      <img
                        src={universityLogo}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <MdOutlineSchool className="size-8 sm:size-10 text-primary-300" />
                    )}
                  </div>
                  <div className="min-w-0 pt-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-primary-900 leading-tight">
                      {programName}
                    </h1>
                    <p className="text-sm sm:text-base text-primary-500 mt-1">
                      {universityName}
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border shadow-sm ${getApplicationStatusColor(app.status)}`}
                      >
                        {getApplicationStatusLabel(app.status)}
                      </span>
                      <span className="text-xs font-mono font-medium text-primary-500 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                        ID: {app.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl p-4 sm:p-5 border border-primary-100 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-primary-700 font-medium">
                    <FiUser className="size-4 text-primary-400 shrink-0" />
                    <span>{studentName}</span>
                  </div>
                  {studentEmail && (
                    <div className="flex items-center gap-2 text-sm text-primary-600 font-medium">
                      <FiMail className="size-4 text-primary-400 shrink-0" />
                      <span>{studentEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border min-h-[40vh] border-primary-100 shadow-sm overflow-hidden w-full min-w-0">
              <div className="flex border-b border-primary-100 px-6 sm:px-8 pt-6 gap-8 overflow-x-auto scrollbar-none">
                {(
                  [
                    {
                      key: "profile" as Tab,
                      label: "Student Profile",
                      icon: FiUser,
                    },
                    {
                      key: "documents" as Tab,
                      label: "Documents",
                      icon: FiFileText,
                    },
                    {
                      key: "form" as Tab,
                      label: "Application Form",
                      icon: FiBookOpen,
                    },
                    { key: "history" as Tab, label: "History", icon: FiClock },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative whitespace-nowrap border-b-2 ${
                      activeTab === tab.key
                        ? "text-brand-600 border-brand-600"
                        : "text-primary-500 hover:text-primary-800 border-transparent hover:border-primary-300"
                    }`}
                  >
                    <tab.icon
                      className={`size-4 shrink-0 transition-colors ${activeTab === tab.key ? "text-brand-600" : "text-primary-400"}`}
                    />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 sm:p-8 space-y-8"
                  >
                    {!profile ? (
                      <div className="p-10 text-center">
                        <div className="mx-auto size-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                          <FiUser className="size-8 text-primary-300" />
                        </div>
                        <h3 className="text-lg font-bold text-primary-900 mb-2">
                          No student profile
                        </h3>
                        <p className="text-primary-500 text-sm max-w-sm mx-auto leading-relaxed">
                          The student has not completed their profile yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-4 border-b border-primary-100 pb-2">
                            Personal Details
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-6 gap-x-4">
                            {[
                              { label: "Full Name", value: studentName },
                              {
                                label: "Nationality",
                                value: profile.nationality,
                              },
                              {
                                label: "Gender",
                                value: profile.gender,
                                capitalize: true,
                              },
                              {
                                label: "Date of Birth",
                                value: profile.date_of_birth
                                  ? new Date(
                                      profile.date_of_birth,
                                    ).toLocaleDateString()
                                  : null,
                              },
                              { label: "Religion", value: profile.religion },
                              {
                                label: "Mother Tongue",
                                value: profile.mother_tongue,
                              },
                              {
                                label: "Marital Status",
                                value: profile.marital_status,
                              },
                            ].map((item, i) => (
                              <div key={i}>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-2">
                                  {item.label}
                                </p>
                                {item.value ? (
                                  <p
                                    className={`text-sm md:text-[15px] font-medium text-primary-900 ${(item as any).capitalize ? "capitalize" : ""}`}
                                  >
                                    {item.value}
                                  </p>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-amber-600">
                                    <FiAlertTriangle className="size-3.5 shrink-0" />
                                    <span className="text-xs font-semibold">
                                      Missing
                                    </span>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-4 border-b border-primary-100 pb-2">
                            Contact Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                            {[
                              { label: "Email", value: studentEmail },
                              {
                                label: "Phone Number",
                                value: profile.phone_number,
                              },
                              {
                                label: "WhatsApp",
                                value: profile.whatsapp_number,
                              },
                            ].map((item, i) => (
                              <div key={i}>
                                <p className="text-[10px] uppercase tracking-widest text-primary-400 font-bold mb-2">
                                  {item.label}
                                </p>
                                {item.value ? (
                                  <p className="text-sm md:text-[15px] font-medium text-primary-900">
                                    {item.value}
                                  </p>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-amber-600">
                                    <FiAlertTriangle className="size-3.5 shrink-0" />
                                    <span className="text-xs font-semibold">
                                      Missing
                                    </span>
                                  </span>
                                )}
                              </div>
                            ))}
                            <div className="sm:col-span-2">
                              <p className="text-[10px] uppercase tracking-widest text-primary-400 font-bold mb-2">
                                Home Address
                              </p>
                              {profile.address ? (
                                <p className="text-sm md:text-[15px] font-medium text-primary-900">
                                  {profile.address}
                                  {profile.city ? `, ${profile.city}` : ""}
                                  {profile.zip_code
                                    ? `, ${profile.zip_code}`
                                    : ""}
                                </p>
                              ) : (
                                <span className="flex items-center gap-1.5 text-amber-600">
                                  <FiAlertTriangle className="size-3.5 shrink-0" />
                                  <span className="text-xs font-semibold">
                                    Missing
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-4 border-b border-primary-100 pb-2">
                            Passport & Travel Details
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-6 gap-x-4">
                            {[
                              {
                                label: "Passport Number",
                                value: profile.passport_number,
                              },
                              {
                                label: "Passport Expiry",
                                value: profile.passport_expiry
                                  ? new Date(
                                      profile.passport_expiry,
                                    ).toLocaleDateString()
                                  : null,
                              },
                              {
                                label: "In China Now?",
                                value: profile.in_china_now ? "Yes" : "No",
                              },
                              {
                                label: "Visited China Before?",
                                value: profile.has_visited_china ? "Yes" : "No",
                              },
                            ].map((item, i) => (
                              <div key={i}>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1">
                                  {item.label}
                                </p>
                                {item.value ? (
                                  <p className="text-sm font-medium text-primary-900">
                                    {item.value}
                                  </p>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-amber-600">
                                    <FiAlertTriangle className="size-3.5 shrink-0" />
                                    <span className="text-xs font-semibold">
                                      Missing
                                    </span>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-4 border-b border-primary-100 pb-2">
                            Education History
                          </h3>
                          {profile.education_history &&
                          profile.education_history.length > 0 ? (
                            <div className="space-y-6">
                              {profile.education_history.map((edu, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-l-2 border-primary-200 pl-4"
                                >
                                  <div>
                                    <h4 className="font-semibold text-primary-900">
                                      {edu.schoolName}
                                    </h4>
                                    <p className="text-sm font-medium text-primary-600 mt-0.5">
                                      {edu.fieldOfStudy || "General Studies"} •{" "}
                                      <span className="text-primary-500">
                                        {edu.level}
                                      </span>
                                    </p>
                                    {edu.gpa && (
                                      <p className="text-xs font-semibold text-primary-500 mt-1">
                                        GPA: {edu.gpa}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-sm font-medium text-primary-400 mt-1 sm:mt-0">
                                    {new Date(edu.startDate).getFullYear()} –{" "}
                                    {new Date(edu.endDate).getFullYear()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-primary-500">
                              No education history recorded.
                            </p>
                          )}
                        </div>

                        {profile.family_info &&
                          Object.keys(profile.family_info).length > 0 && (
                            <div>
                              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-4 border-b border-primary-100 pb-2">
                                Family Information
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                {(
                                  ["father", "mother", "guardian"] as const
                                ).map((role) => {
                                  const member = profile.family_info?.[role];
                                  if (!member || !member.name) return null;
                                  return (
                                    <div key={role}>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1 capitalize">
                                        {role}
                                      </p>
                                      <p className="font-bold text-sm text-primary-900">
                                        {member.name}
                                      </p>
                                      <div className="mt-1 space-y-0.5 text-sm font-medium text-primary-600">
                                        {member.age && <p>Age: {member.age}</p>}
                                        {member.jobtitle && (
                                          <p>Job: {member.jobtitle}</p>
                                        )}
                                        {member.phone && <p>{member.phone}</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "documents" && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 sm:p-8 space-y-8"
                  >
                    {totalDocs === 0 ? (
                      <div className="bg-primary-50/50 rounded-2xl p-8 text-center border border-dashed border-primary-200">
                        <FiFileText className="size-8 text-primary-300 mx-auto mb-3" />
                        <p className="text-sm text-primary-500 font-medium">
                          No documents required for this program.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-5 mb-6">
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
                                strokeDasharray={`${Math.round((uploadedDocs / totalDocs) * 97.4)} 97.4`}
                                className={
                                  uploadedDocs === totalDocs
                                    ? "text-brand-500"
                                    : "text-brand-400"
                                }
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary-900">
                                {uploadedDocs}/{totalDocs}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-bold text-primary-900">
                              {uploadedDocs === totalDocs
                                ? "All documents submitted"
                                : `${totalDocs - uploadedDocs} document${totalDocs - uploadedDocs === 1 ? "" : "s"} pending`}
                            </p>
                            <p className="text-sm text-primary-500 font-medium mt-0.5">
                              {uploadedDocs} of {totalDocs} required documents
                              received
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {[...requiredDocs]
                            .sort((a, b) => {
                              const order = (k: string) => {
                                const s = appDocs[k as typeof a]?.status;
                                if (
                                  !s ||
                                  s === "rejected" ||
                                  s === "needs_correction"
                                )
                                  return 0;
                                return 1;
                              };
                              return order(a) - order(b);
                            })
                            .map((docKey) => {
                              const doc = appDocs[docKey];
                              const { icon, color } = getDocumentStatusMeta(
                                doc?.status ?? "missing",
                              );
                              const rowColors = color
                                .split(" ")
                                .filter(
                                  (c) =>
                                    c.startsWith("bg-") ||
                                    c.startsWith("border-"),
                                )
                                .join(" ");
                              return (
                                <div
                                  key={docKey}
                                  className={`w-full flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${rowColors}`}
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div
                                      className={`size-12 rounded-xl flex items-center justify-center border shrink-0 ${color}`}
                                    >
                                      {icon}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-base font-medium text-primary-900 tracking-tight truncate">
                                        {getDocumentLabel(docKey)}
                                      </h4>
                                      <span
                                        className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-lg border mt-1 inline-block ${color}`}
                                      >
                                        {doc?.status
                                          ? doc.status.replace(/_/g, " ")
                                          : "Missing"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      title="Edit Status"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDocKey(docKey);
                                        setDocNewStatus(doc?.status ?? "");
                                        setDocFeedback(doc?.feedback ?? "");
                                      }}
                                      className="p-2 rounded-lg text-primary-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all"
                                    >
                                      <FiEdit className="size-4" />
                                    </button>
                                    {doc?.url && (
                                      <Link
                                        href={doc.url}
                                        target="_blank"
                                        title="Download"
                                        className="p-2 rounded-lg text-primary-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all active:scale-95"
                                      >
                                        <FiDownload className="size-4.5" />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
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
                      <div className="p-10 text-center">
                        <div className="mx-auto size-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                          <FiUser className="size-8 text-primary-300" />
                        </div>
                        <h3 className="text-lg font-bold text-primary-900 mb-2">
                          No Application Form
                        </h3>
                        <p className="text-primary-500 text-sm max-w-sm mx-auto leading-relaxed">
                          The student has not completed their application form
                          yet.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    key="history"
                    id="history"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 sm:p-8 space-y-8"
                  >
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
                                    isFirst ? "bg-brand-500" : "bg-primary-300",
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
                                        {entry.reverted && (
                                          <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                                            Reverted
                                          </span>
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
                                    <div className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100/50">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full lg:w-1/3 shrink-0 flex flex-col gap-6 lg:sticky lg:top-8">
            <div className="bg-white rounded-3xl border border-primary-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary-900">
                    Application Status
                  </h3>
                  <p className="text-sm text-primary-500 font-medium mb-3 mt-1">
                    Update the status of this application.
                  </p>
                </div>
                <Select
                  value={app.status}
                  onChange={(val) =>
                    handleStatusSelect(val as ApplicationStatus)
                  }
                  options={APPLICATION_STATUSES.map((s) => ({
                    label: getApplicationStatusLabel(s),
                    value: s,
                  }))}
                  disabled={updatingStatus}
                  textClassName="font-semibold text-sm"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={focusHistory}
                    className="flex justify-end items-center gap-1.5 text-xs text-brand-600 font-medium hover:underline hover:text-primary-700 transition-colors mt-1"
                  >
                    <FiClock className="size-3" />
                    History
                  </button>
                  {canUndo && (
                    <button
                      type="button"
                      onClick={() => setConfirmUndo(true)}
                      disabled={undoing}
                      className="flex justify-end items-center gap-1.5 text-xs text-primary-500 font-medium hover:underline hover:text-primary-700 transition-colors mt-1 disabled:opacity-50"
                    >
                      <FiRotateCcw className="size-3" />
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="py-6 px-6 bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold tracking-wide text-primary-900 uppercase">
                  User Downloads
                </h3>
              </div>
              <div className="space-y-3 mb-4">
                {app.user_downloads.length === 0 ? (
                  <div className="py-4">
                    <p className="text-sm text-primary-500">
                      Upload documents such as Offer letter for students to
                      download.
                    </p>
                  </div>
                ) : (
                  app.user_downloads.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-primary-100 bg-primary-50/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-white border border-primary-200 flex items-center justify-center shrink-0">
                          <FiFileText className="size-4 text-brand-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary-900 truncate">
                            {doc.title}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-primary-500 mt-0.5 line-clamp-1">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-[10px] uppercase tracking-wide text-primary-400 font-medium mt-1">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-brand-200"
                      >
                        <FiDownload className="size-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-auto border-t border-primary-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="w-full py-2.5 items-center justify-center flex gap-2 bg-white border border-primary-200 hover:border-brand-300 hover:bg-brand-50 text-sm font-bold text-brand-600 hover:text-brand-700 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <FiUploadCloud className="size-4" />
                  Add Document
                </button>
              </div>
            </div>

            <div className="py-6 px-6 bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold tracking-wide text-primary-900 uppercase flex items-center gap-2">
                  <FiMessageSquare className="size-4 text-primary-400" />
                  Application Notes
                </h3>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-primary-300 p-8 py-12 flex flex-col items-center gap-2 text-center text-primary-500 text-sm font-medium">
                    <GrNote className="size-6" />
                    No notes yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-2xl border ${
                          note.visibility === "public"
                            ? "bg-white border-primary-200"
                            : "bg-amber-50/50 border-amber-200/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary-900">
                              {note.author?.full_name || "Unknown"}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                                note.visibility === "public"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                              }`}
                            >
                              {note.visibility}
                            </span>
                          </div>
                          <span className="text-xs text-primary-400 font-medium whitespace-nowrap">
                            {formatRelativeTime(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-wrap">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-primary-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(true)}
                  className="w-full py-2.5 items-center justify-center flex gap-2 bg-white border border-primary-200 hover:border-brand-300 hover:bg-brand-50 text-sm font-bold text-brand-600 hover:text-brand-700 rounded-xl transition-all shadow-xs"
                >
                  + Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !uploadingAdminDoc && setShowUploadModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl border border-primary-100 w-full max-w-md overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-primary-100">
                <h3 className="text-base font-bold text-primary-900">
                  Upload Document
                </h3>
                <p className="text-sm text-primary-500 mt-1">
                  This document will be available for the student to download.
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1.5 block">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Offer Letter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm text-primary-900 placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1.5 block">
                    Description
                  </label>
                  <input
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="e.g. Official offer letter from the university"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-200 text-sm text-primary-900 placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1.5 block">
                    File *
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-primary-200 hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition-all">
                    {uploadFile ? (
                      <span className="text-sm font-medium text-primary-700 truncate">
                        {uploadFile.name}
                      </span>
                    ) : (
                      <>
                        <FiUploadCloud className="size-5 text-primary-400" />
                        <span className="text-sm font-medium text-primary-400">
                          Choose a file
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadFile(file);
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-primary-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadTitle("");
                    setUploadDescription("");
                    setUploadFile(null);
                  }}
                  disabled={uploadingAdminDoc}
                  className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminUpload}
                  disabled={
                    uploadingAdminDoc || !uploadTitle.trim() || !uploadFile
                  }
                  className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadingAdminDoc ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
