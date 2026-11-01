"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  User,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Lock,
  Download,
  AlertCircle,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, activeMode, refreshUser, signOut } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [regeneratingRecovery, setRegeneratingRecovery] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);

  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [hostOrigin, setHostOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostOrigin(window.location.origin);
    }
    if (user) {
      setDisplayName(user.display_name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
      setWebsite(user.website || "");
    }
  }, [user]);

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMessage(null);

    const res = await apiFetch("/api/auth/update-profile", {
      method: "POST",
      body: JSON.stringify({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        website: website.trim(),
      }),
    });

    setSavingProfile(false);
    if (res.ok) {
      await refreshUser();
      setStatusMessage({ type: "success", text: "Profile details updated successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error.message });
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setChangingPassword(true);
    const res = await apiFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    setChangingPassword(false);
    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatusMessage({ type: "success", text: "Password changed successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error.message });
    }
  };

  // Regenerate Recovery Code
  const handleRegenerateRecovery = async () => {
    if (!window.confirm("Regenerate your recovery code? Your existing recovery code will be permanently retired.")) {
      return;
    }

    setRegeneratingRecovery(true);
    setStatusMessage(null);

    const res = await apiFetch<{ recovery_code: string }>("/api/auth/regenerate-recovery", {
      method: "POST",
    });

    setRegeneratingRecovery(false);
    if (res.ok && res.data) {
      setNewRecoveryCode(res.data.recovery_code);
      setStatusMessage({ type: "success", text: "New recovery code generated. Save it immediately." });
    } else {
      setStatusMessage({ type: "error", text: res.error.message });
    }
  };

  // Regenerate Account Key
  const handleRegenerateKey = async () => {
    if (!window.confirm("Regenerate your MCP Account Key? Any external Claude or ChatGPT connectors using the previous key will immediately stop working.")) {
      return;
    }

    setRegeneratingKey(true);
    setStatusMessage(null);

    const res = await apiFetch<{ account_key: string }>("/api/auth/regenerate-key", {
      method: "POST",
    });

    setRegeneratingKey(false);
    if (res.ok) {
      await refreshUser();
      setStatusMessage({ type: "success", text: "New MCP account key generated and activated." });
    } else {
      setStatusMessage({ type: "error", text: res.error.message });
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmationText.trim().toLowerCase() !== user.username.toLowerCase()) {
      setDeleteError(`Please type your exact username (${user?.username}) to confirm.`);
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch("/api/auth/delete-account", {
      method: "DELETE",
      body: JSON.stringify({ usernameConfirmation: deleteConfirmationText.trim() }),
    });

    setDeleting(false);
    if (res.ok) {
      window.location.href = "/";
    } else {
      setDeleteError(res.error.message);
    }
  };

  const copyMcpUrl = () => {
    if (!user) return;
    const url = `${hostOrigin}/api/mcp/${user.account_key}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyNewCode = () => {
    if (!newRecoveryCode) return;
    navigator.clipboard.writeText(newRecoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadNewCode = () => {
    if (!newRecoveryCode || !user) return;
    const element = document.createElement("a");
    const file = new Blob(
      [
        `VYNTER NORTH REPLACEMENT RECOVERY CODE\n` +
          `Username: ${user.username}\n` +
          `Recovery Code: ${newRecoveryCode}\n\n` +
          `Store this safely. Your old recovery code is permanently deactivated.`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `vynter-recovery-${user.username}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 max-w-3xl pb-16">
      <div>
        <h1 className="text-3xl font-serif text-text tracking-tight">Account Settings</h1>
        <p className="text-sm text-dim mt-1">
          Manage your personal details, credentials, and MCP connector keys.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-[6px] border text-sm flex items-center gap-3 ${
            statusMessage.type === "success"
              ? "bg-ok/10 border-ok/30 text-ok"
              : "bg-bad/10 border-bad/30 text-bad"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Account Overview & Plan Badge */}
      <div className="p-6 rounded-[10px] bg-panel border border-line space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text flex items-center gap-2">
              <Shield className="w-4 h-4 text-glacier" />
              <span>Identity & Plan</span>
            </h2>
            <p className="text-xs text-dim mt-0.5">
              Unique handle: <span className="font-mono text-text">@{user?.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-semibold uppercase bg-panel-raised border border-line text-text">
              Plan: {user?.plan || "free"}
            </span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase border ${
                user?.verification_status === "verified"
                  ? "bg-ok/10 text-ok border-ok/30"
                  : "bg-panel-raised text-dim border-line"
              }`}
            >
              {user?.verification_status === "verified" ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="p-6 rounded-[10px] bg-panel border border-line space-y-5">
        <h2 className="text-base font-semibold text-text flex items-center gap-2">
          <User className="w-4 h-4 text-glacier" />
          <span>Profile Details</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Display name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Bio (≤ 300 characters)
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell studios and creators about your background..."
              className="input-base resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Website or Portfolio link
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="input-base"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
            >
              {savingProfile ? "Saving..." : "Save details"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 rounded-[10px] bg-panel border border-line space-y-5">
        <h2 className="text-base font-semibold text-text flex items-center gap-2">
          <Lock className="w-4 h-4 text-glacier" />
          <span>Change Password</span>
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
              Current password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
                New password (min 8 chars)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dim mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-secondary"
            >
              {changingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>

      {/* Emergency Recovery Code */}
      <div className="p-6 rounded-[10px] bg-panel border border-line space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <Key className="w-4 h-4 text-glacier" />
            <span>Emergency Recovery Code</span>
          </h2>
          <p className="text-xs text-dim">
            If you forget your password, your recovery code is the only way back into your account.
          </p>
        </div>

        {newRecoveryCode ? (
          <div className="p-4 bg-night border border-line rounded-[8px] space-y-3">
            <span className="text-xs uppercase text-dim block">
              New Master Recovery Code:
            </span>
            <span className="font-mono text-xl font-bold text-glacier select-all block">
              {newRecoveryCode}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyNewCode}
                className="btn-secondary text-xs !min-h-[36px]"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Copied" : "Copy code"}
              </button>
              <button
                type="button"
                onClick={downloadNewCode}
                className="btn-secondary text-xs !min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5" />
                Download .txt
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={regeneratingRecovery}
            onClick={handleRegenerateRecovery}
            className="btn-secondary text-xs !min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regeneratingRecovery ? "animate-spin" : ""}`} />
            <span>Generate replacement recovery code</span>
          </button>
        )}
      </div>

      {/* MCP Connector URL & Account Key */}
      <div className="p-6 rounded-[10px] bg-panel border border-line space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <Key className="w-4 h-4 text-glacier" />
            <span>Personal MCP Server URL</span>
          </h2>
          <p className="text-xs text-dim">
            Add this remote MCP URL into Claude or ChatGPT to use your rented characters directly in chat.
          </p>
        </div>

        <div className="space-y-2">
          <code className="block p-3 rounded-[6px] bg-night border border-line text-xs font-mono text-glacier overflow-x-auto select-all">
            {hostOrigin}/api/mcp/{user?.account_key}
          </code>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={copyMcpUrl}
              className="btn-secondary text-xs !min-h-[36px]"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? "Copied URL" : "Copy connector URL"}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerateKey}
              disabled={regeneratingKey}
              className="btn-destructive text-xs !min-h-[36px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingKey ? "animate-spin" : ""}`} />
              <span>Regenerate key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={signOut}
          className="btn-secondary w-full flex items-center justify-center gap-2 text-bad hover:bg-bad/10 hover:border-bad"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out of Vynter North</span>
        </button>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 rounded-[10px] bg-bad/5 border border-bad/20 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-bad flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-dim">
            Permanently delete your profile and registered character data. Blocked while active rentals or grace periods exist.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setShowDeleteModal(true);
          }}
          className="btn-destructive text-xs !min-h-[38px]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-night/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-panel border border-line rounded-[10px] p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-text">Confirm Account Deletion</h3>
            <p className="text-xs text-dim leading-relaxed">
              This action cannot be undone. To permanently delete your account, type your username{" "}
              <strong className="text-bad font-mono">@{user?.username}</strong> below:
            </p>

            {deleteError && (
              <div className="p-3 bg-bad/10 border border-bad/30 rounded text-xs text-bad">
                {deleteError}
              </div>
            )}

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={user?.username}
              className="input-base font-mono text-sm"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                  setDeleteError(null);
                }}
                className="btn-secondary text-xs !min-h-[36px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  deleteConfirmationText.trim().toLowerCase() !==
                    user?.username.toLowerCase() || deleting
                }
                onClick={handleDeleteAccount}
                className="btn-destructive text-xs !min-h-[36px] disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Permanently delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
