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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
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
          className="px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          Browse Programs
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-primary-100 shadow-sm">
          <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <FiFileText className="h-8 w-8 text-primary-500" />
          </div>
          <h3 className="text-lg font-medium text-primary-900 mb-2">
            No applications yet
          </h3>
          <p className="text-primary-500 mb-6 max-w-md mx-auto">
            You haven't applied to any programs yet. Browse our catalog to find
            your dream university program in China.
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-brand-500 hover:bg-brand-600"
          >
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
                <div className="group bg-white rounded-xl p-5 border border-primary-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-100">
                  <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                    {/* University Logo */}
                    <div className="h-16 w-16 shrink-0 bg-primary-50 rounded-lg overflow-hidden border border-primary-100 flex items-center justify-center">
                      {app.program?.university?.logo_url ? (
                        <img
                          src={app.program.university.logo_url}
                          alt={app.program.university.name_en}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary-300">
                          {app.program?.university?.name_en?.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="grow min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-primary-900 truncate group-hover:text-primary-600 transition-colors">
                          {app.program?.name_en}
                        </h3>

                        <span
                          className={`
                          px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide
                          ${getApplicationStatusColor(app.status)}
                        `}
                        >
                          {getApplicationStatusLabel(app.status)}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-primary-500 gap-y-1 gap-x-6">
                        <span className="flex items-center gap-1.5">
                          <span className="font-medium text-primary-700">
                            {app.program?.university?.name_en}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiCalendar className="w-4 h-4" />
                          Applied:{" "}
                          {new Date(app.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiClock className="w-4 h-4" />
                          Last updated:{" "}
                          {new Date(app.updated_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <FiChevronRight className="w-5 h-5" />
                    </div>
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
