"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiFilter,
  FiX,
  FiUser,
} from "react-icons/fi";
import { userRepository } from "@/lib/repositories/user.repo";
import { Database } from "@/lib/types/supabase";
import { getStudentInitials } from "@/lib/utils/application";
import { updateUserRole } from "@/lib/actions/user.actions";
import { twMerge } from "tailwind-merge";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Enums"]["user_role"];

const PAGE_SIZE = 20;

const ROLE_OPTIONS: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "counselor", label: "Counselor" },
  { value: "admin", label: "Admin" },
];

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function UserSkeleton() {
  return (
    <div className="w-full bg-white rounded-xl p-4 border border-primary-100 shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <div className="size-10 rounded-full bg-primary-100 shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 bg-primary-100 rounded w-2/3" />
            <div className="h-3 bg-primary-50 rounded w-1/2" />
          </div>
        </div>
        <div className="h-8 w-32 bg-primary-100 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

function UserAvatar({
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

  if (!isExternal && avatarUrl) {
    return (
      <img
        loading="lazy"
        src={avatarUrl}
        alt={name}
        className="size-10 rounded-full object-cover border border-primary-100 shrink-0"
      />
    );
  }
  return (
    <div className="size-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-brand-600 uppercase">
        {initials}
      </span>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [page, setPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Role Action State
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: ProfileRow | null;
    pendingRole: UserRole | null;
  }>({ isOpen: false, user: null, pendingRole: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const result = await userRepository.getUsers(
        {
          search: debouncedSearch,
          role: roleFilter,
          page,
          pageSize: PAGE_SIZE,
        },
        supabase,
      );
      setUsers(result.data);
      setTotalCount(result.total_count);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleRoleChange = (user: ProfileRow, newRole: UserRole) => {
    if (user.role === newRole) return;
    setConfirmModal({
      isOpen: true,
      user,
      pendingRole: newRole,
    });
  };

  const confirmRoleUpdate = async () => {
    if (!confirmModal.user || !confirmModal.pendingRole) return;

    setUpdatingUserId(confirmModal.user.id);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      const result = await updateUserRole(
        confirmModal.user.id,
        confirmModal.pendingRole,
      );
      if (result.success) {
        // Optimistic update
        setUsers((prev) =>
          prev.map((u) =>
            u.id === confirmModal.user?.id
              ? { ...u, role: confirmModal.pendingRole! }
              : u,
          ),
        );
      } else {
        alert(result.error || "Failed to update role");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="w-full max-w-full p-4 sm:p-6 pb-12 space-y-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            User Management
          </h1>
          <p className="text-primary-500 mt-0.5 text-sm">
            {loading
              ? "Loading…"
              : `Managing ${totalCount} assigned user${totalCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:items-center">
          <div className="relative flex-1 min-w-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 size-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
              className={twMerge(
                "w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm h-[46px]",
                roleFilter !== "all"
                  ? "bg-brand-50 border-brand-200 text-brand-700"
                  : "bg-white border-primary-200 text-primary-700 hover:border-primary-300",
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiFilter className="size-4 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[140px]">
                  {ROLE_OPTIONS.find((r) => r.value === roleFilter)?.label}
                </span>
              </div>
              <FiChevronDown
                className={twMerge(
                  "size-3.5 shrink-0 transition-transform",
                  showFilterDropdown && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 bg-white border border-primary-200 rounded-2xl shadow-lg py-2"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setRoleFilter(opt.value);
                        setShowFilterDropdown(false);
                      }}
                      className={twMerge(
                        "w-full flex items-center px-4 py-2.5 text-sm transition-colors text-left",
                        roleFilter === opt.value
                          ? "bg-brand-50 text-brand-700 font-medium"
                          : "text-primary-700 hover:bg-primary-50",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User List */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col gap-3 w-full">
              {[...Array(5)].map((_, i) => (
                <UserSkeleton key={i} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white w-full rounded-2xl p-10 text-center border border-primary-100 shadow-sm">
              <div className="mx-auto size-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                <FiUser className="size-7 text-primary-400" />
              </div>
              <h3 className="text-base font-semibold text-primary-900 font-serif mb-1">
                No users found
              </h3>
              <p className="text-primary-500 text-sm max-w-xs mx-auto">
                {search
                  ? "Try adjusting your search or filter."
                  : "No users match the selected role."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-primary-100 shadow-sm min-w-0"
                  >
                    <div className="flex items-center gap-3 w-full sm:flex-1 min-w-0">
                      <UserAvatar
                        name={user.full_name || user.email}
                        avatarUrl={user.avatar_url}
                      />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h3 className="text-sm font-semibold text-primary-900 truncate">
                          {user.full_name || "Unknown User"}
                        </h3>
                        <p className="text-sm text-primary-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end w-full sm:w-auto shrink-0 relative">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value as UserRole)
                        }
                        disabled={
                          updatingUserId === user.id || user.role === "admin"
                        }
                        className={twMerge(
                          "appearance-none bg-primary-50 border border-primary-200 text-primary-800 text-sm font-medium rounded-lg px-3.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pr-8",
                          user.role === "counselor" &&
                            "bg-brand-50 text-brand-700 border-brand-200",
                          user.role === "admin" &&
                            "bg-error/10 text-error border-error/20",
                        )}
                      >
                        <option value="student">Student</option>
                        <option value="counselor">Counselor</option>
                        {user.role === "admin" && (
                          <option value="admin" disabled>
                            Admin
                          </option>
                        )}
                      </select>
                      <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-primary-400 pointer-events-none" />

                      {updatingUserId === user.id && (
                        <div className="absolute right-full mr-3">
                          <div className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pagination */}
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && confirmModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setConfirmModal({
                  isOpen: false,
                  user: null,
                  pendingRole: null,
                })
              }
              className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  Confirm Role Change
                </h3>
                <p className="text-primary-600 text-sm leading-relaxed mb-6">
                  Are you sure you want to change the role of{" "}
                  <strong className="text-primary-900 font-semibold">
                    {confirmModal.user.full_name || confirmModal.user.email}
                  </strong>{" "}
                  from{" "}
                  <span className="capitalize">{confirmModal.user.role}</span>{" "}
                  to{" "}
                  <strong className="text-brand-600 capitalize">
                    {confirmModal.pendingRole}
                  </strong>
                  ?
                </p>

                {confirmModal.pendingRole === "counselor" && (
                  <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <p className="text-xs text-warning-800 font-medium">
                      ⚠️ Counselors have access to the Admin Dashboard and can
                      view and edit student applications.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: false,
                        user: null,
                        pendingRole: null,
                      })
                    }
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmRoleUpdate}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-lg transition-colors"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
