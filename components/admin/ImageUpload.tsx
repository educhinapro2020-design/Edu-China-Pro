"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiUpload, FiX, FiLoader } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_ASSETS_BUCKET } from "@/lib/constants/admin";
import { twMerge } from "tailwind-merge";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  folder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export function ImageUpload({
  value,
  onChange,
  label,
  folder = "uploads",
  className,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      console.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("File must be an image");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(ADMIN_ASSETS_BUCKET)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(ADMIN_ASSETS_BUCKET).getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const ratioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[2/1]",
  }[aspectRatio];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary-700 mb-1">
        {label}
      </label>
      <div
        onClick={() => !value && fileInputRef.current?.click()}
        className={twMerge(
          "relative border-2 border-dashed border-primary-200 rounded-xl overflow-hidden hover:bg-primary-50 transition-colors group cursor-pointer",
          ratioClass,
          value ? "border-solid border-primary-100" : "",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <FiLoader className="size-6 text-brand-600 animate-spin" />
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Uploaded image" className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-sm transition-colors"
                title="Replace"
              >
                <FiUpload className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white backdrop-blur-sm transition-colors"
                title="Remove"
              >
                <FiX className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-400">
            <FiUpload className="size-8 mb-2" />
            <span className="text-xs font-medium">Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
}
