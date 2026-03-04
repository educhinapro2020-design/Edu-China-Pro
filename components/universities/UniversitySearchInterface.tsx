"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UniversityCard from "@/components/UniversityCard";
import { University } from "@/lib/types/university";
import { FiSearch, FiX } from "react-icons/fi";
import { Select } from "@/components/ui/select";
import { POPULAR_CITIES } from "@/lib/constants/cities";
import {
  COUNTRY_SPECIFIC_LABELS,
  INSTITUTION_TYPE_OPTIONS,
} from "@/lib/constants/admin";

interface Props {
  initialData: University[];
  totalCount: number;
  initialFilter: any;
  currentPage: number;
  limit: number;
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-200">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-brand-900 transition-colors cursor-pointer"
      >
        <FiX className="size-3" />
      </button>
    </span>
  );
}

function UniversityCardSkeleton() {
  return (
    <div className="bg-white border border-primary-200 rounded-xl p-6 flex flex-col h-full animate-pulse">
      <div className="w-full h-24 mb-6 bg-primary-100 rounded-lg" />
      <div className="space-y-3 flex-1">
        <div className="h-5 bg-primary-100 rounded w-3/4" />
        <div className="h-3 bg-primary-100 rounded w-1/3" />
        <div className="h-3 bg-primary-100 rounded w-full" />
        <div className="h-3 bg-primary-100 rounded w-5/6" />
        <div className="h-3 bg-primary-100 rounded w-4/6" />
      </div>
      <div className="mt-4 pt-4 border-t border-primary-100">
        <div className="h-4 bg-primary-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function UniversitySearchInterface({
  initialData,
  totalCount,
  currentPage,
  limit,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");

  const activeCity = searchParams.get("city");
  const activeType = searchParams.get("type");
  const activeLabels =
    searchParams.get("labels")?.split(",").filter(Boolean) || [];

  const totalPages = Math.ceil(totalCount / limit);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      updateURL({ q: search || null, page: "1" });
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  function updateURL(params: Record<string, string | null>) {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (!value) newParams.delete(key);
      else newParams.set(key, value);
    });
    startTransition(() => {
      router.push(`/universities?${newParams.toString()}`, { scroll: false });
    });
  }

  function toggleLabel(label: string) {
    const exists = activeLabels.includes(label);
    const updated = exists
      ? activeLabels.filter((l) => l !== label)
      : [...activeLabels, label];
    updateURL({ labels: updated.length ? updated.join(",") : null, page: "1" });
  }

  function setCity(cityId: string) {
    updateURL({ city: cityId || null, page: "1" });
  }

  function setType(type: string) {
    updateURL({ type: type || null, page: "1" });
  }

  function changePage(page: number) {
    updateURL({ page: String(page) });
  }

  function clearAllFilters() {
    setSearch("");
    startTransition(() => {
      router.push("/universities", { scroll: false });
    });
  }

  const activeCityName = POPULAR_CITIES.find(
    (c) => c.id === activeCity,
  )?.name_en;
  const activeTypeName = INSTITUTION_TYPE_OPTIONS.find(
    (o) => o.value === activeType,
  )?.label;
  const searchQuery = searchParams.get("q");
  const hasActiveFilters =
    !!activeCity || !!activeType || activeLabels.length > 0 || !!searchQuery;

  const cityOptions = [
    { value: "", label: "All cities" },
    ...POPULAR_CITIES.map((c) => ({ value: c.id, label: c.name_en })),
  ];
  const typeOptions = [
    { value: "", label: "All types" },
    ...INSTITUTION_TYPE_OPTIONS.map((o) => ({
      value: o.value,
      label: o.label,
    })),
  ];

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          City
        </p>
        <Select
          textClassName="text-sm font-medium"
          value={activeCity || ""}
          onChange={(val) => setCity(val)}
          options={cityOptions}
          placeholder="All cities"
        />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          Institution Type
        </p>
        <Select
          textClassName="text-sm font-medium"
          value={activeType || ""}
          onChange={(val) => setType(val)}
          options={typeOptions}
          placeholder="All types"
        />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          University Category
        </p>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_SPECIFIC_LABELS.map((label) => {
            const isActive = activeLabels.includes(label.key);
            return (
              <button
                key={label.key}
                onClick={() => toggleLabel(label.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-50 text-brand-700 border-brand-200 ring-2 ring-offset-1 ring-brand-200"
                    : "border-primary-200 text-primary-600 hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                {label.label}
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm flex items-center gap-1 text-primary-500 hover:text-primary-700 font-medium transition-colors cursor-pointer"
        >
          <FiX className="size-3.5 shrink-0" />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-linea-to-br from-brand-50 via-white to-primary-50 pt-24 pb-12 md:pt-28 md:pb-20">
        <div className="absolute top-0 right-0 size-[200px] bg-brand-200 rounded-full filter blur-lg opacity-10" />
        <div className="absolute bottom-0 left-0 size-[200px] bg-brand-200 rounded-full filter blur-lg opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] bg-primary-100 rounded-full filter blur-2xl opacity-10 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 brand-text">
            Top Universities in China for International Students
          </h1>
          <p className="text-primary-500 text-base md:text-lg mb-10 max-w-2xl mx-auto">
            Browse hundreds of accredited Chinese universities offering programs
            in English and Chinese across all provinces.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateURL({ q: search || null, page: "1" });
            }}
          >
            <div className="relative shadow-sm rounded-2xl bg-white border border-primary-200">
              <FiSearch className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by university name..."
                className="w-full h-14 md:h-16 pl-12 md:pl-14 pr-10 rounded-2xl focus:outline-none text-base md:text-lg text-primary-900 placeholder:text-primary-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-primary-400 hover:text-primary-600 transition-colors cursor-pointer"
                >
                  <FiX className="size-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
          <aside className="lg:sticky lg:top-20 lg:self-start lg:h-fit">
            {filterPanel}
          </aside>

          <div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-primary-500 mr-1">
                  Showing results for
                </span>
                {searchQuery && (
                  <FilterChip
                    label={`"${searchQuery}"`}
                    onRemove={() => {
                      setSearch("");
                      updateURL({ q: null, page: "1" });
                    }}
                  />
                )}
                {activeCityName && (
                  <FilterChip
                    label={activeCityName}
                    onRemove={() => setCity("")}
                  />
                )}
                {activeTypeName && (
                  <FilterChip
                    label={activeTypeName}
                    onRemove={() => setType("")}
                  />
                )}
                {activeLabels.map((key) => {
                  const lbl = COUNTRY_SPECIFIC_LABELS.find(
                    (l) => l.key === key,
                  );
                  return lbl ? (
                    <FilterChip
                      key={key}
                      label={lbl.label}
                      onRemove={() => toggleLabel(key)}
                    />
                  ) : null;
                })}
              </div>
            )}

            {isPending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <UniversityCardSkeleton key={i} />
                ))}
              </div>
            ) : initialData.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-primary-400 text-lg mb-3">
                  No universities found matching your criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {initialData.map((uni) => (
                    <UniversityCard key={uni.id} university={uni} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 md:mt-16 gap-1.5 flex-wrap">
                    {currentPage > 1 && (
                      <button
                        onClick={() => changePage(currentPage - 1)}
                        className="px-3 py-2 rounded-lg text-sm font-medium border bg-white border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                      >
                        Prev
                      </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => {
                      const page = i + 1;
                      if (
                        totalPages > 7 &&
                        page !== 1 &&
                        page !== totalPages &&
                        Math.abs(page - currentPage) > 2
                      ) {
                        if (page === 2 || page === totalPages - 1)
                          return (
                            <span
                              key={i}
                              className="px-2 py-2 text-sm text-primary-400"
                            >
                              …
                            </span>
                          );
                        return null;
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => changePage(page)}
                          className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                            currentPage === page
                              ? "bg-brand-600 text-white border-brand-600"
                              : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {currentPage < totalPages && (
                      <button
                        onClick={() => changePage(currentPage + 1)}
                        className="px-3 py-2 rounded-lg text-sm font-medium border bg-white border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
