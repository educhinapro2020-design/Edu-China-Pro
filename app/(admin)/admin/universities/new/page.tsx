"use client";

import { UniversityForm } from "@/components/admin/UniversityForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export function NewUniversityPage({
  basePath = "/admin",
}: {
  basePath?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`${basePath}/universities`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
        >
          <FiArrowLeft className="size-4" />
          Back to Universities
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 font-serif">
          Add University
        </h1>
        <p className="text-primary-500">Create a new university profile</p>
      </div>
      <UniversityForm basePath={basePath} />
    </div>
  );
}

export default function AdminNewUniversityPage() {
  return <NewUniversityPage basePath="/admin" />;
}
