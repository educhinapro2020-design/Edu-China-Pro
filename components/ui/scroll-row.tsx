"use client";

import { ReactNode, useRef, useEffect, useState, Children } from "react";
import { twMerge } from "tailwind-merge";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showHint?: boolean;
}

export function ScrollRow({
  children,
  className = "",
  itemClassName = "",
  showArrows = true,
  showHint = true,
}: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 350;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={twMerge("relative group", className)}>
      {showHint && (
        <div className="md:hidden mb-3 text-xs text-primary-400 animate-pulse flex items-center justify-end gap-1 pr-2">
          Swipe to explore →
        </div>
      )}

      {showArrows && (
        <>
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={twMerge(
              "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-primary-200 items-center justify-center transition-all",
              canScrollLeft
                ? "text-primary-600 hover:text-brand-600 hover:border-brand-300 group-hover:opacity-100 group-hover:-translate-x-2 opacity-0"
                : "opacity-0 pointer-events-none",
            )}
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={twMerge(
              "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-primary-200 items-center justify-center transition-all",
              canScrollRight
                ? "text-primary-600 hover:text-brand-600 hover:border-brand-300 group-hover:opacity-100 group-hover:translate-x-2 opacity-0"
                : "opacity-0 pointer-events-none",
            )}
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-linear-to-r from-white/80 to-transparent z-10" />
      )}

      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-linear-to-l from-white/80 to-transparent z-10" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pt-2 -mb-4 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {Children.map(children, (child, index) => (
          <div
            key={index}
            className={twMerge("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
