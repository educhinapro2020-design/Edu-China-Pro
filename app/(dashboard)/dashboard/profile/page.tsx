"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FiPrinter, FiEdit3, FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { ProfileDocument } from "@/components/shared/ProfileDocument";
import Link from "next/link";
import { useEffect, useState } from "react";
import { studentRepository } from "@/lib/repositories/student.repo";
import { createClient } from "@/lib/supabase/client";
import { StudentProfile } from "@/lib/types/student";
import { FiLoader } from "react-icons/fi";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<StudentProfile> | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Profile_${profile?.first_name || "Student"}`,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email);
        const data = await studentRepository.getProfile(user.id, supabase);
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiLoader className="size-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-primary-100 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <FiArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-900">My Profile</h1>
            <p className="text-sm text-primary-500">
              View and manage your application profile
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 sm:flex-none gap-2"
          >
            <FiPrinter className="size-4" /> Print / PDF
          </Button>
          <Link href="/dashboard/profile/build" className="flex-1 sm:flex-none">
            <Button className="w-full gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-brand-100">
              <FiEdit3 className="size-4" /> Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-primary-50/50 p-4 rounded-3xl border border-primary-100 overflow-x-auto print:border-0 print:p-0 print:overflow-visible">
        <ProfileDocument
          ref={componentRef}
          profile={profile}
          email={userEmail}
        />
      </div>
    </div>
  );
}
