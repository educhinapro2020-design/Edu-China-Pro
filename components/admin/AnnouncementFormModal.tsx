"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiLoader } from "react-icons/fi";
import { HiMegaphone } from "react-icons/hi2";
import { DatePicker } from "@/components/ui/date-picker";
import { Announcement, AnnouncementInsert } from "@/lib/types/announcement";
import { announcementRepository } from "@/lib/repositories/announcement.repo";
import { twMerge } from "tailwind-merge";

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (announcement: Announcement) => void;
  editing?: Announcement | null;
}

export function AnnouncementFormModal({
  isOpen,
  onClose,
  onSaved,
  editing,
}: AnnouncementFormModalProps) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [linkUrl, setLinkUrl] = useState(editing?.link_url ?? "");
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);
  const [startsAt, setStartsAt] = useState<string | null>(
    editing?.starts_at ?? null,
  );
  const [endsAt, setEndsAt] = useState<string | null>(editing?.ends_at ?? null);
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [removedDesktop, setRemovedDesktop] = useState(false);
  const [removedMobile, setRemovedMobile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleRemoveDesktopImage = () => {
    const url = editing?.desktop_image_url;
    setDesktopImageFile(null);
    setRemovedDesktop(true);
    if (url && editing) {
      editing.desktop_image_url = "";
      announcementRepository.deleteImage(url);
      announcementRepository.update(editing.id, { desktop_image_url: "" });
    }
  };

  const handleRemoveMobileImage = () => {
    const url = editing?.mobile_image_url;
    setMobileImageFile(null);
    setRemovedMobile(true);
    if (url && editing) {
      editing.mobile_image_url = null;
      announcementRepository.deleteImage(url);
      announcementRepository.update(editing.id, { mobile_image_url: null });
    }
  };

  const handleSubmit = async () => {
    if (!desktopImageFile && !editing?.desktop_image_url && removedDesktop) {
      setError("A desktop image is required for the banner.");
      return;
    }
    if (!linkUrl.trim()) {
      setError("Link URL is required.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const payload: AnnouncementInsert = {
        title: title.trim() || "Unnamed Banner",
        link_url: linkUrl.trim(),
        is_active: isActive,
        starts_at: startsAt,
        ends_at: endsAt,
        desktop_image_url: "",
        mobile_image_url: null,
      };

      if (desktopImageFile) {
        if (editing?.desktop_image_url) {
          await announcementRepository.deleteImage(editing.desktop_image_url);
        }
        payload.desktop_image_url =
          await announcementRepository.uploadImage(desktopImageFile);
      } else if (removedDesktop) {
        payload.desktop_image_url = "";
      } else if (editing?.desktop_image_url) {
        payload.desktop_image_url = editing.desktop_image_url;
      }

      if (mobileImageFile) {
        if (editing?.mobile_image_url) {
          await announcementRepository.deleteImage(editing.mobile_image_url);
        }
        payload.mobile_image_url =
          await announcementRepository.uploadImage(mobileImageFile);
      } else if (removedMobile) {
        payload.mobile_image_url = null;
      } else if (editing?.mobile_image_url) {
        payload.mobile_image_url = editing.mobile_image_url;
      }

      let result: Announcement;
      if (editing) {
        result = await announcementRepository.update(editing.id, payload);
      } else {
        result = await announcementRepository.create(payload);
      }
      onSaved(result);
      setTitle("");
      setLinkUrl("");
      setDesktopImageFile(null);
      setMobileImageFile(null);
      setRemovedDesktop(false);
      setRemovedMobile(false);
      setIsActive(true);
      setStartsAt(null);
      setEndsAt(null);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
            className="fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-primary-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <HiMegaphone className="size-4.5 text-brand-600" />
                  </div>
                  <h2 className="text-lg font-bold text-primary-900">
                    {editing ? "Edit Announcement" : "New Announcement"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <FiX className="size-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-primary-900">
                      Banner
                    </label>
                    <span className="text-sm text-primary-500">
                      (8:1 e.g. 1600 x 200)
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {desktopImageFile ||
                    (editing?.desktop_image_url && !removedDesktop) ? (
                      <div className="relative w-full aspect-8/1 rounded-xl border border-primary-200 overflow-hidden bg-primary-50 shrink-0 group">
                        <img
                          src={
                            desktopImageFile
                              ? URL.createObjectURL(desktopImageFile)
                              : (editing?.desktop_image_url as string) || ""
                          }
                          alt="Desktop banner preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveDesktopImage}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="size-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-8/1 rounded-xl border border-dashed border-primary-300 bg-primary-25 flex items-center justify-center shrink-0">
                        <HiMegaphone className="size-8 text-primary-200" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setDesktopImageFile(file);
                        }}
                        className="w-full text-sm text-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-colors cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-primary-900">
                      Mobile Banner
                    </label>
                    <span className="text-sm text-primary-500">
                      (4:1 e.g. 800 x 200)
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {mobileImageFile ||
                    (editing?.mobile_image_url && !removedMobile) ? (
                      <div className="relative w-full max-w-[200px] aspect-4/1 rounded-xl border border-primary-200 overflow-hidden bg-primary-50 shrink-0 group">
                        <img
                          src={
                            mobileImageFile
                              ? URL.createObjectURL(mobileImageFile)
                              : (editing?.mobile_image_url as string) || ""
                          }
                          alt="Mobile banner preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveMobileImage}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="size-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-[200px] aspect-4/1 rounded-xl border border-dashed border-primary-300 bg-primary-25 flex items-center justify-center shrink-0">
                        <p className="text-xs text-primary-300 text-center px-4">
                          Uses desktop crop if omitted
                        </p>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setMobileImageFile(file);
                        }}
                        className="w-full text-sm text-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-colors cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label mb-2">Link URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="e.g. /scholarships"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all mb-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label mb-2">Starts At</label>
                    <DatePicker
                      value={startsAt}
                      onChange={setStartsAt}
                      placeholder="No start date"
                    />
                  </div>
                  <div>
                    <label className="label mb-2">Ends At</label>
                    <DatePicker
                      value={endsAt}
                      onChange={setEndsAt}
                      placeholder="No end date"
                    />
                  </div>
                </div>

                <div>
                  <label className="label mb-3">Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unnamed Banner"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all mb-1"
                  />
                  <p className="text-xs text-primary-400">
                    For internal identification only. Will not be displayed.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={twMerge(
                      "relative w-11 h-6 rounded-full transition-colors duration-200",
                      isActive ? "bg-brand-600" : "bg-primary-200",
                    )}
                  >
                    <span
                      className={twMerge(
                        "absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform duration-200",
                        isActive && "translate-x-5",
                      )}
                    />
                  </button>
                  <span className="text-sm font-medium text-primary-700">
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {error && (
                  <p className="text-sm text-error font-medium">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-100 shrink-0">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <FiLoader className="size-3.5 animate-spin" />}
                  {editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
