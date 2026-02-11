"use client";

import { useState, useRef } from "react";
import { FiUpload, FiCheck, FiEye, FiEdit } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { DocumentStatus } from "@/lib/types/student";
import { twMerge } from "tailwind-merge";

interface DocumentUploadFieldProps {
  label: string;
  docKey: string;
  status?: DocumentStatus;
  currentUrl?: string;
  onUpload: (file: File) => Promise<void>;
  required?: boolean;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
}

interface StatusStyleConfig {
  border: string;
  text: string;
  bg: string;
  pill?: { label: string; className: string };
}

export function DocumentUploadField({
  label,
  docKey,
  status = "pending",
  currentUrl,
  onUpload,
  required = false,
  description,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
}: DocumentUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 100);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload failed", error);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getStatusStyles = (): StatusStyleConfig => {
    switch (status) {
      case "uploaded":
        return {
          border: "border-success",
          text: "text-success",
          bg: "",
          pill: { label: "Uploaded", className: "bg-success/10 text-success" },
        };
      case "verified":
        return {
          border: "border-brand-500",
          text: "text-brand-600",
          bg: "bg-brand-50",
          pill: { label: "Verified", className: "bg-brand-100 text-brand-600" },
        };
      case "rejected":
        return {
          border: "border-red-400",
          text: "text-red-600",
          bg: "bg-red-50",
          pill: { label: "Rejected", className: "bg-red-100 text-red-600" },
        };
      case "needs_correction":
        return {
          border: "border-amber-400",
          text: "text-amber-600",
          bg: "bg-amber-50",
          pill: {
            label: "Needs Correction",
            className: "bg-amber-100 text-amber-600",
          },
        };
      default:
        return {
          border: "border-primary-300 hover:border-brand-300",
          text: "text-primary-900",
          bg: "hover:bg-primary-50",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      id={docKey}
      className={twMerge(
        "border-2 border-dashed rounded-xl border-primary-300 hover:border-brand-300 p-4 transition-all duration-200 flex flex-col",
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          {styles.pill && (
            <span
              className={twMerge(
                "text-xs font-medium px-2 py-1 rounded-full mb-1 md:mb-2 inline-block",
                styles.pill.className,
              )}
            >
              {styles.pill.label}
            </span>
          )}
          <h4
            className={twMerge(
              "font-semibold text-base flex items-center gap-2",
              styles.text,
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
            {status === "verified" && (
              <FiCheck className="size-4 text-brand-600" />
            )}
          </h4>
          {description && (
            <p className="text-sm text-primary-500 mt-1">{description}</p>
          )}
          {accept && (
            <p className="text-xs font-medium text-primary-500 mt-2">
              * {accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")}
            </p>
          )}
          {error && (
            <p className="text-xs font-medium text-red-500 mt-2">{error}</p>
          )}
        </div>

        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="icon"
              title="View Document"
              className="h-8 w-8 rounded-full bg-white/50 hover:bg-white text-primary-600"
            >
              <FiEye className="size-4" />
            </Button>
          </a>
        )}
      </div>

      <div className="mt-auto pt-3">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-400 rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-primary-500 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        ) : (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "verified"}
            variant="outline"
            className="w-full gap-2 text-sm h-9 md:h-10"
          >
            {status === "uploaded" ? (
              <>
                <FiEdit className="size-3" /> Edit
              </>
            ) : (
              <>
                <FiUpload className="size-3" /> Select File
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
