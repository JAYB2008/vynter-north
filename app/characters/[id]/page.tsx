"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  Activity,
  Heart,
  MessageSquare,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { findCharacter, CHARACTERS } from "@/lib/characters";

export default function CharacterProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const character = findCharacter(rawId) || CHARACTERS[0];

  const [activeTab, setActiveTab] = useState<"overview" | "personality" | "demo">("overview");

  // Embedded Demo state
  const [demoScene, setDemoScene] = useState<string>(character.demo_scene);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [enrichedResult, setEnrichedResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRunDemo = async () => {
    if (!demoScene.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene: demoScene.trim(),
          characterId: character.id,
          accountKey: "vn-test-key-001",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enrichment failed");
      setEnrichedResult(data);
      toast.success("Intelligence enrichment complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to run enrichment");
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!enrichedResult?.enriched_prompt) return;
    navigator.clipboard.writeText(enrichedResult.enriched_prompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/characters"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Character Registry</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ═══════════════════════════════════════════════════════════
            LEFT SIDE (5 cols)
            ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 p-8 rounded-3xl bg-[#1A1A2E] border border-[#2D2D4E] space-y-6 shadow-2xl relative overflow-hidden">
          {/* Large Avatar Placeholder */}
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${
              character.avatar_gradient || "from-purple-600 to-indigo-800"
            } flex items-center justify-center text-white font-black text-4xl shadow-xl border border-white/10 mx-auto sm:mx-0`}
          >
            {character.avatar_initials || character.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl sm:text-4xl font-black text-[#F9FAFB] tracking-tight">
                {character.name}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#0F0F1A] border border-[#2D2D4E] text-[#A78BFA]">
                {character.id}
              </span>
            </div>

            <p className="text-sm text-[#A78BFA] italic font-medium">
              &ldquo;{character.vibe_summary}&rdquo;
            </p>

            <div className="text-xs text-[#9CA3AF]">
              Registered: <span className="text-[#F9FAFB] font-medium">{character.registered_date || "2025"}</span>
            </div>
          </div>

          {/* Active Status Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active — Available for Rental</span>
          </div>

          {/* Genre Tags */}
          <div className="space-y-2 pt-2 border-t border-[#2D2D4E]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
              Allowed Genres
            </span>
            <div className="flex flex-wrap gap-2">
              {character.allowed_genres.map((g) => (
                <span
                  key={g}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-[#0F0F1A] border border-[#2D2D4E] text-[#F9FAFB]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="pt-4 border-t border-[#2D2D4E]">
            <Link
              href={`/demo?character=${character.id}`}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-[#7C3AED]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try This Character in Studio</span>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT SIDE TABS (7 cols)
            ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1A1A2E] border border-[#2D2D4E]">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                  : "text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("personality")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "personality"
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                  : "text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              Personality Skills
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("demo")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "demo"
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                  : "text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              Embedded Demo
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="p-8 rounded-3xl bg-[#1A1A2E] border border-[#2D2D4E] space-y-6 shadow-xl animate-fadeIn">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-2">
                  Core Trait Definition
                </h3>
                <p className="text-base text-[#F9FAFB] leading-relaxed font-medium">
                  {character.core_trait}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#2D2D4E] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block">
                  Reference Demo Scene
                </span>
                <p className="text-sm text-[#F9FAFB] leading-relaxed italic">
                  &ldquo;{character.demo_scene}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#2D2D4E]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                    Movement Habit
                  </span>
                  <p className="text-xs text-[#F9FAFB] leading-relaxed line-clamp-3">
                    {character.movement}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#2D2D4E]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                    Stress Behavior
                  </span>
                  <p className="text-xs text-[#F9FAFB] leading-relaxed line-clamp-3">
                    {character.stress_reaction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONALITY (PHYSICAL, PERSONALITY, DIALOGUE) */}
          {activeTab === "personality" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Physical Style Section */}
              <div className="p-6 rounded-3xl bg-[#1A1A2E] border-l-4 border-l-blue-500 border border-[#2D2D4E] space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Activity className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Physical Style
                  </h3>
                </div>
                <div>
                  <span className="text-xs text-[#9CA3AF] block mb-1">Movement & Spatial Stance:</span>
                  <p className="text-sm text-[#F9FAFB] leading-relaxed">
                    {character.movement}
                  </p>
                </div>
              </div>

              {/* Personality Section */}
              <div className="p-6 rounded-3xl bg-[#1A1A2E] border-l-4 border-l-[#7C3AED] border border-[#2D2D4E] space-y-4">
                <div className="flex items-center gap-2 text-[#A78BFA]">
                  <Heart className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Personality Architecture
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#9CA3AF] block mb-1">Core Trait:</span>
                    <p className="text-sm text-[#F9FAFB] leading-relaxed">
                      {character.core_trait}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#9CA3AF] block mb-1">Stress Reaction:</span>
                    <p className="text-sm text-[#F9FAFB] leading-relaxed">
                      {character.stress_reaction}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#9CA3AF] block mb-1">Hidden Quality:</span>
                    <p className="text-sm text-[#F9FAFB] leading-relaxed">
                      {character.hidden_quality}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dialogue Style Section */}
              <div className="p-6 rounded-3xl bg-[#1A1A2E] border-l-4 border-l-amber-500 border border-[#2D2D4E] space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Dialogue Style
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-[#9CA3AF] block mb-1">Speaking Pace & Vocal Delivery:</span>
                    <p className="text-sm text-[#F9FAFB] leading-relaxed">
                      {character.speaking_pace}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#9CA3AF] block mb-1">Verbal Habit:</span>
                    <p className="text-sm text-[#F9FAFB] leading-relaxed">
                      {character.verbal_habit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMBEDDED DEMO */}
          {activeTab === "demo" && (
            <div className="p-7 rounded-3xl bg-[#1A1A2E] border border-[#2D2D4E] space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Test {character.name} Live</span>
                </h3>
                <span className="text-xs text-[#9CA3AF]">
                  Uses account key <code className="text-[#A78BFA]">vn-test-key-001</code>
                </span>
              </div>

              <textarea
                rows={4}
                value={demoScene}
                onChange={(e) => setDemoScene(e.target.value)}
                placeholder="Describe what happens in the scene..."
                className="w-full bg-[#0F0F1A] border border-[#2D2D4E] rounded-2xl p-4 text-sm text-[#F9FAFB] focus:outline-none focus:border-[#7C3AED] resize-none"
              />

              <button
                type="button"
                disabled={isLoading}
                onClick={handleRunDemo}
                className="w-full py-3.5 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#7C3AED]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enriching Scene with {character.name}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Live Enrichment</span>
                  </>
                )}
              </button>

              {enrichedResult && (
                <div className="space-y-4 pt-4 border-t border-[#2D2D4E]">
                  <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Enriched Cinematic Prompt
                      </span>
                      <button
                        type="button"
                        onClick={copyResult}
                        className="px-2.5 py-1 rounded-md bg-[#1A1A2E] text-xs text-[#F9FAFB] border border-[#2D2D4E] flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-[#F9FAFB] leading-relaxed">
                      {enrichedResult.enriched_prompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Global Action */}
          <div className="pt-2 flex items-center justify-between">
            <Link
              href={`/demo?character=${character.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-[#7C3AED]/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try This Character in Standalone Demo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
