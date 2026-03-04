import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { SOCIAL_LINKS, CONTACT_INFO } from "@/lib/constants/socials";

const footerLinks = [
  {
    title: "Services",
    items: [
      { label: "SmartScore™", href: "/#smart-score" },
      { label: "University Search", href: "/universities" },
      { label: "Program Search", href: "/programs" },
      { label: "Book a Consultation", href: "/#consultation" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/#why-choose-ecp" },
      { label: "Contact Us", href: "/#consultation" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="bg-brand-950 text-white py-16 border-t border-primary-900"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-block mb-6 group active:scale-95 transition-transform"
            >
              <span className="font-serif font-bold text-3xl text-white tracking-tight group-hover:text-brand-300 transition-colors">
                EduChinaPro
              </span>
            </Link>
            <p className="text-white mb-8 max-w-sm leading-relaxed">
              Your trusted partner for higher education in China. We simplify
              the path to academic success for ambitious students.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.filter((link) => link.label !== "Email").map(
                (social, i) => (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    href={social.href}
                    title={social.label}
                    className={twMerge(
                      "size-8.5 active:scale-95 rounded-full flex items-center justify-center text-white hover:text-white transition-all duration-300 transform hover:-translate-y-1 bg-white/10",
                      social.color,
                    )}
                  >
                    <social.icon className="size-4.5" />
                  </a>
                ),
              )}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h4 className="font-bold text-white mb-6 font-serif tracking-wide border-b border-white pb-2 inline-block">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-brand-300 transition-colors block py-0.5 active:scale-95 duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 font-serif tracking-wide border-b border-white/20 pb-2 inline-block">
              Presence
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                  Nepal
                </p>
                <p className="text-sm text-white">Old Baneshwor, Kathmandu</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                  China
                </p>
                <p className="text-sm text-white">On-ground support</p>
              </div>
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                  Specialization
                </p>
                <p className="text-sm text-white">100% China-focused</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 font-serif tracking-wide border-b border-white pb-2 inline-block">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                {(() => {
                  const emailLink = SOCIAL_LINKS.find(
                    (s) => s.label === "Email",
                  );
                  const Icon = emailLink?.icon || SOCIAL_LINKS[0].icon;
                  return (
                    <Icon className="w-5 h-5 text-white mt-0.5 shrink-0" />
                  );
                })()}
                <span className="text-sm">
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="hover:text-brand-400 transition-colors active:scale-95 inline-block"
                  >
                    {CONTACT_INFO.email}
                  </a>
                  <br />
                </span>
              </li>
              <li className="flex items-start gap-3">
                {(() => {
                  const waLink = SOCIAL_LINKS.find(
                    (s) => s.label === "WhatsApp",
                  );
                  const Icon = waLink?.icon || SOCIAL_LINKS[0].icon;
                  return (
                    <Icon className="w-5 h-5 text-white mt-0.5 shrink-0" />
                  );
                })()}
                <span className="text-sm">
                  <a
                    href={
                      SOCIAL_LINKS.find((s) => s.label === "WhatsApp")?.href
                    }
                    className=" transition-colors active:scale-95 inline-block"
                  >
                    {CONTACT_INFO.displayWhatsapp}
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
