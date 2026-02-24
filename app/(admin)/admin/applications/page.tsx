"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ApplicationStatus } from "@/lib/types/application";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiSearch,
  FiChevronRight,
  FiChevronDown,
  FiChevronLeft,
  FiCalendar,
  FiClock,
  FiFilter,
  FiX,
  FiUser,
} from "react-icons/fi";
import {
  getApplicationStatusColor,
  getApplicationStatusLabel,
  formatRelativeTime,
  getStudentInitials,
} from "@/lib/utils/application";
import { applicationRepository } from "@/lib/repositories/application.repo";

import { APPLICATION_STATUSES } from "@/lib/types/application";

const ALL_STATUSES: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...APPLICATION_STATUSES.map((status) => ({
    value: status,
    label: getApplicationStatusLabel(status),
  })),
];

const PAGE_SIZE = 20;

type AppItem = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  student: { full_name: string; email: string; avatar_url: string | null };
  program: {
    id: string;
    name_en: string;
    university: { id: string; name_en: string; logo_url: string | null };
  };
};

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function RowSkeleton() {
  return (
    <div className="w-full bg-white rounded-xl p-4 border border-primary-100 shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-1/3">
          <div className="size-10 rounded-lg bg-primary-100 shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 bg-primary-100 rounded w-3/4" />
            <div className="h-3 bg-primary-50 rounded w-1/2" />
          </div>
        </div>
        <div className="flex items-center justify-between w-full sm:flex-1 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-primary-50 sm:border-0">
          <div className="h-6 w-24 bg-primary-50 rounded-full" />
          <div className="h-6 w-24 bg-primary-100 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}

function StudentAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initials = getStudentInitials(name);
  const isExternal =
    !avatarUrl ||
    avatarUrl.includes("googleusercontent.com") ||
    avatarUrl.includes("githubusercontent.com");

  if (!isExternal) {
    return (
      <img
        loading="lazy"
        src={avatarUrl!}
        alt={name}
        className="size-6 rounded-full object-cover border border-primary-100 shrink-0"
      />
    );
  }
  return (
    <div className="size-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-semibold text-brand-600">
        {initials}
      </span>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const [data, setData] = useState<AppItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [recentlyUpdated, setRecentlyUpdated] = useState<AppItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const result = await applicationRepository.searchApplications(
        {
          search: debouncedSearch,
          status: statusFilter === "all" ? null : statusFilter,
          page,
          pageSize: PAGE_SIZE,
        },
        supabase,
      );
      setData(result.data);
      setTotalCount(result.total_count);
      setRecentlyUpdated(result.recently_updated);
      setStatusCounts(result.status_counts);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilterDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const showRecent =
    recentlyUpdated.length > 0 &&
    page === 1 &&
    debouncedSearch === "" &&
    statusFilter === "all";
  const visibleRecent = showAllRecent
    ? recentlyUpdated
    : recentlyUpdated.slice(0, 5);
  const activeStatusLabel =
    statusFilter === "all"
      ? "All"
      : (ALL_STATUSES.find((s) => s.value === statusFilter)?.label ??
        statusFilter);

  return (
    <div className="w-full max-w-full p-4 sm:p-6 pb-12 space-y-6">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            Applications
          </h1>
          <p className="text-primary-500 mt-0.5 text-sm">
            {loading
              ? "Loading…"
              : `${totalCount} application${totalCount !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:items-center">
          <div className="relative flex-1 min-w-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 size-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student, program, university, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-3 rounded-xl border border-primary-200 bg-white text-sm text-primary-800 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
              >
                <FiX className="size-4" />
              </button>
            )}
          </div>
          <div
            className="relative w-full sm:w-auto shrink-0 z-20"
            ref={filterRef}
          >
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm
                ${statusFilter !== "all" ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-primary-200 text-primary-700 hover:border-primary-300"}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiFilter className="size-4 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[140px]">
                  {activeStatusLabel}
                </span>
              </div>
              <FiChevronDown
                className={`size-3.5 shrink-0 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0 }}
                  className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-64 bg-white border border-primary-200 rounded-2xl shadow-lg py-2 max-h-72 overflow-y-auto"
                >
                  {ALL_STATUSES.map((s) => {
                    const count =
                      s.value === "all"
                        ? totalAll
                        : (statusCounts[s.value] ?? 0);
                    return (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => {
                          setStatusFilter(s.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                          ${statusFilter === s.value ? "bg-brand-50 text-brand-700 font-medium" : "text-primary-700 hover:bg-primary-50"}`}
                      >
                        <span className="truncate pr-3 text-left">
                          {s.label}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${statusFilter === s.value ? "text-brand-600" : "text-primary-400"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {showRecent && (
          <div className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <FiClock className="size-4 text-primary-400" />
              <h2 className="text-sm font-medium text-primary-700">
                Recently Updated
              </h2>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              <AnimatePresence mode="popLayout">
                {visibleRecent.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{}}
                    layout
                    className="w-full"
                  >
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="block w-full outline-none"
                    >
                      <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-3.5 border border-primary-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all w-full min-w-0">
                        <div className="flex items-start sm:items-center gap-3 w-full sm:flex-1 min-w-0">
                          <div className="size-10 bg-primary-50 rounded-lg overflow-hidden border border-primary-100 flex items-center justify-center shrink-0">
                            {app.program?.university?.logo_url ? (
                              <img
                                src={app.program.university.logo_url}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-primary-300">
                                {app.program?.university?.name_en?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-medium text-sm text-primary-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                              {app.program?.name_en}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                              <FiUser className="size-3 text-primary-400 shrink-0" />
                              <span className="text-sm capitalize text-primary-600 truncate">
                                {app.student?.full_name}
                              </span>
                              <span className="text-xs text-primary-400 shrink-0">
                                ·
                              </span>
                              <span className="text-xs text-primary-500 shrink-0">
                                {formatRelativeTime(app.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end w-full sm:w-auto mt-1 sm:mt-0 shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide truncate max-w-full ${getApplicationStatusColor(app.status)}`}
                          >
                            {getApplicationStatusLabel(app.status)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {recentlyUpdated.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllRecent(!showAllRecent)}
                className="flex items-center justify-center gap-1 w-full mt-3 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors py-2"
              >
                {showAllRecent ? "Show less" : "Show more"}
                <FiChevronDown
                  className={`size-3.5 transition-transform ${showAllRecent ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        )}

        <div className="w-full">
          <div className="flex items-center justify-between mb-4 w-full">
            <h2 className="text-sm font-semibold text-primary-700 truncate pr-2">
              {statusFilter !== "all" ? activeStatusLabel : "All Applications"}
              {!loading && (
                <span className="text-primary-400 font-normal ml-1.5 shrink-0">
                  ({totalCount})
                </span>
              )}
            </h2>
            {totalPages > 1 && (
              <span className="text-xs text-primary-400 shrink-0">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 w-full">
              {[...Array(6)].map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="bg-white w-full rounded-2xl p-10 text-center border border-primary-100 shadow-sm">
              <div className="mx-auto size-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                <FiFileText className="size-7 text-primary-400" />
              </div>
              <h3 className="text-base font-semibold text-primary-900 font-serif mb-1">
                No applications found
              </h3>
              <p className="text-primary-500 text-sm max-w-xs mx-auto">
                {search
                  ? "Try adjusting your search or filter."
                  : "No applications match the selected status."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <AnimatePresence mode="popLayout">
                {data.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0 }}
                    className="w-full"
                  >
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="block w-full outline-none"
                    >
                      <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-primary-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 w-full min-w-0">
                        <div className="flex items-start sm:items-center gap-3 w-full sm:flex-1 min-w-0">
                          <div className="size-11 shrink-0 bg-primary-50 rounded-xl overflow-hidden border border-primary-100 flex items-center justify-center">
                            {app.program?.university?.logo_url ? (
                              <img
                                src={app.program.university.logo_url}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-bold text-primary-300">
                                {app.program?.university?.name_en?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="text-sm font-semibold text-primary-900 line-clamp-2 sm:truncate group-hover:text-brand-600 transition-colors">
                              {app.program?.name_en}
                            </h3>
                            <p className="text-sm text-primary-500 truncate mt-0.5">
                              {app.program?.university?.name_en}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t border-primary-50 sm:border-t-0 min-w-0">
                          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
                            <StudentAvatar
                              name={app.student?.full_name ?? "?"}
                              avatarUrl={app.student?.avatar_url}
                            />
                            <span className="text-sm capitalize font-medium text-primary-600 truncate max-w-[120px] sm:max-w-[140px]">
                              {app.student?.full_name ?? "Unknown"}
                            </span>
                          </div>

                          <div className="hidden lg:flex items-center gap-1.5 text-xs text-primary-500 shrink-0 w-24">
                            <FiCalendar className="size-3.5" />
                            <span className="truncate">
                              {new Date(app.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <div className="shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide block truncate max-w-[130px] sm:max-w-[160px] ${getApplicationStatusColor(app.status)}`}
                            >
                              {getApplicationStatusLabel(app.status)}
                            </span>
                          </div>

                          <div className="hidden sm:flex items-center justify-center size-8 rounded-full bg-primary-50 text-primary-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors shrink-0 ml-2">
                            <FiChevronRight className="size-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {totalPages > 1 && !loading && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 pb-6 w-full">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-primary-600 bg-white border border-primary-200 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              <FiChevronLeft className="size-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`size-9 rounded-xl text-sm font-medium transition-all shrink-0 ${
                    page === pageNum
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-white text-primary-600 border border-primary-200 hover:border-primary-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-primary-600 bg-white border border-primary-200 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              <span className="hidden sm:inline">Next</span>
              <FiChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
