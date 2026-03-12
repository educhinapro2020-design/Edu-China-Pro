"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  FiMenu,
  FiTrash2,
  FiEdit,
  FiPlus,
  FiLoader,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiCalendar,
} from "react-icons/fi";
import { HiMegaphone } from "react-icons/hi2";
import { Announcement } from "@/lib/types/announcement";
import { announcementRepository } from "@/lib/repositories/announcement.repo";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { AnnouncementFormModal } from "@/components/admin/AnnouncementFormModal";
import { twMerge } from "tailwind-merge";

const PAGE_SIZE = 10;

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const dragItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    announcementRepository.getAll().then((data) => {
      setAnnouncements(
        [...data].sort((a, b) => a.display_order - b.display_order),
      );
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    setIsDeleting(true);
    try {
      await announcementRepository.delete(confirmId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== confirmId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setConfirmId(null);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const next = !current;
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: next } : a)),
    );
    try {
      await announcementRepository.toggleActive(id, next);
    } catch (err) {
      console.error(err);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: current } : a)),
      );
    }
  };

  const handleDragStart = (index: number) => {
    if (searchQuery) return;
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    if (searchQuery) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverIndex === null || searchQuery) {
      dragItem.current = null;
      setDragOverIndex(null);
      return;
    }
    const realDragIndex = (page - 1) * PAGE_SIZE + dragItem.current;
    const realOverIndex = (page - 1) * PAGE_SIZE + dragOverIndex;

    const reordered = [...announcements];
    const [moved] = reordered.splice(realDragIndex, 1);
    reordered.splice(realOverIndex, 0, moved);
    setAnnouncements(reordered);

    dragItem.current = null;
    setDragOverIndex(null);

    setIsSaving(true);
    try {
      await Promise.all(
        reordered.map((a, i) =>
          announcementRepository.updateOrder(a.id, i + 1),
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaved = (saved: Announcement) => {
    setAnnouncements((prev) => {
      const exists = prev.find((a) => a.id === saved.id);
      if (exists) {
        return prev.map((a) => (a.id === saved.id ? saved : a));
      }
      return [...prev, saved];
    });
    setEditing(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return announcements;
    const q = searchQuery.toLowerCase();
    return announcements.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.link_url?.toLowerCase().includes(q),
    );
  }, [announcements, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const confirmItem = announcements.find((a) => a.id === confirmId);

  const formatDate = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            Announcements
          </h1>
          <p className="text-primary-500 text-sm mt-0.5">
            Manage sitewide announcement banners
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary-400">
              <FiLoader className="size-3 animate-spin" />
              Saving...
            </span>
          )}
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
          >
            <FiPlus className="size-4" />
            Add Announcement
          </button>
        </div>
      </div>

      <div className="relative w-full md:w-72">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary-400" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
        />
      </div>

      <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-primary-900">
              All Announcements
              <span className="ml-2 text-xs font-normal text-primary-400">
                ({filteredItems.length})
              </span>
            </h2>
            <p className="text-sm text-primary-500 mt-0.5">
              {searchQuery
                ? "Search active · reordering disabled"
                : "Drag to reorder · order updates automatically"}
            </p>
          </div>
        </div>

        <div className="divide-y divide-primary-50 min-h-[420px]">
          {loading ? (
            <div className="animate-pulse divide-y divide-primary-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                  <div className="size-4 rounded bg-primary-100 shrink-0" />
                  <div className="w-5 h-3 rounded bg-primary-100 shrink-0" />
                  <div className="size-9 rounded-xl bg-primary-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-48 rounded bg-primary-100" />
                    <div className="h-2.5 w-28 rounded bg-primary-50" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-7 rounded-lg bg-primary-50" />
                    <div className="size-7 rounded-lg bg-primary-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[420px] text-primary-400">
              <HiMegaphone className="size-8 mb-2 opacity-30" />
              <p className="text-sm">
                {searchQuery ? "No results found" : "No announcements yet"}
              </p>
            </div>
          ) : null}

          {paginatedItems.map((item, index) => (
            <div
              key={item.id}
              draggable={!searchQuery}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={twMerge(
                "flex items-center gap-3 px-6 py-3.5 transition-all duration-150",
                !searchQuery && "cursor-grab active:cursor-grabbing",
                dragOverIndex === index &&
                  dragItem.current !== index &&
                  "bg-brand-50 border-l-4 border-brand-500",
              )}
            >
              {!searchQuery && (
                <FiMenu className="size-4 text-primary-300 shrink-0" />
              )}
              <span className="text-xs font-bold text-primary-300 w-5 shrink-0">
                {(page - 1) * PAGE_SIZE + index + 1}
              </span>

              <div className="w-16 aspect-8/1 rounded-lg bg-primary-50 border border-primary-100 shrink-0 flex items-center justify-center overflow-hidden">
                {item.desktop_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.desktop_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiMegaphone className="size-3.5 text-brand-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-900 truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.link_url && (
                    <span className="inline-flex items-center gap-1 text-xs text-brand-600">
                      <FiExternalLink className="size-3" />
                      <span className="truncate max-w-[120px]">
                        {item.link_url}
                      </span>
                    </span>
                  )}
                  {(item.starts_at || item.ends_at) && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-400">
                      <FiCalendar className="size-3" />
                      {formatDate(item.starts_at) || "..."} →{" "}
                      {formatDate(item.ends_at) || "..."}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleToggleActive(item.id, item.is_active)}
                className={twMerge(
                  "relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0",
                  item.is_active ? "bg-brand-600" : "bg-primary-200",
                )}
                title={item.is_active ? "Deactivate" : "Activate"}
              >
                <span
                  className={twMerge(
                    "absolute top-0.5 left-0.5 size-4.5 bg-white rounded-full shadow transition-transform duration-200",
                    item.is_active && "translate-x-[18px]",
                  )}
                />
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  title="Edit"
                  className="p-1.5 text-primary-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <FiEdit className="size-3.5" />
                </button>
                <button
                  onClick={() => setConfirmId(item.id)}
                  title="Delete"
                  className="p-1.5 text-primary-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <FiTrash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-primary-100 flex items-center justify-between bg-primary-25/50">
            <p className="text-xs font-medium text-primary-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filteredItems.length)} of{" "}
              {filteredItems.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={twMerge(
                      "size-8 rounded-lg text-xs font-bold transition-all",
                      page === i + 1
                        ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                        : "text-primary-500 hover:bg-white hover:text-primary-900",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${confirmItem?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      <AnnouncementFormModal
        key={editing?.id ?? "new"}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        editing={editing}
      />
    </div>
  );
}
