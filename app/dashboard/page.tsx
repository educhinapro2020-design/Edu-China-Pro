import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { studentRepository } from "@/lib/repositories/student.repo";
import { ProfileProgress } from "@/components/dashboard/ProfileProgress";
import { calculateProfileProgress } from "@/lib/utils/profile-progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await studentRepository.getProfile(user.id, supabase);

  const progressPercentage = calculateProfileProgress(profile);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-2">
            Welcome back,{" "}
            <span className="text-brand-600">
              {profile?.first_name || "Scholar"}
            </span>
            !
          </h1>
          <p className="body-large text-primary-500 mt-1">
            Track your applications, manage profile
          </p>
        </div>
      </div>

      {progressPercentage < 100 && (
        <div className="max-w-2xl">
          <ProfileProgress percentage={progressPercentage} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-white border border-primary-100 rounded-3xl shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
          <h3 className="heading-3 mb-2">No Active Applications</h3>
          <p className="body text-primary-500 mb-6 max-w-sm">
            You haven't started any applications yet. Browse over 12,000 courses
            to find your perfect match.
          </p>
        </div>

        <div className="p-6 bg-white border border-primary-100 rounded-3xl shadow-sm min-h-[300px]">
          <h3 className="heading-4 mb-4">Recommended</h3>
        </div>
      </div>
    </div>
  );
}
