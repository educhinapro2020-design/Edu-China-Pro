"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { applicationService } from "@/lib/services/application.service";
import { Modal } from "@/components/ui/modal";

interface ApplyButtonProps {
  programId: string;
  universityId: string;
  className?: string;
  children?: React.ReactNode;
}

export function ApplyButton({
  programId,
  universityId,
  className,
  children,
}: ApplyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirectTo=${returnUrl}`);
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setShowConfirm(false);
    try {
      const app = await applicationService.createApplication(
        (await createClient().auth.getUser()).data.user!.id,
        programId,
        universityId,
      );
      router.push(`/dashboard/applications/${app.id}`);
    } catch (error) {
      console.error("Application error:", error);
      alert("Failed to start application. You may have already applied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading}
        className={className}
        endIcon={
          loading ? <FiLoader className="animate-spin" /> : <FiArrowRight />
        }
      >
        {children || "Apply Now"}
      </Button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Application"
        description="This will start a new application for this program. You'll be taken to your application dashboard where you can complete the process. Ready to proceed?"
      >
        <button
          onClick={() => setShowConfirm(false)}
          className="px-5 py-2.5 rounded-xl border border-primary-200 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors shadow-sm shadow-brand-200"
        >
          Yes, Apply Now
        </button>
      </Modal>
    </>
  );
}
