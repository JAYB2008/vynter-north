"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Character, EnrichmentOutput } from "@/lib/types";

interface DemoInterfaceProps {
  initialCharacters?: Character[];
  preselectedCharacterName?: string;
}

export function DemoInterface({
  initialCharacters = [],
  preselectedCharacterName = "Cairo",
}: DemoInterfaceProps) {
  const characters = initialCharacters.length > 0
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
  const [result, setResult] = useState<EnrichmentOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const presets = [
    {
      label: "Cairo in a job interview",
      char: "Cairo",
      scene:
        "Cairo walks into a high-stakes job interview and the interviewer already looks thoroughly unimpressed.",
    },
    {
      label: "Sable spots a threat before anyone else",
      char: "Sable",
      scene:
        "Sable is at a noisy political rally when she notices an unmarked drone descending silently above the VIP podium.",
    },
    {
      label: "Drew has to fix something that just broke",
      char: "Drew",
      scene:
        "Drew is tasked with rebooting the primary atmospheric generator while emergency alarms are blaring and the crew is panicking.",
    },
  ];

  const handleEnrich = async () => {
    if (!scene.trim()) {
      toast.error("Please describe a scene to enrich.");
      return;
    }

    setLoading(true);
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

      setResult(data);
      toast.success("Scene enriched with character intelligence!");
    } catch (err: any) {
      toast.error(err.message || "Failed to run enrichment.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.enriched_prompt) return;
    navigator.clipboard.writeText(result.enriched_prompt);
    setCopied(true);
    toast.success("Enriched prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedChar =
    characters.find((c) => c.name.toLowerCase() === selectedCharName.toLowerCase()) ||
    characters[0];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT PANEL: Your Prompt */}
        <div className="vn-card p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-muted-app uppercase">
                Step 1: Your Input
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[#A78BFA] border border-purple-500/20">
                Studio Scene
              </span>
            </div>

            {/* Character Selector Dropdown */}
            <div>
              <label className="text-xs font-semibold text-secondary-app block mb-1.5">
                Target AI Character
              </label>
              <div className="relative">
                <select
                  value={selectedCharName}
                  onChange={(e) => {
                    setSelectedCharName(e.target.value);
                  }}
                  className="vn-input w-full px-3.5 py-2.5 text-sm font-medium pr-10 cursor-pointer appearance-none"
                >
                  {characters.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name} — "{c.vibe_summary}"
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-app absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Scene Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-secondary-app">
                  Scene Description
                </label>
                <span className="text-[11px] text-muted-app">
                  Keep it simple — just the events
                </span>
              </div>
              <textarea
                rows={5}
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="Describe what happens in the scene. Keep it simple — just the event. Don't describe emotions or behavior. The character intelligence adds all of that."
                className="vn-input w-full p-3.5 text-sm leading-relaxed resize-none"
              />
            </div>

            {/* Quick Example Scene Buttons */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-app">
                Quick Test Prompts:
              </span>
              <div className="flex flex-col gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCharName(p.char);
                      setScene(p.scene);
                    }}
                    className="text-left text-xs text-secondary-app hover:text-[#A78BFA] hover:bg-elevated-app px-2.5 py-1.5 rounded-md border border-app transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{p.label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-app group-hover:text-[#A78BFA] shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleEnrich}
            disabled={loading}
            className="vn-button-primary w-full py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 text-sm font-bold tracking-wide mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Character Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enrich This Scene ↗</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL: What Video Tool Receives */}
        <div className="vn-card p-6 flex flex-col justify-between gap-4 border-[#7C3AED]/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-muted-app uppercase">
                Step 2: Output
              </span>
              {result && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {result.word_count.original}w → {result.word_count.enriched}w ({result.word_count.multiplier}x enrichment)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-primary-app flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#7C3AED]" />
                <span>Prompt For Video Generator (Runway / Kling / HigsField)</span>
              </h4>

              {result && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border border-app bg-elevated-app hover:border-[#7C3AED] transition-all text-secondary-app hover:text-primary-app"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Output Box */}
            <div className="min-h-[220px] rounded-xl bg-elevated-app border border-app p-4 flex flex-col justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-app">
                  <div className="w-10 h-10 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
                  <p className="text-xs font-medium animate-pulse">
                    Decrypting personality profile & enriching scene with NVIDIA NIM...
                  </p>
                </div>
              ) : result ? (
                <p className="text-sm text-primary-app leading-relaxed font-sans select-all whitespace-pre-line animate-fadeIn">
                  {result.enriched_prompt}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-muted-app">
                  <BrainCircuit className="w-10 h-10 mb-2 opacity-40 text-[#7C3AED]" />
                  <p className="text-sm font-medium text-secondary-app">
                    Enriched prompt will appear here...
                  </p>
                  <p className="text-xs text-muted-app max-w-xs mt-1">
                    Select a character, click "Enrich This Scene", and witness the personality layer weave in cinematic film direction.
                  </p>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="pt-2 border-t border-app flex items-center justify-between text-xs text-muted-app">
              <span>Character: <strong className="text-primary-app">{result.character.name}</strong></span>
              <span>Model: <span className="font-mono text-[11px] text-[#A78BFA]">{result.model_used || "NVIDIA NIM LLaMA-3"}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Full Behavior Analysis */}
      {result?.behavior_breakdown && (
        <div className="vn-card p-6 flex flex-col gap-4">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="font-bold text-sm text-primary-app">
                Full Behavior Breakdown (Extracted Intelligence)
              </h4>
            </div>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4 text-muted-app" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-app" />
            )}
          </button>

          {showBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-elevated-app border border-app flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Facial Expression</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.facial_expression}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-elevated-app border border-app flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Body Language & Movement</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.body_language}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-elevated-app border border-app flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Internal Emotional State</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.emotional_state}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-elevated-app border border-app flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Dialogue & Vocal Delivery</span>
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {result.behavior_breakdown.dialogue_direction}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
