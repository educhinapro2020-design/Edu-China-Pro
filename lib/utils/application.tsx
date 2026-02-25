import { ApplicationStatus } from "@/lib/types/application";
import { DocumentStatus } from "@/lib/types/student";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import React from "react";
import { MdOutlineVerified } from "react-icons/md";

type ApplicationStatusMeta = {
  label: string;
  color: string;
  description: string;
};

const APPLICATION_STATUS_META: Record<string, ApplicationStatusMeta> = {
  draft: {
    label: "Draft",
    color: "bg-primary-100 text-primary-700",
    description:
      "Your application has been created. Please ensure all required documents are uploaded before submission.",
  },
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-700",
    description:
      "Your application has been submitted and is awaiting review by our admissions team.",
  },
  reviewing: {
    label: "Reviewing",
    color: "bg-indigo-100 text-indigo-700",
    description:
      "Our team is carefully reviewing your application and documents.",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    description:
      "Your application has been approved internally and is ready to proceed to the next stage.",
  },
  action_required: {
    label: "Action Required",
    color: "bg-orange-100 text-orange-700",
    description:
      "We need additional information or corrections from you. Please check the messages tab for details.",
  },
  application_fee_pending: {
    label: "Application Fee Pending",
    color: "bg-yellow-100 text-yellow-700",
    description:
      "Please complete the university application fee payment to proceed. Contact your counselor for payment details.",
  },
  application_fee_paid: {
    label: "Application Fee Paid",
    color: "bg-sky-100 text-sky-700",
    description:
      "Your application fee has been received. We will now proceed to submit your application to the university.",
  },
  applied_to_university: {
    label: "Applied to University",
    color: "bg-violet-100 text-violet-700",
    description:
      "Your application has been officially submitted to the university and is under their review.",
  },
  admission_success: {
    label: "Admission Successful",
    color: "bg-green-100 text-green-800",
    description:
      "Congratulations! The university has accepted your application.",
  },
  admission_failure: {
    label: "Admission Unsuccessful",
    color: "bg-red-100 text-red-700",
    description:
      "Unfortunately, the university was unable to offer you admission at this time. Please contact your counselor to discuss next steps.",
  },
  offer_letter: {
    label: "Offer Letter Issued",
    color: "bg-fuchsia-100 text-fuchsia-700",
    description:
      "Your official offer letter has been uploaded. Please review it in the documents section.",
  },
  ecp_fee_pending: {
    label: "ECP Service Fee Pending",
    color: "bg-amber-100 text-amber-700",
    description:
      "Please complete the EduChinaPro service fee payment to continue with your visa processing. Contact your counselor for payment details.",
  },
  ecp_fee_paid: {
    label: "ECP Service Fee Paid",
    color: "bg-teal-100 text-teal-700",
    description:
      "Your EduChinaPro service fee has been received. We will now begin processing your JW form.",
  },
  jw_form_received: {
    label: "JW Form Received",
    color: "bg-cyan-100 text-cyan-700",
    description:
      "Your JW202 admission notice has been received from the university. Visa document preparation is underway.",
  },
  visa_docs_ready: {
    label: "Visa Docs Ready",
    color: "bg-purple-100 text-purple-700",
    description:
      "All your visa application documents are prepared and ready for submission to the embassy.",
  },
  visa_granted: {
    label: "Visa Granted",
    color: "bg-emerald-600 text-white",
    description:
      "Congratulations! Your student visa has been granted. You are ready to begin your journey to China.",
  },
};

/**
 * Returns the full meta (label, color, description) for an application status.
 */
export function getApplicationStatusMeta(
  status: ApplicationStatus | string | null | undefined,
): ApplicationStatusMeta {
  if (!status) {
    return {
      label: "Unknown",
      color: "bg-primary-100 text-primary-700",
      description: "",
    };
  }
  return (
    APPLICATION_STATUS_META[status as string] ?? {
      label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "bg-primary-100 text-primary-700",
      description: "",
    }
  );
}

export function getApplicationStatusColor(
  status: ApplicationStatus | string | null | undefined,
): string {
  return getApplicationStatusMeta(status).color;
}

export function getApplicationStatusLabel(
  status: ApplicationStatus | string | null | undefined,
): string {
  return getApplicationStatusMeta(status).label;
}

/**
 * Formats a date string into a relative human-readable time (e.g., "2h ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Extracts initials from a full name.
 */
export function getStudentInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type DocumentStatusMeta = {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
};

/**
 * Returns the full meta (label, color, icon, description) for a document status.
 */
export function getDocumentStatusMeta(
  status: DocumentStatus | "missing" | null | undefined,
): DocumentStatusMeta {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        color: "text-success bg-success/10 border-success/20",
        icon: <MdOutlineVerified className="size-4" />,
        description: "This document has been verified by our team.",
      };
    case "uploaded":
      return {
        label: "Uploaded",
        color: "text-brand-600 bg-brand-50 border-brand-100",
        icon: <FiCheckCircle className="size-4" />,
        description: "Document uploaded and pending verification.",
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "text-error bg-error/10 border-error/20",
        icon: <FiXCircle className="size-4" />,
        description:
          "This document was rejected. Please upload a corrected version.",
      };
    case "needs_correction":
      return {
        label: "Needs Correction",
        color: "text-warning bg-warning/10 border-warning/20",
        icon: <FiAlertCircle className="size-4" />,
        description:
          "This document requires corrections. Check the messages tab for details.",
      };
    case "missing":
    default:
      return {
        label: "Missing",
        color: "text-warning bg-warning/10 border-warning/20",
        icon: <FiAlertTriangle className="size-4" />,
        description: "This document has not been uploaded yet.",
      };
  }
}
