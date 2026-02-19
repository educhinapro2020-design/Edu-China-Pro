"use client";

import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import {
  FiUsers,
  FiMapPin,
  FiBookOpen,
  FiFileText,
  FiTrendingUp,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { adminDataService } from "@/lib/services/admin-data.service";
import { AdminDashboardData, StatBreakdown } from "@/lib/types/admin";

import { StatCard } from "@/components/admin/StatCard";

const COLORS = [
  "#3c70d1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(d: Date | null) {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateShort(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type DateRange = "1W" | "4W" | "6W" | "custom";

const DATE_PRESETS: { key: DateRange; label: string }[] = [
  { key: "1W", label: "1W" },
  { key: "4W", label: "4W" },
  { key: "6W", label: "6W" },
  { key: "custom", label: "Custom" },
];

type AppBreakdownTab = "degree" | "subject" | "city" | "university";

const BREAKDOWN_TABS: { key: AppBreakdownTab; label: string }[] = [
  { key: "degree", label: "Degree" },
  { key: "subject", label: "Subject" },
  { key: "city", label: "City" },
  { key: "university", label: "University" },
];

function MiniCalendar({
  selected,
  onSelect,
  label,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  label: string;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? today.getMonth(),
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const days: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isSelected = (day: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  return (
    <div className="w-[240px]">
      <p className="text-xs font-medium text-primary-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-primary-100 text-primary-500 transition-colors"
        >
          <FiChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-primary-800">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-primary-100 text-primary-500 transition-colors"
        >
          <FiChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-medium text-primary-400 py-1"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) =>
          day === null ? (
            <div key={`e-${i}`} />
          ) : (
            <button
              key={day}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={`
                text-xs py-1.5 rounded-lg transition-all
                ${
                  isSelected(day)
                    ? "bg-brand-600 text-white font-semibold"
                    : isToday(day)
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-primary-700 hover:bg-primary-100"
                }
              `}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [breakdownTab, setBreakdownTab] = useState<AppBreakdownTab>("degree");
  const [dateRange, setDateRange] = useState<DateRange>("1W");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const getWeeks = (): number => {
    if (dateRange === "1W") return 1;
    if (dateRange === "4W") return 4;
    if (dateRange === "custom" && customFrom) {
      const diffMs = Math.abs(Date.now() - customFrom.getTime());
      return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
    }
    return 6;
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await adminDataService.getDashboardData(getWeeks());
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [dateRange, customFrom]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCustomPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading || !data) {
    return <AdminDashboardSkeleton />;
  }

  if (!data) return null;

  const activeBreakdown: StatBreakdown[] =
    {
      degree: data.apps_by_degree,
      subject: data.apps_by_subject,
      city: data.apps_by_city,
      university: data.apps_by_university,
    }[breakdownTab] ?? [];

  type ProgramTab = "degree" | "language" | "subject";
  const programTabData: Record<ProgramTab, StatBreakdown[]> = {
    degree: data.programs_by_degree,
    language: data.programs_by_language,
    subject: data.programs_by_subject,
  };

  return (
    <div className="space-y-8 md:ml-16">
      <div>
        <h1 className="text-2xl font-bold brand-text font-serif">
          Admin Panel
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Student Signups"
          value={data.kpi.total_students}
          icon={FiUsers}
          // trend={{
          //   value: Math.abs(data.kpi.student_trend),
          //   positive: data.kpi.student_trend >= 0,
          // }}
        />
        <StatCard
          label="Total Applications"
          value={data.kpi.total_applications}
          icon={FiFileText}
          // trend={{
          //   value: Math.abs(data.kpi.application_trend),
          //   positive: data.kpi.application_trend >= 0,
          // }}
        />
        <StatCard
          label="Total Universities"
          value={data.kpi.total_universities}
          icon={FiMapPin}
        />
        <StatCard
          label="Total Programs"
          value={data.kpi.total_programs}
          icon={FiBookOpen}
        />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex gap-1 bg-primary-50 p-1 rounded-xl">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => {
                if (preset.key === "custom") {
                  setShowCustomPicker((v) => !v);
                } else {
                  setDateRange(preset.key);
                  setShowCustomPicker(false);
                }
              }}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  dateRange === preset.key
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-primary-500 hover:text-primary-700"
                }
              `}
            >
              {preset.key === "custom" ? (
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="size-3.5" />
                  {customFrom && customTo
                    ? `${formatDateShort(customFrom)} – ${formatDateShort(customTo)}`
                    : "Custom"}
                </span>
              ) : (
                preset.label
              )}
            </button>
          ))}
        </div>

        {showCustomPicker && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40 sm:hidden"
              onClick={() => setShowCustomPicker(false)}
            />
            <div
              ref={pickerRef}
              className="
                fixed inset-x-4 top-1/2 -translate-y-1/2 z-50
                sm:absolute sm:inset-auto sm:translate-y-0 sm:top-full sm:left-0 sm:mt-2
                bg-white border border-primary-200 rounded-2xl shadow-xl p-5
                animate-in fade-in slide-in-from-top-2 duration-200
                max-h-[90vh] overflow-y-auto
              "
            >
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
                <MiniCalendar
                  label="From"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                />
                <div className="h-px sm:h-auto sm:w-px bg-primary-100" />
                <MiniCalendar
                  label="To"
                  selected={customTo}
                  onSelect={setCustomTo}
                />
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary-100">
                <p className="text-xs text-primary-400">
                  {customFrom && customTo
                    ? `${formatDate(customFrom)} → ${formatDate(customTo)}`
                    : "Select a range"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCustomFrom(null);
                      setCustomTo(null);
                    }}
                    className="text-xs text-primary-500 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      if (customFrom && customTo) {
                        setDateRange("custom");
                        setShowCustomPicker(false);
                      }
                    }}
                    disabled={!customFrom || !customTo}
                    className="text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:bg-primary-300 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FiTrendingUp className="text-brand-600" />
            <h3 className="text-lg font-semibold text-primary-900 font-serif">
              Applications Trend
            </h3>
          </div>
          <div className="h-[400px]" style={{ outline: "none" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.application_trend}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3c70d1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3c70d1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3c70d1"
                  strokeWidth={2.5}
                  fill="url(#appGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 font-serif">
              Application Insights
            </h3>
            <div className="flex gap-1 bg-primary-50 p-1 rounded-xl">
              {BREAKDOWN_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setBreakdownTab(tab.key)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200
                    ${
                      breakdownTab === tab.key
                        ? "bg-white text-brand-600 shadow-sm"
                        : "text-primary-500 hover:text-primary-700"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[400px]" style={{ outline: "none" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeBreakdown}
                layout="vertical"
                margin={{
                  left: breakdownTab === "university" ? 40 : 10,
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
                  width={breakdownTab === "university" ? 150 : 110}
                  tick={{ fontSize: 11, fill: "#334155" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(60, 112, 209, 0.05)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {activeBreakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UniversitiesOverviewCard
          typeData={data.universities_by_type}
          cityData={data.universities_by_city}
        />
        <ProgramsOverviewCard data={programTabData} />
      </div>
    </div>
  );
}

function ProgramsOverviewCard({
  data,
}: {
  data: Record<string, StatBreakdown[]>;
}) {
  type Tab = "degree" | "language" | "subject";
  const TABS: { key: Tab; label: string }[] = [
    { key: "degree", label: "Degree Level" },
    { key: "language", label: "Language" },
    { key: "subject", label: "Subject Area" },
  ];

  const [activeTab, setActiveTab] = useState<Tab>("degree");
  const chartData = data[activeTab] || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold text-primary-900 font-serif">
          Programs Overview
        </h3>
        <div className="flex gap-1 bg-primary-50 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  activeTab === tab.key
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-primary-500 hover:text-primary-700"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ left: 10, right: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(60, 112, 209, 0.05)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
                fontSize: 13,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`prog-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UniversitiesOverviewCard({
  typeData,
  cityData,
}: {
  typeData: StatBreakdown[];
  cityData: StatBreakdown[];
}) {
  type Tab = "type" | "city";
  const TABS: { key: Tab; label: string }[] = [
    { key: "type", label: "Type" },
    { key: "city", label: "City" },
  ];

  const [activeTab, setActiveTab] = useState<Tab>("type");
  const chartData = activeTab === "type" ? typeData : cityData;

  return (
    <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-semibold text-primary-900 font-serif">
          Universities
        </h3>
        <div className="flex gap-1 bg-primary-50 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  activeTab === tab.key
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-primary-500 hover:text-primary-700"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
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
              width={activeTab === "type" ? 110 : 90}
              tick={{ fontSize: 11, fill: "#334155" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(60, 112, 209, 0.05)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
                fontSize: 13,
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`uni-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 md:ml-16 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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

      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-16 bg-gray-200 rounded-lg" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[380px]">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-[300px] bg-gray-50 rounded-xl" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[380px]">
          <div className="flex justify-between mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-8 w-64 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-[300px] bg-gray-50 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[380px]">
          <div className="flex justify-between mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-32 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-[300px] bg-gray-50 rounded-xl" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm h-[380px]">
          <div className="flex justify-between mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-8 w-48 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-[300px] bg-gray-50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
