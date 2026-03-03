"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiExternalLink,
  FiBookOpen,
  FiStar,
} from "react-icons/fi";
import { programRepository } from "@/lib/repositories/program.repo";
import { Program } from "@/lib/types/university";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export function ProgramsListPage({
  basePath = "/admin",
}: {
  basePath?: string;
}) {
  const [data, setData] = useState<Program[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchPrograms();
  }, [page, search]);

  async function fetchPrograms() {
    setIsLoading(true);
    try {
      const result = await programRepository.getProgramsWithCount({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: search || undefined,
      });
      setData(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleFeatured = async (row: Program) => {
    setTogglingId(row.id);
    try {
      await programRepository.updateFeatured(row.id, !row.is_featured, null);
      setData((prev) =>
        prev.map((p) =>
          p.id === row.id ? { ...p, is_featured: !p.is_featured } : p,
        ),
      );
      toast.success(
        row.is_featured ? "Removed from featured" : "Added to featured",
      );
    } catch {
      toast.error("Failed to update featured status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await programRepository.deleteProgram(deleteId);
      fetchPrograms();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Program>[] = [
    {
      header: "Program Name",
      accessor: "name_en",
      className: "w-1/3",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white border border-primary-200 overflow-hidden flex items-center justify-center shrink-0">
            <FiBookOpen className="size-4 text-brand-500" />
          </div>
          <div>
            <div
              className="font-medium capitalize text-primary-900 truncate max-w-[300px]"
              title={row.name_en}
            >
              {row.name_en}
            </div>
            <div className="text-xs text-primary-500">
              {(row as any).university?.name_en}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Degree",
      accessor: "degree_level",
      render: (row) => (
        <span className="capitalize text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
          {row.degree_level.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Duration",
      accessor: "duration",
      render: (row) => (
        <span className="text-sm text-primary-600">{row.duration || "—"}</span>
      ),
    },
    {
      header: "Language",
      accessor: "language",
      render: (row) => (
        <span className="capitalize text-xs text-primary-500">
          {row.language.replace(/_/g, " ")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            Programs
          </h1>
          <p className="text-primary-500">Manage academic programs</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search programs..."
        isLoading={isLoading}
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFeatured(row);
              }}
              disabled={togglingId === row.id}
              className={twMerge(
                "p-2 transition-colors cursor-pointer disabled:opacity-40",
                row.is_featured
                  ? "text-amber-400 hover:text-amber-500"
                  : "text-primary-300 hover:text-amber-400",
              )}
              title={
                row.is_featured ? "Remove from featured" : "Add to featured"
              }
            >
              <FiStar
                className={twMerge(
                  "size-4",
                  row.is_featured && "fill-amber-400",
                )}
              />
            </button>
            <Link
              href={`/universities/${(row as any).university?.slug}/programs/${row.slug}`}
              target="_blank"
              className="p-2 text-primary-400 hover:text-brand-600 transition-colors"
              title="View Public Page"
            >
              <FiExternalLink className="size-4" />
            </Link>
            <Link
              href={`${basePath}/universities/${row.university_id}/programs/${row.id}/edit`}
              className="p-2 text-primary-400 hover:text-brand-600 transition-colors"
              title="Edit"
            >
              <FiEdit2 className="size-4" />
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(row.id);
              }}
              className="p-2 text-primary-400 hover:text-red-600 transition-colors cursor-pointer"
              title="Delete"
            >
              <FiTrash2 className="size-4" />
            </button>
          </>
        )}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Program"
        message="Are you sure you want to delete this program? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function AdminProgramsPage() {
  return <ProgramsListPage basePath="/admin" />;
}
