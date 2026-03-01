import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationBell } from "@/components/shared/NotificationBell";
import Link from "next/link";

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
          id: user.id,
          name: profile.full_name || user.email || "Admin",
          email: user.email || "",
          avatar: profile.avatar_url,
          role: profile.role,
        }}
      />
      <div className="h-10 absolute top-4 right-8 z-50 flex items-center gap-3">
        <NotificationBell userId={user.id} />
        <Link
          href="/admin/profile"
          className="hidden md:flex shrink-0 size-9 rounded-full overflow-hidden border border-primary-100 bg-brand-100 items-center justify-center ring-2 ring-brand-300 transition-all"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || "Admin"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-bold text-brand-600">
              {(profile.full_name || user.email || "A")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          )}
        </Link>
      </div>

      <main className="flex-1 min-h-[calc(100vh-40px)] mt-10 min-w-0 flex flex-col">
        <div className="flex-1 p-4 pt-18 md:p-8 flex flex-col h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
