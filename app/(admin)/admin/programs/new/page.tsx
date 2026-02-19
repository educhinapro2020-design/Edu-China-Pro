"use client";

import { ProgramForm } from "@/components/admin/ProgramForm";

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 font-serif">
          Add Program
        </h1>
        <p className="text-primary-500">Create a new academic program</p>
      </div>
      <ProgramForm />
    </div>
  );
}
