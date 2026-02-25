"use client";

import { FiCalendar, FiMapPin } from "react-icons/fi";

export function ClosingCTA() {
  return (
    <section className="py-20 md:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className=" rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold brand-text leading-tight font-serif tracking-tight">
                Your future in China deserves more than an application.
              </h2>

              <p className="text-primary-700 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                It deserves strategy, clarity, and continuous support. Partner
                with EduChinaPro for an end-to-end journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#smart-score"
                  className="px-8 py-4 bg-white text-brand-900 border border-primary-200 hover:bg-brand-50 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Take the SmartScore™
                </a>
                <a
                  href="#consultation"
                  className="px-8 py-4 bg-brand-600 text-white hover:bg-brand-700 border border-brand-600 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FiCalendar className="size-5" />
                  Schedule Counseling
                </a>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-2 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-4 left-6 bg-white/90 backdrop-blur text-brand-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm z-10 flex items-center gap-1.5">
                  <FiMapPin className="size-3.5" />
                  Visit Our Nepal Office
                </div>
                <div className="w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden bg-primary-100/20">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5130470084537!2d85.3402869!3d27.701441499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19d62b0483af%3A0xb7bdc46a59ab50bf!2sEdu%20China%20Pro!5e0!3m2!1sen!2snp!4v1772012341638!5m2!1sen!2snp"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
