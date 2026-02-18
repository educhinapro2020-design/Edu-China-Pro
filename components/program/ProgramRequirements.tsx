"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DocumentKey, getDocumentLabel } from "@/lib/constants/documents";
import { StudentDocumentEntry } from "@/lib/types/student";
import { studentService } from "@/lib/services/student.service";
import { FiCheckCircle, FiFileText } from "react-icons/fi";

interface ProgramRequirementsProps {
  requirements: DocumentKey[];
}

export function ProgramRequirements({
  requirements,
}: ProgramRequirementsProps) {
  const [checklist, setChecklist] = useState<
    Partial<Record<DocumentKey, StudentDocumentEntry | undefined>>
  >({});
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsLoggedIn(true);
          const result = await studentService.checkRequirements(
            user.id,
            requirements,
          );
          setChecklist(result);
        }
      } catch (error) {
        console.error("Failed to fetch user docs:", error);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [requirements]);

  if (requirements.length === 0) return null;

  return (
    <div>
      <h4 className="flex items-center gap-2 text-sm font-bold text-primary-400 uppercase tracking-widest mb-4">
        <FiFileText className="w-4 h-4" /> Required Documents
      </h4>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {requirements.map((docKey) => {
          const entry = checklist[docKey];
          const hasDoc = !!entry;

          return (
            <div
              key={docKey}
              className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 hover:bg-primary-50 transition-colors group"
            >
              {isLoggedIn && (
                <div className="shrink-0">
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
                  ) : hasDoc ? (
                    <FiCheckCircle className="size-4 text-success" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary-200 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              )}

              <div className="grow">
                <p className="text-primary-900 font-medium text-sm">
                  {getDocumentLabel(docKey)}
                </p>
                {isLoggedIn && !loading && (
                  <p
                    className={`text-xs mt-0.5 ${hasDoc ? "text-green-600" : "text-primary-400"}`}
                  >
                    {hasDoc ? "" : "Missing from profile"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
