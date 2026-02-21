"use client";

import { useEffect, useState, use } from "react";
import { applicationService } from "@/lib/services/application.service";
import { Application, ApplicationDocument } from "@/lib/types/application";
import { DocumentKey, getDocumentLabel } from "@/lib/constants/documents";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import { DocumentStatus } from "@/lib/types/student";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getDocumentStatusInfo,
} from "@/lib/utils/application";

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

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);

        const data = await applicationService.getApplicationById(id);
        setApplication(data);
      } catch (error) {
        console.error("Failed to fetch application:", error);
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
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  if (loading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full size-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  if (!application)
    return <div className="p-10 text-center">Application not found</div>;

  const requirements = application.program?.document_requirements || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center text-sm text-primary-500 hover:text-primary-900 mb-4 transition-colors"
        >
          <FiArrowLeft className="mr-1" /> Back to Applications
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-primary-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary-50 rounded-lg overflow-hidden border border-primary-100 flex items-center justify-center">
              {application.program?.university?.logo_url ? (
                <img
                  src={application.program.university.logo_url}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-primary-300">
                  {application.program?.university?.name_en?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-900">
                {application.program?.name_en}
              </h1>
              <p className="text-primary-600">
                {application.program?.university?.name_en}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide ${getApplicationStatusColor(application.status)}`}
            >
              {getApplicationStatusLabel(application.status)}
            </span>
            <p className="text-xs text-primary-400 mt-2">
              ID: {application.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-100 bg-primary-50 flex justify-between items-center">
              <h2 className="font-semibold text-primary-900">
                Required Documents
              </h2>
              <span className="text-sm text-primary-500">
                {requirements.length} Items
              </span>
            </div>

            <div className="divide-y divide-primary-100">
              {requirements.map((docKey) => {
                const doc = application.documents?.[docKey];
                const status = doc?.status || "missing";

                return (
                  <div
                    key={docKey}
                    className="p-6 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-primary-900">
                            {getDocumentLabel(docKey)}
                          </h3>
                          <StatusIcon status={status} />
                        </div>
                        <p className="text-sm text-primary-500 mb-3 max-w-md">
                          Required for admission processing.
                        </p>

                        {doc?.feedback && (
                          <div className="mt-2 text-sm bg-red-50 text-red-700 p-3 rounded-md border border-red-100">
                            <span className="font-semibold">Feedback:</span>{" "}
                            {doc.feedback}
                          </div>
                        )}

                        {doc?.url && (
                          <div className="flex items-center gap-2 text-sm font-medium text-brand-500 mt-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              View Document
                            </a>
                            <span className="text-primary-500 font-normal text-xs">
                              • Uploaded{" "}
                              {new Date(doc.uploaded_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {status === "verified" ? (
                          <span className="text-success text-sm font-medium flex items-center bg-success/20 px-3 py-1 rounded-full border border-success">
                            Verified
                          </span>
                        ) : (
                          <label
                            className={`
                                cursor-pointer inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-all
                                ${uploading === docKey ? "bg-primary-100 text-primary-400" : "bg-white border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"}
                            `}
                          >
                            {uploading === docKey ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />{" "}
                                Uploading...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <FiUploadCloud className="w-4 h-4" />{" "}
                                {doc ? "Replace" : "Upload"}
                              </span>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(docKey, file);
                              }}
                              disabled={uploading === docKey}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
            <h3 className="font-semibold text-primary-900 mb-4">
              Application Timeline
            </h3>
            <div className="relative border-l-2 border-primary-100 ml-3 space-y-6 pb-2">
              <TimelineItem
                active={true}
                completed={application.status !== "document_pending"}
                title="Document Submission"
                date={application.created_at}
              />
              <TimelineItem
                active={application.status === "applied"}
                completed={[
                  "processing",
                  "payment_pending",
                  "admission_success",
                ].includes(application.status)}
                title="University Review"
              />
              <TimelineItem
                active={application.status === "admission_success"}
                completed={application.status === "visa_granted"}
                title="Admission Decision"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: DocumentStatus | "missing" }) {
  const { icon, colorClass } = getDocumentStatusInfo(status);
  return <div className={colorClass}>{icon}</div>;
}

function TimelineItem({
  active,
  completed,
  title,
  date,
}: {
  active: boolean;
  completed: boolean;
  title: string;
  date?: string;
}) {
  return (
    <div className="ml-6 relative">
      <div
        className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${completed ? "bg-success border-success" : active ? "bg-brand-600 border-brand-600" : "bg-white border-primary-300"}`}
      ></div>
      <p
        className={`text-sm font-medium ${completed || active ? "text-brand-500" : "text-primary-400"}`}
      >
        {title}
      </p>
      {date && (
        <p className="text-xs text-primary-500 mt-1">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
