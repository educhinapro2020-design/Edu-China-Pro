"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasSession(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword(password);
      setSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="size-8 border-3 border-primary-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <FiAlertCircle className="size-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-primary-900">
            Invalid or Expired Link
          </h1>
          <p className="text-sm text-primary-500">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Button
            variant="brand"
            onClick={() => router.push("/forgot-password")}
          >
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col relative overflow-hidden font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 z-10 bg-white">
        <div className="w-full max-w-[440px]">
          {success ? (
            <div className="space-y-6">
              <div className="size-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <FiCheckCircle className="size-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="heading-1 mb-3">Password updated!</h1>
                <p className="body text-base text-primary-500">
                  Your password has been successfully reset. You&apos;ll be
                  redirected to login in a moment...
                </p>
              </div>
              <Button
                variant="brand"
                className="w-full"
                onClick={() => router.push("/login")}
                endIcon={<FiArrowRight className="w-4 h-4" />}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="size-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
                  <FiShield className="size-6 text-brand-600" />
                </div>
                <h1 className="heading-1 mb-3">Set new password</h1>
                <p className="body text-base text-primary-500">
                  Choose a strong password for your account. Must be at least 8
                  characters.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-primary-700 ml-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    icon={<FiLock className="w-4 h-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-primary-700 ml-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    icon={<FiLock className="w-4 h-4" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Update Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary-50 items-center justify-center">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md text-center px-8">
          <div className="size-24 rounded-full bg-white shadow-xl border border-primary-100 flex items-center justify-center mx-auto mb-8">
            <FiShield className="size-10 text-brand-600" />
          </div>
          <h2 className="heading-2 mb-4">Stay Secure.</h2>
          <p className="body-large text-primary-500">
            A strong password protects your applications, scholarship data, and
            personal information.
          </p>
        </div>
      </div>
    </div>
  );
}
