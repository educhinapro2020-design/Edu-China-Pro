"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  FiUser,
  FiMessageCircle,
  FiSend,
  FiAward,
  FiShield,
  FiNavigation,
} from "react-icons/fi";

const STEPS = [
  {
    id: 1,
    title: "Build Your Profile",
    desc: "One master profile, 5,000+ programs.",
    icon: FiUser,
    accent: "brand",
  },
  {
    id: 2,
    title: "1-on-1 Counselor",
    desc: "A dedicated expert to help your application process.",
    icon: FiMessageCircle,
    accent: "gold",
  },
  {
    id: 3,
    title: "Offer & Admission",
    desc: "Evaluate offers and packages.",
    icon: FiAward,
    accent: "gold",
  },
  {
    id: 4,
    title: "Visa Processing",
    desc: "JW-202 coordination and full embassy interview prep.",
    icon: FiShield,
    accent: "brand",
  },
] as const;

const CARD_POSITIONS = [
  { x: 300, y: 130, align: "bottom" },
  { x: 900, y: 130, align: "bottom" },
  { x: 900, y: 390, align: "top" },
  { x: 300, y: 390, align: "top" },
] as const;

const ACCENT = {
  brand: {
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
    numColor: "text-brand-200",
    dot: "#3c70d1",
    dotRing: "#dbe8ff",
  },
  gold: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    numColor: "text-amber-200",
    dot: "#f59e0b",
    dotRing: "#fef3c7",
  },
};

function DesktopCard({
  step,
  pos,
  index,
}: {
  step: (typeof STEPS)[number];
  pos: (typeof CARD_POSITIONS)[number];
  index: number;
}) {
  const Icon = step.icon;
  const accent = ACCENT[step.accent];
  const isBottomAlign = pos.align === "bottom";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: isBottomAlign ? -10 : 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute flex flex-col items-center"
      style={{
        left: `${(pos.x / 1200) * 100}%`,
        top: `${(pos.y / 520) * 100}%`,
        transform: isBottomAlign
          ? "translate(-50%, calc(-100% - 8px))"
          : "translate(-50%, 8px)",
      }}
    >
      <div className="w-[190px] bg-white rounded-2xl border border-primary-100 px-4 py-3.5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`size-8 rounded-lg ${accent.iconBg} flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300`}
          >
            <Icon className={`size-4 ${accent.iconColor}`} />
          </div>
          <span
            className={`text-xs font-black ${accent.numColor} tracking-tighter`}
          >
            {step.id < 10 ? `0${step.id}` : step.id}
          </span>
        </div>
        <h3 className="text-[13px] font-bold text-primary-900 leading-tight mb-1">
          {step.title}
        </h3>
        <p className="text-[11px] text-primary-400 leading-relaxed font-medium">
          {step.desc}
        </p>
      </div>

      {/* No connector line to prevent "hanging" look */}
    </motion.div>
  );
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.5"],
  });

  const pathProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-32 bg-[#FAFBFF] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-primary-900 tracking-tight mb-6">
            How<span className="brand-text">EduChinaPro</span> works
          </h2>
          <p className="text-primary-500 max-w-lg mx-auto body-large">
            From your first question to graduation day — one winding, supported
            path built for your success.
          </p>
        </motion.div>

        <div className="hidden lg:block relative">
          <div
            className="relative w-full"
            style={{ paddingBottom: "calc(520 / 1200 * 100%)" }}
          >
            <div className="absolute inset-0">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1200 520"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="pathGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3c70d1" />
                    <stop offset="50%" stopColor="#2d5ac2" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>

                <path
                  d="M 300 130 H 900 C 1050 130, 1050 390, 900 390 H 300"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.3"
                />

                <path
                  d="M 300 130 H 900 C 1050 130, 1050 390, 900 390 H 300"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="1 15"
                  strokeLinecap="round"
                />

                <motion.path
                  d="M 300 130 H 900 C 1050 130, 1050 390, 900 390 H 300"
                  stroke="url(#pathGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ pathLength: pathProgress }}
                />

                {CARD_POSITIONS.map((pos, i) => {
                  const accent = ACCENT[STEPS[i].accent];
                  return (
                    <motion.g
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="12"
                        fill="white"
                        stroke={accent.dot}
                        strokeWidth="3"
                        className="shadow-sm"
                      />
                      <circle cx={pos.x} cy={pos.y} r="5" fill={accent.dot} />
                    </motion.g>
                  );
                })}
              </svg>

              {STEPS.map((step, i) => (
                <DesktopCard
                  key={step.id}
                  step={step}
                  pos={CARD_POSITIONS[i]}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile Serpentine (Zig-Zag) ── */}
        <div className="lg:hidden relative pb-10">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-full max-w-[340px] pointer-events-none">
            <svg
              viewBox="0 0 100 400"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                d="M 20 0 Q 80 50, 50 100 Q 20 150, 50 200 Q 80 250, 50 300 Q 20 350, 50 400"
                stroke="#E2E8F0"
                strokeWidth="3"
                fill="none"
              />
              <motion.path
                d="M 20 0 Q 80 50, 50 100 Q 20 150, 50 200 Q 80 250, 50 300 Q 20 350, 50 400"
                stroke="url(#mobileGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                style={{ pathLength: pathProgress }}
              />
              <defs>
                <linearGradient
                  id="mobileGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3c70d1" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 space-y-16">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const accent = ACCENT[step.accent];
              const isRight = idx % 2 !== 0;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-center w-full ${isRight ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-[45%] ${isRight ? "text-right" : "text-left"}`}
                  >
                    <div className="bg-white border border-primary-100 rounded-2xl p-4 shadow-sm relative group hover:shadow-md transition-shadow">
                      <div
                        className={`flex items-center gap-2 mb-2 ${isRight ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`size-7 rounded-lg ${accent.iconBg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`size-3.5 ${accent.iconColor}`} />
                        </div>
                        <span className="text-[10px] font-black text-primary-200">
                          0{step.id}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-primary-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-[10px] text-primary-400 leading-relaxed line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div className="w-[10%] flex justify-center">
                    <div className="size-4 rounded-full bg-white border-2 border-primary-100 flex items-center justify-center relative z-20">
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: accent.dot }}
                      />
                    </div>
                  </div>

                  <div className="w-[45%]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#smart-score"
              className="inline-flex items-center gap-3 px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-xl shadow-brand-100 hover:-translate-y-1 transition-all text-sm group"
            >
              Take the SmartScore™
              <svg
                className="size-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
            <a
              href="#consultation"
              className="inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-brand-100 text-brand-700 hover:bg-brand-50 font-bold rounded-2xl transition-all text-sm"
            >
              Book Free Consultation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
