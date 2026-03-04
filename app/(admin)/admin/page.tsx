"use client";

import { useEffect, useState } from "react";
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
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiUserX,
  FiPercent,
} from "react-icons/fi";
import { adminDataService } from "@/lib/services/admin-data.service";
import { AdminDashboardData, StatBreakdown } from "@/lib/types/admin";

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

const STAGE_COLORS: Record<string, string> = {
  early: "#3c70d1",
  mid: "#f59e0b",
  urgent: "#ef4444",
  late: "#8b5cf6",
  success: "#10b981",
  terminal: "#94a3b8",
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

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  delta?: number;
  deltaLabel?: string;
  accent?: string;
  urgent?: boolean;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  accent = "bg-brand-50 text-brand-600",
  urgent,
}: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 ${urgent ? "border-red-200" : "border-primary-100"}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`size-10 rounded-xl flex items-center justify-center ${accent}`}
        >
          <Icon className="size-5" />
        </div>
        {delta !== undefined && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            +{delta} {deltaLabel}
          </span>
        )}
        {urgent && (
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-1">
          {label}
        </p>
        <p
          className={`text-3xl font-bold font-serif ${urgent ? "text-red-600" : "text-primary-900"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

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
    <div className="flex gap-1 bg-primary-50 p-1 rounded-xl">
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
  const maxPipelineVal = Math.max(...pipeline.map((s: any) => s.value), 1);

  const ops = data.monthly_ops;

  return (
    <div className="space-y-8 md:ml-16 pb-12">
      <div>
        <h1 className="text-2xl font-bold brand-text font-serif">Dashboard</h1>
        <p className="text-sm text-primary-400 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Total Students"
          value={data.kpi.total_students}
          icon={FiUsers}
          delta={data.kpi.students_this_month}
          deltaLabel="this month"
          accent="bg-brand-50 text-brand-600"
        />
        <KpiCard
          label="Total Applications"
          value={data.kpi.total_applications}
          icon={FiFileText}
          delta={data.kpi.apps_this_month}
          deltaLabel="this month"
          accent="bg-brand-50 text-brand-600"
        />
        <KpiCard
          label="Needs Action"
          value={data.kpi.needs_action}
          icon={FiAlertCircle}
          accent="bg-red-50 text-red-600"
          urgent={data.kpi.needs_action > 0}
        />
        <KpiCard
          label="Pending Review"
          value={data.kpi.pending_review}
          icon={FiClock}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Visa Granted"
          value={data.kpi.visa_granted}
          icon={FiCheckCircle}
          accent="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Unassigned"
          value={data.kpi.unassigned}
          icon={FiUserX}
          accent="bg-slate-50 text-slate-600"
          urgent={data.kpi.unassigned > 0}
        />
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-900 font-serif">
              Application Pipeline
            </h3>
            <p className="text-xs text-primary-400 mt-0.5">
              All active applications by current status
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { stage: "early", label: "Early" },
              { stage: "mid", label: "Mid" },
              { stage: "urgent", label: "Urgent" },
              { stage: "late", label: "Late" },
              { stage: "success", label: "Success" },
              { stage: "terminal", label: "Closed" },
            ].map(({ stage, label }) => (
              <div key={stage} className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[stage] }}
                />
                <span className="text-xs text-primary-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {pipeline.map((s: any) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xs text-primary-500 w-40 shrink-0 text-right">
                {STATUS_LABELS[s.label] ?? s.label}
              </span>
              <div className="flex-1 h-7 bg-primary-50 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.max((s.value / maxPipelineVal) * 100, 4)}%`,
                    backgroundColor: STAGE_COLORS[s.stage] ?? "#3c70d1",
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    {s.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {pipeline.length === 0 && (
            <p className="text-sm text-primary-400 text-center py-8">
              No applications yet
            </p>
          )}
        </div>
      </div>

      {/* Application Insights + Monthly Ops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Insights */}
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 font-serif">
              Application Insights
            </h3>
            <TabBar
              tabs={BREAKDOWN_TABS}
              active={breakdownTab}
              onChange={setBreakdownTab}
            />
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeBreakdown}
                layout="vertical"
                margin={{
                  left:
                    breakdownTab === "university" || breakdownTab === "program"
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
                    breakdownTab === "university" || breakdownTab === "program"
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

        {/* Monthly Ops */}
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-primary-900 font-serif">
            {new Date().toLocaleDateString("en-US", { month: "long" })}{" "}
            Operations
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">
                New Students
              </p>
              <p className="text-3xl font-bold font-serif text-brand-900">
                {ops?.new_students ?? 0}
              </p>
            </div>
            <div className="bg-primary-50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1">
                New Applications
              </p>
              <p className="text-3xl font-bold font-serif text-primary-900">
                {ops?.new_applications ?? 0}
              </p>
            </div>
          </div>

          {/* Counselor Load */}
          {ops?.counselor_load?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">
                Counselor Active Cases
              </p>
              <div className="space-y-2">
                {ops.counselor_load.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-primary-50 last:border-0"
                  >
                    <span className="text-sm font-medium text-primary-700">
                      {c.counselor_name ?? "Unknown"}
                    </span>
                    <span className="text-sm font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {c.active_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status movements */}
          {ops?.status_movements?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">
                Status Movements This Month
              </p>
              <div className="space-y-2">
                {ops.status_movements.slice(0, 5).map((m: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-primary-600">
                      {STATUS_LABELS[m.status] ?? m.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-primary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{
                            width: `${Math.min((m.count / (ops.status_movements[0]?.count ?? 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary-700 w-6 text-right">
                        {m.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 md:ml-16 animate-pulse pb-12">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-primary-100 space-y-3 shadow-sm"
          >
            <div className="size-10 rounded-xl bg-gray-100" />
            <div className="h-2 w-16 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[400px]">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-32 bg-gray-100 rounded" />
              <div
                className="h-7 flex-1 bg-gray-100 rounded-lg"
                style={{ width: `${40 + i * 7}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[480px]"
          >
            <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
            <div className="h-[380px] bg-gray-50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
