"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { profileRepo } from "@/lib/repositories/profile.repo";
import { uploadAvatar } from "@/lib/services/avatar.service";
import { FiCamera, FiUser, FiArrowLeft, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";
import { ImageCropper } from "@/components/shared/image-cropper";

type FormState = {
  full_name: string;
  description: string;
};

export default function AdminProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    full_name: "",
    description: "",
  });
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.replace("/login");
      setUserId(user.id);

      const profile = await profileRepo.getProfile(user.id);
      if (profile) {
        setForm({
          full_name: profile.full_name ?? "",
          description: (profile as any).description ?? "",
        });
        setCurrentAvatarUrl(profile.avatar_url ?? null);
      }
      setLoading(false);
    });
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCroppingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `avatar_${Date.now()}.jpg`, {
      type: croppedBlob.type || "image/jpeg",
    });
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(croppedBlob));
    setCroppingImage(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!form.full_name.trim()) return;

    setSaving(true);
    setSaveError(null);

    try {
      let avatarUrl = currentAvatarUrl;

      if (pendingAvatarFile) {
        avatarUrl = await uploadAvatar(userId, pendingAvatarFile);
      }

      await profileRepo.updateProfile(userId, {
        full_name: form.full_name.trim(),
        description: form.description.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      } as any);

      setPendingAvatarFile(null);
      setCurrentAvatarUrl(avatarUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview ?? currentAvatarUrl;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="size-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage}
          aspect={1}
          onCropComplete={handleCropComplete}
          onCancel={() => setCroppingImage(null)}
        />
      )}

      <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6 pb-16">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-brand-600 transition-colors uppercase tracking-wider group mt-2"
        >
          <FiArrowLeft className="size-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-serif">
            My Profile
          </h1>
          <p className="text-primary-500 text-sm mt-0.5">
            Manage your profile information
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-primary-100 shadow-sm p-8 space-y-8"
        >
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => !saving && fileInputRef.current?.click()}
              className={`relative size-36 rounded-full border-4 border-white shadow-xl flex items-center justify-center cursor-pointer overflow-hidden group transition-transform hover:scale-105 active:scale-95 ${
                displayAvatar
                  ? "bg-white"
                  : "bg-primary-50 border-dashed border-primary-200"
              } ${saving ? "pointer-events-none" : ""}`}
            >
              {displayAvatar ? (
                <>
                  <img
                    src={displayAvatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 p-2 rounded-full backdrop-blur-sm">
                      <FiCamera className="size-5 text-primary-900" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <div className="size-10 bg-brand-50 rounded-full flex items-center justify-center">
                    <FiUser className="size-5 text-brand-500" />
                  </div>
                  <p className="text-xs font-semibold text-primary-500">
                    Upload Photo
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-primary-900">
                Profile Photo
              </p>
              <p className="text-xs text-primary-500 mt-2">
                Click to change · JPG, PNG or WebP
              </p>
            </div>

            <div className="flex items-start gap-2 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3">
              <FiInfo className="size-4 text-brand-500 shrink-0 mt-1" />
              <p className="text-sm text-brand-700 leading-relaxed">
                TIP: A clear, professional photo and description helps build
                trust with students.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="full_name"
              className="block text-sm font-bold text-primary-900"
            >
              Full Name <span className="text-brand-600">*</span>
            </label>
            <input
              id="full_name"
              type="text"
              value={form.full_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_name: e.target.value }))
              }
              placeholder="e.g. John Admin"
              required
              className="w-full px-4 py-3 rounded-xl border border-primary-200 text-sm text-primary-900 placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-bold text-primary-900"
            >
              About You{" "}
              <span className="text-primary-500 font-normal text-xs ml-1">
                Optional
              </span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="A short description about your role..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl border border-primary-200 text-sm text-primary-900 placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all resize-none"
            />
            <p className="text-xs text-primary-400 text-right">
              {form.description.length}/500
            </p>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 font-medium">{saveError}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-primary-100">
            {saved && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-green-600"
              >
                Profile saved successfully.
              </motion.p>
            )}
            {!saved && <span />}
            <button
              type="submit"
              disabled={saving || !form.full_name.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
