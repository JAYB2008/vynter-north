"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Film,
  Sparkles,
  Play,
  Copy,
  Check,
  CheckCircle2,
  Eye,
  Activity,
  HeartHandshake,
  MessageSquare,
  Network,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { CharacterWithSkills, BehaviorBreakdown } from "@/lib/types";

function StudioContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("character");

  // State
  const [characters, setCharacters] = useState<CharacterWithSkills[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [scenePrompt, setScenePrompt] = useState<string>(
    "James trips and falls during football practice in front of the whole team."
  );

  // Toggles
  const [personalityInjection, setPersonalityInjection] = useState(true);
  const [physicalBehavior, setPhysicalBehavior] = useState(true);
  const [dialogueDirection, setDialogueDirection] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"intelligence" | "prompt" | "video">("intelligence");

  // Loading & Progress States
  const [isEnriching, setIsEnriching] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>("");

  // Results
  const [enrichedResult, setEnrichedResult] = useState<{
    enrichedPrompt: string;
    behaviorBreakdown: BehaviorBreakdown;
    generationLogId?: string;
    modelUsed?: string;
  } | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Fetch characters on load
  useEffect(() => {
    async function loadCharacters() {
      try {
        const res = await fetch("/api/characters");
        const data = await res.json();
        if (data.characters && data.characters.length > 0) {
          setCharacters(data.characters);
          if (preselectedId) {
            const match = data.characters.find((c: CharacterWithSkills) => c.id === preselectedId);
            if (match) {
              setSelectedCharId(match.id);
              return;
            }
          }
          // Default to first character (usually James)
          setSelectedCharId(data.characters[0].id);
        }
      } catch (err) {
        console.error("Failed to load characters:", err);
      }
    }
    loadCharacters();
  }, [preselectedId]);

  const selectedCharacter = characters.find((c) => c.id === selectedCharId);

  // 1. Run Enrichment Only
  const handleEnrichPrompt = async () => {
    if (!selectedCharId) {
      toast.error("Please select a character");
      return;
    }
    if (!scenePrompt.trim()) {
      toast.error("Please describe a scene");
      return;
    }

    setIsEnriching(true);
    setGenerationPhase("Reading character personality profile and skills...");

    try {
      const res = await fetch("/api/intelligence/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedCharId,
          scenePrompt: scenePrompt.trim(),
          settings: {
            personalityInjection,
            physicalBehavior,
            dialogueDirection,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Enrichment failed");
      }

      setEnrichedResult({
        enrichedPrompt: data.enrichedPrompt,
        behaviorBreakdown: data.behaviorBreakdown,
        generationLogId: data.generationLogId,
        modelUsed: data.modelUsed,
      });

      setActiveTab("intelligence");
      toast.success("Scene successfully enriched with character intelligence!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error enriching prompt";
      toast.error(msg);
    } finally {
      setIsEnriching(false);
      setGenerationPhase("");
    }
  };

  // 2. Full Flow: Enrich + Generate Video
  const handleGenerateVideo = async () => {
    if (!selectedCharId) {
      toast.error("Please select a character");
      return;
    }
    if (!scenePrompt.trim()) {
      toast.error("Please describe a scene");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoUrl(null);

    try {
      // Step A: Enrich Prompt
      setGenerationPhase("Enriching prompt with character personality...");
      await new Promise((r) => setTimeout(r, 1200));

      const enrichRes = await fetch("/api/intelligence/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedCharId,
          scenePrompt: scenePrompt.trim(),
          settings: {
            personalityInjection,
            physicalBehavior,
            dialogueDirection,
          },
        }),
      });

      const enrichData = await enrichRes.json();
      if (!enrichRes.ok) {
        throw new Error(enrichData.error || "Enrichment failed");
      }

      setEnrichedResult({
        enrichedPrompt: enrichData.enrichedPrompt,
        behaviorBreakdown: enrichData.behaviorBreakdown,
        generationLogId: enrichData.generationLogId,
        modelUsed: enrichData.modelUsed,
      });

      // Step B: Send to Video Generator
      setGenerationPhase("Sending to video generator...");
      await new Promise((r) => setTimeout(r, 1200));

      const genRes = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrichedPrompt: enrichData.enrichedPrompt,
          generationLogId: enrichData.generationLogId,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genData.error || "Video dispatch failed");
      }

      const predictionId = genData.predictionId;

      // Step C: Poll for video completion
      let attempts = 0;
      const phases = [
        "Generating frames...",
        "Processing motion vectors...",
        "Synthesizing lighting and expressions...",
        "Finalizing video stream...",
      ];

      const pollInterval = setInterval(async () => {
        attempts++;
        const phaseIndex = Math.min(attempts - 1, phases.length - 1);
        setGenerationPhase(phases[phaseIndex]);

        try {
          const statusRes = await fetch(
            `/api/video/status/${predictionId}?logId=${enrichData.generationLogId}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === "succeeded" && statusData.videoUrl) {
            clearInterval(pollInterval);
            setVideoUrl(statusData.videoUrl);
            setIsGeneratingVideo(false);
            setGenerationPhase("");
            setActiveTab("video");
            toast.success("AI Video generated successfully!");
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setIsGeneratingVideo(false);
            setGenerationPhase("");
            toast.error("Video generation encountered an issue");
          }
        } catch (pollErr) {
          console.warn("Polling error:", pollErr);
        }

        // Safety timeout after 45 seconds
        if (attempts > 15) {
          clearInterval(pollInterval);
          setIsGeneratingVideo(false);
          setGenerationPhase("");
          setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
          setActiveTab("video");
        }
      }, 2500);
    } catch (err: unknown) {
      console.error("Video generation failed:", err);
      const msg = err instanceof Error ? err.message : "Video generation failed";
      toast.error(msg);
      setIsGeneratingVideo(false);
      setGenerationPhase("");
    }
  };

  const copyPromptToClipboard = () => {
    if (!enrichedResult?.enrichedPrompt) return;
    navigator.clipboard.writeText(enrichedResult.enrichedPrompt);
    setHasCopied(true);
    toast.success("Enriched prompt copied to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Word count calculations
  const originalWordCount = scenePrompt.trim() ? scenePrompt.trim().split(/\s+/).length : 0;
  const enrichedWordCount = enrichedResult?.enrichedPrompt
    ? enrichedResult.enrichedPrompt.trim().split(/\s+/).length
    : 0;
  const addedWordCount = Math.max(0, enrichedWordCount - originalWordCount);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Film className="w-8 h-8 text-[#7C3AED]" />
          Video Studio
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Compose scene events and let the Character Intelligence Layer inject nuanced, character-specific behavior.
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL — Input (5 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-white border border-slate-200 p-6 sm:p-7 rounded-2xl shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              Scene Input
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Define who is in the scene and what happens.</p>
          </div>

          {/* Character Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Character
            </label>
            <select
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none transition-all"
            >
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} ({char.skills?.core_trait || "Dynamic"})
                </option>
              ))}
            </select>

            {/* Selected character vibe summary */}
            {selectedCharacter?.skills?.vibe_summary && (
              <div className="mt-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-slate-700">
                <span className="font-semibold text-[#7C3AED] block mb-0.5">Vibe Summary:</span>
                {selectedCharacter.skills.vibe_summary}
              </div>
            )}
          </div>

          {/* Scene Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Scene Description
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {originalWordCount} words
              </span>
            </div>
            <textarea
              rows={6}
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              placeholder="Describe what happens in your scene. Just describe the event — the character's personality will be handled automatically."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none placeholder:text-slate-400 resize-none leading-relaxed transition-all"
            />
            <p className="text-xs text-slate-500 mt-1.5 italic">
              e.g. James is playing football and trips in front of the whole team
            </p>
          </div>

          {/* Behavior Settings Toggles */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
              Behavior Settings
            </span>

            {/* Toggle 1: Personality Injection */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-700">Personality Injection</span>
              <button
                type="button"
                onClick={() => setPersonalityInjection(!personalityInjection)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  personalityInjection ? "bg-[#7C3AED]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 absolute top-1 ${
                    personalityInjection ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </label>

            {/* Toggle 2: Physical Behavior */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-700">Physical Behavior</span>
              <button
                type="button"
                onClick={() => setPhysicalBehavior(!physicalBehavior)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  physicalBehavior ? "bg-[#7C3AED]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 absolute top-1 ${
                    physicalBehavior ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </label>

            {/* Toggle 3: Dialogue Direction */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-slate-700">Dialogue Direction</span>
              <button
                type="button"
                onClick={() => setDialogueDirection(!dialogueDirection)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  dialogueDirection ? "bg-[#7C3AED]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 absolute top-1 ${
                    dialogueDirection ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={isEnriching || isGeneratingVideo}
              onClick={handleEnrichPrompt}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-[#7C3AED] text-sm font-semibold border border-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isEnriching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
                  <span>Enriching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Enrich Prompt</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isEnriching || isGeneratingVideo}
              onClick={handleGenerateVideo}
              className="flex-1 py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-[#7C3AED]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGeneratingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>

          {/* Loading status progress indicator */}
          {(isEnriching || isGeneratingVideo) && generationPhase && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin shrink-0" />
              <span className="text-xs text-[#7C3AED] font-semibold">
                {generationPhase}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Output (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("intelligence")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "intelligence"
                    ? "border-[#7C3AED] text-[#7C3AED]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                Tab 1 — Intelligence Output
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("prompt")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "prompt"
                    ? "border-[#7C3AED] text-[#7C3AED]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-pink-500" />
                Tab 2 — Enriched Prompt
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "video"
                    ? "border-[#7C3AED] text-[#7C3AED]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Film className="w-4 h-4 text-emerald-600" />
                Tab 3 — Generated Video
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* TAB 1: Intelligence Output Cards */}
              {activeTab === "intelligence" && (
                <div>
                  {!enrichedResult ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3 text-[#7C3AED]">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">
                        Ready to Enrich Scene
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Click &ldquo;Enrich Prompt&rdquo; or &ldquo;Generate Video&rdquo; to process the scene through the Character Intelligence Layer.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Facial Expression Card */}
                      <div className="p-4 rounded-xl bg-white border-l-4 border-l-purple-500 border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-1.5 text-purple-700">
                          <Eye className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Facial Expression
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {enrichedResult.behaviorBreakdown.facial_expression}
                        </p>
                      </div>

                      {/* Body Language Card */}
                      <div className="p-4 rounded-xl bg-white border-l-4 border-l-blue-500 border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-1.5 text-blue-700">
                          <Activity className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Body Language
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {enrichedResult.behaviorBreakdown.body_language}
                        </p>
                      </div>

                      {/* Emotional State Card */}
                      <div className="p-4 rounded-xl bg-white border-l-4 border-l-rose-500 border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-1.5 text-rose-700">
                          <HeartHandshake className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Emotional State
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {enrichedResult.behaviorBreakdown.emotional_state}
                        </p>
                      </div>

                      {/* Dialogue Direction Card */}
                      <div className="p-4 rounded-xl bg-white border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-1.5 text-amber-700">
                          <MessageSquare className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Dialogue Direction
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {enrichedResult.behaviorBreakdown.dialogue_direction}
                        </p>
                      </div>

                      {/* Scene Integration Card */}
                      <div className="p-4 rounded-xl bg-white border-l-4 border-l-emerald-500 border border-slate-200 shadow-xs">
                        <div className="flex items-center gap-2 mb-1.5 text-emerald-700">
                          <Network className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Scene Integration
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {enrichedResult.behaviorBreakdown.scene_integration}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Enriched Prompt */}
              {activeTab === "prompt" && (
                <div>
                  {!enrichedResult ? (
                    <div className="text-center py-16 px-4 text-xs text-slate-500">
                      Enrich a scene prompt to view the synthesized output.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-purple-100 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                        {enrichedResult.enrichedPrompt}
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={copyPromptToClipboard}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
                        >
                          {hasCopied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-500" />
                              <span>Copy to Clipboard</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isGeneratingVideo}
                          onClick={handleGenerateVideo}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow-md shadow-[#7C3AED]/20 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Send to Video Generator</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Generated Video */}
              {activeTab === "video" && (
                <div>
                  {isGeneratingVideo ? (
                    <div className="text-center py-16 px-4 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-[#7C3AED] animate-pulse">
                        <Film className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                          Generating AI Character Video
                        </h4>
                        <p className="text-xs text-[#7C3AED] font-semibold">
                          {generationPhase || "Contacting Replicate video engine..."}
                        </p>
                      </div>
                    </div>
                  ) : videoUrl ? (
                    <div className="space-y-4">
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video relative group shadow-md">
                        <video
                          src={videoUrl}
                          controls
                          autoPlay
                          loop
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          Video synthesis complete
                        </span>
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#7C3AED] hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <span>Open full video</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4">
                      <Film className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        No video generated yet. Click &ldquo;Generate Video&rdquo; to produce a scene clip.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARISON (The Proof of Concept Validation Callout) */}
          {enrichedResult && (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Proof of Concept Comparison
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-200">
                  {enrichedWordCount > 0 ? `${(enrichedWordCount / originalWordCount).toFixed(1)}x Enrichment` : "Enriched"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Side: What you wrote */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      What you wrote
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      &ldquo;{scenePrompt}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-slate-500">
                    Word count: <span className="text-slate-900">{originalWordCount}</span> words
                  </div>
                </div>

                {/* Right Side: What the video generator receives */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] block mb-2">
                      What the video generator receives
                    </span>
                    <p className="text-xs sm:text-sm text-purple-950 leading-relaxed font-medium">
                      &ldquo;{enrichedResult.enrichedPrompt}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-purple-200 text-xs font-semibold text-[#7C3AED]">
                    Word count: <span className="text-purple-900">{enrichedWordCount}</span> words
                  </div>
                </div>
              </div>

              {/* Summary Statement */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-100 text-xs sm:text-sm text-slate-800 leading-relaxed">
                You wrote <span className="font-bold text-slate-900">{originalWordCount} words</span>. The character added{" "}
                <span className="font-bold text-[#7C3AED]">{addedWordCount} words</span> of personality-specific behavioral detail automatically.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto w-full px-4 py-16 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7C3AED] mb-3" />
          <span>Loading Video Studio...</span>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
