"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { twMerge } from "tailwind-merge";
import { universityRepository } from "@/lib/repositories/university.repo";

interface LogoUploadProps {
  universityId?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUpload({
  universityId,
  value,
  onChange,
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    if (!file.type.startsWith("image/")) return;

    setIsUploading(true);
    setProgress(0);

    const ticker = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 12 : p));
    }, 120);

    try {
      const supabase = createClient();
      const publicUrl = await universityRepository.uploadLogo(
        file,
        universityId ?? "temp",
        supabase,
      );

      clearInterval(ticker);
      setProgress(100);
      setTimeout(() => {
        onChange(publicUrl);
        setIsUploading(false);
        setProgress(0);
      }, 300);
    } catch (err) {
      clearInterval(ticker);
      console.error("Upload failed:", err);
      setIsUploading(false);
      setProgress(0);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="label">University Logo</label>

      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        className={twMerge(
          "relative w-40 h-40 rounded-2xl border-2 border-dashed border-primary-200 bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-brand-400 hover:bg-brand-50 overflow-hidden group",
          value && "border-solid border-primary-100 shadow-sm",
          isUploading && "pointer-events-none",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {value && !isUploading ? (
          <>
            <img
              src={value}
              alt="University logo"
              className="w-full h-full object-contain p-3"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="text-xs text-white font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-white font-medium bg-red-500/70 hover:bg-red-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <FiX className="size-3" /> Remove
              </button>
            </div>
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3 px-4 w-full">
            <span className="text-xs font-semibold text-brand-600">
              {progress}%
            </span>
            <div className="w-full h-1.5 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary-400 group-hover:text-brand-500 transition-colors px-4 text-center">
            <FiUploadCloud className="size-7" />
            <span className="text-xs font-medium leading-tight">
              Click to upload logo
            </span>
            <span className="text-[10px] text-primary-300">
              PNG, SVG · max 5MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
