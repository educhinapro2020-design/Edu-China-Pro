"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FiUploadCloud, FiX, FiMenu } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { twMerge } from "tailwind-merge";
import { ADMIN_ASSETS_BUCKET } from "@/lib/constants/admin";
import { extractStoragePath } from "@/lib/utils/storage";

interface MultiImageUploadProps {
  uploadFolder: string;
  value: string[];
  onChange: (urls: string[]) => void;
  onSync?: (urls: string[]) => Promise<void>;
  label?: string;
}

export default function MultiImageUpload({
  uploadFolder,
  value,
  onChange,
  onSync,
  label = "Images",
}: MultiImageUploadProps) {
  const items = Array.isArray(value) ? value : [];
  const dragItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (inputRef.current) inputRef.current.value = "";

    const validFiles = files.filter(
      (f) => f.size <= 10 * 1024 * 1024 && f.type.startsWith("image/"),
    );
    if (!validFiles.length) return;

    const blobUrls = validFiles.map((f) => URL.createObjectURL(f));
    const optimistic = [...items, ...blobUrls];
    onChange(optimistic);

    const supabase = createClient();
    const uploaded: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const ext = file.name.split(".").pop();
      const path = `${uploadFolder}/album-${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage
        .from(ADMIN_ASSETS_BUCKET)
        .upload(path, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage
          .from(ADMIN_ASSETS_BUCKET)
          .getPublicUrl(path);

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = data.publicUrl;
        });

        uploaded.push(data.publicUrl);
      }

      URL.revokeObjectURL(blobUrls[i]);
    }

    const final = [...items, ...uploaded];
    onChange(final);

    if (onSync && uploaded.length > 0) {
      try {
        await onSync(final);
      } catch (err) {
        console.error("Failed to sync images to DB:", err);
      }
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = items[index];
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);

    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
      return;
    }

    const storagePath = extractStoragePath(urlToRemove);
    if (storagePath) {
      const supabase = createClient();
      await supabase.storage.from(ADMIN_ASSETS_BUCKET).remove([storagePath]);
    }

    if (onSync) {
      try {
        await onSync(updated);
      } catch (err) {
        console.error("Failed to sync image removal to DB:", err);
      }
    }
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverIndex === null) {
      dragItem.current = null;
      setDragOverIndex(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverIndex, 0, moved);
    onChange(reordered);
    dragItem.current = null;
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={twMerge(
                "relative group aspect-video rounded-xl overflow-hidden border-2 border-primary-100 cursor-grab active:cursor-grabbing transition-all duration-200",
                dragOverIndex === index && "border-brand-500 scale-95",
              )}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/20 text-white">
                  <FiMenu className="size-4" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded-lg bg-red-500/70 hover:bg-red-600/80 text-white transition-colors"
                >
                  <FiX className="size-4" />
                </button>
              </div>
              <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-primary-200 bg-white cursor-pointer transition-all duration-200 hover:border-brand-400 hover:bg-brand-50"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <FiUploadCloud className="size-7 text-primary-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-primary-600">
            Click to upload images
          </p>
          <p className="text-xs text-primary-400 mt-0.5">
            Multiple files · max 10MB each · drag to reorder after upload
          </p>
        </div>
      </div>
    </div>
  );
}
