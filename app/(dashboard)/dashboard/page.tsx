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
                  <div className="group bg-white rounded-xl p-4 border border-primary-100 hover:shadow-md transition-all duration-200 flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 bg-primary-50 rounded-lg overflow-hidden border border-primary-100 flex items-center justify-center">
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

                    <div className="grow min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-primary-900 truncate group-hover:text-primary-600 transition-colors">
                            {app.program?.name_en}
                          </h4>
                          <p className="text-sm text-primary-500 truncate">
                            {app.program?.university?.name_en}
                          </p>
                        </div>
                        <span
                          className={`
                            px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide whitespace-nowrap ml-2
                            ${getApplicationStatusColor(app.status)}
                          `}
                        >
                          {getApplicationStatusLabel(app.status)}
                        </span>
                      </div>
                    </div>

                    <FiChevronRight className="w-5 h-5 text-primary-300 group-hover:text-primary-600" />
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
