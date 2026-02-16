"use client";

import { useState, useMemo } from "react";
import { University, Program } from "@/lib/types/university";
import ProgramCard from "@/components/ProgramCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FiInfo,
  FiSearch,
  FiBookOpen,
  FiX,
  FiFilter,
  FiTrendingUp,
} from "react-icons/fi";

interface UniversityContentProps {
  university: University;
  programs: Program[];
}

export function UniversityContent({
  university,
  programs,
}: UniversityContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("all");
  const [selectedIntake, setSelectedIntake] = useState("all");

  const degreeOptions = useMemo(() => {
    const degrees = Array.from(new Set(programs.map((p) => p.degree_level)));
    return [
      { label: "All Degrees", value: "all" },
      ...degrees.map((d) => ({
        label: d.charAt(0).toUpperCase() + d.slice(1).replace("_", " "),
        value: d,
      })),
    ];
  }, [programs]);

  const intakeOptions = useMemo(() => {
    const intakes = Array.from(
      new Set(
        programs
          .map((p) => p.intake_season)
          .filter((i): i is NonNullable<typeof i> => Boolean(i)),
      ),
    );
    return [
      { label: "All Intakes", value: "all" },
      ...intakes.map((i) => ({
        label: i!.charAt(0).toUpperCase() + i!.slice(1),
        value: i!,
      })),
    ];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        program.name_en.toLowerCase().includes(searchLower) ||
        program.degree_level.toLowerCase().includes(searchLower);

      const matchesDegree =
        selectedDegree === "all" || program.degree_level === selectedDegree;

      const matchesIntake =
        selectedIntake === "all" ||
        (program.intake_season && program.intake_season === selectedIntake);

      return matchesSearch && matchesDegree && matchesIntake;
    });
  }, [programs, searchQuery, selectedDegree, selectedIntake]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDegree("all");
    setSelectedIntake("all");
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedDegree !== "all" || selectedIntake !== "all";

  return (
    <div className="bg-primary-50/30 py-16">
      <div className="container mx-auto px-6 max-w-5xl space-y-16">
        <section id="programs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <FiBookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-900 font-serif">
                  Academic Programs
                </h2>
              </div>
              <p className="text-primary-500">
                Explore a wide range of degrees taught in English and Chinese,
                designed to prepare you for a global career.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-4xl border border-primary-100 shadow-sm p-6 md:p-10 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <form
                className="w-full lg:w-1/3"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.currentTarget.querySelector("input")?.blur();
                }}
              >
                <Input
                  placeholder="Search majors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<FiSearch className="w-5 h-5 text-primary-400" />}
                  className="bg-primary-50/50 border-transparent focus:bg-white focus:border-brand-300 h-12"
                />
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 grow">
                <Select
                  value={selectedDegree}
                  onChange={setSelectedDegree}
                  options={degreeOptions}
                  placeholder="Degree Level"
                  className="w-full h-12 bg-primary-50/50 border-transparent hover:border-primary-200"
                />
                <Select
                  value={selectedIntake}
                  onChange={setSelectedIntake}
                  options={intakeOptions}
                  placeholder="Intake Season"
                  className="w-full h-12 bg-primary-50/50 border-transparent hover:border-primary-200"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-6 pt-6 border-t border-primary-100 flex items-center justify-between">
                <p className="text-sm font-medium text-primary-500">
                  Found{" "}
                  <span className="text-brand-600 font-bold">
                    {filteredPrograms.length}
                  </span>{" "}
                  matching programs
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-red-500 hover:bg-red-50"
                >
                  <FiX className="mr-2" /> Reset Filters
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  className="hover:shadow-2xl"
                />
              ))
            ) : (
              <div className="col-span-full py-20 px-2 text-center bg-white rounded-4xl border-2 border-dashed border-primary-200">
                <div className="size-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                  <FiFilter className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2 font-serif">
                  No programs found
                </h3>
                <p className="text-primary-500 mb-8 max-w-sm mx-auto">
                  Try adjusting your filters or keywords to see more results.
                </p>
                <Button onClick={resetFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        <section
          id="about"
          className="bg-white rounded-4xl border border-primary-100 shadow-sm p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2 md:mb-4">
              <div className="size-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                <FiInfo className="size-5" />
              </div>
              <h2 className="text-base md:text-xl font-bold text-primary-900 font-serif">
                About <span className="inline md:hidden">University</span>
                <span className="hidden md:inline brand-text">
                  {university.name_en}
                </span>
              </h2>
            </div>

            <div className="prose prose-brand max-w-none prose-p:text-primary-600 prose-headings:font-serif">
              <p className="body line-clamp-8 md:line-clamp-6 text-sm md:text-base">
                {university.profile_text ||
                  "A prestigious university offering comprehensive programs for international students."}
              </p>

              {university.advantages_html && (
                <div className="mt-12 pt-12 border-t border-primary-100">
                  <div className="flex items-center gap-4 mb-6">
                    <FiTrendingUp className="text-brand-500 w-6 h-6" />
                    <h3 className="text-2xl font-bold text-primary-900 m-0 font-serif">
                      Why {university.name_en}?
                    </h3>
                  </div>
                  <div
                    className="prose-li:text-primary-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: university.advantages_html,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
