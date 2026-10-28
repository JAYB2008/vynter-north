"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, role, refreshProfile, logout } = useAuth();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accountKey, setAccountKey] = useState("");

  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
      setAccountKey(user.account_key || "vn-prod-key-pending");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("You must be logged in to update your profile.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id);

      if (error) throw error;

      await refreshProfile();
      setStatusMessage({ type: "success", text: "Profile details updated successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(accountKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm("Are you sure you want to regenerate your Account Key? Any existing tools connecting to your characters with the old key will stop working.")) {
      return;
    }

    setRegenerating(true);
    setStatusMessage(null);

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) throw new Error("Authentication required.");

      const newKey = `vn-${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;

      const { error } = await supabase
        .from("profiles")
        .update({
          account_key: newKey,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id);

      if (error) throw error;

      setAccountKey(newKey);
      await refreshProfile();
      setStatusMessage({ type: "success", text: "New Account Key generated and saved." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to regenerate Account Key.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      return;
    }

    setDeleting(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Cascade delete profile and characters
        await supabase.from("characters").delete().eq("owner_id", authUser.id);
        await supabase.from("profiles").delete().eq("id", authUser.id);
      }

      await logout();
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account.";
      setStatusMessage({ type: "error", text: msg });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Manage your personal details, developer keys, and role configuration.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Role Badge Display (READ-ONLY) */}
      <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7C3AED]" />
              <span>Assigned Role</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Your account permissions and dashboard features are locked to this role.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40">
            {role}
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-xs text-[#94A3B8]">
          <Lock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span>Role is permanent once onboarding is completed. Contact support to change your account role.</span>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-[#7C3AED]" />
          <span>Profile Details</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name or studio label"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
              Bio
            </label>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your creative focus..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#7C3AED]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Key Display with Copy & Regenerate */}
      <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-[#7C3AED]" />
            <span>Developer Account Key</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Used by Claude Desktop, ChatGPT, and SDK tools to authenticate with Vynter North's MCP server.
          </p>
        </div>

        <div className="space-y-2">
          <code className="block p-3 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-xs sm:text-sm font-mono text-[#A78BFA] overflow-x-auto select-all">
            {accountKey}
          </code>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyKey}
              className="px-3.5 py-1.5 rounded-lg bg-[#1C1C35] hover:bg-[#2A2A4A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Key"}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerateKey}
              disabled={regenerating}
              className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              <span>Regenerate Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Permanently delete your profile and registered character data. This action is irreversible.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#14142A] border border-[#1E1E3A] rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-[#94A3B8]">
              This will immediately delete your account and all associated character registry records. Type <strong className="text-red-400 font-mono">DELETE</strong> below to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm font-mono focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }}
                className="px-4 py-2 rounded-lg bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== "DELETE" || deleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-xs font-semibold text-white shadow-md flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
