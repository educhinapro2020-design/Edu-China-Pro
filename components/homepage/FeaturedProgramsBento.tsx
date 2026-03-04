"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
} from "react-icons/fi";
import { CiCalendar } from "react-icons/ci";
import { FaCalendar } from "react-icons/fa";
import { Program } from "@/lib/types/university";
import { getTuition } from "@/lib/utils/program";
import { twMerge } from "tailwind-merge";

interface FeaturedProgramsProps {
  programs: Program[];
  title?: React.ReactNode;
  hideHeader?: boolean;
}

export function FeaturedProgramsBento({
  programs,
  title,
  hideHeader = false,
}: FeaturedProgramsProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const current = programs[index];
  const university = (current as any).university;
  const {
    displayAmt,
    originalAmt,
    currency,
    hasScholarship,
    savings,
    tuitionPer,
  } = getTuition(current);

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + programs.length) % programs.length);
  };

  if (!programs.length) return null;

  return (
    <section className={twMerge("py-24 bg-white", hideHeader && "py-12")}>
      <div className="container mx-auto px-6">
        {!hideHeader && (
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <div className="space-y-3">
              <h2 className="heading-1 !leading-tight">
                {title || (
                  <>
                    Featured{" "}
                    <span className="text-gold-600 font-serif">
                      Scholarships
                    </span>
                  </>
                )}
              </h2>
              <p className="body-large text-primary-500">
                Hand-selected scholarship programs at China's top institutions.
              </p>
            </div>
            <Link
              href="/scholarships"
              className="hidden md:flex items-center gap-2 text-gold-600 font-semibold text-sm hover:text-gold-700 transition-all group"
            >
              View All
            </Link>
          </div>
        )}

        <div className="relative group/card md:px-8">
          <button
            onClick={() => go(-1)}
            aria-label="Previous program"
            className={twMerge(
              "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 size-12 bg-brand-600 rounded-full shadow-xl border border-primary-200 items-center justify-center transition-all",
              index === 0
                ? "opacity-40 pointer-events-none"
                : "text-white hover:scale-105",
            )}
          >
            <FiChevronLeft className="size-5 text-white" />
          </button>

          <button
            onClick={() => go(1)}
            aria-label="Next program"
            className={twMerge(
              "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 size-12 bg-brand-600 rounded-full shadow-xl border border-primary-200 items-center justify-center transition-all",
              index === programs.length - 1
                ? "opacity-40 pointer-events-none"
                : "text-white hover:scale-105",
            )}
          >
            <FiChevronRight className="size-5 text-white" />
          </button>

          <div
            className="relative rounded-lg overflow-hidden shadow-2xl shadow-primary-900/20"
            style={{ minHeight: "70vh" }}
          >
            <AnimatePresence>
              <motion.div
                key={`bg-${current.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, zIndex: 0 }}
              >
                {current.cover_image_url ? (
                  <Image
                    src={current.cover_image_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className="object-cover"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-primary-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/0" />
              </motion.div>
            </AnimatePresence>

            <div
              className="relative flex flex-col justify-between min-h-[80vh] p-8 md:p-12"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <Link
                  href={`/universities/${university?.slug}`}
                  className="flex items-center gap-3 group/uni"
                >
                  <div className="size-11 rounded-xl bg-white overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                    {university?.logo_url && (
                      <Image
                        src={university.logo_url}
                        alt={university.name_en}
                        width={36}
                        height={36}
                        sizes="44px"
                        className="object-contain"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/90 mb-0.5">
                      Institution
                    </p>
                    <p className="text-white font-semibold text-sm group-hover/uni:underline underline-offset-2">
                      {university?.name_en}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 flex-wrap">
                  {current.application_deadline ? (
                    (() => {
                      const deadline = new Date(current.application_deadline);
                      const daysLeft = Math.ceil(
                        (deadline.getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      );
                      const bg =
                        daysLeft < 0
                          ? "bg-primary-100 text-primary-900"
                          : daysLeft < 60
                            ? "bg-amber-500"
                            : "bg-brand-500";
                      return (
                        <span
                          className={twMerge(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg",
                            bg,
                          )}
                        >
                          <CiCalendar className="size-4" />
                          {daysLeft > 0
                            ? `Apply by ${deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : "Deadline passed"}
                        </span>
                      );
                    })()
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-emerald-500 shadow-lg">
                      <FaCalendar className="size-3.5" />
                      Open Intake
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end"
                >
                  <div className="md:col-span-7 space-y-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gold-600 text-white shadow-lg w-fit">
                      <FiAward className="size-4" />
                      Scholarship Available
                    </span>
                    <h3 className="text-4xl md:text-6xl capitalize font-serif font-bold text-white leading-[1.05] mb-4">
                      {current.name_en}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/30 text-white border border-white/20 capitalize">
                        {current.degree_level.replace(/_/g, " ")}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/30 text-white border border-white/20 capitalize">
                        {current.language.replace(/_/g, " ")}
                      </span>
                      {current.duration && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/30 text-white border border-white/20">
                          {current.duration}
                        </span>
                      )}
                    </div>

                    {current.description && (
                      <p className="hidden md:block text-white/80 text-base leading-relaxed line-clamp-4 max-w-lg">
                        {current.description}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-3">
                    <div className="bg-gold-600 border border-white/10 rounded-2xl p-5">
                      <p className="text-xs font-bold uppercase text-white/90 mb-3">
                        Tuition {tuitionPer ? `/ ${tuitionPer}` : ""}
                      </p>
                      {hasScholarship && originalAmt ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-3">
                            <p className="text-sm font-medium text-white/50 line-through">
                              {originalAmt.toLocaleString()} {currency}
                            </p>
                            <p className="text-white font-bold text-2xl">
                              {displayAmt === 0
                                ? "Full Scholarship"
                                : `${displayAmt?.toLocaleString()} ${currency}`}
                            </p>
                          </div>
                          {savings && savings > 0 && (
                            <p className="text-sm font-bold text-white">
                              You save {savings.toLocaleString()} {currency}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-white font-bold text-xl">
                          {displayAmt != null
                            ? `${displayAmt.toLocaleString()} ${currency}`
                            : "Contact us"}
                        </p>
                      )}
                    </div>

                    {(current.scholarship_policy_html ||
                      (current as any).estimated_living_cost) && (
                      <div className="bg-brand-700 border border-white/10 rounded-2xl p-4">
                        <div className="flex flex-col gap-3">
                          {current.scholarship_policy_html && (
                            <div>
                              <div
                                className="text-white/90 text-sm leading-relaxed line-clamp-4 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:text-white/90 [&_p]:mb-1 [&_h2]:font-bold [&_h3]:font-bold"
                                dangerouslySetInnerHTML={{
                                  __html: current.scholarship_policy_html,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/universities/${university?.slug}/programs/${current.slug}`}
                      className="group inline-flex items-center justify-between px-6 py-4 bg-white text-primary-900 font-bold rounded-2xl hover:bg-brand-50 transition-all active:scale-95 shadow-2xl"
                    >
                      Learn More
                      <FiArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="md:hidden flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous program"
                  className={twMerge(
                    "size-10 rounded-full border border-white/20 bg-white backdrop-blur-sm text-brand-600 flex items-center justify-center transition-all active:scale-90",
                    index === 0
                      ? "opacity-40 pointer-events-none"
                      : "hover:bg-white/20",
                  )}
                >
                  <FiChevronLeft className="size-4" />
                </button>

                <div className="flex items-center gap-2">
                  {programs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > index ? 1 : -1);
                        setIndex(i);
                      }}
                      className={twMerge(
                        "rounded-full transition-all duration-300",
                        i === index
                          ? "w-6 h-2 bg-white"
                          : "size-2 bg-white/30 hover:bg-white/60",
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={() => go(1)}
                  aria-label="Next program"
                  className={twMerge(
                    "size-10 rounded-full bg-white text-brand-600 flex items-center justify-center transition-all active:scale-90 shadow-lg",
                    index === programs.length - 1
                      ? "opacity-40 pointer-events-none"
                      : "hover:bg-brand-50",
                  )}
                >
                  <FiChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center mt-5">
            <div className="flex items-center gap-2">
              {programs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={twMerge(
                    "rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 h-2 bg-brand-600"
                      : "size-2 bg-primary-300 hover:bg-primary-500",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
