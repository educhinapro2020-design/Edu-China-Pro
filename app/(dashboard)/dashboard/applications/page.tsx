"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/lib/services/application.service";
import { Application } from "@/lib/types/application";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiChevronRight,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
} from "@/lib/utils/application";
import { FaGraduationCap } from "react-icons/fa";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const data = await applicationService.getApplications(user.id);
          setApplications(data);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full size-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">
            My Applications
          </h1>
          <p className="text-primary-500 mt-1">
            Track the status of your university applications
          </p>
        </div>
        <Link
          href="/programs"
          className="px-4 py-2.5 bg-brand-500 self-start text-white rounded-xl hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          Browse Programs
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <FiFileText className="h-8 w-8 text-primary-500" />
          </div>
          <h3 className="heading-4 text-primary-900 mb-2">
            No applications yet
          </h3>
          <p className="text-primary-500 mb-6 max-w-md mx-auto">
            You haven't applied to any programs yet. Browse our catalog to find
            your dream university program in China.
          </p>
          <Link
            href="/programs"
            className="inline-flex gap-2 items-center px-6 py-2 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-brand-500 hover:bg-brand-600"
          >
            <FaGraduationCap className="size-5" />
            Start Your Journey
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/dashboard/applications/${app.id}`}>
                <div className="group bg-white rounded-xl p-4 sm:p-5 border border-primary-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-200 w-full overflow-hidden">
                  <div className="flex items-start sm:items-center gap-4 w-full">
                    <div className="size-12 sm:size-14 shrink-0 bg-primary-50 rounded-lg overflow-hidden border border-primary-100 flex items-center justify-center">
                      {app.program?.university?.logo_url ? (
                        <img
                          src={app.program.university.logo_url}
                          alt={app.program.university.name_en}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-primary-300">
                          {app.program?.university?.name_en?.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm sm:text-base font-semibold text-primary-900 group-hover:text-primary-600 transition-colors leading-snug break-words line-clamp-2">
                          {app.program?.name_en}
                        </h3>

                        <span
                          className={`self-start shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${getApplicationStatusColor(app.status)}`}
                        >
                          {getApplicationStatusLabel(app.status)}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-primary-700 mb-2 break-words">
                        {app.program?.university?.name_en}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs text-primary-500">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <FiCalendar className="size-3 shrink-0" />
                          Applied{" "}
                          {new Date(app.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <FiClock className="size-3 shrink-0" />
                          Updated{" "}
                          {new Date(app.updated_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>

                    <FiChevronRight className="size-4 text-primary-300 group-hover:text-primary-600 transition-colors shrink-0 hidden sm:block" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
