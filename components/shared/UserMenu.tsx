"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { authService } from "@/lib/services/auth.service";
import { useRouter, usePathname } from "next/navigation";
import {
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiUserPlus,
  FiLayout,
} from "react-icons/fi";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { LiaUniversitySolid } from "react-icons/lia";
import { MdOutlineSchool } from "react-icons/md";

interface UserMenuProps {
  user: User | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "Find Universities",
      href: "/universities",
      icon: LiaUniversitySolid,
    },
    { label: "Explore Programs", href: "/programs", icon: MdOutlineSchool },
  ];

  return (
    <div className="flex items-center gap-3" ref={menuRef}>
      {user && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex size-10 rounded-full overflow-hidden border border-primary-200 hover:border-brand-300 hover:ring-2 hover:ring-brand-200 transition bg-primary-50 items-center justify-center shrink-0"
        >
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
        </button>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          "md:hidden p-2 rounded-full border transition-all duration-200 shadow-sm cursor-pointer",
          isOpen
            ? "bg-brand-50 border-brand-200 text-brand-600"
            : "bg-white border-primary-200 text-primary-600 hover:bg-primary-50",
        )}
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX className="size-5" /> : <FiMenu className="size-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-4 top-[96%] w-64 bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              {user && (
                <div className="px-3 py-3 mb-1 border-b border-primary-100 flex items-center gap-3">
                  <div className="size-9 rounded-full overflow-hidden border border-primary-200 bg-primary-50 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="User avatar"
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <FiUser className="w-4 h-4 text-primary-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-primary-900 truncate">
                      {user.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-primary-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
              {user && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <FiLayout className="size-4" />
                  Dashboard
                </Link>
              )}

              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex md:hidden items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-primary-600 hover:bg-primary-50 hover:text-primary-900"
                    }`}
                  >
                    <item.icon className="size-4.5" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="h-px bg-primary-100 my-1 mx-2" />

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <FiLogOut className="size-4" />
                  Sign out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                  >
                    <FiUser className="size-4" />
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <FiUserPlus className="size-4" />
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
