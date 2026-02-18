import { ApplicationStatus } from "@/lib/types/application";
import { DocumentStatus } from "@/lib/types/student";
import { FiCheckCircle, FiAlertCircle, FiXCircle } from "react-icons/fi";
import React from "react";

/**
 * Returns the Tailwind CSS classes for the status badge based on application status.
 */
export function getApplicationStatusColor(
  status: ApplicationStatus | string | null | undefined,
): string {
  if (!status) return "bg-primary-100 text-primary-800";
  switch (status) {
    case "document_pending":
      return "bg-yellow-100 text-yellow-800";
    case "applied":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-indigo-100 text-indigo-800";
    case "payment_pending":
      return "bg-orange-100 text-orange-800";
    case "admission_success":
      return "bg-green-100 text-green-800";
    case "admission_failure":
      return "bg-red-100 text-red-800";
    case "visa_granted":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-primary-100 text-primary-800";
  }
}

/**
 * Returns a human-readable label for the application status.
 */
export function getApplicationStatusLabel(
  status: ApplicationStatus | string | null | undefined,
): string {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ");
}

/**
 * Returns the icon component and color class for a document status.
 */
export function getDocumentStatusInfo(
  status: DocumentStatus | "missing" | null | undefined,
): {
  icon: React.ReactNode;
  colorClass: string;
} {
  switch (status) {
    case "verified":
      return {
        icon: <FiCheckCircle className="size-4" />,
        colorClass: "text-success",
      };
    case "uploaded":
      return {
        icon: <FiCheckCircle className="size-4" />,
        colorClass: "text-brand-500",
      };
    case "rejected":
      return {
        icon: <FiXCircle className="size-4" />,
        colorClass: "text-red-500",
      };
    case "needs_correction":
      return {
        icon: <FiAlertCircle className="size-4" />,
        colorClass: "text-orange-500",
      };
    case "missing":
    default:
      return {
        icon: (
          <div className="size-4 rounded-full border-2 border-primary-200" />
        ),
        colorClass: "text-primary-300",
      };
  }
}

/**
 * Returns the color class for the document status text/badge.
 */
export function getDocumentStatusColor(
  status: DocumentStatus | "missing" | null | undefined,
): string {
  switch (status) {
    case "verified":
      return "text-success bg-success/10 border-success/20";
    case "uploaded":
      return "text-brand-600 bg-brand-50 border-brand-100";
    case "rejected":
      return "text-red-700 bg-red-50 border-red-100";
    case "needs_correction":
      return "text-orange-700 bg-orange-50 border-orange-100";
    case "missing":
    default:
      return "text-primary-500 bg-primary-50 border-primary-100";
  }
}
