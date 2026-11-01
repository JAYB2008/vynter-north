"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, CheckCircle2, Copy, Download } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !recoveryCode.trim() || !newPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ new_recovery_code: string; account: any }>(
        "/api/auth/recover",
        {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            recovery_code: recoveryCode.trim(),
            new_password: newPassword,
          }),
        }
      );

      if (!res.ok) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      setNewRecoveryCode(res.data.new_recovery_code);
      await refreshUser();
    } catch {
      setError("Couldn't reach Vynter North. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!newRecoveryCode) return;
    navigator.clipboard.writeText(newRecoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!newRecoveryCode) return;
    const element = document.createElement("a");
    const file = new Blob(
      [
        `VYNTER NORTH NEW ACCOUNT RECOVERY CODE\n` +
          `Username: ${username}\n` +
          `Recovery Code: ${newRecoveryCode}\n\n` +
          `Store this file safely. Your old recovery code is now invalid.`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `vynter-north-new-recovery-${username}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-night text-text flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" />
        <h2 className="mt-6 text-3xl font-serif tracking-tight text-text">
          {newRecoveryCode ? "Password Reset Successful" : "Recover Account"}
        </h2>
        <p className="mt-2 text-sm text-dim">
          {newRecoveryCode
            ? "Your password has been updated and a new emergency recovery code has been issued."
            : "Enter your username, 16-character recovery code, and new password."}
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

          {newRecoveryCode ? (
            <div className="space-y-6">
              <div className="p-4 bg-night border border-line rounded-[8px] text-center">
                <span className="text-xs uppercase tracking-wider text-dim block mb-1">
                  Your New Master Recovery Code
                </span>
                <span className="font-mono text-2xl font-bold tracking-widest text-glacier select-all block py-2">
                  {newRecoveryCode}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyCode}
                  className="btn-secondary flex-1 text-sm"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy code"}
                </button>
                <button
                  type="button"
                  onClick={downloadCode}
                  className="btn-secondary flex-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </button>
              </div>

              <div className="p-3.5 bg-warn/10 border border-warn/30 rounded-md text-xs text-warn leading-relaxed">
                <strong>Attention:</strong> Your previous recovery code has been permanently retired. Please save this new code in a secure location.
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="btn-primary w-full"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Recovery code
                </label>
                <input
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  className="input-base font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  New password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-line text-center text-sm text-dim">
            Remembered your credentials?{" "}
            <Link href="/signin" className="text-glacier hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
