"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  CreditCard,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { Rental, Generation } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function StudioOverviewPage() {
  const { user } = useAuth();
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

  const activeRentals = rentals.filter((r) => {
    const expiresAt = r.expires_at ? new Date(r.expires_at).getTime() : Infinity;
    return !r.ended_early && Date.now() < expiresAt;
  });

  const totalCreditsRemaining = rentals.reduce(
    (acc, r) => acc + Math.max(0, r.credits_total - r.credits_used),
    0
  );

  const totalScenesEnriched = rentals.reduce((acc, r) => acc + r.credits_used, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        <p className="text-xs text-[var(--text-dim)] mt-3">Loading studio dashboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Studio Command
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Studio Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Production metrics and active character talent roster.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio/workspace"
            className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Open Workspace
          </Link>
          <Link
            href="/marketplace"
            className="px-4 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-xs font-medium text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Rent Talent
          </Link>
        </div>
      </div>

      {/* Metrics Grid (Section 9.7) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-dim)] font-medium">Active Rentals</span>
          <span className="font-mono text-3xl font-bold text-[var(--text)] block">
            {activeRentals.length}
          </span>
          <span className="text-[11px] text-[var(--text-dim)] block">
            {rentals.length} total in library history
          </span>
        </div>

        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-dim)] font-medium">Credits Remaining</span>
          <span className="font-mono text-3xl font-bold text-[var(--glacier)] block">
            {totalCreditsRemaining.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--text-dim)] block">
            Across all active rental passes
          </span>
        </div>

        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-dim)] font-medium">Scenes Enriched</span>
          <span className="font-mono text-3xl font-bold text-[var(--text)] block">
            {totalScenesEnriched}
          </span>
          <span className="text-[11px] text-[var(--text-dim)] block">
            Kept generation instructions
          </span>
        </div>
      </div>

      {/* Recommended Next Step (Section 9.7) */}
      <div className="p-6 bg-[var(--night)] border border-[var(--glacier)] rounded-[10px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[var(--glacier)] uppercase font-semibold block">
            Recommended Action
          </span>
          <h3 className="font-serif text-xl text-[var(--text)]">
            {activeRentals.length === 0
              ? "Cast your first character on the marketplace"
              : "Connect your private MCP URL into Claude or ChatGPT"}
          </h3>
          <p className="text-xs text-[var(--text-dim)] max-w-xl">
            {activeRentals.length === 0
              ? "Start a free 3-day trial on any active character with 15 included preview credits."
              : "Use your characters directly in Claude conversations without copying and pasting prompt direction."}
          </p>
        </div>

        <Link
          href={activeRentals.length === 0 ? "/marketplace" : "/studio/connect"}
          className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 shrink-0 flex items-center gap-1.5"
        >
          {activeRentals.length === 0 ? "Browse Marketplace" : "Open Connect Guide"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Active Characters Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[var(--text)]">
            Active Character Roster
          </h2>
          <Link
            href="/studio/library"
            className="text-xs text-[var(--glacier)] hover:underline"
          >
            View all ({rentals.length}) →
          </Link>
        </div>

        {activeRentals.length === 0 ? (
          <div className="p-8 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] text-center text-xs text-[var(--text-dim)]">
            No active characters currently rented. Visit the marketplace to add talent.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRentals.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-3"
              >
                <div className="flex items-center gap-3">
                  {r.character?.portrait_url && (
                    <img
                      src={r.character.portrait_url}
                      alt={r.character.name}
                      className="w-12 h-15 object-cover rounded-[2px] border border-[var(--line)]"
                    />
                  )}
                  <div>
                    <span className="font-serif text-lg text-[var(--text)] block leading-tight">
                      {r.character?.name || r.character_id}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-dim)]">
                      {r.character_id}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-dim)]">
                    {Math.max(0, r.credits_total - r.credits_used)} credits left
                  </span>
                  <Link
                    href={`/studio/workspace?character=${r.character_id}`}
                    className="text-[var(--glacier)] hover:underline font-medium"
                  >
                    Open in workspace →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
