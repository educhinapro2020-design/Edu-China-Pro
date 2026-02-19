"use client";

import { useEffect, useState } from "react";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { programRepository } from "@/lib/repositories/program.repo";
import { Program } from "@/lib/types/university";
import { useParams } from "next/navigation";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";

export default function EditProgramPage() {
  const params = useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProgram() {
      if (!params.id) return;
      try {
        const data = await programRepository.getProgramById(
          params.id as string,
        );
        setProgram(data);
      } catch (error) {
        console.error("Failed to fetch program", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgram();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <ProgressiveLoader message="Loading program..." isAdmin />
      </div>
    );
  }

  if (!program) {
    return <div>Program not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
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
