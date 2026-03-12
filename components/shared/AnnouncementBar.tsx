"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBullhorn } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { Announcement } from "@/lib/types/announcement";
import Image from "next/image";

interface AnnouncementBarProps {
  announcements: Announcement[];
}

const ROTATE_INTERVAL = 6000;

export function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const rotate = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setProgress(0);
  }, [announcements.length]);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(rotate, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [announcements.length, rotate]);

  useEffect(() => {
    if (announcements.length <= 1) return;

    let raf: number;
    let start: number;

    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min(elapsed / ROTATE_INTERVAL, 1);
      setProgress(pct);
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentIndex, announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div className="relative w-full bg-white flex justify-center overflow-hidden">
      <div className="relative w-full container mx-auto">
        <AnimatePresence mode="wait">
          {(() => {
            const Wrapper = current.link_url
              ? ({
                  children,
                  className,
                }: {
                  children: React.ReactNode;
                  className: string;
                }) => (
                  <Link
                    href={current.link_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {children}
                  </Link>
                )
              : ({
                  children,
                  className,
                }: {
                  children: React.ReactNode;
                  className: string;
                }) => <div className={className}>{children}</div>;

            return (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Wrapper className="block w-full mx-auto h-auto relative bg-primary-100 rounded-md overflow-hidden border border-white/10 group cursor-pointer">
                  <div className="hidden md:block w-full h-auto aspect-8/1 relative">
                    {current.desktop_image_url ? (
                      <Image
                        fill
                        src={current.desktop_image_url}
                        alt={current.title || "Announcement Desktop"}
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        priority={true}
                        className="object-cover w-full h-full block transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-400">
                        <FaBullhorn className="size-8 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="block md:hidden w-full h-auto aspect-4/1 relative">
                    {current.mobile_image_url || current.desktop_image_url ? (
                      <Image
                        fill
                        src={
                          current.mobile_image_url || current.desktop_image_url
                        }
                        alt={current.title || "Announcement Mobile"}
                        sizes="100vw"
                        priority={true}
                        className="object-cover w-full h-full block transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-400">
                        <FaBullhorn className="size-8 opacity-50" />
                      </div>
                    )}
                  </div>
                </Wrapper>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {announcements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <motion.div
            className="h-full bg-linear-to-r from-brand-300 to-white/60"
            style={{ width: `${progress * 100}%` }}
            transition={{ duration: 0 }}
          />
        </div>
      )}
    </div>
  );
}
