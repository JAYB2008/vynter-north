"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sparkles,
  Clapperboard,
  Star,
  Globe,
  FileText,
  Bot,
  Film,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);

  const accountKey = user?.account_key || "vn-active-account-key";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(accountKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#14142A] via-[#1C1C35] to-[#14142A] border border-[#1E1E3A] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-xs font-semibold text-[#A78BFA]">
            {role === "studio" ? (
              <>
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Production Studio</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Character Creator</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.display_name || "Creator"}
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl">
            {role === "studio"
              ? "Browse verified AI characters, manage studio rentals, and inject behavioral intelligence into your video pipelines."
              : "Register original personas, define behavior profiles, and license your characters to top AI production studios."}
          </p>
        </div>
      </div>

      {/* Account Key Box */}
      <div className="p-5 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
            Your Account Key
          </span>
          <button
            type="button"
            onClick={handleCopyKey}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-white transition-all cursor-pointer"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? "Copied" : "Copy Key"}</span>
          </button>
        </div>
        <code className="block p-3 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-xs sm:text-sm font-mono text-[#A78BFA] overflow-x-auto select-all">
          {accountKey}
        </code>
        <p className="text-[11px] text-[#64748B]">
          Keep this private. You'll use it to connect your characters to Claude, ChatGPT, and custom tools.
        </p>
      </div>

      {/* Next Steps Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">
          Next Steps
        </h2>

        {role === "creator" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Creator Card 1 */}
            <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Register Your First Character</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Create a character, build their personality profile, and list them on the marketplace.
                </p>
              </div>
              <Link
                href="/characters/new"
                className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow-md text-center transition-colors cursor-pointer"
              >
                Create Character →
              </Link>
            </div>

            {/* Creator Card 2 */}
            <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Explore the Marketplace</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  See what other creators are building and understand what makes characters valuable to studios.
                </p>
              </div>
              <Link
                href="/marketplace"
                className="w-full py-2.5 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] text-center transition-colors cursor-pointer"
              >
                Browse Marketplace →
              </Link>
            </div>

            {/* Creator Card 3 */}
            <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Read the Creator Guide</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Learn how to write character profiles and behavioral packs that studios love.
                </p>
              </div>
              <Link
                href="/skills"
                className="w-full py-2.5 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] text-center transition-colors cursor-pointer"
              >
                View Guide →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Studio Card 1 */}
            <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Connect Claude or ChatGPT</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Add the Vynter North MCP connection to your AI tool of choice.
                </p>
              </div>
              <Link
                href="/connect"
                className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow-md text-center transition-colors cursor-pointer"
              >
                Set Up Connection →
              </Link>
            </div>

            {/* Studio Card 2 */}
            <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Browse Characters</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Find the perfect characters for your upcoming productions.
                </p>
              </div>
              <Link
                href="/marketplace"
                className="w-full py-2.5 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] text-center transition-colors cursor-pointer"
              >
                Browse Marketplace →
              </Link>
            </div>

            {/* Studio Card 3 */}
            <div className="p-6 rounded-2xl bg-[#14142A] border border-[#1E1E3A] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Try the Demo</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  See how character intelligence transforms your scene prompts.
                </p>
              </div>
              <Link
                href="/demo"
                className="w-full py-2.5 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] text-center transition-colors cursor-pointer"
              >
                Try Demo →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
