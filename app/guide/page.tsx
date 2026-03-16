import Link from "next/link";
import { FiMessageSquare, FiBell, FiEdit3 } from "react-icons/fi";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ConsultationSection } from "@/components/homepage/ConsultationSection";
import HowItWorks from "@/components/homepage/HowItWorks";
import { RiGraduationCapFill, RiGraduationCapLine } from "react-icons/ri";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <HowItWorks />

      <section className="py-20 md:py-28 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold brand-text tracking-tight font-serif mb-4">
              Key Dashboard Features
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: FiMessageSquare,
                title: "Messages",
                desc: "Chat with counselor or support team directly in the app",
              },
              {
                icon: FiBell,
                title: "Notifications",
                desc: "Important alerts about missing documents, or updates.",
              },
              {
                icon: FiEdit3,
                title: "Counselor Notes",
                desc: "Action items and strategic advice left for you by our expert team.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-3xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="size-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-primary-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <h2 className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-3xl md:text-5xl flex flex-col gap-2 items-center text-center font-bold brand-text tracking-tight font-serif mb-4">
        <RiGraduationCapFill className="size-10 text-brand-600" />
        Ready to start your journey?
      </h2>
      <ConsultationSection />
      <Footer />
    </div>
  );
}
