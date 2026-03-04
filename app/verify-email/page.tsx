"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiMail,
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/services/auth.service";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.verifyOtp(email, code);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError(null);

    try {
      await authService.resendVerification(email);
      setResendCooldown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6) {
      handleVerify();
    }
  }, [otp]);

  if (!email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <FiAlertCircle className="size-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-primary-900">Missing Email</h1>
          <p className="text-sm text-primary-500">
            No email address provided. Please sign up first.
          </p>
          <Button variant="brand" onClick={() => router.push("/signup")}>
            Go to Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex lg:flex-row flex-col relative overflow-hidden font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 z-10 bg-white">
        <div className="w-full max-w-[440px]">
          <button
            onClick={() => router.push("/signup")}
            className="mb-6 p-2 -ml-2 text-primary-600 hover:text-brand-600 transition-colors active:scale-95 rounded-full hover:bg-primary-50"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <div className="size-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6">
              <FiMail className="size-6 text-brand-600" />
            </div>
            <h1 className="heading-1 mb-3">Verify your email</h1>
            <p className="body text-base text-primary-500">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-primary-800">{email}</span>.
              Enter it below to verify your account.
            </p>
          </div>

          <div className="space-y-8">
            {/* OTP Input */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 ${
                    digit
                      ? "border-brand-500 bg-brand-50/50 text-primary-900"
                      : "border-primary-200 bg-primary-50 text-primary-900"
                  } focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20`}
                />
              ))}
            </div>

            {error && (
              <div className="p-3 flex bg-red-50 border border-red-200 rounded-xl items-center gap-3 text-red-600">
                <FiAlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              variant="brand"
              className="w-full"
              loading={loading}
              onClick={handleVerify}
              endIcon={<FiArrowRight className="w-4 h-4" />}
            >
              Verify Email
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-primary-500">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || resending}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:text-primary-400 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw
                  className={`size-4 ${resending ? "animate-spin" : ""}`}
                />
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : resending
                    ? "Sending..."
                    : "Resend Code"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary-50 items-center justify-center">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md text-center px-8">
          <div className="size-24 rounded-full bg-white shadow-xl border border-primary-100 flex items-center justify-center mx-auto mb-8">
            <FiCheckCircle className="size-10 text-brand-600" />
          </div>
          <h2 className="heading-3 mb-4">Almost There!</h2>
          <p className="text-lg text-primary-500">
            Just one more step to unlock your personalized study-in-China
            dashboard, scholarship tools, and expert counseling.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
