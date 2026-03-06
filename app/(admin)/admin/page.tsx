"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FiUsers,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiUserX,
  FiMonitor,
} from "react-icons/fi";
import { adminDataService } from "@/lib/services/admin-data.service";
import { AdminDashboardData, StatBreakdown } from "@/lib/types/admin";
import { getApplicationStatusMeta } from "@/lib/utils/application";

const COLORS = [
  "#3c70d1",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

// Only used for Recharts which requires hex values
const PIPELINE_CHART_COLORS: Record<string, string> = {
  early: "#3c70d1",
  mid: "#f59e0b",
  urgent: "#ef4444",
  late: "#8b5cf6",
  success: "#10b981",
  terminal: "#cbd5e1",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  reviewing: "Reviewing",
  approved: "Approved",
  action_required: "Action Required",
  application_fee_pending: "App Fee Pending",
  application_fee_paid: "App Fee Paid",
  applied_to_university: "Applied to Uni",
  admission_success: "Admission Success",
  admission_failure: "Admission Failure",
  offer_letter: "Offer Letter",
  ecp_fee_pending: "ECP Fee Pending",
  ecp_fee_paid: "ECP Fee Paid",
  jw_form_received: "JW Form Received",
  visa_docs_ready: "Visa Docs Ready",
  visa_granted: "Visa Granted",
  visa_rejected: "Visa Rejected",
  rejected: "Rejected",
  dropped_off: "Dropped Off",
  withdrawn: "Withdrawn",
  closed: "Closed",
};

type AppBreakdownTab = "degree" | "subject" | "city" | "university" | "program";
const BREAKDOWN_TABS: { key: AppBreakdownTab; label: string }[] = [
  { key: "degree", label: "Degree" },
  { key: "subject", label: "Subject" },
  { key: "city", label: "City" },
  { key: "university", label: "University" },
  { key: "program", label: "Program" },
];

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-primary-50 p-1 rounded-xl flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            active === t.key
              ? "bg-white text-brand-600 shadow-sm"
              : "text-primary-500 hover:text-primary-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [breakdownTab, setBreakdownTab] = useState<AppBreakdownTab>("degree");

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await adminDataService.getDashboardData(6);
        if (!cancelled) setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading || !data) return <AdminDashboardSkeleton />;

  const activeBreakdown: StatBreakdown[] =
    {
      degree: data.apps_by_degree,
      subject: data.apps_by_subject,
      city: data.apps_by_city,
      university: data.apps_by_university,
      program: data.apps_by_program ?? [],
    }[breakdownTab] ?? [];

  const pipeline = (data.apps_by_status ?? []).filter((s: any) => s.value > 0);
  const ops = data.monthly_ops;

  const kpis = [
    {
      label: "Total Students",
      value: data.kpi.total_students,
      icon: FiUsers,
      delta: data.kpi.students_this_month,
      accent: "text-brand-600 bg-brand-50",
      urgent: false,
    },
    {
      label: "Total Applications",
      value: data.kpi.total_applications,
      icon: FiFileText,
      delta: data.kpi.apps_this_month,
      accent: "text-brand-600 bg-brand-50",
      urgent: false,
    },
    {
      label: "Pending Review",
      value: data.kpi.pending_review,
      icon: FiClock,
      accent: "text-amber-600 bg-amber-50",
      urgent: false,
    },
    {
      label: "Visa Granted",
      value: data.kpi.visa_granted,
      icon: FiCheckCircle,
      accent: "text-emerald-600 bg-emerald-50",
      urgent: false,
    },
    {
      label: "Unassigned",
      value: data.kpi.unassigned,
      icon: FiUserX,
      accent: "text-slate-600 bg-slate-100",
      urgent: data.kpi.unassigned > 0,
    },
  ];

  return (
    <>
      <div className="md:hidden fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="size-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
          <FiMonitor className="size-6 text-brand-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-primary-900 font-serif">
            Desktop Only
          </p>
          <p className="text-sm text-primary-500 mt-1 max-w-xs">
            The admin dashboard is best viewed on a desktop or tablet for the
            full experience.
          </p>
        </div>
      </div>

      <div className="hidden md:block space-y-6 md:ml-16 pb-12 relative">
        <div>
          <h1 className="text-2xl font-bold brand-text font-serif">
            Dashboard
          </h1>
          <p className="text-sm text-primary-400 mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map((k) => (
            <div
              key={k.label}
              className={`bg-white rounded-2xl border shadow-sm px-5 py-5 flex flex-col gap-2.5 ${k.urgent ? "border-red-200 ring-1 ring-red-100" : "border-primary-100"}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center ${k.accent}`}
                >
                  <k.icon className="size-4" />
                </div>
                {k.delta !== undefined && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full leading-tight">
                    +{k.delta}
                  </span>
                )}
                {k.urgent && k.delta === undefined && (
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-400 mb-1 leading-tight">
                  {k.label}
                </p>
                <p
                  className={`text-2xl font-semibold font-serif leading-none ${k.urgent ? "text-red-600" : "text-primary-900"}`}
                >
                  {k.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-semibold text-primary-900 font-serif">
                Application Pipeline
              </h3>
              <p className="text-xs text-primary-400 mt-0.5">
                Active applications by current status
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(PIPELINE_CHART_COLORS).map(([stage, color]) => (
                <div key={stage} className="flex items-center gap-1">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] text-primary-500 capitalize">
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pipeline.map((s: any) => ({
                  ...s,
                  label: STATUS_LABELS[s.label] ?? s.label,
                }))}
                margin={{ top: 5, right: 10, left: -10, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  angle={-0}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(60,112,209,0.05)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgb(0 0 0/0.1)",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pipeline.map((s: any, i: number) => (
                    <Cell
                      key={i}
                      fill={PIPELINE_CHART_COLORS[s.stage] ?? "#3c70d1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {pipeline.length === 0 && (
            <p className="text-sm text-primary-400 text-center py-8">
              No applications yet
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold text-primary-900 font-serif">
                Application Insights
              </h3>
              <TabBar
                tabs={BREAKDOWN_TABS}
                active={breakdownTab}
                onChange={setBreakdownTab}
              />
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeBreakdown}
                  layout="vertical"
                  margin={{
                    left:
                      breakdownTab === "university" ||
                      breakdownTab === "program"
                        ? 40
                        : 10,
                    right: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={
                      breakdownTab === "university" ||
                      breakdownTab === "program"
                        ? 150
                        : 110
                    }
                    tick={{ fontSize: 11, fill: "#334155" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(60,112,209,0.05)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgb(0 0 0/0.1)",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {activeBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm flex flex-col gap-5 min-h-0">
            <h3 className="text-base font-semibold text-primary-900 font-serif shrink-0">
              {new Date().toLocaleDateString("en-US", { month: "long" })}{" "}
              Operations
            </h3>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-brand-50 rounded-xl px-4 py-3">
                <p className="text-xs font-bold uppercase text-brand-500 mb-1">
                  New Students
                </p>
                <p className="text-2xl font-semibold font-serif text-brand-900">
                  {ops?.new_students ?? 0}
                </p>
              </div>
              <div className="bg-primary-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold uppercase text-primary-500 mb-1">
                  New Applications
                </p>
                <p className="text-2xl font-bold font-serif text-primary-900">
                  {ops?.new_applications ?? 0}
                </p>
              </div>
            </div>

            {ops?.recent_activity?.length > 0 && (
              <div className="min-h-0 flex flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500 mb-4 shrink-0">
                  Recent Activity
                </p>
                <div className="overflow-y-auto max-h-[240px] space-y-0.5 pr-1">
                  {ops.recent_activity.map((a: any, i: number) => {
                    const meta = getApplicationStatusMeta(a.status);
                    const displayName =
                      a.student_name ?? a.student_email ?? "Student";
                    const initials = displayName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <Link
                        key={i}
                        href={`/admin/applications/${a.application_id}`}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-primary-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-brand-50 border border-primary-100">
                            {a.student_avatar ? (
                              <img
                                src={a.student_avatar}
                                alt={displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-brand-600">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary-800 truncate group-hover:text-brand-600 transition-colors">
                              {displayName}
                            </p>
                            <p className="text-xs text-primary-500 truncate">
                              {meta.label}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-primary-400 font-medium shrink-0 ml-2">
                          {new Date(a.changed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 md:ml-16 animate-pulse pb-12">
      <div className="space-y-1.5">
        <div className="h-7 w-40 bg-gray-200 rounded-lg" />
        <div className="h-4 w-56 bg-gray-100 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white px-4 py-4 rounded-2xl border border-primary-100 space-y-2 shadow-sm"
          >
            <div className="size-8 rounded-lg bg-gray-100" />
            <div className="h-2 w-16 bg-gray-100 rounded" />
            <div className="h-7 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[380px]">
        <div className="h-5 w-44 bg-gray-200 rounded mb-5" />
        <div className="h-[300px] bg-gray-50 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[420px]"
          >
            <div className="h-5 w-44 bg-gray-200 rounded mb-5" />
            <div className="h-[340px] bg-gray-50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
