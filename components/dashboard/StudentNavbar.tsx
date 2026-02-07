"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  FiHome,
  FiFileText,
  FiSearch,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiLayout,
  FiBell,
} from "react-icons/fi";
import { authService } from "@/lib/services/auth.service";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: FiLayout },
  { name: "My Applications", href: "/applications", icon: FiFileText },
  { name: "Find Programs", href: "/programs", icon: FiSearch },
  { name: "My Profile", href: "/dashboard/profile/build", icon: FiUser },
];

export function StudentNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await authService.signOut();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="font-serif font-bold text-2xl brand-text tracking-tight group-hover:opacity-90 transition-opacity">
            EduChinaPro
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
                    : "text-primary-600 hover:bg-primary-50 hover:text-primary-900",
                )}
              >
                <Icon
                  className={twMerge(
                    "size-4 transition-colors",
                    isActive
                      ? "text-brand-600"
                      : "text-primary-400 group-hover:text-primary-600",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="relative p-2.5 text-primary-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
            <FiBell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
              2
            </span>
          </button>
          <div className="w-px h-6 bg-primary-200 mx-1" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="size-4" />
            Logout
          </button>
        </div>

        <div
          className="md:hidden relative flex items-center gap-2"
          ref={mobileMenuRef}
        >
          <button className="relative p-2.5 text-primary-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
            <FiBell className="size-6" />
            <span className="absolute top-2 right-2 size-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
              2
            </span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={twMerge(
              "p-2 rounded-full border transition-all duration-200 shadow-sm cursor-pointer",
              isMobileMenuOpen
                ? "bg-brand-50 border-brand-200 text-brand-600"
                : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50",
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="size-5" />
            ) : (
              <FiMenu className="size-5" />
            )}
          </button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-[120%] z-50 w-64 overflow-hidden rounded-2xl border border-primary-200 bg-white p-2 shadow-xl shadow-primary-900/5 origin-top-right"
              >
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={twMerge(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-50 text-brand-700"
                            : "text-primary-600 hover:bg-primary-50 hover:text-primary-900",
                        )}
                      >
                        <Icon
                          className={twMerge(
                            "size-4",
                            isActive ? "text-brand-600" : "text-primary-400",
                          )}
                        />
                        {item.name}
                      </Link>
                    );
                  })}

                  <div className="h-px bg-primary-100 my-2 mx-2" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <FiLogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
