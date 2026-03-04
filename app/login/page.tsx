"use client";

import Link from "next/link";
import React, { Suspense, useState } from "react";
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validations/authValidation";
import { z } from "zod";

function LoginPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);
    setFieldErrors({});

    try {
      loginSchema.parse(formData);

      await authService.signInWithPassword(formData.email, formData.password);
      router.refresh();
      router.push("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors: { [key: string]: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setServerError(error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await authService.signInWithGoogle(next);
    } catch (error) {
      console.error("Google login failed", error);
    } finally {
    }
  };

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col relative overflow-hidden font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 z-10 bg-white">
        <div className="w-full max-w-[440px]">
          <button
            onClick={() => router.back()}
            className="mb-6 p-2 -ml-2 text-primary-600 hover:text-brand-600 transition-colors active:scale-95 rounded-full hover:bg-primary-50"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <h1 className="heading-1 mb-3">Welcome back</h1>
            <p className="body text-lg text-primary-500">
              Sign in to your account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="block tracking-wide text-sm font-semibold text-primary-700 ml-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@example.com"
                icon={<FiMail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              {fieldErrors.email && (
                <p className="text-xs font-medium text-red-500 ml-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="block tracking-wide text-sm font-semibold text-primary-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold tracking-wide text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<FiLock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              {fieldErrors.password && (
                <p className="text-xs font-medium text-red-500 ml-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {serverError && (
                <div className="p-3 flex bg-red-50 border border-red-200 rounded-xl items-center gap-3 text-red-600">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{serverError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="brand"
                loading={loading}
                endIcon={<FiArrowRight className="size-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="relative my-8 text-center">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-primary-200"></div>
            </div>
            <span className="relative px-4 bg-white text-xs font-semibold text-primary-400 uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              loading={googleLoading}
              startIcon={<FcGoogle className="w-5 h-5" />}
            >
              Google
            </Button>
          </div>

          <p className="mt-10 text-center text-sm text-primary-500 font-medium">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-brand-600 font-bold hover:text-brand-700 transition-colors underline decoration-2 underline-offset-4"
            >
              Join Now
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary-50 items-center justify-center">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl shadow-primary-900/10 mb-10 transform -rotate-1 hover:rotate-0 transition-all duration-700 ease-out border-4 border-white/50 backdrop-blur-sm">
            <img
              src="/images/auth/university.webp"
              alt="EduChina Pro University Campus"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
              <p className="text-white font-serif text-2xl font-bold leading-tight">
                "The journey of a thousand miles begins with a single step."
              </p>
              <p className="text-white/80 text-sm mt-2 font-medium">
                — Lao Tzu
              </p>
            </div>
          </div>

          <div className="text-center px-6">
            <h2 className="heading-2 mb-4">
              Education for <br />
              <span className="text-brand-600">Your Future.</span>
            </h2>
            <p className="body-large text-primary-500">
              Connect with 800+ Chinese universities and fast-track your
              admissions process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
