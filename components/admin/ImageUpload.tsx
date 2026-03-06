"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { twMerge } from "tailwind-merge";
import { ADMIN_ASSETS_BUCKET } from "@/lib/constants/admin";
import { extractStoragePath } from "@/lib/utils/storage";

interface ImageUploadProps {
  uploadFolder: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  onSync?: (url: string | null) => Promise<void>;
  label?: string;
}

export default function ImageUpload({
  uploadFolder,
  value,
  onChange,
  onSync,
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) return;
    if (inputRef.current) inputRef.current.value = "";

    const blobUrl = URL.createObjectURL(file);
    onChange(blobUrl);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${uploadFolder}/${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from(ADMIN_ASSETS_BUCKET)
        .upload(path, file, { upsert: true });

      if (error) throw error;

      if (value && !value.startsWith("blob:")) {
        const oldStoragePath = extractStoragePath(value);
        if (oldStoragePath) {
          await supabase.storage
            .from(ADMIN_ASSETS_BUCKET)
            .remove([oldStoragePath]);
        }
      }

      const { data } = supabase.storage
        .from(ADMIN_ASSETS_BUCKET)
        .getPublicUrl(path);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = data.publicUrl;
      });

      URL.revokeObjectURL(blobUrl);
      onChange(data.publicUrl);

      if (onSync) {
        try {
          await onSync(data.publicUrl);
        } catch (err) {
          console.error("Failed to sync image to DB:", err);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      URL.revokeObjectURL(blobUrl);
      onChange(null);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const urlToRemove = value;
    onChange(null);

    if (urlToRemove?.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
      return;
    }

    if (urlToRemove) {
      const storagePath = extractStoragePath(urlToRemove);
      if (storagePath) {
        const supabase = createClient();
        await supabase.storage.from(ADMIN_ASSETS_BUCKET).remove([storagePath]);
      }
    }

    if (onSync) {
      try {
        await onSync(null);
      } catch (err) {
        console.error("Failed to sync image removal to DB:", err);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        className={twMerge(
          "relative w-40 h-40 rounded-2xl border-2 border-dashed border-primary-200 bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:border-brand-400 hover:bg-brand-50 overflow-hidden group",
          value && "border-solid border-primary-100 shadow-sm",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          <>
            <img
              src={value}
              alt={label}
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
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary-400 group-hover:text-brand-500 transition-colors px-4 text-center">
            <FiUploadCloud className="size-7" />
            <span className="text-xs font-medium leading-tight">
              Click to upload
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
