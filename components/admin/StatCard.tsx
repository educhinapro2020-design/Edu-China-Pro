"use client";

import { twMerge } from "tailwind-merge";
import { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: IconType;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={twMerge(
        "bg-white rounded-2xl border border-primary-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="size-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
          <Icon className="size-5 text-brand-600" />
        </div>
        {trend && (
          <span
            className={twMerge(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend.positive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600",
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-primary-900 font-serif">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-primary-500 mt-1">{label}</p>
    </div>
  );
}
