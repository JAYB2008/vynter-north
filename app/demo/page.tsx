"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Share2,
  Eye,
  Activity,
  HeartHandshake,
  MessageSquare,
  Network,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { CharacterWithSkills, BehaviorBreakdown } from "@/lib/types";

function DemoContent() {
  const searchParams = useSearchParams();
  const paramCharId = searchParams.get("character");

  const [characters, setCharacters] = useState<CharacterWithSkills[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [scenePrompt, setScenePrompt] = useState(
    "James trips and falls during football practice in front of the whole team."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    enrichedPrompt: string;
    behaviorBreakdown: BehaviorBreakdown;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadChars() {
      try {
        const res = await fetch("/api/characters");
        const data = await res.json();
        if (data.characters && data.characters.length > 0) {
          setCharacters(data.characters);
          if (paramCharId) {
            const match = data.characters.find((c: CharacterWithSkills) => c.id === paramCharId);
            if (match) {
              setSelectedCharId(match.id);
              return;
            }
          }
          setSelectedCharId(data.characters[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch demo characters:", err);
      }
    }
    loadChars();
  }, [paramCharId]);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId);

  const runDemoEnrichment = async () => {
    if (!selectedCharId || !scenePrompt.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/intelligence/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedCharId,
          scenePrompt: scenePrompt.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Enrichment failed");
      }

      setResult({
        enrichedPrompt: data.enrichedPrompt,
        behaviorBreakdown: data.behaviorBreakdown,
      });

      toast.success("Intelligence enrichment complete!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run demo";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial demo on load once characters are ready
  useEffect(() => {
    if (selectedCharId && !result) {
      runDemoEnrichment();
    }
  }, [selectedCharId]);

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.enrichedPrompt);
    setCopied(true);
    toast.success("Enriched scene copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `Testing the Vynter North Character Intelligence Layer: Automatically injecting psychological behavior into AI video scenes! #AI #VynterNorth`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const origWords = scenePrompt.trim().split(/\s+/).length;
  const enrichWords = result?.enrichedPrompt ? result.enrichedPrompt.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          Interactive Intelligence Demo
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          Test Character Intelligence
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Experience the core behavioral engine in action. Select a character, type any raw scene event,
          and watch how their verified personality rewrites the cinematic direction.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              1. Choose Character
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {characters.map((char) => {
                const isSelected = char.id === selectedCharId;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      setSelectedCharId(char.id);
                      if (char.name.toLowerCase().includes("james")) {
                        setScenePrompt("James trips and falls during football practice in front of the whole team.");
                      } else if (char.name.toLowerCase().includes("aria")) {
                        setScenePrompt("Aria is unexpectedly confronted about a missing encrypted security key in the boardroom.");
                      } else {
                        setScenePrompt("Marcus encounters an armed scout while escorting civilians across the river.");
                      }
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? "bg-purple-50/80 border-[#7C3AED] shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{char.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-[#7C3AED] font-semibold">
                          {char.skills?.core_trait || "Dynamic"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {char.skills?.vibe_summary || char.description}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] mt-1 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Raw Scene Event
              </label>
              <span className="text-[11px] text-slate-500 font-medium">{origWords} words</span>
            </div>
            <textarea
              rows={5}
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              placeholder="Describe the moment..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none placeholder:text-slate-400 resize-none leading-relaxed transition-all"
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={runDemoEnrichment}
            className="w-full py-3.5 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Reading personality & synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enrich Scene Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Output & Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Synthesizing Character Behavior</h4>
              <p className="text-xs text-slate-500">
                Aligning {selectedCharacter?.name || "character"}&apos;s stress response, posture, and speech cadence with the scene...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Enriched Prompt Hero Box */}
              <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                    Enriched Cinematic Prompt
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyResult}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 border border-purple-200 shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-sans bg-white p-4 rounded-xl border border-purple-100 shadow-xs">
                  &ldquo;{result.enrichedPrompt}&rdquo;
                </p>
              </div>

              {/* Behavior Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border-l-4 border-l-purple-500 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                    Facial Expression
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {result.behaviorBreakdown.facial_expression}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border-l-4 border-l-blue-500 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    Body Language
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {result.behaviorBreakdown.body_language}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border-l-4 border-l-rose-500 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block mb-1">
                    Emotional State
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {result.behaviorBreakdown.emotional_state}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    Dialogue Direction
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {result.behaviorBreakdown.dialogue_direction}
                  </p>
                </div>
              </div>

              {/* THE PROOF CALLOUT */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-200 text-center shadow-xs">
                <p className="text-xs sm:text-sm font-medium text-slate-700">
                  <span className="text-slate-500">Without Vynter North:</span> 400 words written manually.{" "}
                  <span className="text-[#7C3AED] font-bold">With Vynter North:</span> {origWords} words, character did the rest.
                </p>
              </div>

              {/* Share & Studio link */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Share demo:</span>
                  <button
                    type="button"
                    onClick={shareOnTwitter}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 shadow-xs"
                    title="Share on X / Twitter"
                  >
                    <span className="font-bold">𝕏</span>
                    <span>Share on X</span>
                  </button>
                  <button
                    type="button"
                    onClick={shareOnLinkedIn}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 shadow-xs"
                    title="Share on LinkedIn"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Share on LinkedIn</span>
                  </button>
                </div>

                <Link
                  href={`/studio?character=${selectedCharId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                >
                  <span>Open in Video Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto w-full px-4 py-16 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7C3AED] mb-3" />
          <span>Loading Intelligence Demo...</span>
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}
