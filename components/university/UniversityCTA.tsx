"use client";

import { useEffect, useState } from "react";
import { University } from "@/lib/types/university";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiX, FiSend, FiEdit3 } from "react-icons/fi";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface UniversityCTAProps {
  university: University & { city?: { name_en: string } | null };
}

export function UniversityCTA({ university }: UniversityCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isPastThreshold = currentScrollY > 400;

      const shouldBeVisible = isPastThreshold && isScrollingDown;
      setIsVisible(shouldBeVisible);

      if (!shouldBeVisible) setIsExpanded(false);

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={twMerge(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 transform",
        isVisible && !footerVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0",
        isExpanded ? "p-4" : "p-0",
      )}
    >
      <div className="container mx-auto max-w-5xl relative">
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="md:hidden absolute bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10"
          >
            <FiEdit3 className="w-6 h-6" />
          </button>
        )}

        <div
          className={twMerge(
            "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-4xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-200",
            !isExpanded ? "hidden md:flex" : "flex",
          )}
        >
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="md:hidden absolute -top-2 -right-2 w-8 h-8 bg-white border border-primary-100 rounded-full flex items-center justify-center shadow-lg text-primary-400 hover:text-primary-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-4">
            <div className="hidden md:flex w-12 h-12 bg-primary-50 rounded-xl items-center justify-center shrink-0">
              {university.logo_url ? (
                <img
                  src={university.logo_url}
                  className="w-8 h-8 object-contain"
                  alt="Logo"
                />
              ) : (
                <span className="text-brand-500 font-bold">U</span>
              )}
            </div>
            <div className="text-center md:text-left space-y-1">
              <p className="text-base font-bold text-primary-900 line-clamp-1">
                {university.name_en}
              </p>
              <p className="text-xs text-primary-500">
                {university.city?.name_en || "China"} • Admissions Now Open
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <Link href="#application" className="grow md:grow-0">
              <Button
                className="w-full px-8 shadow-lg shadow-brand-500/20"
                endIcon={<FiArrowRight />}
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
