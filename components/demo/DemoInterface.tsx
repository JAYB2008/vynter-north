"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Eye,
  Activity,
  Heart,
  MessageSquare,
  Layers,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Character, EnrichmentOutput } from "@/lib/types";

interface DemoInterfaceProps {
  initialCharacters?: Character[];
  preselectedCharacterName?: string;
  hideVideoLinks?: boolean;
}

export function DemoInterface({
  initialCharacters = [],
  preselectedCharacterName = "Cairo",
  hideVideoLinks = false,
}: DemoInterfaceProps) {
  const characters =
    initialCharacters.length > 0
      ? initialCharacters
      : [
          {
            id: "CVR-2025-00001",
            name: "Cairo",
            vibe_summary: "Loud. Performative. Secretly terrified.",
          },
          {
            id: "CVR-2025-00002",
            name: "Sable",
            vibe_summary: "Still. Watchful. Already decided.",
          },
          {
            id: "CVR-2025-00003",
            name: "Drew",
            vibe_summary: "Warm. Impulsive. Breaks things trying to fix them.",
          },
        ];

  const [selectedCharName, setSelectedCharName] = useState(
    preselectedCharacterName
  );
  const [scene, setScene] = useState(
    "Cairo walks into a job interview and the interviewer already looks thoroughly unimpressed."
  );
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    "Reading character profile..." | "Applying personality..." | "Done"
  >("Done");
  const [result, setResult] = useState<EnrichmentOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Exact 3 example scene buttons from spec
  const presets = [
    {
      label: "Cairo in a job interview →",
      char: "Cairo",
      scene: "Cairo walks into a job interview and the interviewer already looks thoroughly unimpressed.",
    },
    {
      label: "Sable spots a threat →",
      char: "Sable",
      scene: "Sable is at a crowded political rally when she spots a suspicious movement above the VIP terrace.",
    },
    {
      label: "Drew has to fix something that broke →",
      char: "Drew",
      scene: "Drew has to fix the main power generator that broke right as emergency sirens start blaring.",
    },
  ];

  const handleEnrich = async () => {
    if (!scene.trim()) {
      toast.error("Please describe what happens in the scene.");
      return;
    }

    setLoading(true);
    setLoadingStep("Reading character profile...");

    // Simulated sequential loading states
    const timer1 = setTimeout(() => {
      setLoadingStep("Applying personality...");
    }, 900);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene,
          characterId: selectedCharName,
          accountKey: "vn-test-key-001",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to enrich scene.");
      }

      setLoadingStep("Done");
      setResult(data);
      toast.success("Scene enriched with character personality!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate character enrichment.");
    } finally {
      clearTimeout(timer1);
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.enriched_prompt) return;
    navigator.clipboard.writeText(result.enriched_prompt);
    setCopied(true);
    toast.success("Enriched prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedChar =
    characters.find((c) => c.name === selectedCharName) || characters[0];

  return (
    <div className="w-full space-y-6">
      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT PANEL — "Your prompt" */}
        <div className="vn-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-app">
                Your Prompt
              </span>
              <span className="text-xs text-[#A78BFA] font-semibold">
                Event Description Only
              </span>
            </div>

            {/* Character Selector Dropdown (3 pre-loaded demo characters) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Select Character Persona
              </label>
              <select
                value={selectedCharName}
                onChange={(e) => {
                  setSelectedCharName(e.target.value);
                  const matched = presets.find((p) => p.char === e.target.value);
                  if (matched) setScene(matched.scene);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#7C3AED] transition-colors"
              >
                {characters.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name} — {c.vibe_summary}
                  </option>
                ))}
              </select>
            </div>

            {/* Large Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Scene Event
              </label>
              <textarea
                rows={5}
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="Describe what happens in the scene. Keep it simple — just the event. Don't describe how they feel or act. The character intelligence adds all of that."
                className="w-full p-3.5 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Three Example Scene Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-app block">
                Or try an example scene:
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCharName(p.char);
                      setScene(p.scene);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-elevated-app hover:bg-[#1C1C35] text-secondary-app hover:text-primary-app border border-app transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full-width Purple Button */}
          <button
            type="button"
            onClick={handleEnrich}
            disabled={loading}
            className="vn-button-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enrich This Scene →</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL — "What your video tool receives" */}
        <div
          className={`vn-card p-6 flex flex-col justify-between space-y-4 transition-all duration-300 ${
            result ? "opacity-100" : "opacity-75 bg-secondary-app/50"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-app">
                What Your Video Tool Receives
              </span>

              {result && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                  {result.word_count.original} words → {result.word_count.enriched} words ({result.word_count.multiplier} enrichment)
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-primary-app animate-pulse">
                  {loadingStep}
                </p>
                <p className="text-xs text-secondary-app max-w-xs">
                  Decoupling raw event from character personality layers.
                </p>
              </div>
            ) : result ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl bg-secondary-app border border-app font-sans text-xs sm:text-sm text-primary-app leading-relaxed select-all max-h-72 overflow-y-auto">
                  {result.enriched_prompt}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-muted-app">
                <BrainCircuit className="w-10 h-10 opacity-30" />
                <p className="text-sm font-semibold text-secondary-app">
                  No enriched scene yet
                </p>
                <p className="text-xs max-w-xs">
                  Select a character and click "Enrich This Scene" to see professional film direction generated automatically.
                </p>
              </div>
            )}
          </div>

          {result && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3 rounded-xl border border-app bg-elevated-app hover:bg-[#1C1C35] text-xs font-bold text-primary-app flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#A78BFA]" />}
              <span>{copied ? "Copied Prompt" : "Copy Enriched Prompt"}</span>
            </button>
          )}
        </div>
      </div>

      {/* COLLAPSIBLE "Full Behavior Breakdown" (4 CARDS) */}
      {result && result.behavior_breakdown && (
        <div className="vn-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full p-4 flex items-center justify-between text-left border-b border-app hover:bg-elevated-app/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-xs sm:text-sm font-bold text-primary-app">
                Full Behavior Breakdown
              </span>
              <span className="text-xs text-muted-app hidden sm:inline">
                (Facial Expression • Body Language • Emotional State • Dialogue Direction)
              </span>
            </div>

            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-muted-app" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-app" />
            )}
          </button>

          {showBreakdown && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {/* Card 1: Facial Expression */}
              <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA]">
                  <Eye className="w-4 h-4 text-[#7C3AED]" />
                  <span>Facial Expression</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.facial_expression}
                </p>
              </div>

              {/* Card 2: Body Language */}
              <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA]">
                  <Activity className="w-4 h-4 text-[#7C3AED]" />
                  <span>Body Language</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.body_language}
                </p>
              </div>

              {/* Card 3: Emotional State */}
              <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA]">
                  <Heart className="w-4 h-4 text-[#7C3AED]" />
                  <span>Emotional State</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.emotional_state}
                </p>
              </div>

              {/* Card 4: Dialogue Direction */}
              <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA]">
                  <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                  <span>Dialogue Direction</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.dialogue_direction}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Tool Links (HigsField | Runway | Kling) */}
      {!hideVideoLinks && (
        <div className="p-5 rounded-2xl bg-card-app border border-app flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-bold text-primary-app">
              Ready to use this in your AI video tool?
            </span>
            <p className="text-xs text-secondary-app">
              Directly copy the enriched prompt into HigsField, Runway, or Kling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://higsfield.ai"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-app bg-secondary-app hover:border-[#7C3AED] text-xs font-semibold text-primary-app transition-colors"
            >
              HigsField
            </a>
            <a
              href="https://runwayml.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-app bg-secondary-app hover:border-[#7C3AED] text-xs font-semibold text-primary-app transition-colors"
            >
              Runway Gen-3
            </a>
            <a
              href="https://klingai.org"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-app bg-secondary-app hover:border-[#7C3AED] text-xs font-semibold text-primary-app transition-colors"
            >
              Kling AI
            </a>
            <a
              href="/connect"
              className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all"
            >
              Connect Tools →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
