"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const go = (dir: number) => {
    setIndex((prev) => (prev + dir + images.length) % images.length);
  };

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const lightboxGo = (dir: number) => {
    setLightboxIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <>
      <div className="relative group/gallery">
        <button
          onClick={() => go(-1)}
          aria-label="Previous image"
          className={twMerge(
            "hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 size-11 bg-white rounded-full shadow-lg border border-brand-100 items-center justify-center transition-all text-brand-600 hover:scale-105",
            index === 0
              ? "text-primary-300 border-primary-100 cursor-not-allowed pointer-events-none"
              : "",
          )}
        >
          <FiChevronLeft className="size-5" />
        </button>

        <button
          onClick={() => go(1)}
          aria-label="Next image"
          className={twMerge(
            "hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 size-11 bg-white rounded-full shadow-lg border border-brand-100 items-center justify-center transition-all text-brand-600 hover:scale-105",
            index === images.length - 1
              ? "text-primary-300 border-primary-100 cursor-not-allowed pointer-events-none"
              : "",
          )}
        >
          <FiChevronRight className="size-5" />
        </button>

        <div className="rounded-2xl overflow-hidden relative aspect-video md:aspect-[16/9] bg-primary-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={images[index]}
                alt={
                  title ? `${title} — image ${index + 1}` : `Image ${index + 1}`
                }
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="md:hidden flex items-center justify-between mt-3">
          <button
            onClick={() => go(-1)}
            aria-label="Previous image"
            className={twMerge(
              "size-10 rounded-full bg-brand-500 text-white flex items-center justify-center transition-all active:scale-90 shadow-md",
              index === 0 ? "opacity-40 pointer-events-none" : "",
            )}
          >
            <FiChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={twMerge(
                  "rounded-full transition-all duration-300",
                  i === index
                    ? "w-5 h-2 bg-brand-500"
                    : "size-2 bg-primary-300 hover:bg-primary-400",
                )}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Next image"
            className={twMerge(
              "size-10 rounded-full bg-brand-500 text-white flex items-center justify-center transition-all active:scale-90 shadow-md",
              index === images.length - 1
                ? "opacity-40 pointer-events-none"
                : "",
            )}
          >
            <FiChevronRight className="size-4" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="hidden md:flex justify-center items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 flex-wrap">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={twMerge(
                  "relative shrink-0 rounded-xl overflow-hidden transition-all duration-300",
                  i === index
                    ? "w-20 h-14 ring-2 ring-brand-500 ring-offset-2"
                    : "w-14 h-14 opacity-50 grayscale hover:opacity-80 hover:grayscale-0",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <FiX className="size-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxGo(-1);
              }}
              className={twMerge(
                "absolute left-4 size-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90",
                lightboxIndex === 0 ? "opacity-30 pointer-events-none" : "",
              )}
            >
              <FiChevronLeft className="size-5" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt=""
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxGo(1);
              }}
              className={twMerge(
                "absolute right-4 size-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90",
                lightboxIndex === images.length - 1
                  ? "opacity-30 pointer-events-none"
                  : "",
              )}
            >
              <FiChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
              <span className="text-white font-bold">{lightboxIndex + 1}</span>
              {" / "}
              {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
