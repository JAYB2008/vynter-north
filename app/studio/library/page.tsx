"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Star,
  ShieldCheck,
  Film,
  Plus,
  Loader2,
  Sliders,
} from "lucide-react";
import { Rental, Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function StudioLibraryPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ rentals: Rental[] }>("/api/rentals").then((res) => {
      setLoading(false);
      if (res.ok && res.data.rentals) {
        setRentals(res.data.rentals);
      }
    });
  }, []);

  const getStatusInfo = (rental: Rental) => {
    const now = Date.now();
    const expiresAt = rental.expires_at ? new Date(rental.expires_at).getTime() : Infinity;
    const graceAt = rental.grace_ends_at ? new Date(rental.grace_ends_at).getTime() : Infinity;

    if (rental.ended_early) {
      return {
        label: "Concluded",
        badgeClass: "bg-[var(--line)] text-[var(--text-dim)]",
        eligibleForReview: true,
      };
    }

    if (now < expiresAt) {
      const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      return {
        label: `Active • ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`,
        badgeClass: "bg-[var(--ok)]/15 text-[var(--ok)]",
        eligibleForReview: false,
      };
    }

    if (now < graceAt) {
      const graceDaysLeft = Math.ceil((graceAt - now) / (1000 * 60 * 60 * 24));
      return {
        label: `Grace Period • ${graceDaysLeft}d to renew`,
        badgeClass: "bg-[var(--warn)]/15 text-[var(--warn)]",
        eligibleForReview: true,
      };
    }

    return {
      label: "Expired",
      badgeClass: "bg-[var(--bad)]/15 text-[var(--bad)]",
      eligibleForReview: true,
    };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        <p className="text-xs text-[var(--text-dim)] mt-3">Loading studio library…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--line)] mb-8">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Studio Roster
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            My Character Library
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Rented and owned AI character personalities ready for scene enrichment in workspace or Claude.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Rent more characters
        </Link>
      </div>

      {rentals.length === 0 ? (
        <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--panel-raised)] border border-[var(--line)] flex items-center justify-center text-[var(--text-dim)]">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-[var(--text)]">Your Library is Empty</h3>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            Browse the talent marketplace to start a free 3-day trial or rent verified character personalities.
          </p>
          <Link
            href="/marketplace"
            className="inline-block px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110"
          >
            Explore Character Talent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((r) => {
            const char = r.character;
            const status = getStatusInfo(r);
            const creditsLeft = Math.max(0, r.credits_total - r.credits_used);
            const creditPct = Math.min(100, Math.round((creditsLeft / (r.credits_total || 1)) * 100));

            return (
              <div
                key={r.id}
                className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-5 flex flex-col justify-between space-y-4 shadow-sm"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {char?.portrait_url && (
                        <img
                          src={char.portrait_url}
                          alt={char.name}
                          className="w-12 h-15 object-cover rounded-[2px] border border-[var(--line)]"
                        />
                      )}
                      <div>
                        <Link
                          href={`/characters/${r.character_id}`}
                          className="font-serif text-xl text-[var(--text)] hover:text-[var(--glacier)] block leading-tight"
                        >
                          {char?.name || r.character_id}
                        </Link>
                        <span className="font-mono text-[10px] text-[var(--text-dim)]">
                          {r.character_id}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-medium ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {char?.vibe_summary && (
                    <p className="text-xs text-[var(--text-dim)] line-clamp-1 italic">
                      "{char.vibe_summary}"
                    </p>
                  )}

                  {/* Credits Usage Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-[var(--text-dim)] font-mono">
                      <span>Credits:</span>
                      <span className="font-semibold text-[var(--text)]">
                        {creditsLeft} / {r.credits_total} remaining
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--panel-raised)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          creditPct > 25 ? "bg-[var(--glacier)]" : "bg-[var(--bad)]"
                        }`}
                        style={{ width: `${creditPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[var(--line)] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/studio/workspace?character=${r.character_id}`}
                      className="py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-center text-xs font-semibold rounded-[4px] hover:brightness-110 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Workspace
                    </Link>

                    <Link
                      href={`/studio/library/${r.id}`}
                      className="py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-center text-xs font-medium text-[var(--text)] rounded-[4px] hover:border-[var(--glacier)] flex items-center justify-center gap-1"
                    >
                      <Sliders className="w-3 h-3" /> Controls
                    </Link>
                  </div>

                  {status.eligibleForReview && (
                    <Link
                      href={`/characters/${r.character_id}#reviews`}
                      className="w-full py-1.5 text-center text-[11px] text-[var(--marquee)] hover:underline block"
                    >
                      ★ Write rental review
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
