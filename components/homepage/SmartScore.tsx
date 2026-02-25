"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiArrowLeft, FiCalendar } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { RiGraduationCapLine } from "react-icons/ri";

type FormData = {
  gpa: string;
  field: string;
  degreeLevel: string;
  scholarship: string;
  budget: string;
  chineseLevel: string;
};

type ScoreResult = {
  admission: number;
  scholarshipStrength: number;
  visaReadiness: number;
  careerAlignment: number;
  overall: number;
  tier: "Strong" | "Competitive" | "Developing";
  tierColor: string;
  tierBg: string;
  recommendations: string[];
};

const QUESTIONS: {
  key: keyof FormData;
  question: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "degreeLevel",
    question: "What degree level are you aiming for?",
    options: [
      { value: "bachelor", label: "Bachelor's" },
      { value: "master", label: "Master's" },
      { value: "phd", label: "PhD / Doctorate" },
    ],
  },
  {
    key: "gpa",
    question: "What is your GPA or academic percentage?",
    options: [
      { value: "below-60", label: "Below 60%" },
      { value: "60-70", label: "60 – 70%" },
      { value: "70-80", label: "70 – 80%" },
      { value: "80-90", label: "80 – 90%" },
      { value: "90+", label: "90%+" },
    ],
  },
  {
    key: "field",
    question: "Which field do you want to study?",
    options: [
      { value: "medicine", label: "Medicine & Health" },
      { value: "engineering", label: "Engineering & Tech" },
      { value: "business", label: "Business & Economics" },
      { value: "science", label: "Science & Research" },
      { value: "language", label: "Chinese Language" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "scholarship",
    question: "Which scholarship pathway interests you most?",
    options: [
      { value: "csc", label: "CSC Government" },
      { value: "bri", label: "Belt & Road" },
      { value: "provincial", label: "Provincial" },
      { value: "university", label: "University" },
      { value: "self", label: "Self-Financed" },
    ],
  },
  {
    key: "budget",
    question: "What is your annual budget for studying?",
    options: [
      { value: "under-3k", label: "Under $3,000" },
      { value: "3k-6k", label: "$3k – $6k" },
      { value: "6k-10k", label: "$6k – $10k" },
      { value: "10k+", label: "Above $10k" },
    ],
  },
  {
    key: "chineseLevel",
    question: "What is your Chinese language level?",
    options: [
      { value: "none", label: "None" },
      { value: "basic", label: "Basic" },
      { value: "hsk-1-3", label: "HSK 1–3" },
      { value: "hsk-4+", label: "HSK 4+" },
    ],
  },
];

function computeScore(form: FormData): ScoreResult {
  const gpaScore: Record<string, number> = {
    "below-60": 10,
    "60-70": 40,
    "70-80": 60,
    "80-90": 80,
    "90+": 95,
  };
  const gpa = gpaScore[form.gpa] ?? 50;

  const degreeBaseline: Record<string, number> = {
    bachelor: 80,
    master: 65,
    phd: 50,
  };
  const degBase = degreeBaseline[form.degreeLevel] ?? 65;
  const admission = Math.round(gpa * 0.7 + degBase * 0.3);

  const scholarshipBase: Record<string, number> = {
    csc: 90,
    bri: 80,
    provincial: 70,
    university: 60,
    self: 30,
  };
  const scholarshipStrength = Math.min(
    100,
    Math.round((scholarshipBase[form.scholarship] ?? 50) * 0.7 + gpa * 0.3),
  );

  const chineseScore: Record<string, number> = {
    none: 55,
    basic: 65,
    "hsk-1-3": 78,
    "hsk-4+": 92,
  };
  const visaReadiness = chineseScore[form.chineseLevel] ?? 60;

  const fieldAlign: Record<string, Record<string, number>> = {
    medicine: { bachelor: 85, master: 90, phd: 80 },
    engineering: { bachelor: 90, master: 85, phd: 95 },
    business: { bachelor: 80, master: 90, phd: 75 },
    science: { bachelor: 75, master: 85, phd: 95 },
    language: { bachelor: 85, master: 70, phd: 60 },
    other: { bachelor: 70, master: 75, phd: 70 },
  };
  const careerAlignment = fieldAlign[form.field]?.[form.degreeLevel] ?? 75;

  const overall = Math.round(
    admission * 0.3 +
      scholarshipStrength * 0.3 +
      visaReadiness * 0.2 +
      careerAlignment * 0.2,
  );

  const tier: ScoreResult["tier"] =
    overall >= 75 ? "Strong" : overall >= 55 ? "Competitive" : "Developing";

  const tierColor =
    tier === "Strong"
      ? "text-emerald-600"
      : tier === "Competitive"
        ? "text-brand-600"
        : "text-amber-600";
  const tierBg =
    tier === "Strong"
      ? "bg-emerald-50 border-emerald-200"
      : tier === "Competitive"
        ? "bg-brand-50 border-brand-200"
        : "bg-amber-50 border-amber-200";

  const recommendations: string[] = [];
  if (gpa < 70)
    recommendations.push(
      "Strengthen your academic record — universities like Tsinghua and Fudan require 75%+ for competitive programs.",
    );
  if (form.chineseLevel === "none")
    recommendations.push(
      "Starting HSK 1–3 before arrival dramatically improves campus experience and visa strength.",
    );
  if (form.scholarship === "csc" && gpa < 80)
    recommendations.push(
      "CSC is highly competitive. Add provincial or university scholarships as strategic backups.",
    );
  if (form.scholarship !== "self" && form.budget === "under-3k")
    recommendations.push(
      "Your scholarship choice can fully cover tuition. Focus your strategy on scholarship confirmation first.",
    );
  if (recommendations.length === 0)
    recommendations.push(
      "Your profile is well-aligned for China. A strategic counseling session will finalize your best-fit universities.",
    );

  return {
    admission,
    scholarshipStrength,
    visaReadiness,
    careerAlignment,
    overall,
    tier,
    tierColor,
    tierBg,
    recommendations,
  };
}

function ScoreRing({
  score,
  label,
  strokeColor,
}: {
  score: number;
  label: string;
  strokeColor: string;
}) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-16">
        <svg width="64" height="64" viewBox="0 0 36 36" className="-rotate-90">
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary-100"
          />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            stroke={strokeColor}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-primary-900">{score}</span>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-primary-500 text-center uppercase tracking-wider leading-tight max-w-[64px]">
        {label}
      </p>
    </div>
  );
}

const INITIAL_FORM: FormData = {
  gpa: "",
  field: "",
  degreeLevel: "",
  scholarship: "",
  budget: "",
  chineseLevel: "",
};

type Phase = "intro" | "questions" | "result";

export function SmartScoreSection() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [direction, setDirection] = useState(1);

  const current = QUESTIONS[qIndex];
  const currentValue = form[current?.key];

  const handleSelect = (val: string) => {
    const updated = { ...form, [current.key]: val };
    setForm(updated);
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setDirection(1);
        setQIndex((i) => i + 1);
      } else {
        setResult(computeScore(updated));
        setPhase("result");
      }
    }, 180);
  };

  const handleBack = () => {
    if (qIndex === 0) {
      setPhase("intro");
    } else {
      setDirection(-1);
      setQIndex((i) => i - 1);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setQIndex(0);
    setDirection(1);
    setPhase("intro");
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "#10b981" : s >= 55 ? "#2563eb" : "#f59e0b";

  return (
    <section
      id="smart-score"
      className="py-20 md:py-24 px-4 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-16 -left-16 size-64 rounded-full border border-brand-50/80 pointer-events-none" />
            <div className="absolute -top-8 -left-8 size-48 rounded-full border border-brand-50 pointer-events-none" />
            <div className="relative space-y-8">
              <div className="space-y-3">
                <h2 className="text-5xl md:text-6xl font-bold text-primary-900 leading-[0.95] tracking-tight">
                  <span className="text-2xl font-semibold brand-text">
                    EduChinaPro{" "}
                  </span>
                  <br />
                  Smart<span className="brand-text">Score</span>
                </h2>
              </div>
              <p className="text-primary-500 text-lg leading-relaxed max-w-md">
                Know exactly where you stand before you apply. Six questions.
                Four dimensions. One clear strategy.
              </p>
              <div className="grid grid-cols-4 gap-2">
                <ScoreRing
                  score={90}
                  label="Admission"
                  strokeColor={scoreColor(90)}
                />
                <ScoreRing
                  score={70}
                  label="Scholarship"
                  strokeColor={scoreColor(70)}
                />
                <ScoreRing
                  score={50}
                  label="Visa"
                  strokeColor={scoreColor(50)}
                />
              </div>
              <p className="text-xs text-primary-400 font-medium italic">
                * Example scores. Take yours free in under a minute.
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-white rounded-4xl border border-primary-100 shadow-[0_24px_80px_rgba(45,90,194,0.07)] overflow-hidden min-h-[480px] flex flex-col">
              <AnimatePresence mode="wait" custom={direction}>
                {phase === "intro" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col flex-1 p-10 items-center justify-center text-center gap-7"
                  >
                    <div className="size-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                      <RiGraduationCapLine className="size-6 text-brand-600" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-primary-900">
                        Take Your Free SmartScore™
                      </h3>
                      <p className="text-primary-500 text-base leading-relaxed max-w-sm mx-auto">
                        Answer 6 quick questions and get a personalized
                        assessment of your China study profile — in under a
                        minute.
                      </p>
                    </div>
                    <button
                      onClick={() => setPhase("questions")}
                      className="w-full max-w-xs flex items-center justify-center gap-2 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-200 text-sm"
                    >
                      Start Free Assessment
                      <FiArrowRight className="size-4" />
                    </button>
                    <p className="text-xs text-primary-400 font-medium">
                      No sign-up required · Takes under a minute
                    </p>
                  </motion.div>
                )}

                {phase === "questions" && (
                  <motion.div
                    key={`q-${qIndex}`}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -40 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col items-center justify-center flex-1 px-10 py-16"
                  >
                    <div className="flex flex-col gap-8">
                      <h3 className="text-xl font-bold text-primary-900 leading-snug">
                        {current.question}
                      </h3>

                      <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`,
                          }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 flex-1 content-start">
                        {current.options.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={twMerge(
                              "px-4 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap",
                              currentValue === opt.value
                                ? "bg-brand-600 border-brand-600 text-white shadow-sm shadow-brand-200"
                                : "bg-white border-primary-200 text-primary-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleBack}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-700 transition-colors self-start mt-auto"
                      >
                        <FiArrowLeft className="size-3.5" />
                        {qIndex === 0 ? "Back" : "Previous"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {phase === "result" && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="flex flex-col flex-1 overflow-y-auto"
                  >
                    <div className="px-8 pt-7 pb-5 bg-gradient-to-br from-primary-50/80 to-white border-b border-primary-100 shrink-0">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500 mb-1">
                        Your SmartScore™
                      </p>
                      <div className="flex items-end gap-3">
                        <span className="text-6xl font-bold text-primary-900 leading-none tracking-tighter">
                          {result.overall}
                        </span>
                        <div className="pb-1.5 flex items-center gap-2">
                          <span className="text-lg font-bold text-primary-300">
                            /100
                          </span>
                          <div
                            className={twMerge(
                              "hidden md:inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold",
                              result.tierBg,
                              result.tierColor,
                            )}
                          >
                            {result.tier} Profile
                          </div>
                        </div>
                      </div>
                      <div
                        className={twMerge(
                          "md:hidden inline-flex mt-2 items-center px-2.5 py-1 rounded-lg border text-xs font-bold",
                          result.tierBg,
                          result.tierColor,
                        )}
                      >
                        {result.tier} Profile
                      </div>
                    </div>

                    <div className="px-8 py-5 border-b border-primary-50 shrink-0">
                      <div className="grid grid-cols-3 gap-2">
                        <ScoreRing
                          score={result.admission}
                          label="Admission"
                          strokeColor={scoreColor(result.admission)}
                        />
                        <ScoreRing
                          score={result.scholarshipStrength}
                          label="Scholarship"
                          strokeColor={scoreColor(result.scholarshipStrength)}
                        />
                        <ScoreRing
                          score={result.visaReadiness}
                          label="Visa"
                          strokeColor={scoreColor(result.visaReadiness)}
                        />
                      </div>
                    </div>

                    <div className="px-8 py-5 space-y-3 border-b border-primary-50 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400">
                        Strategic Recommendations
                      </p>
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="size-5 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-brand-600">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-sm text-primary-600 leading-relaxed">
                            {r}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="px-8 py-5 flex flex-col sm:flex-row gap-2.5 shrink-0">
                      <a
                        href="/#consultation"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-2xl transition-all shadow-sm shadow-brand-200"
                      >
                        <FiCalendar className="size-4" />
                        Book Free Counseling
                      </a>
                      <button
                        onClick={handleReset}
                        className="flex-1 py-3 border border-primary-200 hover:border-primary-300 text-primary-500 hover:text-primary-800 text-sm font-semibold rounded-2xl transition-all"
                      >
                        Retake
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
