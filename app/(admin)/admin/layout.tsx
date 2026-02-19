import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
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
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-primary-50 flex">
      <AdminSidebar
        user={{
          name: profile.full_name || user.email || "Admin",
          email: user.email || "",
          avatar: profile.avatar_url,
        }}
      />
      <main className="flex-1 min-h-screen min-w-0">
        <div className="p-4 pt-18 md:p-8 ">{children}</div>
      </main>
    </div>
  );
}
