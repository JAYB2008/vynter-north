"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2, FlaskConical, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NameLoginFormProps {
  mode: "login" | "signup";
}

/**
 * Testing-mode auth: type a name and tap Continue.
 * New name -> creates an account and goes to onboarding.
 * Existing name (on this browser) -> logs back in.
 */
export function NameLoginForm({ mode }: NameLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") || "/dashboard";
  const { loginWithName } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      return;
    }

    setLoading(true);
    try {
      const { profile } = loginWithName(name);
      router.push(profile.onboarding_completed ? redirectTo : "/onboarding");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-app tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-secondary-app">
          {isSignup
            ? "Just type your name and tap continue."
            : "Type the name you signed up with to jump back in."}
        </p>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 text-xs text-secondary-app">
        <FlaskConical className="w-4 h-4 shrink-0 text-[var(--warning)] mt-0.5" />
        <span>
          <strong className="text-primary-app">Testing mode.</strong> No email or password
          needed. Your account is saved on this browser — use the same name to log back in.
        </span>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleContinue} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="name-login-input"
            className="text-xs font-semibold uppercase tracking-wider text-secondary-app block"
          >
            Your name
          </label>
          <div className="relative">
            <UserRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-app pointer-events-none" />
            <input
              id="name-login-input"
              ref={inputRef}
              type="text"
              autoComplete="name"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jay"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary-app border border-app text-primary-app placeholder:text-muted-app text-base focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-colors"
            />
          </div>
        </div>

        <button
          id="name-login-continue"
          type="submit"
          disabled={loading || name.trim().length < 2}
          className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base shadow-md shadow-[#7C3AED]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Entering...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-1">
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-sm text-[#A78BFA] hover:text-primary-app font-medium transition-colors"
        >
          {isSignup ? "Already have an account? Log in →" : "New here? Create an account →"}
        </Link>
      </div>
    </div>
  );
}
