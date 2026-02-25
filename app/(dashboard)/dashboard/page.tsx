import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { studentRepository } from "@/lib/repositories/student.repo";
import { ProfileProgress } from "@/components/dashboard/ProfileProgress";
import { calculateProfileProgress } from "@/lib/utils/profile-progress";

import { applicationRepository } from "@/lib/repositories/application.repo";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
} from "@/lib/utils/application";
import Link from "next/link";
import { FiFileText, FiChevronRight } from "react-icons/fi";
import { studentDocumentsRepository } from "@/lib/repositories/student-documents.repo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, documents, applications] = await Promise.all([
    studentRepository.getProfile(user.id, supabase),
    studentDocumentsRepository.getDocuments(user.id, supabase),
    applicationRepository.getApplications(user.id, supabase),
  ]);

  const progressPercentage = calculateProfileProgress(
    profile,
    documents?.documents,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-3">
            Welcome,{" "}
            <span className="text-brand-600">
              {profile?.first_name || "Scholar"}
            </span>
            !
          </h1>
          <p className="body text-primary-600 mt-1">
            Track your applications, manage profile
          </p>
        </div>
      </div>

      {progressPercentage < 100 && (
        <div className="max-w-2xl">
          <ProfileProgress percentage={progressPercentage} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-white border border-primary-100 rounded-3xl shadow-sm min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="heading-4">My Applications</h3>
            <Link
              href="/dashboard/applications"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View All
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col justify-center items-center text-center py-10">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <FiFileText className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                No Active Applications
              </h3>
              <p className="body text-primary-500 mb-6 max-w-sm mx-auto">
                You haven't started any applications yet. Browse over 12,000
                courses to find your perfect match.
              </p>
              <Link href="/programs" className="btn-primary">
                Find Programs
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.slice(0, 3).map((app) => (
                <Link key={app.id} href={`/dashboard/applications/${app.id}`}>
                  <div className="group bg-white rounded-xl p-4 sm:p-5 border border-primary-100 hover:shadow-md transition-all duration-200 hover:border-primary-200 w-full overflow-hidden flex items-start sm:items-center gap-4">
                    <div className="size-12 sm:size-14 shrink-0 bg-primary-50 rounded-lg overflow-hidden border border-primary-100 flex items-center justify-center">
                      {app.program?.university?.logo_url ? (
                        <img
                          src={app.program.university.logo_url}
                          alt={app.program.university.name_en}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-bold text-primary-300">
                          {app.program?.university?.name_en?.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <h4 className="text-sm sm:text-base font-semibold text-primary-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2 break-words">
                          {app.program?.name_en}
                        </h4>
                        <span
                          className={`self-start shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${getApplicationStatusColor(app.status)}`}
                        >
                          {getApplicationStatusLabel(app.status)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary-500 break-words">
                        {app.program?.university?.name_en}
                      </p>
                    </div>

                    <FiChevronRight className="size-4 text-primary-300 group-hover:text-primary-600 transition-colors shrink-0 hidden sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
