"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Program, ProgramFilter } from "@/lib/types/university";
import { FiSearch, FiX } from "react-icons/fi";
import { Select } from "@/components/ui/select";
import {
  DEGREE_LEVEL_OPTIONS,
  SCHOLARSHIP_TYPE_OPTIONS,
  INTAKE_SEASON_OPTIONS,
  TEACHING_LANGUAGE_OPTIONS,
} from "@/lib/constants/admin";
import ProgramCard from "@/components/ProgramCard";

interface Props {
  initialData: Program[];
  totalCount: number;
  initialFilter: ProgramFilter;
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

function ProgramCardSkeleton() {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white overflow-hidden animate-pulse">
      <div className="h-40 bg-primary-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-primary-100 rounded w-3/4" />
        <div className="h-3 bg-primary-100 rounded w-1/2" />
        <div className="h-3 bg-primary-100 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function ProgramSearchInterface({
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
  const [minTuition, setMinTuition] = useState(
    searchParams.get("minTuition") || "",
  );
  const [maxTuition, setMaxTuition] = useState(
    searchParams.get("maxTuition") || "",
  );

  const activeDegree = searchParams.get("degree");
  const activeIntake = searchParams.get("intake");
  const activeLanguage = searchParams.get("language");
  const activeScholarship = searchParams.get("scholarship");

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
      router.push(`/programs?${newParams.toString()}`, { scroll: false });
    });
  }

  function applyTuition() {
    updateURL({
      minTuition: minTuition || null,
      maxTuition: maxTuition || null,
      page: "1",
    });
  }

  function clearAllFilters() {
    setSearch("");
    setMinTuition("");
    setMaxTuition("");
    startTransition(() => {
      router.push("/programs", { scroll: false });
    });
  }

  function changePage(page: number) {
    updateURL({ page: String(page) });
  }

  const searchQuery = searchParams.get("q");
  const activeTuitionMin = searchParams.get("minTuition");
  const activeTuitionMax = searchParams.get("maxTuition");

  const hasActiveFilters =
    !!activeDegree ||
    !!activeIntake ||
    !!activeLanguage ||
    !!activeScholarship ||
    !!searchQuery ||
    !!activeTuitionMin ||
    !!activeTuitionMax;

  const activeDegreeName = DEGREE_LEVEL_OPTIONS.find(
    (o) => o.value === activeDegree,
  )?.label;
  const activeIntakeName = INTAKE_SEASON_OPTIONS.find(
    (o) => o.value === activeIntake,
  )?.label;
  const activeLanguageName = TEACHING_LANGUAGE_OPTIONS.find(
    (o) => o.value === activeLanguage,
  )?.label;
  const activeScholarshipName = SCHOLARSHIP_TYPE_OPTIONS.find(
    (o) => o.value === activeScholarship,
  )?.label;

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          Tuition Range (RMB per year)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minTuition}
            onChange={(e) => setMinTuition(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-primary-200 text-sm text-primary-900 focus:outline-none focus:border-brand-400"
          />
          <span className="text-primary-400 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxTuition}
            onChange={(e) => setMaxTuition(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-primary-200 text-sm text-primary-900 focus:outline-none focus:border-brand-400"
          />
        </div>
        <button
          onClick={applyTuition}
          className="mt-3 px-4 md:w-full h-9 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors cursor-pointer"
        >
          Apply
        </button>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          Degree Level
        </p>
        <Select
          textClassName="text-sm font-medium"
          value={activeDegree || ""}
          onChange={(val) => updateURL({ degree: val || null, page: "1" })}
          options={[
            { value: "", label: "All levels" },
            ...DEGREE_LEVEL_OPTIONS,
          ]}
          placeholder="All levels"
        />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          Intake Season
        </p>
        <Select
          textClassName="text-sm font-medium"
          value={activeIntake || ""}
          onChange={(val) => updateURL({ intake: val || null, page: "1" })}
          options={[
            { value: "", label: "All seasons" },
            ...INTAKE_SEASON_OPTIONS,
          ]}
          placeholder="All seasons"
        />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          Teaching Language
        </p>
        <Select
          textClassName="text-sm font-medium"
          value={activeLanguage || ""}
          onChange={(val) => updateURL({ language: val || null, page: "1" })}
          options={[
            { value: "", label: "All languages" },
            ...TEACHING_LANGUAGE_OPTIONS,
          ]}
          placeholder="All languages"
        />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-3">
          Scholarship
        </p>
        <Select
          textClassName="text-sm font-medium"
          value={activeScholarship || ""}
          onChange={(val) => updateURL({ scholarship: val || null, page: "1" })}
          options={[
            { value: "", label: "All types" },
            ...SCHOLARSHIP_TYPE_OPTIONS,
          ]}
          placeholder="All types"
        />
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
      <section className="relative pt-24 pb-12 md:pt-28 md:pb-20">
        <div className="absolute top-0 right-0 size-[200px] bg-brand-200 rounded-full filter blur-lg opacity-10" />
        <div className="absolute bottom-0 left-0 size-[200px] bg-brand-200 rounded-full filter blur-lg opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] bg-primary-100 rounded-full filter blur-2xl opacity-10 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl relative">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-500 mb-4 px-3 py-1">
            5000+ Programs · 1000+ Universities
          </span>
          <h1 className="text-3xl md:text-5xl font-sans font-bold py-2 mb-4 brand-text">
            Study in China: Bachelor&apos;s, Master&apos;s & PhD Programs
          </h1>
          <p className="text-primary-500 text-base md:text-lg mb-10 max-w-3xl mx-auto">
            Find bachelor's, master's, and doctoral programs taught in English
            and Chinese — with scholarships, spring & autumn intakes, and
            affordable tuition across China's universities.
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
                placeholder="Search programs"
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
                {activeDegreeName && (
                  <FilterChip
                    label={activeDegreeName}
                    onRemove={() => updateURL({ degree: null, page: "1" })}
                  />
                )}
                {activeIntakeName && (
                  <FilterChip
                    label={activeIntakeName}
                    onRemove={() => updateURL({ intake: null, page: "1" })}
                  />
                )}
                {activeLanguageName && (
                  <FilterChip
                    label={activeLanguageName}
                    onRemove={() => updateURL({ language: null, page: "1" })}
                  />
                )}
                {activeScholarshipName && (
                  <FilterChip
                    label={activeScholarshipName}
                    onRemove={() => updateURL({ scholarship: null, page: "1" })}
                  />
                )}
                {activeTuitionMin && (
                  <FilterChip
                    label={`Min RMB ${activeTuitionMin}`}
                    onRemove={() => {
                      setMinTuition("");
                      updateURL({ minTuition: null, page: "1" });
                    }}
                  />
                )}
                {activeTuitionMax && (
                  <FilterChip
                    label={`Max RMB ${activeTuitionMax}`}
                    onRemove={() => {
                      setMaxTuition("");
                      updateURL({ maxTuition: null, page: "1" });
                    }}
                  />
                )}
              </div>
            )}

            {isPending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProgramCardSkeleton key={i} />
                ))}
              </div>
            ) : initialData.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-primary-400 text-lg mb-3">
                  No programs found matching your criteria.
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
                  {initialData.map((program) => (
                    <ProgramCard key={program.id} program={program} />
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
