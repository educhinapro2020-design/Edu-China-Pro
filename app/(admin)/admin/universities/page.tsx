"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiExternalLink,
} from "react-icons/fi";
import { universityRepository } from "@/lib/repositories/university.repo";
import { University } from "@/lib/types/university";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/button";

export default function AdminUniversitiesPage() {
  const [data, setData] = useState<University[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      header: "Rank",
      accessor: "qs_rank",
      render: (row) => (
        <div className="text-xs">
          {row.qs_rank ? (
            <span className="px-2 py-0.5 bg-primary-100 rounded text-primary-700 font-medium">
              QS #{row.qs_rank}
            </span>
          ) : (
            "—"
          )}
        </div>
      ),
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

/*TODO: add actions
 {/*actions={(row) => (
          <>
            <Link
              href={`/universities/${row.slug}`}
              target="_blank"
              className="p-2 text-primary-400 hover:text-brand-600 transition-colors"
              title="View Public Page"
            >
              <FiExternalLink className="size-4" />
            </Link>
            <Link
              href={`/admin/universities/${row.id}/edit`}
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
        */
