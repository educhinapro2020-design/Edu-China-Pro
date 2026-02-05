import { StudentNavbar } from "@/components/dashboard/StudentNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary-50">
      <StudentNavbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
