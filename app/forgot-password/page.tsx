"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMail,
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await authService.resetPasswordRequest(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col relative overflow-hidden font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 z-10 bg-white">
        <div className="w-full max-w-[440px]">
          <button
            onClick={() => router.push("/login")}
            className="mb-6 p-2 -ml-2 text-primary-600 hover:text-brand-600 transition-colors active:scale-95 rounded-full hover:bg-primary-50"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>

          {sent ? (
            <div className="space-y-6">
              <div className="size-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <FiCheckCircle className="size-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="heading-1 mb-3">Check your email</h1>
                <p className="body text-base text-primary-500">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-primary-800">
                    {email}
                  </span>
                  . Click the link in the email to reset your password.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  variant="brand"
                  className="w-full"
                  onClick={() => router.push("/login")}
                  endIcon={<FiArrowRight className="w-4 h-4" />}
                >
                  Back to Login
                </Button>
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="w-full text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors py-2"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="heading-1 mb-3">Forgot password?</h1>
                <p className="body text-base text-primary-500">
                  No worries! Enter your email and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-primary-700 ml-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="student@example.com"
                    icon={<FiMail className="w-4 h-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 flex bg-red-50 border border-red-200 rounded-xl items-center gap-3 text-red-600">
                    <FiAlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="brand"
                  className="w-full"
                  loading={loading}
                  endIcon={<FiArrowRight className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-10 text-center text-sm text-primary-500 font-medium">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-brand-600 font-bold hover:text-brand-700 transition-colors underline decoration-2 underline-offset-4"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary-50 items-center justify-center">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="text-center px-6">
            <h2 className="heading-2 mb-4">
              Secure Your <span className="text-brand-600">Account.</span>
            </h2>
            <p className="text-lg text-primary-500">
              Your education journey is important. Keep your account safe and
              get back on track in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
