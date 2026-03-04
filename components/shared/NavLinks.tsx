"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { LiaUniversitySolid } from "react-icons/lia";
import { MdOutlineSchool } from "react-icons/md";
import { IconType } from "react-icons";

interface NavLink {
  label: string;
  href: string;
  icon?: IconType;
  exact?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", exact: true },
  {
    label: "Find Universities",
    href: "/universities",
  },
  { label: "Explore Programs", href: "/programs", icon: MdOutlineSchool },
  { label: "Scholarships", href: "/scholarships" },
];

export function NavLinks() {
  const pathname = usePathname();

  const isActive = (link: NavLink) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  return (
    <div className="hidden md:flex items-center gap-8">
      {NAV_LINKS.map((link) => {
        const active = isActive(link);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={twMerge(
              "font-medium text-sm flex items-center gap-2 transition-colors",
              active
                ? "text-brand-600"
                : "text-primary-600 hover:text-brand-600",
            )}
          >
            {link.icon && <link.icon size={20} />}
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export { NAV_LINKS };
