"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiBookOpen,
  FiArrowLeft,
  FiStar,
} from "react-icons/fi";
import { programRepository } from "@/lib/repositories/program.repo";
import { universityRepository } from "@/lib/repositories/university.repo";
import { Program, University } from "@/lib/types/university";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export function NestedProgramsPage({
  basePath = "/admin",
}: {
  basePath?: string;
}) {
  const params = useParams();
  const universityId = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
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
    async function fetchUni() {
      if (universityId) {
        const u = await universityRepository.getUniversityById(universityId);
        setUniversity(u);
      }
    }
    fetchUni();
  }, [universityId]);

  useEffect(() => {
    fetchPrograms();
  }, [page, search, universityId]);

  async function fetchPrograms() {
    setIsLoading(true);
    try {
      const result = await programRepository.getProgramsWithCount({
        universityId,
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
              {row.degree_level.replace("_", " ")}
            </div>
          </div>
        </div>
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
        <span className="capitalize text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
          {row.language.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Intake",
      accessor: "intake_season",
      render: (row) => (
        <span className="capitalize text-xs text-primary-500">
          {row.intake_season || "—"}
        </span>
      ),
    },
  ];

  if (!university && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ProgressiveLoader isAdmin message="Loading programs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`${basePath}/universities`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
        >
          <FiArrowLeft className="size-4" />
          Back to Universities
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {university?.logo_url && (
              <div className="relative size-12 rounded-full overflow-hidden border border-primary-200 shrink-0 bg-white">
                <img
                  src={university.logo_url}
                  alt={university.name_en}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-primary-900 font-serif">
                {university ? `${university.name_en} Programs` : "Programs"}
              </h1>
              <p className="text-primary-500">
                Manage academic programs for this university
              </p>
            </div>
          </div>
          <Link
            href={`${basePath}/universities/${universityId}/programs/new`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
          >
            <Button startIcon={<FiPlus />} size="sm">
              Add Program
            </Button>
          </Link>
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
              href={`/universities/${university?.slug}/programs/${row.slug}`}
              target="_blank"
              className="p-2 text-primary-400 hover:text-brand-600 transition-colors"
              title="View Public Page"
            >
              <FiExternalLink className="size-4" />
            </Link>
            <Link
              href={`${basePath}/universities/${universityId}/programs/${row.id}/edit`}
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

export default function AdminNestedProgramsPage() {
  return <NestedProgramsPage basePath="/admin" />;
}
