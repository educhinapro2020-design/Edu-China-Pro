"use client";

import { FiInfo, FiCheckCircle, FiChevronLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { APPLICATION_ADMIN_STATUSES } from "@/lib/types/application";
import {
  getApplicationStatusMeta,
  ADMIN_GUIDANCE,
} from "@/lib/utils/application";
import { twMerge } from "tailwind-merge";

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
            {APPLICATION_ADMIN_STATUSES.map((status, index) => {
              const meta = getApplicationStatusMeta(status);
              const guidance = ADMIN_GUIDANCE[status];
              if (!guidance) return null;

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
