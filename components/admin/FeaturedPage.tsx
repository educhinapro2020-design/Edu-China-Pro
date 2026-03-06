"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  FiMenu,
  FiTrash2,
  FiEdit,
  FiBook,
  FiHome,
  FiLoader,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { universityRepository } from "@/lib/repositories/university.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { University, Program } from "@/lib/types/university";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

type Tab = "universities" | "programs";
type FeaturedUniversity = University & {
  featured_order: number | null;
  is_featured: boolean;
};
type FeaturedProgram = Program & {
  featured_order: number | null;
  is_featured: boolean;
};

export function FeaturedPage() {
  const [tab, setTab] = useState<Tab>("programs");

  const [featuredUniversities, setFeaturedUniversities] = useState<
    FeaturedUniversity[]
  >([]);
  const [featuredPrograms, setFeaturedPrograms] = useState<FeaturedProgram[]>(
    [],
  );

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const dragItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      universityRepository.getFeaturedUniversities(),
      programRepository.getFeaturedPrograms(),
    ]).then(([uniData, progData]) => {
      setFeaturedUniversities(
        [...uniData].sort(
          (a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999),
        ) as FeaturedUniversity[],
      );
      setFeaturedPrograms(
        [...progData].sort(
          (a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999),
        ) as FeaturedProgram[],
      );
      setLoading(false);
    });
  }, []);

  const handleConfirmRemove = async () => {
    if (!confirmId) return;
    setIsRemoving(true);
    try {
      if (tab === "universities") {
        await universityRepository.updateFeatured(confirmId, false, null);
        setFeaturedUniversities((prev) =>
          prev.filter((u) => u.id !== confirmId),
        );
      } else {
        await programRepository.updateFeatured(confirmId, false, null);
        setFeaturedPrograms((prev) => prev.filter((p) => p.id !== confirmId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemoving(false);
      setConfirmId(null);
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
  const handleDragEnd = async (type: Tab) => {
    if (dragItem.current === null || dragOverIndex === null || searchQuery) {
      dragItem.current = null;
      setDragOverIndex(null);
      return;
    }
    const realDragIndex = (page - 1) * PAGE_SIZE + dragItem.current;
    const realOverIndex = (page - 1) * PAGE_SIZE + dragOverIndex;

    let reorderedUnis = featuredUniversities;
    let reorderedProgs = featuredPrograms;
    if (type === "universities") {
      reorderedUnis = [...featuredUniversities];
      const [moved] = reorderedUnis.splice(realDragIndex, 1);
      reorderedUnis.splice(realOverIndex, 0, moved);
      setFeaturedUniversities(reorderedUnis);
    } else {
      reorderedProgs = [...featuredPrograms];
      const [moved] = reorderedProgs.splice(realDragIndex, 1);
      reorderedProgs.splice(realOverIndex, 0, moved);
      setFeaturedPrograms(reorderedProgs);
    }
    dragItem.current = null;
    setDragOverIndex(null);

    setIsSaving(true);
    try {
      await Promise.all([
        ...reorderedUnis.map((u, i) =>
          universityRepository.updateFeatured(u.id, true, i + 1),
        ),
        ...reorderedProgs.map((p, i) =>
          programRepository.updateFeatured(p.id, true, i + 1),
        ),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const allFeaturedItems =
    tab === "universities" ? featuredUniversities : featuredPrograms;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return allFeaturedItems;
    const q = searchQuery.toLowerCase();
    return allFeaturedItems.filter(
      (item) =>
        item.name_en.toLowerCase().includes(q) ||
        (tab === "universities" &&
          (item as any).city?.name_en?.toLowerCase().includes(q)) ||
        (tab === "programs" &&
          (item as any).university?.name_en?.toLowerCase().includes(q)),
    );
  }, [allFeaturedItems, searchQuery, tab]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, tab]);

  const confirmItem = allFeaturedItems.find((i) => i.id === confirmId);

  const getEditLink = (item: FeaturedUniversity | FeaturedProgram) => {
    if (tab === "universities") {
      return `/admin/universities/${item.id}/edit`;
    } else {
      const prog = item as FeaturedProgram;
      return `/admin/universities/${(prog as any).university_id}/programs/${prog.id}/edit`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            Featured
          </h1>
          <p className="text-primary-500 text-sm mt-0.5">
            Manage what appears on the homepage
          </p>
        </div>
        {isSaving && (
          <span className="inline-flex items-center gap-1.5 text-xs text-primary-400">
            <FiLoader className="size-3 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-primary-50 rounded-xl w-fit border border-primary-100">
          {(["programs", "universities"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={twMerge(
                "px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200",
                tab === t
                  ? "bg-white text-primary-900 shadow-sm"
                  : "text-primary-500 hover:text-primary-700",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary-400" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-primary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-primary-900">
              Featured {tab === "universities" ? "Universities" : "Programs"}
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
                    <div className="h-3.5 w-40 rounded bg-primary-100" />
                    <div className="h-2.5 w-24 rounded bg-primary-50" />
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
              <FiHome className="size-8 mb-2 opacity-30" />
              <p className="text-sm">
                {searchQuery ? "No results found" : `No featured ${tab} yet`}
              </p>
            </div>
          ) : null}
          {paginatedItems.map(
            (item: FeaturedUniversity | FeaturedProgram, index: number) => (
              <div
                key={item.id}
                draggable={!searchQuery}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={() => handleDragEnd(tab)}
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

                <div className="size-9 rounded-xl bg-primary-50 border border-primary-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {tab === "universities" && (item as any).logo_url ? (
                    <img
                      src={(item as any).logo_url}
                      alt={item.name_en}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : tab === "universities" ? (
                    <FiHome className="size-4 text-primary-400" />
                  ) : (item as any).university?.logo_url ? (
                    <img
                      src={(item as any).university.logo_url}
                      alt={(item as any).university.name_en}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <FiBook className="size-4 text-brand-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold capitalize text-primary-900 truncate">
                    {item.name_en}
                  </p>
                  {tab === "universities" && (item as any).city?.name_en && (
                    <p className="text-xs text-primary-400 truncate">
                      {(item as any).city.name_en}
                    </p>
                  )}
                  {tab === "programs" && (
                    <p className="text-xs text-primary-400 truncate">
                      {(item as any).university?.name_en}
                      {(item as any).degree_level &&
                        ` · ${(item as any).degree_level.replace(/_/g, " ")}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={getEditLink(item)}
                    title="Edit"
                    className="p-1.5 text-primary-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    <FiEdit className="size-3.5" />
                  </Link>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    title="Remove from featured"
                    className="p-1.5 text-primary-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ),
          )}
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
        onConfirm={handleConfirmRemove}
        title="Remove from Featured"
        message={`Are you sure you want to remove "${confirmItem?.name_en}" from featured? It will no longer appear on the homepage.`}
        isLoading={isRemoving}
      />
    </div>
  );
}

export default function AdminFeaturedPage() {
  return <FeaturedPage />;
}
