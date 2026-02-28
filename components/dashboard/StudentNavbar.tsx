"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  FiFileText,
  FiSearch,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiLayout,
} from "react-icons/fi";
import { authService } from "@/lib/services/auth.service";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import {
  NotificationBellOnly,
  NotificationToasts,
} from "../shared/NotificationBell";
import { useNotifications } from "@/lib/hooks/useNotifications";

const navItems = [
  {
    name: "My Applications",
    href: "/dashboard/applications",
    icon: FiFileText,
  },
  { name: "Find Programs", href: "/programs", icon: FiSearch },
  { name: "My Profile", href: "/dashboard/profile", icon: FiUser },
];

interface StudentNavbarProps {
  user: User;
}

export function StudentNavbar({ user }: StudentNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user.user_metadata?.avatar_url;

  const {
    notifications,
    unreadCount,
    loading,
    toasts,
    dismissToast,
    markRead,
    markAllRead,
  } = useNotifications(user.id);

  const handleSignOut = async () => {
    await authService.signOut();
    router.refresh();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
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
    setIsUserDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <NotificationToasts
        toasts={toasts}
        onDismiss={dismissToast}
        onRead={markRead}
      />

      <nav className="print:hidden sticky top-0 z-40 w-full border-b border-primary-200 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/images/logo/educhinapro-logo.svg"
              alt="EduChinaPro"
              width={28}
              height={28}
              className="size-10 group-hover:opacity-90 transition-opacity"
              priority
            />
            <span className="font-serif font-bold text-xl brand-text tracking-tight group-hover:opacity-90 transition-opacity">
              EduChinaPro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
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
                      ? "text-brand-700"
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
          </div>

          <div className="hidden md:flex items-center gap-4 relative">
            <NotificationBellOnly
              userId={user.id}
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              markRead={markRead}
              markAllRead={markAllRead}
              toasts={toasts}
              dismissToast={dismissToast}
            />

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="size-9 rounded-full overflow-hidden border border-primary-200 bg-primary-50 flex items-center justify-center hover:ring-2 hover:ring-brand-200 transition"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FiUser className="w-5 h-5 text-primary-500" />
                )}
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-72 bg-white border border-primary-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-primary-100 flex items-center gap-3">
                      <div className="size-10 rounded-full overflow-hidden border border-primary-200 bg-primary-50 flex items-center justify-center shrink-0">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="User avatar"
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-primary-900 truncate">
                          {user.user_metadata?.full_name || "Student"}
                        </span>
                        <span className="text-sm text-primary-500 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-primary-700 hover:bg-primary-50 transition"
                      >
                        <FiLayout className="size-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition text-left"
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

          <div className="md:hidden flex items-center gap-2">
            <NotificationBellOnly
              userId={user.id}
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              markRead={markRead}
              markAllRead={markAllRead}
              toasts={toasts}
              dismissToast={dismissToast}
            />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={twMerge(
                "p-2 rounded-full border transition-all duration-200 shadow-sm",
                isMobileMenuOpen
                  ? "bg-brand-50 border-brand-200 text-brand-600"
                  : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50",
              )}
            >
              {isMobileMenuOpen ? (
                <FiX className="size-5" />
              ) : (
                <FiMenu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-white/30 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.aside
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-primary-200 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-end px-5 h-14">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-primary-100 text-primary-500"
                >
                  <FiX className="size-5" />
                </button>
              </div>

              <div className="px-5 pb-4 border-b border-primary-100 flex items-center gap-3">
                <div className="size-10 rounded-full overflow-hidden border border-primary-200 bg-primary-50 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FiUser className="w-5 h-5 text-primary-500" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-primary-900 truncate">
                    {user.user_metadata?.full_name || "Student"}
                  </span>
                  <span className="text-sm text-primary-500 truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={twMerge(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
                          : "text-primary-600 hover:bg-primary-50 hover:text-primary-900",
                      )}
                    >
                      <Icon
                        className={twMerge(
                          "size-5",
                          isActive ? "text-brand-600" : "text-primary-400",
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-3 py-4 border-t border-primary-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition text-left"
                >
                  <FiLogOut className="size-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
