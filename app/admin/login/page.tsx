"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

export default function AdminLogin() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [targetEmail, setTargetEmail] = useState("gadhaveshambhuraj@gmail.com");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.requiresOtp) {
        setTargetEmail(data.email || "gadhaveshambhuraj@gmail.com");
        setStep("otp");
        setSuccessMsg(`Security code sent`);
      } else {
        setError(data.error || "Login credentials failed");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("Failed to connect to authentication server");
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim() }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMsg("Authorized! Redirecting to creator verification queue...");
        setTimeout(() => {
          router.push("/admin/creators");
        }, 800);
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("Failed to verify code");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setIsResending(false);

      if (res.ok) {
        setSuccessMsg(`New security code sent`);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (err: any) {
      setIsResending(false);
      setError("Network error resending code");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-textMain flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl border border-borderMuted shadow-2xl space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-red-950/40 rounded-2xl text-red-400 border border-red-900/40 shadow-inner">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-textMain">Admin Gateway</h1>
            <p className="text-xs text-textMuted mt-1 font-mono">
              {step === "credentials"
                ? "Restricted Access • Verification Staff Only"
                : "2-Factor Security Challenge"}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 text-red-300 border border-red-500/40 rounded-xl text-xs text-center leading-relaxed font-mono">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs text-center flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase font-bold">
                Admin ID
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="••••••••••••"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm text-textMain focus:border-red-500 outline-none font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-textMuted mb-1.5 uppercase font-bold">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-3 text-sm text-textMain focus:border-red-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-heading font-bold rounded-xl py-3 mt-2 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-red-600/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Checking Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Verify Identity & Send OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-mono text-textMuted mb-2 uppercase text-center font-bold">
                Enter 6-Digit One-Time Code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold bg-surfaceElevated border-2 border-borderMuted focus:border-limeAccent rounded-xl py-3.5 text-textMain outline-none transition"
              />
              <span className="text-[10px] text-textMuted text-center block mt-1.5 font-mono">
                Code expires in 10 minutes. Check spam folder if not found.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.trim().length !== 6}
              className="w-full bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-limeAccent/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Authorize Admin Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-borderMuted text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setError("");
                }}
                className="text-textMuted hover:text-textMain transition"
              >
                ← Back to credentials
              </button>

              <button
                type="button"
                disabled={isResending}
                onClick={handleResendOtp}
                className="text-limeAccent hover:underline transition disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend Code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
