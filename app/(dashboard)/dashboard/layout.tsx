import { StudentNavbar } from "@/components/dashboard/StudentNavbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
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

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <StudentNavbar user={user} />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}
