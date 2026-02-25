import { CounselorSidebar } from "@/components/counselor/CounselorSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "counselor") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-primary-50 flex">
      <CounselorSidebar
        user={{
          name: profile.full_name || user.email || "Counselor",
          email: profile.email || user.email || "",
          avatar: profile.avatar_url,
          role: profile.role,
        }}
      />
      <main className="flex-1 min-h-screen min-w-0 flex flex-col">
        <div className="flex-1 p-4 pt-18 md:p-8 flex flex-col">{children}</div>
      </main>
    </div>
  );
}
