"use client";

import { UniversityForm } from "@/components/admin/UniversityForm";

export default function NewUniversityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 font-serif">
          Add University
        </h1>
        <p className="text-primary-500">Create a new university profile</p>
      </div>
      <UniversityForm />
    </div>
  );
}
