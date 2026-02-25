"use client";

import { useState, useMemo, useEffect } from "react";
import { FiList, FiCheckCircle, FiX, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { StudentProfile, StudentDocumentEntry } from "@/lib/types/student";
import { DocumentKey } from "@/lib/constants/documents";
import { getProfileChecklist } from "@/lib/utils/profile-checklist";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";

interface ProfileChecklistModalProps {
  profile: Partial<StudentProfile>;
  documents?: Partial<Record<DocumentKey, StudentDocumentEntry>>;
}

export function ProfileChecklistModal({
  profile,
  documents,
}: ProfileChecklistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { completed, missing } = useMemo(
    () => getProfileChecklist(profile, documents),
    [profile, documents],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const totalItems = completed.length + missing.length;
  const progress =
    totalItems > 0 ? Math.round((completed.length / totalItems) * 100) : 0;

  const handleFix = (step: number, id: string) => {
    setIsOpen(false);
    const helperParam =
      searchParams.get("helper") === "true" ? "&helper=true" : "";
    router.push(
      `/dashboard/profile/build?step=${step}&focus=${id}${helperParam}`,
    );
  };

  if (missing.length === 0) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-brand-600 text-white rounded-full p-4 shadow-lg shadow-brand-600/30 flex items-center gap-3 transition-colors hover:bg-brand-700"
      >
        <div className="relative">
          <FiList className="size-6" />
          {missing.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold ring-2 ring-brand-600">
              {missing.length}
            </span>
          )}
        </div>
        <span className="font-medium pr-1 hidden md:inline-block">
          Complete Profile
        </span>

        <div className="relative size-6 hidden md:block">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-brand-800"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="text-white transition-all duration-500 ease-in-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress}, 100`}
            />
          </svg>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed min-h-screen inset-0 z-50 bg-primary-950/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed inset-x-4 bottom-4 md:bottom-24 md:right-8 md:left-auto md:w-[400px] z-50 flex flex-col max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-primary-100 overflow-hidden"
            >
              <div className="p-5 border-b border-primary-100 flex items-center justify-between bg-white relative z-10">
                <div>
                  <h3 className="heading-4 text-lg">Profile Checklist</h3>
                  <p className="text-xs text-primary-500 font-medium mt-1">
                    Profile completion{" "}
                    <span className="text-brand-500 font-semibold">
                      ({progress}%)
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-primary-400 hover:text-primary-900 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <FiX className="size-5" />
                </button>
              </div>

              <div className="h-1 md:h-2 bg-primary-100 w-full">
                <motion.div
                  className="h-full bg-brand-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <div className="overflow-y-auto p-2 scrollbar-hide">
                {missing.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center">
                    <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <FiCheckCircle className="size-8" />
                    </div>
                    <h3 className="text-lg font-bold text-primary-900 mb-1">
                      {" "}
                      all set!
                    </h3>
                    <p className="text-primary-500 text-sm">
                      Your profile is 100% complete.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-500 flex items-center gap-2">
                      Missing ({missing.length})
                    </div>

                    {missing.map((item, idx) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={twMerge(
                              "size-8 rounded-full flex items-center justify-center text-xs font-bold",
                              item.category === "document"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-primary-100 text-primary-600",
                            )}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary-900">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-primary-500 font-medium uppercase tracking-wide">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFix(item.step, item.id)}
                          className="h-8 px-3 text-xs bg-white hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                        >
                          Go <FiArrowRight className="ml-1 size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white to-transparent pointer-events-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
