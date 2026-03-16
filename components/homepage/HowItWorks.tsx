import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiUser } from "react-icons/fi";
import { FiAward } from "react-icons/fi";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-24 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-900 tracking-tight mb-8 md:mb-12">
            How <span className="brand-text">EduChinaPro</span> Works
          </h2>
          <p className="text-primary-500 text-lg max-w-3xl mx-auto leading-relaxed">
            Just signed up? Here&apos;s the exact path to follow. We&apos;ll
            guide you from completing your profile to receiving your acceptance
            letter.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-600">01</span>
                </div>
                <div className="h-px flex-grow bg-primary-100" />
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-primary-900 tracking-tight font-serif">
                Complete Your Profile &amp; Upload Documents
              </h3>

              <p className="text-lg text-primary-600 leading-relaxed max-w-xl">
                This is the{" "}
                <span className="font-bold text-primary-900">
                  very first thing
                </span>{" "}
                to do after signing up. Fill in your information, academic
                details and upload the required documents — passport,
                transcripts, and photos.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="size-5 text-success mt-0.5 shrink-0" />
                  <span className="text-primary-700 font-medium">
                    Our team verifies your documents.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="size-5 text-success mt-0.5 shrink-0" />
                  <span className="text-primary-700 font-medium">
                    Different programs might have different requirements.
                  </span>
                </li>
              </ul>

              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-3 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-100 transition-all group"
              >
                Build My Profile
                <FiArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary-100 w-full max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-full bg-brand-50 flex items-center justify-center">
                    <FiUser className="size-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-primary-900 text-sm">
                      Profile Completion
                    </p>
                    <p className="text-xs text-primary-400">
                      3 of 5 sections done
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    "Personal Details",
                    "Academic History",
                    "Passport & Photo",
                    "Language Scores",
                    "Statement",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-sm font-medium ${i < 3 ? "text-primary-900" : "text-primary-400"}`}
                      >
                        {item}
                      </span>
                      {i < 3 ? (
                        <div className="size-5 rounded-full bg-success/10 flex items-center justify-center">
                          <FiCheckCircle className="size-3 text-success" />
                        </div>
                      ) : (
                        <div className="size-5 rounded-full bg-primary-100" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-2 bg-primary-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-brand-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="hidden lg:flex justify-center order-2 lg:order-1">
              <div className="space-y-4 w-full max-w-sm">
                {[
                  {
                    name: "MBBS at Peking University",
                    tag: "Full Scholarship",
                    tagColor: "bg-gold-500 text-white",
                    meta: "6 Years · English · Beijing",
                    icon: true,
                  },
                  {
                    name: "Computer Science – Zhejiang",
                    tag: "CSC Funded",
                    tagColor: "bg-brand-50 text-brand-700",
                    meta: "4 Years · English & Chinese",
                    icon: false,
                  },
                ].map((card) => (
                  <div
                    key={card.name}
                    className="bg-white rounded-2xl p-5 border border-primary-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-primary-900 leading-snug">
                        {card.name}
                      </h4>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${card.tagColor} uppercase tracking-wider`}
                      >
                        {card.icon && <FiAward className="size-3" />}
                        {card.tag}
                      </span>
                    </div>
                    <p className="text-xs text-primary-500">{card.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gold-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">02</span>
                </div>
                <div className="h-px flex-grow bg-primary-200" />
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-primary-900 tracking-tight font-serif">
                Browse Programs &amp; Scholarships
              </h3>

              <p className="text-lg text-primary-600 leading-relaxed max-w-xl">
                Explore thousands of programs and scholarship opportunities.
                Filter by major, location, and funding type to find the perfect
                match. Our expert counselors will help you find the best program
                for you.
              </p>

              <Link
                href="/scholarships"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/30 hover:-translate-y-0.5 transition-all group"
              >
                View Scholarships
                <FiArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-600">03</span>
                </div>
                <div className="h-px flex-grow bg-primary-100" />
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-primary-900 tracking-tight font-serif">
                Apply &amp; Track Progress
              </h3>

              <p className="text-lg text-primary-600 leading-relaxed max-w-xl">
                Apply to your chosen programs and track status updates. You will
                receive{" "}
                <span className="font-bold brand-text">
                  SMS and email notifications
                </span>{" "}
                at every major application milestone.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="size-5 text-success mt-0.5 shrink-0" />
                  <span className="text-primary-700 font-medium">
                    Application status updates in your dashboard.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="size-5 text-success mt-0.5 shrink-0" />
                  <span className="text-primary-700 font-medium">
                    SMS &amp; email alerts so you never miss a milestone.
                  </span>
                </li>
              </ul>
            </div>

            {/* Visual */}
            <div className="hidden lg:flex justify-center">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary-100 w-full max-w-sm transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <p className="font-bold text-primary-900 text-sm mb-6">
                  Application Progress
                </p>
                <div className="space-y-6">
                  {[
                    { label: "Documents Submitted", done: true },
                    { label: "University Review", done: true },
                    { label: "Admission Offer", done: false, active: true },
                    { label: "Visa Processing", done: false },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-4">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                          step.done
                            ? "bg-success/10"
                            : step.active
                              ? "bg-brand-50 ring-2 ring-brand-200"
                              : "bg-primary-50"
                        }`}
                      >
                        {step.done ? (
                          <FiCheckCircle className="size-4 text-success" />
                        ) : (
                          <span
                            className={`text-xs font-black ${step.active ? "text-brand-600" : "text-primary-300"}`}
                          >
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          step.done
                            ? "text-primary-900"
                            : step.active
                              ? "text-brand-600 font-bold"
                              : "text-primary-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
