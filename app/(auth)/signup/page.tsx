"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage("Please enter your display name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Please fulfill all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms of Service to create an account.");
      return;
    }

    setLoading(true);

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      // If user session is created immediately (email confirmation disabled or auto-confirm)
      if (data.session || data.user) {
        // Also insert profile row if trigger didn't fire
        try {
          await supabase.from("profiles").upsert({
            id: data.user!.id,
            display_name: displayName.trim(),
            role: "creator", // default initial role, picked in onboarding
            onboarding_completed: false,
          });
        } catch {
          // ignore error if profile trigger handled it
        }

        router.push("/onboarding");
      } else {
        // Confirmation email sent
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign up. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setGoogleLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect with Google.";
      setErrorMessage(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Join Vynter North — the AI character intelligence platform
        </p>
      </div>

      {/* Inline Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
            Display name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Elena Vance"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
            Email address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password Requirements Checklist */}
          <div className="grid grid-cols-3 gap-1 pt-1.5 text-[11px]">
            <div className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400" : "text-[#64748B]"}`}>
              {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>8+ chars</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-400" : "text-[#64748B]"}`}>
              {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>1 number</span>
            </div>
            <div className={`flex items-center gap-1 ${hasUppercase ? "text-emerald-400" : "text-[#64748B]"}`}>
              {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              <span>1 uppercase</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
            Confirm password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded border-[#2A2A4A] bg-[#0F0F1A] text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-[#94A3B8] cursor-pointer">
            I agree to the <span className="text-[#A78BFA]">Terms of Service</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#1E1E3A] w-full" />
        <span className="bg-[#14142A] px-3 text-xs uppercase tracking-wider text-[#64748B] relative z-10 font-medium">
          or
        </span>
      </div>

      {/* Continue with Google */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="w-full py-2 rounded-xl border border-[#2A2A4A] bg-[#0F0F1A] hover:bg-[#1C1C35] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#A78BFA]" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      <div className="text-center pt-1">
        <Link
          href="/login"
          className="text-xs sm:text-sm text-[#A78BFA] hover:text-white font-medium transition-colors"
        >
          Already have an account? Sign In →
        </Link>
      </div>
    </div>
  );
}
