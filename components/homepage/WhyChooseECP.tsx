export default function WhyChooseECP() {
  return (
    <section className="py-20 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-900 tracking-tight mb-8 md:mb-12">
            Why Choose <span className="brand-text">EduChinaPro?</span>
          </h2>
          <p className="text-primary-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Your trusted, dual-country partner for a successful education
            journey in China. We combine strategy, transparency, and
            cross-border expertise.
          </p>
        </div>

        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 min-h-[600px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-brand-50 rounded-full -z-0 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-brand-100/50 rounded-full -z-0 pointer-events-none" />

          <div className="z-10 flex flex-col gap-12">
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-[280px] border border-gray-50 transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-2">
                Full Scholarship Strategy
              </h3>
              <p className="text-sm text-primary-500 mb-5">
                Guidance for CSC, BRI, Provincial, and University-level funding.
              </p>
              <button className="w-full py-2.5 bg-brand-600 text-white rounded-xl font-medium text-sm hover:bg-brand-700 transition-colors shadow-md shadow-brand-200">
                View Scholarships
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-[280px] border border-gray-50 self-end transform hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-primary-800">
                  Dual-Country Support
                </h3>
              </div>
              <p className="text-xs text-primary-600">
                From Nepal to China, we are with you until graduation.
              </p>
            </div>
          </div>

          <div className="relative z-20 my-12 lg:my-0 shrink-0">
            <div className="w-72 h-[420px] rounded-[40px] overflow-hidden border-[12px] border-brand-50 shadow-2xl relative">
              <img
                src="/images/marketing/why-choose-educhinapro.png"
                alt="Graduate"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-center">
                <p className="text-white font-semibold text-xl tracking-wide">
                  Your Success Story
                </p>
              </div>
            </div>

            <div className="absolute -top-10 -right-16 hidden lg:block text-primary-300">
              <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="none"
                className="rotate-12"
              >
                <path
                  d="M20 80C40 70 80 70 90 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M82 25L90 20L92 30"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="z-10 flex flex-col gap-10">
            <div className="bg-white p-7 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-[300px] border border-gray-50 transform hover:-translate-y-1 transition-transform">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-primary-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-primary-800 text-lg leading-tight">
                    Full Spectrum of Programs
                  </h3>
                </div>
              </div>
              <p className="text-sm text-primary-500 mb-4">
                Medical, Engineering, Business, and more at all levels.
              </p>
              <button className="w-full py-2.5 bg-brand-600 text-white rounded-xl font-medium text-sm hover:bg-brand-700 transition-colors shadow-md shadow-brand-200">
                Explore programs
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-[260px] border border-gray-50 self-end transform hover:-translate-y-1 transition-transform">
              <h3 className="font-bold text-primary-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-600 rounded-full"></span>
                SmartScore
              </h3>
              <p className="text-xs text-primary-600 leading-relaxed">
                Strategic assessment for admission, scholarship, and visa
                success.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
