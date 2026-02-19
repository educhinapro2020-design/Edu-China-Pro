"use client";

import { useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search...",
  isLoading = false,
  onRowClick,
  actions,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const getNestedValue = (obj: T, path: string): any => {
    return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
  };

  return (
    <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
      {onSearch && (
        <div className="px-4 py-3 border-b border-primary-100">
          <div className="relative max-w-xl">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 text-sm bg-primary-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all text-primary-900 placeholder:text-primary-400"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-100">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={twMerge(
                    "px-4 py-3 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-primary-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-primary-100 rounded-lg animate-pulse w-3/4" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-4">
                      <div className="h-4 bg-primary-100 rounded-lg animate-pulse w-16 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-primary-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={twMerge(
                    "transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-primary-25"
                      : "hover:bg-primary-25",
                  )}
                >
                  {columns.map((col, j) => (
                    <td
                      key={j}
                      className={twMerge(
                        "px-4 py-4 text-sm text-primary-700",
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : (getNestedValue(row, col.accessor as string) ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-primary-100 flex items-center justify-between">
          <p className="text-sm text-primary-500">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <FiChevronLeft className="size-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={twMerge(
                    "size-8 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    pageNum === page
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-primary-600 hover:bg-primary-50",
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <FiChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
