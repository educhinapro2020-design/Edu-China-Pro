"use client";

import { useEffect, useState } from "react";
import { UniversityForm } from "@/components/admin/UniversityForm";
import { universityRepository } from "@/lib/repositories/university.repo";
import { University } from "@/lib/types/university";
import { useParams } from "next/navigation";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function EditUniversityPage() {
  const params = useParams();
  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUniversity() {
      if (!params.id) return;
      try {
        const data = await universityRepository.getUniversityById(
          params.id as string,
        );
        setUniversity(data);
      } catch (error) {
        console.error("Failed to fetch university", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUniversity();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ProgressiveLoader isAdmin message="Loading university..." />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="py-12 text-center text-primary-500">
        University not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin/universities"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors mb-4"
        >
          <FiArrowLeft className="size-4" />
          Back to Universities
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 font-serif">
          Edit University
        </h1>
        <p className="text-primary-500">
          Editing <span>{university.name_en}</span>
        </p>
      </div>
      <UniversityForm initialData={university} isEditing />
    </div>
  );
}
