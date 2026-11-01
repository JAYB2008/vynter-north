"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Calendar,
  DollarSign,
  Check,
  X,
  ArrowRight,
  Loader2,
  Users,
} from "lucide-react";
import { CastingCall, Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function CastingPage() {
  const { user, isAuthenticated } = useAuth();
  const [calls, setCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [activeCall, setActiveCall] = useState<CastingCall | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    apiFetch<{ calls: CastingCall[] }>("/api/casting").then((res) => {
      setLoading(false);
      if (res.ok && res.data.calls) {
        setCalls(res.data.calls);
      }
    });
  }, []);

  const handleOpenApply = async (call: CastingCall) => {
    setActiveCall(call);
    setApplySuccess(false);
    if (user) {
      const res = await apiFetch<{ characters: Character[] }>(
        `/api/characters?owner_id=${user.id}`
      );
      if (res.ok && res.data.characters) {
        setMyCharacters(res.data.characters);
        if (res.data.characters.length > 0) {
          setSelectedCharId(res.data.characters[0].id);
        }
      }
    }
  };

  const handleApply = async () => {
    if (!activeCall || !selectedCharId) return;
    setSubmitting(true);

    const res = await apiFetch(`/api/casting/${activeCall.id}/apply`, {
      method: "POST",
      body: JSON.stringify({
        character_id: selectedCharId,
        message: applyMessage,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setApplySuccess(true);
      setTimeout(() => {
        setActiveCall(null);
        setApplySuccess(false);
        setApplyMessage("");
      }, 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Open Auditions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Studio Casting Calls
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Production briefs from AI video studios looking for specific talent and character personas.
          </p>
        </div>

        <Link
          href="/studio/casting"
          className="text-xs text-[var(--glacier)] hover:underline flex items-center gap-1 font-medium"
        >
          Studio: Post a casting call →
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        </div>
      ) : calls.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <Film className="w-10 h-10 mx-auto text-[var(--text-dim)]" />
          <h3 className="font-serif text-2xl text-[var(--text)]">No Open Casting Calls</h3>
          <p className="text-xs text-[var(--text-dim)]">
            Check back soon or post a new brief if you are operating as a studio.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {calls.map((call) => (
            <div
              key={call.id}
              className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[var(--line)]">
                <div>
                  <h3 className="font-serif text-2xl text-[var(--text)] leading-tight">
                    {call.title}
                  </h3>
                  <span className="text-xs text-[var(--text-dim)]">
                    Posted by {call.studio?.display_name || "Production Studio"} •{" "}
                    {new Date(call.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {call.budget_cents && (
                    <span className="font-mono text-xs font-bold text-[var(--text)] px-2.5 py-1 rounded bg-[var(--panel-raised)]">
                      Budget: ${(call.budget_cents / 100).toFixed(0)}
                    </span>
                  )}
                  {call.min_tier && (
                    <span className="px-2 py-0.5 rounded bg-[var(--marquee)]/15 text-[var(--marquee)] font-mono text-[10px] uppercase font-bold">
                      Min Tier: {call.min_tier}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--text)] leading-relaxed">
                {call.description}
              </p>

              {call.genres && call.genres.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {call.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] text-[10px]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-dim)]">
                  {call.deadline
                    ? `Deadline: ${new Date(call.deadline).toLocaleDateString()}`
                    : "Rolling submissions"}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenApply(call)}
                  className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Apply with a character
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-2xl text-[var(--text)]">
              Submit Character Audition
            </h3>
            <p className="text-xs text-[var(--text-dim)]">
              Applying to <strong>{activeCall.title}</strong>
            </p>

            {!isAuthenticated ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-[var(--text-dim)]">
                  You must be signed in as a creator to submit an audition.
                </p>
                <Link
                  href="/signin"
                  className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded"
                >
                  Sign In
                </Link>
              </div>
            ) : myCharacters.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-dim)] space-y-2">
                <p>You have no active characters registered in your catalog.</p>
                <Link
                  href="/dashboard/characters/new"
                  className="text-[var(--glacier)] hover:underline font-semibold"
                >
                  Register a character first →
                </Link>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[var(--text-dim)] font-medium mb-1">
                    Select Your Character:
                  </label>
                  <select
                    value={selectedCharId}
                    onChange={(e) => setSelectedCharId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-[var(--text)] font-semibold"
                  >
                    {myCharacters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-dim)] font-medium mb-1">
                    Audition Note to Studio:
                  </label>
                  <textarea
                    rows={3}
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder="Describe why this character fits the brief or specific demo reel scenes..."
                    className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
                  />
                </div>

                {applySuccess && (
                  <span className="text-xs text-[var(--ok)] font-medium block">
                    ✓ Audition submitted to studio!
                  </span>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveCall(null)}
                    className="px-3 py-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={submitting}
                    className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded text-xs hover:brightness-110 flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit Application"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
