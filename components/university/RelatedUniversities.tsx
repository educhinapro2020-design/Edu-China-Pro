"use client";

import { University } from "@/lib/types/university";
import UniversityCard from "@/components/UniversityCard";
import { ScrollRow } from "@/components/ui/scroll-row";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

interface RelatedUniversitiesProps {
  universities: University[];
}

export function RelatedUniversities({
  universities,
}: RelatedUniversitiesProps) {
  if (!universities || universities.length === 0) return null;

  return (
    <section className="py-16 border-t border-primary-100 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="heading-2 mb-4">Related Universities</h2>
            <p className="body text-primary-600">
              Discover other prestigious institutions in similar locations or
              with matching academic profiles to help you find your perfect fit.
            </p>
          </div>
          <Link href="/universities">
            <Button variant="outline" className="group">
              View All Universities
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <ScrollRow itemClassName="w-[250px] md:w-[320px]">
          {universities.map((uni) => (
            <UniversityCard key={uni.id} university={uni} className="h-full" />
          ))}
        </ScrollRow>
      </div>
    </section>
  );
}
