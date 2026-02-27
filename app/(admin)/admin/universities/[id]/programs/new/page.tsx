"use client";

import { useParams } from "next/navigation";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { Program } from "@/lib/types/university";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export function NewProgramPage({ basePath = "/admin" }: { basePath?: string }) {
  const params = useParams();

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`${basePath}/universities/${params.id}/programs`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
        >
          <FiArrowLeft className="size-4" />
          Back to Programs
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 font-serif">
          Add Program
        </h1>
        <p className="text-primary-500">Create a new academic program</p>
      </div>
      <ProgramForm
        initialData={{ university_id: params.id } as Program}
        basePath={basePath}
      />
    </div>
  );
}

export default function AdminNewProgramPage() {
  return <NewProgramPage basePath="/admin" />;
}
