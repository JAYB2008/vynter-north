"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Layers,
  Film,
} from "lucide-react";
import { Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCharacters() {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const results: Character[] = [];
      for (const id of ids) {
        const res = await apiFetch<{ character: Character }>(`/api/characters/${id}`);
        if (res.ok && res.data.character) {
          results.push(res.data.character);
        }
      }
      setCharacters(results);
      setLoading(false);
    }
    loadCharacters();
  }, [idsParam]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <p className="text-sm text-[var(--text-dim)]">Loading character comparison…</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="font-serif text-3xl text-[var(--text)]">No Characters Selected</h1>
        <p className="text-xs text-[var(--text-dim)]">
          Select 2 or 3 characters from the marketplace to inspect their situational capabilities and rates side-by-side.
        </p>
        <Link
          href="/marketplace"
          className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/marketplace"
            className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)]">
            Character Comparison ({characters.length})
          </h1>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[var(--line)] text-left text-xs">
          <thead>
            <tr className="bg-[var(--panel)] border-b border-[var(--line)]">
              <th className="p-4 w-48 font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                Attribute
              </th>
              {characters.map((c) => (
                <th key={c.id} className="p-4 min-w-[240px] border-l border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    {c.portrait_url && (
                      <img
                        src={c.portrait_url}
                        alt={c.name}
                        className="w-12 h-15 object-cover rounded-[2px] border border-[var(--line)]"
                      />
                    )}
                    <div>
                      <Link
                        href={`/characters/${c.id}`}
                        className="font-serif text-xl text-[var(--text)] hover:text-[var(--glacier)] block leading-tight"
                      >
                        {c.name}
                      </Link>
                      <span className="font-mono text-[10px] text-[var(--text-dim)]">
                        {c.id}
                      </span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] bg-[var(--panel-raised)]">
            {/* Fame Tier & Score */}
            <tr>
              <td className="p-4 font-medium text-[var(--text)]">Fame Tier & Score</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)]">
                  <span className="text-[var(--marquee)] font-semibold uppercase">
                    ★ {c.fame_tier} ({c.fame_score} pts)
                  </span>
                </td>
              ))}
            </tr>

            {/* Average Rating */}
            <tr>
              <td className="p-4 font-medium text-[var(--text)]">Rating & Reviews</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)]">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-[var(--marquee)] text-[var(--marquee)]" />
                    <span className="font-semibold text-[var(--text)]">
                      {c.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-[var(--text-dim)]">
                      ({c.review_count} reviews)
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Daily & Monthly Rates */}
            <tr>
              <td className="p-4 font-medium text-[var(--text)]">Rental Pricing</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)] font-mono">
                  {c.is_free ? (
                    <span className="text-[var(--ok)] font-bold">Free</span>
                  ) : (
                    <div>
                      <span className="text-sm font-bold text-[var(--text)] block">
                        ${(c.price_daily_cents / 100).toFixed(0)}/day
                      </span>
                      <span className="text-[11px] text-[var(--text-dim)]">
                        ${(c.price_monthly_cents / 100).toFixed(0)}/month (500 credits)
                      </span>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* 3-Day Trial */}
            <tr>
              <td className="p-4 font-medium text-[var(--text)]">Free Trial (15 cr)</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)]">
                  {c.trial_enabled ? (
                    <span className="text-[var(--ok)] flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Available
                    </span>
                  ) : (
                    <span className="text-[var(--text-dim)] flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Not enabled
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Core Trait */}
            <tr>
              <td className="p-4 font-medium text-[var(--text)]">Core Trait</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)] text-xs text-[var(--text)]">
                  {c.core_trait || "Distinctive presence"}
                </td>
              ))}
            </tr>

            {/* Voice Delivery */}
            <tr>
              <td className="p-4 font-medium text-[var(--text)]">Voice Delivery</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)] text-xs text-[var(--text-dim)]">
                  <span>{c.voice_tone || "Grounded"} • {c.voice_pitch || "Medium"}</span>
                  <span className="block text-[11px] mt-0.5">{c.voice_accent || "Neutral"}</span>
                </td>
              ))}
            </tr>

            {/* Action Buttons */}
            <tr className="bg-[var(--panel)]">
              <td className="p-4 font-semibold text-[var(--text)]">Action</td>
              {characters.map((c) => (
                <td key={c.id} className="p-4 border-l border-[var(--line)]">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/characters/${c.id}`}
                      className="w-full py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-center font-semibold rounded-[4px] hover:brightness-110"
                    >
                      View & Rent
                    </Link>
                    {c.trial_enabled && (
                      <Link
                        href={`/checkout?character_id=${c.id}&kind=trial`}
                        className="w-full py-1.5 border border-[var(--line)] text-center font-medium text-[var(--text)] rounded-[4px] hover:border-[var(--glacier)]"
                      >
                        Start Trial
                      </Link>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
