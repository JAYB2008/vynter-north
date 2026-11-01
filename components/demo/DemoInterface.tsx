"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowRight,
  HelpCircle,
  Film,
  Layers,
  Activity,
  Smile,
  MessageSquare,
} from "lucide-react";
import { Character, EnrichmentOutput } from "@/lib/types";
import { apiFetch } from "@/lib/api";

interface DemoInterfaceProps {
  initialCharacters?: Character[];
  isAdmin?: boolean;
}

// Static recorded example strictly for when zero demo characters exist yet in DB
const STATIC_FALLBACK_DEMO = {
  characterName: "Sample Director Test",
  cvrId: "CVR-RECORDED-DEMO",
  sceneText: "Cairo walks into a job interview and the interviewer already looks thoroughly unimpressed.",
  enrichedPrompt:
    "Cairo enters the office with his chin set higher than normal, an instinctive overcompensation for the cold scrutiny from across the mahogany desk. He pauses before taking the offered chair, his hands smoothing the seams of his jacket in a quick, defensive rhythm before gripping the armrests. Rather than shrinking under the interviewer's dismissive stare, his posture stiffens into hyper-formal compliance. When asked to introduce himself, he speaks with brisk, clipped articulation, allowing brief, loaded pauses after each sentence to measure the other man's reaction. His eyes remain fixed on the interviewer's pen, tracking every minute movement without breaking his polite, unyielding facade.",
  analysis: {
    primary_category: "social",
    intensity: "medium",
    detail: "short",
  },
  fieldsUsed: ["core_trait", "behavior_social", "movement_style", "verbal_habits"],
  wordCount: { original: 14, enriched: 128, multiplier: "9.1x" },
  breakdown: {
    facial_expression: "Guarded, fixed neutrality with rapid blink rate when addressed directly.",
    body_language: "Over-correcting posture; rigid shoulders; arms pinned strictly to the sides.",
    emotional_state: "High internal anxiety masked under cold professional rigidity.",
    dialogue_direction: "Measured, clipped delivery; pitch drops slightly on key assertions.",
  },
};

export function DemoInterface({
  initialCharacters = [],
  isAdmin = false,
}: DemoInterfaceProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedCharId, setSelectedCharId] = useState<string>(
    initialCharacters[0]?.id || ""
  );
  const [sceneText, setSceneText] = useState(
    initialCharacters[0]
      ? `${initialCharacters[0].name} enters a crowded room and notices someone watching from the shadows.`
      : STATIC_FALLBACK_DEMO.sceneText
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showWhyPanel, setShowWhyPanel] = useState(true);

  // If no initial characters provided, load from /api/characters?is_demo=true
  useEffect(() => {
    if (initialCharacters.length === 0) {
      apiFetch<{ characters: Character[] }>("/api/characters?is_demo=true").then(
        (res) => {
          if (res.ok && res.data.characters && res.data.characters.length > 0) {
            setCharacters(res.data.characters);
            setSelectedCharId(res.data.characters[0].id);
            setSceneText(
              `${res.data.characters[0].name} is cornered in an alleyway. A sudden sound echoes from the fire escape.`
            );
          }
        }
      );
    }
  }, [initialCharacters]);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId);

  // Dynamic 3 presets per selected character
  const getPresets = (char?: Character) => {
    if (!char) {
      return [
        {
          label: "Job Interview →",
          text: "Cairo walks into a job interview and the interviewer already looks thoroughly unimpressed.",
        },
        {
          label: "Cornered in an alley →",
          text: "Cairo is backed into a dead-end alley by two loan sharks demanding immediate repayment.",
        },
        {
          label: "Emergency meeting →",
          text: "Cairo has to convince a skeptical board of executives that the company is safe.",
        },
      ];
    }
    const name = char.name;
    const genre = char.genres?.[0] || "Drama";
    return [
      {
        label: `${genre} scene →`,
        text: `${name} walks into a high-stakes meeting where everyone at the table knows they lied.`,
      },
      {
        label: `Undercover confrontation →`,
        text: `${name} is questioned by police about an incident they witnessed earlier that night.`,
      },
      {
        label: `Quiet realization →`,
        text: `${name} sits alone in a diner late at night, reading a handwritten letter they weren't supposed to find.`,
      },
    ];
  };

  const handleEnrich = async () => {
    if (!sceneText.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    // If using static fallback when zero characters exist
    if (characters.length === 0) {
      setTimeout(() => {
        setResult(STATIC_FALLBACK_DEMO);
        setLoading(false);
      }, 700);
      return;
    }

    const res = await apiFetch<any>("/api/enrich", {
      method: "POST",
      body: JSON.stringify({
        character_id: selectedCharId,
        scene: sceneText.trim(),
        source: "demo",
      }),
    });

    setLoading(false);
    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      const err = !res.ok ? res.error?.message : undefined;
      setErrorMsg(
        err ||
          "Enrichment service encountered a temporary error. Please try again."
      );
    }
  };

  const copyPrompt = () => {
    const textToCopy = result?.enriched_prompt || STATIC_FALLBACK_DEMO.enrichedPrompt;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Zero Demo Characters Notice (Section 7.1) */}
      {characters.length === 0 && (
        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] text-xs text-[var(--text-dim)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[var(--glacier)]/15 text-[var(--glacier)] font-mono text-[10px] uppercase font-semibold">
              Example Output
            </span>
            <span>
              Showing recorded baseline demonstration. Register characters in creator mode to test live custom profiles.
            </span>
          </div>
          {isAdmin && (
            <Link
              href="/admin/characters"
              className="text-[var(--marquee)] hover:underline shrink-0 text-xs font-semibold"
            >
              Admin: Flag a Character as Demo →
            </Link>
          )}
        </div>
      )}

      {/* Hero Board: Left (What you wrote) / Right (What your video tool receives) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: What you wrote */}
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                What you write (Scene Action)
              </span>

              {/* Character Selector */}
              {characters.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-dim)]">Character:</span>
                  <select
                    value={selectedCharId}
                    onChange={(e) => {
                      setSelectedCharId(e.target.value);
                      const found = characters.find((c) => c.id === e.target.value);
                      if (found) {
                        setSceneText(
                          `${found.name} walks into a high-stakes negotiation where their credentials are questioned.`
                        );
                      }
                    }}
                    className="px-2.5 py-1 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] font-semibold"
                  >
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {getPresets(selectedCharacter).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSceneText(p.text)}
                  className="px-2.5 py-1 rounded-[4px] bg-[var(--panel-raised)] border border-[var(--line)] text-[11px] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--glacier)] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              rows={6}
              value={sceneText}
              onChange={(e) => setSceneText(e.target.value)}
              placeholder="Describe only what happens. Don't describe feelings or behavior — the character adds that automatically."
              className="w-full px-4 py-3 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-dim)]">
              {sceneText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="button"
              onClick={handleEnrich}
              disabled={loading || !sceneText.trim()}
              className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enriching direction…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Enrich scene
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: What your video tool receives */}
        <div className="p-6 bg-[var(--night)] border border-[var(--line)] rounded-[10px] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                What your video tool receives
              </span>
              {(result || characters.length === 0) && (
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="px-2.5 py-1 rounded bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] hover:border-[var(--glacier)] flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[var(--ok)]" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy prompt
                    </>
                  )}
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 bg-[var(--bad)]/15 border border-[var(--bad)] rounded text-xs text-[var(--bad)]">
                {errorMsg}
              </div>
            )}

            {/* Display Enriched Prompt */}
            {result || (!loading && characters.length === 0) ? (
              <div className="space-y-3">
                {/* Word Count Ratio Line (Section 7.1) */}
                <div className="text-[11px] font-mono text-[var(--glacier)]">
                  {result?.word_count?.original || STATIC_FALLBACK_DEMO.wordCount.original} words in →{" "}
                  {result?.word_count?.enriched || STATIC_FALLBACK_DEMO.wordCount.enriched} words out (
                  {result?.word_count?.multiplier || STATIC_FALLBACK_DEMO.wordCount.multiplier})
                </div>

                <p className="text-sm text-[var(--text)] leading-relaxed font-sans whitespace-pre-wrap">
                  {result?.enriched_prompt || STATIC_FALLBACK_DEMO.enrichedPrompt}
                </p>
              </div>
            ) : loading ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-[var(--text-dim)] space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--glacier)]" />
                <span>Selecting relevant character sheet paragraphs…</span>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-[var(--text-dim)] text-center p-4">
                <span>Click "Enrich scene" to see camera-ready behavioral film direction.</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--text-dim)]">
            <Link
              href="/connect"
              className="text-[var(--glacier)] hover:underline flex items-center gap-1"
            >
              Use this in Claude or ChatGPT <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* "Why It Behaves This Way" Accordion & Breakdown Panel */}
      {(result || characters.length === 0) && (
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowWhyPanel(!showWhyPanel)}
            className="w-full px-6 py-4 flex items-center justify-between text-xs font-semibold text-[var(--text)] hover:bg-[var(--panel-raised)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--glacier)]" />
              <span>Why it behaves this way (Behavioral Breakdown & Intelligence Attribution)</span>
            </div>
            {showWhyPanel ? (
              <ChevronUp className="w-4 h-4 text-[var(--text-dim)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
            )}
          </button>

          {showWhyPanel && (
            <div className="p-6 pt-0 border-t border-[var(--line)] space-y-6 text-xs">
              {/* Fields used from sheet */}
              <div className="pt-4 flex flex-wrap items-center gap-2">
                <span className="text-[var(--text-dim)] font-medium">
                  Fields retrieved from character sheet:
                </span>
                {(result?.fields_used || STATIC_FALLBACK_DEMO.fieldsUsed).map(
                  (f: string) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded bg-[var(--panel-raised)] border border-[var(--line)] font-mono text-[11px] text-[var(--glacier)]"
                    >
                      {f}
                    </span>
                  )
                )}
                <span className="text-[var(--text-dim)] ml-auto font-mono text-[11px]">
                  Scene detected:{" "}
                  {result?.scene_analysis?.primary_category ||
                    STATIC_FALLBACK_DEMO.analysis.primary_category}
                </span>
              </div>

              {/* 4 Breakdown Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[6px] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                    Facial Expression
                  </span>
                  <p className="text-xs text-[var(--text)]">
                    {result?.facial_expression ||
                      STATIC_FALLBACK_DEMO.breakdown.facial_expression}
                  </p>
                </div>

                <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[6px] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                    Body Language
                  </span>
                  <p className="text-xs text-[var(--text)]">
                    {result?.body_language ||
                      STATIC_FALLBACK_DEMO.breakdown.body_language}
                  </p>
                </div>

                <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[6px] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                    Emotional State
                  </span>
                  <p className="text-xs text-[var(--text)]">
                    {result?.emotional_state ||
                      STATIC_FALLBACK_DEMO.breakdown.emotional_state}
                  </p>
                </div>

                <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[6px] space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                    Dialogue Direction
                  </span>
                  <p className="text-xs text-[var(--text)]">
                    {result?.dialogue_direction ||
                      STATIC_FALLBACK_DEMO.breakdown.dialogue_direction}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
