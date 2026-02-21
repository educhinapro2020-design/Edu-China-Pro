"use client";

import { useEffect, useState } from "react";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { programRepository } from "@/lib/repositories/program.repo";
import { Program } from "@/lib/types/university";
import { useParams } from "next/navigation";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function EditProgramPage() {
  const params = useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProgram() {
      if (!params.programId) return;
      try {
        const data = await programRepository.getProgramById(
          params.programId as string,
        );
        setProgram(data);
      } catch (error) {
        console.error("Failed to fetch program", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgram();
  }, [params.programId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ProgressiveLoader message="Loading program..." isAdmin />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="py-12 text-center text-primary-500">
        Program not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/admin/universities/${params.id}/programs`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
        >
          <FiArrowLeft className="size-4" />
          Back to Programs
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 font-serif">
          Edit Program
        </h1>
        <p className="text-primary-500">
          Editing <span>{program.name_en}</span>
        </p>
      </div>
      <ProgramForm initialData={program} isEditing />
    </div>
  );
}
