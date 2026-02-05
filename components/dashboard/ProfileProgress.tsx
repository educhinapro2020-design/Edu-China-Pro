"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";

interface ProfileProgressProps {
  percentage: number;
}

export function ProfileProgress({ percentage }: ProfileProgressProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full bg-white border border-primary-200 rounded-2xl shadow-sm p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative size-14 shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary-100"
            />

            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={`text-brand-500 transition-all duration-1000 ease-out`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <span className="absolute text-xs font-semibold text-primary-900">
            {percentage}%
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-primary-900 font-serif">
            Complete your profile
          </h3>
          <p className="text-sm text-primary-500 hidden sm:block">
            Finish your profile to start applying to universities.
          </p>
        </div>
      </div>

      <Button
        variant="brand"
        size="sm"
        asChild
        endIcon={<FiArrowRight className="size-4" />}
      >
        <Link href="/dashboard/profile/build">Complete Profile</Link>
      </Button>
    </div>
  );
}
