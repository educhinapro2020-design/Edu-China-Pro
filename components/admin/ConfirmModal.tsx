"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  isLoading = false,
  variant = "danger",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex flex-col items-start gap-2">
                <div
                  className={twMerge(
                    "size-10 rounded-xl flex items-center justify-center shrink-0",
                    variant === "danger" ? "bg-red-50" : "bg-amber-50",
                  )}
                >
                  <FiAlertTriangle
                    className={twMerge(
                      "size-5",
                      variant === "danger" ? "text-red-600" : "text-amber-600",
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 text-lg">
                    {title}
                  </h3>
                  <p className="text-sm text-primary-500 mt-1">{message}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={twMerge(
                    "px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50",
                    variant === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700",
                  )}
                >
                  {isLoading ? "Processing..." : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
