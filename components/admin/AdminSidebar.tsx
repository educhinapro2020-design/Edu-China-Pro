"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  FiX,
  FiMenu,
  FiLogOut,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/admin";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
    role?: string;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (mobile = false) => (
    <>
      <div className="flex flex-col h-full bg-white">
        <div
          className={twMerge(
            "px-3 py-5 flex items-center h-16 overflow-hidden shrink-0 transition-all",
            isCollapsed && !mobile ? "justify-center" : "justify-between",
          )}
        >
          {(!isCollapsed || mobile) && (
            <Link href="/admin" className="flex items-center gap-3 min-w-0">
              <motion.div layout className="relative shrink-0 size-10">
                <Image
                  src="/images/logo/educhinapro-logo.svg"
                  alt="EduChinaPro"
                  fill
                  className="object-contain"
                />
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  opacity: 1,
                  width: "auto",
                  marginLeft: 12,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap flex flex-col gap-1"
              >
                <span className="brand-text font-bold text-xl">
                  EduChinaPro
                </span>
              </motion.div>
            </Link>
          )}

          {!mobile && (
            <button
              onClick={() => setIsCollapsed((v) => !v)}
              className={twMerge(
                "shrink-0 p-1.5 rounded-xl text-primary-400 hover:text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer",
                isCollapsed && !mobile ? "mx-auto" : "",
              )}
            >
              {isCollapsed ? (
                <FiChevronRight className="size-5" />
              ) : (
                <FiChevronLeft className="size-5" />
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {ADMIN_NAV_ITEMS.map((item) => {
            if (item.href === "/admin/users" && user.role !== "admin")
              return null;

            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed && !mobile ? item.name : undefined}
                className={twMerge(
                  "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-0 group relative overflow-hidden",
                  active
                    ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                    : "text-primary-600 hover:bg-primary-50 hover:text-primary-900",
                  isCollapsed && !mobile ? "justify-center" : "",
                )}
              >
                <div className="shrink-0 size-5 flex items-center justify-center">
                  <Icon
                    className={twMerge(
                      "size-5 transition-colors",
                      active
                        ? "text-brand-600"
                        : "text-primary-400 group-hover:text-primary-600",
                    )}
                  />
                </div>

                <motion.span
                  initial={false}
                  animate={{
                    opacity: isCollapsed && !mobile ? 0 : 1,
                    width: isCollapsed && !mobile ? 0 : "auto",
                    marginLeft: isCollapsed && !mobile ? 0 : 12,
                  }}
                  transition={{ duration: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-primary-100 shrink-0">
          <div
            className={twMerge(
              "flex items-center px-3 py-2.5 mb-1 overflow-hidden",
              isCollapsed && !mobile ? "justify-center" : "",
            )}
          >
            <motion.div
              initial={false}
              animate={{
                opacity: isCollapsed && !mobile ? 0 : 1,
                width: isCollapsed && !mobile ? 0 : "auto",
                marginLeft: isCollapsed && !mobile ? 0 : 12,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap min-w-0"
            >
              <p className="text-sm font-semibold text-primary-900 truncate">
                {user.name}
              </p>
            </motion.div>
          </div>

          <button
            onClick={handleSignOut}
            title={isCollapsed && !mobile ? "Logout" : undefined}
            className={twMerge(
              "w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
              isCollapsed && !mobile ? "justify-center" : "",
            )}
          >
            <div className="shrink-0 size-5 flex items-center justify-center">
              <FiLogOut className="size-5 shrink-0" />
            </div>

            <motion.span
              initial={false}
              animate={{
                opacity: isCollapsed && !mobile ? 0 : 1,
                width: isCollapsed && !mobile ? 0 : "auto",
                marginLeft: isCollapsed && !mobile ? 0 : 12,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Logout
            </motion.span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <LayoutGroup>
      <motion.aside
        layout
        initial={false}
        animate={{ width: isCollapsed ? 68 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-primary-100 shadow-sm overflow-hidden"
      >
        {navContent(false)}
      </motion.aside>

      {pathname !== "/admin" && (
        <motion.div
          layout
          initial={false}
          animate={{ width: isCollapsed ? 68 : 256 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden md:block shrink-0 h-full"
        />
      )}

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen((v) => !v)}
          className={twMerge(
            "p-2 rounded-full border transition-colors shadow-sm cursor-pointer",
            isMobileOpen
              ? "bg-brand-50 border-brand-200 text-brand-600"
              : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50",
          )}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <FiX className="size-5" />
          ) : (
            <FiMenu className="size-5" />
          )}
        </button>
      </div>

      <div className="md:hidden h-14" />

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-60 bg-white/30 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              ref={mobileMenuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-70 w-72 bg-white border-r border-primary-200 shadow-2xl flex flex-col"
            >
              {navContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
