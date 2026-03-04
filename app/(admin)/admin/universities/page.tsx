"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiExternalLink,
  FiStar,
} from "react-icons/fi";
import { universityRepository } from "@/lib/repositories/university.repo";
import { University } from "@/lib/types/university";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export function UniversitiesPage({
  basePath = "/admin",
}: {
  basePath?: string;
}) {
  const [data, setData] = useState<University[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchUniversities();
  }, [page, search]);

  async function fetchUniversities() {
    setIsLoading(true);
    try {
      const result = await universityRepository.getUniversitiesWithCount({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        search: search || undefined,
      });
      setData(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleFeatured = async (row: University) => {
    setTogglingId(row.id);
    try {
      await universityRepository.updateFeatured(row.id, !row.is_featured, null);
      setData((prev) =>
        prev.map((u) =>
          u.id === row.id ? { ...u, is_featured: !u.is_featured } : u,
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
      await universityRepository.deleteUniversity(deleteId);
      fetchUniversities();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<University>[] = [
    {
      header: "University",
      accessor: "name_en",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-white border border-primary-200 overflow-hidden flex items-center justify-center shrink-0">
            {row.logo_url ? (
              <img
                src={row.logo_url}
                alt={row.name_en}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs text-primary-400 font-bold">
                {row.name_en.substring(0, 2)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-primary-900">{row.name_en}</div>
            <div className="text-xs text-primary-500 truncate max-w-[200px]">
              {row.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: "city.name_en",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-primary-600">
          <FiMapPin className="size-3.5" />
          <span>{(row as any).city?.name_en || "Unknown"}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "institution_type",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
            row.institution_type === "public"
              ? "bg-blue-50 text-blue-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {row.institution_type}
        </span>
      ),
    },

    {
      header: "Programs",
      accessor: "id",
      render: (row) => {
        const programsInfo = (row as any).programs;
        const count =
          programsInfo && programsInfo.length > 0 ? programsInfo[0].count : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary-500">
              {count}
            </span>
            <Link
              href={`${basePath}/universities/${row.id}/programs`}
              className="px-3 py-1 flex items-center gap-2 cursor-pointer text-primary-600 hover:text-brand-600 hover:underline rounded-lg text-sm font-medium transition-colors"
            >
              <FiExternalLink />
              Manage
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            Universities
          </h1>
          <p className="text-primary-500">Manage university profiles</p>
        </div>
        <Link
          href={`${basePath}/universities/new`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
        >
          <Button startIcon={<FiPlus />} size="sm">
            Add University
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search universities..."
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
                  ? "text-amber-400 hover:text-gold-500"
                  : "text-primary-300 hover:text-gold-500",
              )}
              title={
                row.is_featured ? "Remove from featured" : "Add to featured"
              }
            >
              <FiStar
                className={twMerge(
                  "size-5",
                  row.is_featured && "fill-amber-400",
                )}
              />
            </button>
            <Link
              href={`/universities/${row.slug}`}
              target="_blank"
              className="p-2 text-primary-400 hover:text-brand-600 transition-colors"
              title="View Public Page"
            >
              <FiExternalLink className="size-4" />
            </Link>
            <Link
              href={`${basePath}/universities/${row.id}/edit`}
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
        title="Delete University"
        message="Are you sure you want to delete this university? This action cannot be undone and will cascadingly delete all associated programs."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function AdminUniversitiesPage() {
  return <UniversitiesPage basePath="/admin" />;
}
