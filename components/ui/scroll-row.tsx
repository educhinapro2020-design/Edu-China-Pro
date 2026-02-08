"use client";

import { ReactNode, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
}

export function ScrollRow({
  children,
  className = "",
  itemClassName = "",
  showArrows = true,
}: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={twMerge("relative group", className)}>
      {showArrows && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-primary-200 flex items-center justify-center text-primary-600 hover:text-brand-600 hover:border-brand-300 transition-all opacity-0 group-hover:opacity-100 group-hover:-translate-x-2"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-primary-200 flex items-center justify-center text-primary-600 hover:text-brand-600 hover:border-brand-300 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-2"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mb-4 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div key={index} className={twMerge("shrink-0", itemClassName)}>
                {child}
              </div>
            ))
          : children}
      </div>
    </div>
  );
}
