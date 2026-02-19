"use client";

import { useEffect, useState } from "react";
import { UniversityForm } from "@/components/admin/UniversityForm";
import { universityRepository } from "@/lib/repositories/university.repo";
import { University } from "@/lib/types/university";
import { useParams } from "next/navigation";
import { ProgressiveLoader } from "@/components/ui/ProgressiveLoader";

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <ProgressiveLoader isAdmin message="Loading university..." />
      </div>
    );
  }

  if (!university) {
    return <div>University not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
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
