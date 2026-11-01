"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sliders,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Key,
  Copy,
  Layers,
  StopCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Rental, Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function RentalControlsPage({
  params,
}: {
  params: Promise<{ rentalId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successJustHappened = searchParams.get("success") === "true";
  const { rentalId } = use(params);

  const [rental, setRental] = useState<Rental | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [endingRental, setEndingRental] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Behavior settings
  const [humor, setHumor] = useState(true);
  const [physical, setPhysical] = useState(true);
  const [dialogue, setDialogue] = useState(true);
  const [mode, setMode] = useState<"full" | "appearance_only" | "appearance">("full");

  useEffect(() => {
    apiFetch<{ rental: Rental; character: Character }>(
      `/api/rentals/${rentalId}`
    ).then((res) => {
      setLoading(false);
      if (res.ok && res.data.rental) {
        setRental(res.data.rental);
        setCharacter(res.data.character);
        const s = res.data.rental.settings || {};
        if (typeof s.humor === "boolean") setHumor(s.humor);
        if (typeof s.physical === "boolean") setPhysical(s.physical);
        if (typeof s.dialogue === "boolean") setDialogue(s.dialogue);
        if (s.mode) setMode(s.mode);
      }
    });
  }, [rentalId]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSavedSuccess(false);
    const res = await apiFetch<{ rental: Rental }>(`/api/rentals/${rentalId}`, {
      method: "PATCH",
      body: JSON.stringify({
        settings: { humor, physical, dialogue, mode },
      }),
    });
    setSaving(false);
    if (res.ok && res.data.rental) {
      setRental(res.data.rental);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // Section 9.3 Test Helper: "End rental now"
  const handleEndRentalNow = async () => {
    if (!confirm("End this rental period immediately to test the review flow?")) return;
    setEndingRental(true);
    const res = await apiFetch<{ rental: Rental }>(`/api/rentals/${rentalId}`, {
      method: "PATCH",
      body: JSON.stringify({ end_early: true }),
    });
    setEndingRental(false);
    if (res.ok && res.data.rental) {
      setRental(res.data.rental);
    }
  };

  const copyPassCode = () => {
    if (!rental?.pass_code) return;
    navigator.clipboard.writeText(rental.pass_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        <p className="text-xs text-[var(--text-dim)] mt-3">Loading rental controls…</p>
      </div>
    );
  }

  if (!rental || !character) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="font-serif text-2xl text-[var(--text)]">Rental Not Found</h1>
        <Link
          href="/studio/library"
          className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  const creditsRemaining = Math.max(0, rental.credits_total - rental.credits_used);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Success banner if redirected from checkout */}
      {successJustHappened && (
        <div className="p-4 bg-[var(--glacier)]/15 border border-[var(--glacier)] rounded-[8px] flex items-center justify-between text-xs text-[var(--text)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--glacier)]" />
            <span>
              <strong>Access Activated:</strong> {character.name} is now available in your studio library and connected MCP tools.
            </span>
          </div>
          <Link
            href={`/studio/workspace?character=${character.id}`}
            className="px-3 py-1.5 bg-[var(--glacier)] text-[var(--glacier-ink)] rounded font-semibold text-xs shrink-0"
          >
            Open workspace →
          </Link>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/studio/library"
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {character.portrait_url && (
              <img
                src={character.portrait_url}
                alt={character.name}
                className="w-14 h-18 object-cover rounded-[2px] border border-[var(--line)]"
              />
            )}
            <div>
              <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
                Rental Access Configuration
              </span>
              <h1 className="font-serif text-3xl text-[var(--text)] leading-tight">
                {character.name}
              </h1>
              <span className="font-mono text-xs text-[var(--text-dim)]">
                Pass Code: {rental.pass_code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/studio/workspace?character=${character.id}`}
              className="px-4 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open in Workspace
            </Link>
          </div>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 lg:p-8 space-y-8 shadow-sm">
        {/* Section 9.4 Behavioral Controls */}
        <div className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl text-[var(--text)]">
              Acting & Behavioral Delivery Controls
            </h2>
            <p className="text-xs text-[var(--text-dim)] mt-1">
              Configure how {character.name}'s traits are applied. Settings apply automatically in workspace sessions and MCP remote calls.
            </p>
          </div>

          {/* Mode Switch: Full vs Appearance only */}
          <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-2">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
              Enrichment Mode
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3 rounded-[6px] border cursor-pointer transition-colors ${
                  mode === "full"
                    ? "bg-[var(--panel)] border-[var(--glacier)] text-[var(--text)] font-semibold"
                    : "border-[var(--line)] text-[var(--text-dim)]"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="full"
                  checked={mode === "full"}
                  onChange={() => setMode("full")}
                  className="hidden"
                />
                <span className="block text-xs">Full Intelligence Mode</span>
                <span className="text-[10px] text-[var(--text-dim)] font-normal block mt-0.5">
                  Full behavioral acting direction, cadence, micro-habits, and scene reactions.
                </span>
              </label>

              <label
                className={`p-3 rounded-[6px] border cursor-pointer transition-colors ${
                  mode === "appearance"
                    ? "bg-[var(--panel)] border-[var(--glacier)] text-[var(--text)] font-semibold"
                    : "border-[var(--line)] text-[var(--text-dim)]"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="appearance"
                  checked={mode === "appearance"}
                  onChange={() => setMode("appearance")}
                  className="hidden"
                />
                <span className="block text-xs">Appearance Only</span>
                <span className="text-[10px] text-[var(--text-dim)] font-normal block mt-0.5">
                  Preserves scene text verbatim; appends only character physical look & costume traits.
                </span>
              </label>
            </div>
          </div>

          {/* The 3 Behavior Toggles (Section 9.4) */}
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            <div className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <strong className="text-[var(--text)] block">Humor & Wit Injection</strong>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Allow character dry humor and comedic situational deflections.
                </span>
              </div>
              <input
                type="checkbox"
                checked={humor}
                onChange={(e) => setHumor(e.target.checked)}
                className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <strong className="text-[var(--text)] block">Physical Habits & Tells</strong>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Inject signature movements, center of gravity, and nervous physical gestures.
                </span>
              </div>
              <input
                type="checkbox"
                checked={physical}
                onChange={(e) => setPhysical(e.target.checked)}
                className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <strong className="text-[var(--text)] block">Dialogue Cadence & Delivery</strong>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Include verbal rhythm, pitch modifications under stress, and pause direction.
                </span>
              </div>
              <input
                type="checkbox"
                checked={dialogue}
                onChange={(e) => setDialogue(e.target.checked)}
                className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
              />
            </div>
          </div>

          {/* Scene Tags Explanation (Section 9.4) */}
          <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[8px] space-y-2 text-xs text-[var(--text-dim)]">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
              Inline Scene Override Tags
            </span>
            <p>
              You can override behaviors per prompt by including these bracket tags in your scene text:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--glacier)]">
                [SERIOUS MODE]
              </span>
              <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--glacier)]">
                [NO HUMOR]
              </span>
              <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--glacier)]">
                [SILENT]
              </span>
              <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--glacier)]">
                [DRAMATIC ONLY]
              </span>
              <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--glacier)]">
                [COMEDIC ONLY]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Behavior Settings
            </button>
            {savedSuccess && (
              <span className="text-xs text-[var(--ok)] font-medium">
                Saved.
              </span>
            )}
          </div>
        </div>

        {/* Status, Pass Code & Test Helper */}
        <div className="pt-6 border-t border-[var(--line)] space-y-4">
          <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
            Rental Status & Test Operations
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-[var(--text-dim)]">Credits Remaining:</span>
              <span className="font-mono text-lg font-bold text-[var(--text)] block">
                {creditsRemaining} / {rental.credits_total}
              </span>
            </div>

            <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-[var(--text-dim)]">Status:</span>
              <span className="font-semibold text-[var(--ok)] capitalize block text-sm">
                {rental.ended_early ? "Concluded" : rental.kind}
              </span>
            </div>

            <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-[var(--text-dim)]">Pass Code:</span>
              <div className="flex items-center justify-between font-mono font-bold text-[var(--text)]">
                <span>{rental.pass_code}</span>
                <button
                  type="button"
                  onClick={copyPassCode}
                  className="text-[var(--text-dim)] hover:text-[var(--text)]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[var(--ok)]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 9.3 Test Helper Button: "End rental now" */}
          <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-[var(--text)] block">
                QA Helper: End rental now
              </span>
              <span className="text-[var(--text-dim)]">
                Immediately expires this term to test the review writing and fame recalculation flow.
              </span>
            </div>
            <button
              type="button"
              onClick={handleEndRentalNow}
              disabled={endingRental || rental.ended_early}
              className="px-3.5 py-2 bg-[var(--bad)]/15 border border-[var(--bad)] text-[var(--bad)] rounded text-xs font-semibold hover:bg-[var(--bad)] hover:text-white transition-colors disabled:opacity-50"
            >
              {rental.ended_early ? "Already Concluded" : "End rental now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
