"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { applicationService } from "@/lib/services/application.service";

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
  const router = useRouter();

  const handleApply = async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirectTo=${returnUrl}`);
      return;
    }

    try {
      const app = await applicationService.createApplication(
        user.id,
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
    <Button
      onClick={handleApply}
      disabled={loading}
      className={className}
      endIcon={
        loading ? <FiLoader className="animate-spin" /> : <FiArrowRight />
      }
    >
      {children || "Apply Now"}
    </Button>
  );
}
