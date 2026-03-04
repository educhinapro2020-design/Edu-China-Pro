"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiGlobe } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="relative flex items-center bg-white pt-20">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-50/30 -z-10" />
      <div className="absolute -top-24 -left-24 size-96 bg-brand-100/20 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-primary-950 leading-[1.05] tracking-tight">
                Start Your{" "}
                <span className="text-brand-600">Education Journey</span> in
                China.
              </h1>
              <p className="text-lg text-primary-500 max-w-xl leading-relaxed">
                Scholarships, Admissions, and Visa support for MBBS,
                Engineering, Business, and more. Our dual-country presence in
                Nepal and China ensures smooth, reliable guidance at every step.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#smart-score"
                className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-700 transition-all shadow-xl shadow-brand-200"
              >
                Take the SmartScore™
                <FiArrowRight className="size-5" />
              </Link>
              <Link
                href="#consultation"
                className="px-8 py-4 border-2 border-brand-200 text-brand-600 rounded-2xl font-bold flex items-center justify-center hover:bg-brand-50 transition-all"
              >
                Book Free Consultation
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <p className="hidden md:block text-sm font-medium text-primary-500">
                Nepal's Dedicated Pathway to study in China
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 relative hidden md:block">
            <div className="relative z-10 aspect-[2/5] md:aspect-square max-w-lg mx-auto lg:ml-auto overflow-hidden rounded-[3rem] shadow-2xl border-10 border-brand-50">
              <Image
                src="/images/marketing/why-choose-educhinapro.webp"
                alt="Graduate"
                fill
                className="object-cover"
                priority
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -right-8 top-12 z-20 hidden md:block bg-white p-5 rounded-[2rem] shadow-2xl border border-primary-50 max-w-[220px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <FiCheckCircle className="size-5" />
                </div>
                <h4 className="font-bold text-primary-900 text-sm">
                  Scholarship Strategy
                </h4>
              </div>
              <p className="text-xs text-primary-500 leading-relaxed">
                Medical (MBBS), Engineering, Business, and Computer Science
                programs at all levels.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -left-12 bottom-20 z-20 hidden md:block bg-white p-6 rounded-[2rem] shadow-2xl border border-primary-50 max-w-[240px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                  <FiGlobe className="size-5" />
                </div>
                <h4 className="font-bold text-primary-900 text-sm">
                  Dual-Country Support
                </h4>
              </div>
              <p className="text-xs text-primary-500 leading-relaxed">
                Local teams in Nepal & China with you until graduation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -right-12 bottom-4 z-20 hidden md:block bg-white p-5 rounded-[2rem] shadow-2xl border border-primary-50 max-w-[210px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gold-50 rounded-xl text-gold-600">
                  <FaGraduationCap className="size-5" />
                </div>
                <h4 className="font-bold text-primary-900 text-sm">
                  5,000+ Programs
                </h4>
              </div>
              <p className="text-xs text-primary-500 leading-relaxed">
                Extensive selection of courses across top-tier universities.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
