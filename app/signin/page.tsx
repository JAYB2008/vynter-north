"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ account: any }>("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!res.ok) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      const account = res.data.account;
      await refreshUser();

      if (nextUrl) {
        router.push(nextUrl);
      } else if (account.active_mode === "studio" || (account.has_studio && !account.has_creator)) {
        router.push("/studio/overview");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Couldn't reach Vynter North. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night text-text flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" />
        <h2 className="mt-6 text-3xl font-serif tracking-tight text-text">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-dim">
          Access your characters, MCP connection key, and studio workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-panel border border-line p-6 sm:p-8 rounded-[10px]">
          {error && (
            <div className="mb-6 p-3.5 bg-bad/10 border border-bad/30 rounded-md flex items-start gap-3 text-bad text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-dim">@</span>
                <input
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="input-base pl-8"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-text">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-glacier hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-dim hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-line text-center text-sm text-dim">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-glacier hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-night" />}>
      <SignInForm />
    </Suspense>
  );
}
