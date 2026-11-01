import { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & Creator Plans — Vynter North",
  description:
    "Creator registration plans and studio rental licensing rates. Transparent 80/20 royalty split.",
};

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Test Mode Banner (Section 7.9 & 9.1) */}
      <div className="p-4 bg-[var(--marquee)]/15 border border-[var(--marquee)]/40 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text)]">
        <div>
          <strong className="text-[var(--marquee)] block sm:inline mr-2">
            Test Mode Active:
          </strong>
          <span>Payments are in test mode. Paid creator plans and rental orders use sandbox checkout.</span>
        </div>
        <span className="font-mono text-[11px] text-[var(--text-dim)] shrink-0">
          Platform Fee: 20%
        </span>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
          Transparent Economics
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[var(--text)] tracking-tight">
          Creator Registration Plans
        </h1>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed">
          Catalog original character personalities, anchor cryptographic ownership, and earn recurring royalties when studios rent your talent.
        </p>
      </div>

      {/* 4 Creator Plans (Section 7.9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Free Plan */}
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                Free
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-4xl font-bold text-[var(--text)]">$0</span>
                <span className="text-xs text-[var(--text-dim)]">/month</span>
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-2">
                Ideal for independent creators publishing their first original character identity.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--text)] pt-2 border-t border-[var(--line)]">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>1 registered character</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Master personality sheet</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Rising talent marketplace listing</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Permanent CVR registration slate</span>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] text-center text-xs font-medium text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
          >
            Start Free
          </Link>
        </div>

        {/* Starter Plan */}
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                Starter
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-4xl font-bold text-[var(--text)]">$9</span>
                <span className="text-xs text-[var(--text-dim)]">/month</span>
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-2">
                For character artists with a small roster and short demo reels.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--text)] pt-2 border-t border-[var(--line)]">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>3 registered characters</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Demo reel up to 5 scenes</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>NVIDIA NIM sheet checker</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Verified creator mark eligibility</span>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] text-center text-xs font-medium text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
          >
            Upgrade to Starter
          </Link>
        </div>

        {/* Creator Plan (Featured) */}
        <div className="p-6 bg-[var(--night)] border border-[var(--glacier)] rounded-[10px] flex flex-col justify-between space-y-6 shadow-md relative">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[var(--glacier)] uppercase tracking-wider block">
                Creator (Popular)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-4xl font-bold text-[var(--text)]">$25</span>
                <span className="text-xs text-[var(--text-dim)]">/month</span>
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-2">
                For established character designers managing an active talent roster.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--text)] pt-2 border-t border-[var(--line)]">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--glacier)] shrink-0 mt-0.5" />
                <span>10 registered characters</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--glacier)] shrink-0 mt-0.5" />
                <span>Demo reel up to 10 scenes</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--glacier)] shrink-0 mt-0.5" />
                <span>Main marketplace placement</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--glacier)] shrink-0 mt-0.5" />
                <span>Casting call audition access</span>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-center text-xs font-semibold rounded-[6px] hover:brightness-110"
          >
            Choose Creator
          </Link>
        </div>

        {/* Studio Plan */}
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                Studio
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-4xl font-bold text-[var(--text)]">$60</span>
                <span className="text-xs text-[var(--text-dim)]">/month</span>
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-2">
                Unlimited character catalog for production studios and casting agencies.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--text)] pt-2 border-t border-[var(--line)]">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Unlimited registered characters</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Full demo reels & verified credits</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Priority MCP streaming bandwidth</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--ok)] shrink-0 mt-0.5" />
                <span>Dedicated account manager</span>
              </div>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] text-center text-xs font-medium text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
          >
            Choose Studio
          </Link>
        </div>
      </div>

      {/* How Rentals Work Section (Section 7.9) */}
      <div className="p-8 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-4 text-xs">
        <h3 className="font-serif text-2xl text-[var(--text)]">
          How Character Rentals & the 20% Platform Fee Work
        </h3>
        <p className="text-[var(--text-dim)] leading-relaxed">
          Creators set their own daily, weekly, and monthly rates. When a studio rents a character, Vynter North retains a 20% platform infrastructure fee to cover NVIDIA NIM GPU enrichment inferences, MCP streaming latency, and cryptographic fingerprint registries. The creator earns the remaining 80%.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-[var(--panel-raised)] rounded-[6px] space-y-1">
            <span className="font-bold text-[var(--text)] block">Daily Access (50 credits)</span>
            <span className="text-[var(--text-dim)]">Short-form video experiments and rapid tests.</span>
          </div>
          <div className="p-4 bg-[var(--panel-raised)] rounded-[6px] space-y-1">
            <span className="font-bold text-[var(--text)] block">Weekly Access (200 credits)</span>
            <span className="text-[var(--text-dim)]">Commercial shoots and multi-scene sequences.</span>
          </div>
          <div className="p-4 bg-[var(--panel-raised)] rounded-[6px] space-y-1">
            <span className="font-bold text-[var(--text)] block">Monthly Access (500 credits)</span>
            <span className="text-[var(--text-dim)]">Full series production, games, and VR projects.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
