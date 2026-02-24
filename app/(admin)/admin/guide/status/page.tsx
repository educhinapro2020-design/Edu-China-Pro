"use client";

import React from "react";
import { FiInfo, FiCheckCircle, FiChevronLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  ApplicationStatus,
  APPLICATION_STATUSES,
} from "@/lib/types/application";
import { getApplicationStatusMeta } from "@/lib/utils/application";
import { twMerge } from "tailwind-merge";

const ADMIN_GUIDANCE: Record<
  ApplicationStatus,
  { title: string; action: string; next?: string }
> = {
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
};

export default function StatusGuidePage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-full p-4 sm:p-6 pb-12 space-y-6">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-800 transition-colors"
        >
          <FiChevronLeft className="size-4" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            <span className="brand-text">EduChinaPro</span> Application Status
            Guide
          </h1>
          <p className="text-primary-500 mt-1 text-sm lg:text-base max-w-2xl">
            This guide explains each application status, its meaning, and when
            counselors should use it to advance a student's application.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-primary-50/50 border-b border-primary-100">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <FiInfo className="size-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-900">
                  How Statuses Affect Students
                </h2>
                <p className="text-sm text-primary-600 mt-1 leading-relaxed">
                  The status you set is visible to the student on their
                  dashboard timeline. Certain statuses like{" "}
                  <strong className="font-semibold px-1 py-0.5 bg-warning/10 text-warning rounded text-xs ml-1">
                    Application Fee Pending
                  </strong>{" "}
                  and{" "}
                  <strong className="font-semibold px-1 py-0.5 bg-warning/10 text-warning rounded text-xs ml-1">
                    ECP Service Fee Pending
                  </strong>{" "}
                  will trigger high-priority alerts for the student to take
                  action.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-primary-100">
            {APPLICATION_STATUSES.map((status, index) => {
              const meta = getApplicationStatusMeta(status);
              const guidance = ADMIN_GUIDANCE[status];

              return (
                <div
                  key={status}
                  className="p-6 sm:p-8 hover:bg-primary-50/30 transition-colors flex flex-col md:flex-row gap-6"
                >
                  <div className="md:w-1/3 shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary-400 w-6">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span
                        className={twMerge(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                          meta.color,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="pl-9">
                      <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-1">
                        Student Sees:
                      </p>
                      <p className="text-sm text-primary-500 italic">
                        "{meta.description}"
                      </p>
                    </div>
                  </div>

                  <div className="md:w-2/3 space-y-3 pl-9 md:border-l md:border-primary-100 md:pl-6">
                    <h3 className="text-base font-bold text-primary-900">
                      {guidance.title}
                    </h3>
                    <p className="text-sm text-primary-700 leading-relaxed">
                      {guidance.action}
                    </p>

                    {guidance.next && (
                      <div className="flex items-start gap-2 mt-4 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm text-brand-800">
                        <FiCheckCircle className="size-4 shrink-0 mt-0.5 text-brand-500" />
                        <p>
                          <span className="font-semibold">Next Step:</span>{" "}
                          {guidance.next}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
