"use client";

import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiMessageSquare,
  FiUser,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiArrowRight,
} from "react-icons/fi";
import { Select } from "@/components/ui/select";
import { useState } from "react";

const BENEFIT_LIST = [
  "Free Strategy Session",
  "Personalized Scholarship Roadmap",
  "University Matchmaking Analysis",
  "Onboarding Support",
];

const STUDY_LEVEL_OPTIONS = [
  { label: "Bachelor's Degree", value: "bachelor" },
  { label: "Master's Degree", value: "master" },
  { label: "PhD / Doctoral", value: "phd" },
  { label: "Chinese Language Program", value: "language" },
];

export function ConsultationSection() {
  const [studyLevel, setStudyLevel] = useState("");
  return (
    <section
      id="consultation"
      className="py-24 bg-primary-50 relative overflow-hidden px-4"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-600/5 -skew-x-12 transform translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 tracking-tight font-serif leading-tight mb-6">
                Book Your{" "}
                <span className="brand-text">Free Consultation</span>{" "}
              </h2>
              <p className="text-lg text-primary-600 leading-relaxed max-w-xl">
                Ready to take the first step toward your future in China? Speak
                with a senior counselor for a personalized roadmap for your
                academic success.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFIT_LIST.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="size-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="size-4 text-success" />
                  </div>
                  <span className="text-sm font-medium text-primary-800">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="pt-8">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-primary-900">
                    Expert Team
                  </p>
                  <p className="text-xs text-primary-500">
                    Dual-country support in Nepal & China
                  </p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-primary-100 relative md:-top-12"
          >
            <div className="absolute -top-10 -right-10 size-40 bg-brand-500/10 rounded-full blur-3xl -z-10" />

            <h3 className="text-2xl font-bold text-primary-900 mb-8">
              Secure Your Free Session
            </h3>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-700 ml-1 mb-2 inline-block">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full pl-11 pr-4 py-3.5 bg-primary-50 border border-primary-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-primary-300 text-primary-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-700 ml-1 mb-2 inline-block">
                    WhatsApp / Phone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input
                      type="tel"
                      placeholder="+977"
                      className="w-full pl-11 pr-4 py-3.5 bg-primary-50 border border-primary-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-primary-300 text-primary-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-700 ml-1 mb-2 inline-block">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-primary-50 border border-primary-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-primary-300 text-primary-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-700 ml-1 mb-2 inline-block">
                  Intended Level of Study
                </label>
                <div className="relative">
                  <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 z-10 pointer-events-none" />
                  <Select
                    id="study-level"
                    value={studyLevel}
                    onChange={setStudyLevel}
                    options={STUDY_LEVEL_OPTIONS}
                    placeholder="Select Study Level"
                    className="pl-11 bg-primary-50 border-primary-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-700 ml-1 mb-2 inline-block">
                  How can we help you?
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-4 top-4 text-primary-400" />
                  <textarea
                    rows={3}
                    placeholder="Tell us about your goals..."
                    className="w-full pl-11 pr-4 py-3.5 bg-primary-50 border border-primary-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-primary-300 text-primary-900 resize-none"
                  />
                </div>
              </div>

              <button className="w-full text-sm md:text-base bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-100 transition-all flex items-center justify-center gap-2 group">
                Book Free Consultation
                <FiArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
