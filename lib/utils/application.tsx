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
  visa_rejected: {
    label: "Visa Rejected",
    color: "bg-red-100 text-red-700",
    description:
      "Unfortunately, your student visa application was rejected by the embassy. Please contact your counselor to discuss next steps.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    description:
      "This application has been rejected by EduChinaPro's internal review. Please contact your counselor for details.",
  },
  dropped_off: {
    label: "Dropped Off",
    color: "bg-primary-100 text-primary-500",
    description: "The student has stopped responding / dropped off.",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "bg-primary-100 text-primary-500",
    description: "The student has withdrawn their application.",
  },
  closed: {
    label: "Closed",
    color: "bg-primary-100 text-primary-500",
    description: "This application has been closed.",
  },
};

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

export type AdminGuidanceEntry = {
  title: string;
  action: string;
  next?: string;
};

export const ADMIN_GUIDANCE: Record<string, AdminGuidanceEntry> = {
  draft: {
    title: "Student is preparing the application.",
    action:
      "Automatically set when a student starts an application. Admins rarely set this manually unless resetting a completely botched submission.",
  },
  submitted: {
    title: "Student has submitted the application.",
    action:
      "Automatically set when the student clicks submit. Signals that the application is ready for your initial review.",
    next: "Review the documents and move to 'Reviewing'.",
  },
  reviewing: {
    title: "Counselor is actively reviewing.",
    action:
      "Set this when you begin checking the student's submitted documents and profile to let them know it's being processed.",
    next: "If issues are found, set to 'Action Required'. Otherwise, set to 'Approved'.",
  },
  action_required: {
    title: "Student needs to fix something.",
    action:
      "Set this when documents are rejected or profile information is missing. Always leave a private note and send a message explaining what needs to be fixed.",
    next: "Returns to 'Reviewing' once the student re-submits.",
  },
  approved: {
    title: "Internal review passed.",
    action:
      "Set this when all documents and profile details are verified and the application is internally approved by EduChinaPro.",
    next: "Usually followed by 'Application Fee Pending'.",
  },
  application_fee_pending: {
    title: "Requesting University App Fee.",
    action:
      "Set this to trigger the 'Application Fee Payment Required' alert on the student's dashboard.",
  },
  application_fee_paid: {
    title: "University App Fee verified.",
    action:
      "Set this when you have received and verified the student's application fee payment.",
    next: "Proceed to apply on the university portal and set to 'Applied to University'.",
  },
  applied_to_university: {
    title: "Submitted to University Portal.",
    action:
      "Set this after you have officially submitted their application on the university's own admissions portal.",
  },
  admission_success: {
    title: "University Accepted.",
    action:
      "Set this when the university confirms they have accepted the student.",
  },
  admission_failure: {
    title: "University Rejected.",
    action:
      "Set this if the university denies the application. Be sure to follow up with the student regarding alternative options.",
  },
  offer_letter: {
    title: "Offer Letter Issued.",
    action:
      "Set this when you receive the official Offer/Admission Letter from the university and upload it to their documents.",
  },
  ecp_fee_pending: {
    title: "Requesting ECP Service Fee.",
    action:
      "Set this to trigger the 'EduChinaPro Service Fee Payment Required' alert on the student's dashboard.",
  },
  ecp_fee_paid: {
    title: "ECP Service Fee verified.",
    action:
      "Set this when you have received and verified the student's EduChinaPro service fee payment.",
  },
  jw_form_received: {
    title: "JW202 Form Received.",
    action:
      "Set this when the official JW202 visa form arrives from the university.",
  },
  visa_docs_ready: {
    title: "Visa Documents Prepared.",
    action:
      "Set this when all documents required for the student's visa application are ready and sent to them.",
  },
  visa_granted: {
    title: "Student got their Visa.",
    action:
      "Set this when the student successfully obtains their student visa from the embassy. The final successful state.",
  },
  visa_rejected: {
    title: "Visa was rejected by the embassy.",
    action:
      "Set this if the embassy denies the student's visa application. Contact the student immediately to discuss options such as reapplying or appealing.",
  },
  rejected: {
    title: "Internally rejected by EduChinaPro.",
    action:
      "Set this when the application cannot proceed due to eligibility issues or policy reasons. Always notify the student via message with a clear explanation.",
  },
  dropped_off: {
    title: "Student stopped responding.",
    action:
      "Set this when the student has gone silent and is no longer engaging with the process after multiple follow-up attempts.",
  },
  withdrawn: {
    title: "Student withdrew the application.",
    action:
      "Set this when the student explicitly requests to withdraw their application.",
  },
  closed: {
    title: "Application closed.",
    action:
      "Use this as a general terminal state when the application is finished for any other reason not covered by the above statuses.",
  },
};

export type StudentGuidanceEntry = {
  title: string;
  meaning: string;
  action?: string;
};

export const STUDENT_GUIDANCE: Record<string, StudentGuidanceEntry> = {
  draft: {
    title: "Application is in progress.",
    meaning:
      "You haven't submitted your application yet. It is saved as a draft.",
    action:
      "Complete your profile and upload all required documents to submit.",
  },
  submitted: {
    title: "Application is submitted.",
    meaning:
      "You have successfully submitted your application. It is now waiting for our team to begin the review process.",
  },
  reviewing: {
    title: "We are reviewing your application.",
    meaning:
      "Your counselor is actively matching your profile with the university requirements and verifying your documents.",
  },
  action_required: {
    title: "Action required on your part.",
    meaning:
      "We found an issue with your application. Usually, this means a document is missing or incorrect.",
    action:
      "Please check your messages or document feedback to see what needs to be fixed. Correct and re-upload.",
  },
  approved: {
    title: "Internal review approved.",
    meaning:
      "Your profile and documents have passed our internal quality check! Everything looks good.",
  },
  application_fee_pending: {
    title: "University application fee is due.",
    meaning: "The university requires an application fee to process your file.",
    action:
      "Please follow the instructions provided by your counselor to pay the application fee.",
  },
  application_fee_paid: {
    title: "Application fee received.",
    meaning: "We have verified your application fee payment.",
    action: "We will now submit your files directly to the university portal.",
  },
  applied_to_university: {
    title: "Submitted to University.",
    meaning:
      "We have officially filed your application on the university's admissions portal. It is now in their hands.",
  },
  admission_success: {
    title: "Accepted by University!",
    meaning:
      "Congratulations! The university has reviewed your application and accepted you.",
  },
  admission_failure: {
    title: "Not Accepted.",
    meaning: "Unfortunately, the university chose not to offer you admission.",
    action:
      "Don't worry, contact your counselor to discuss other program options.",
  },
  offer_letter: {
    title: "Offer Letter Issued.",
    meaning:
      "Your official Offer or Admission Letter has been granted by the university.",
    action:
      "You can download and review your offer letter in the documents section.",
  },
  ecp_fee_pending: {
    title: "Service fee is due.",
    meaning:
      "We are preparing to process your JW202 visa forms, which requires the EduChinaPro service fee.",
    action:
      "Please pay the service fee following your counselor's given instructions.",
  },
  ecp_fee_paid: {
    title: "Service fee received.",
    meaning:
      "We have received your service fee payment and are proceeding with your visa arrangements.",
  },
  jw_form_received: {
    title: "JW202 form is ready.",
    meaning: "The university has issued your official JW202 visa form.",
  },
  visa_docs_ready: {
    title: "Visa documents are prepared.",
    meaning:
      "We have organized all the documents you need to take to the embassy for your student visa application.",
  },
  visa_granted: {
    title: "Visa Granted!",
    meaning: "Congratulations! You successfully obtained your student visa.",
    action: "Get ready to start your journey to China!",
  },
  visa_rejected: {
    title: "Visa was rejected.",
    meaning:
      "Unfortunately, the embassy rejected your student visa application.",
    action:
      "Please contact your counselor immediately to discuss your options.",
  },
};

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
