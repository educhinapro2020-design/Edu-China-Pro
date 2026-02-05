import { WizardClient } from "./WizardClient";
import { studentRepository } from "@/lib/repositories/student.repo";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfileBuildPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await studentRepository.getProfile(user.id, supabase);

  if (!profile) {
    return <div>Error loading profile. Please contact support.</div>;
  }

  return (
    <WizardClient
      initialProfile={profile}
      userEmail={user.email || ""}
      userId={user.id}
    />
  );
}
