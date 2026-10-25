"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Eye,
  Activity,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Code2,
} from "lucide-react";
import Link from "next/link";

interface BehaviorBreakdown {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
}

interface EnrichmentResponse {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
  enriched_prompt: string;
  enrichedPrompt?: string;
  behaviorBreakdown?: BehaviorBreakdown;
  error?: string;
}

export default function TestEnrichmentPage() {
  const [scenePrompt, setScenePrompt] = useState<string>(
    "Cairo is cornered by three armed guards in a luxury penthouse corridor."
  );
  const [accountKey, setAccountKey] = useState<string>("vn-test-key-001");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EnrichmentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleEnrich = async () => {
    if (!scenePrompt.trim()) {
      toast.error("Please enter a scene prompt.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene: scenePrompt.trim(),
          characterId: "cairo-001",
          accountKey: accountKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      setResult(data);
      toast.success("Scene successfully enriched with Cairo's profile!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to enrich scene.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.enriched_prompt) return;
    navigator.clipboard.writeText(result.enriched_prompt);
    setCopied(true);
    toast.success("Enriched prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const originalWordCount = scenePrompt.trim()
    ? scenePrompt.trim().split(/\s+/).length
    : 0;
  const enrichedWordCount = result?.enriched_prompt
    ? result.enriched_prompt.trim().split(/\s+/).length
    : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              API Test Bench • Step 1
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Character Enrichment Test
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Testing <code className="text-purple-300 font-mono">/api/enrich</code> with NVIDIA NIM (<code className="text-purple-300 font-mono">meta/llama-3.1-8b-instruct</code>) using character <strong className="text-white">Cairo</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-purple-300 border border-purple-800/40 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Connect MCP (Claude)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Character Profile Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-purple-900/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Loaded Profile: Cairo
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60">
              accountKey: vn-test-key-001
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-purple-400 font-semibold block mb-0.5">Core Trait</span>
              <p className="text-slate-300">Overconfident but genuinely skilled</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-purple-400 font-semibold block mb-0.5">Movement & Voice</span>
              <p className="text-slate-300">Sideways lean, plants feet wide. Smooth but cracks under real stress.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-purple-400 font-semibold block mb-0.5">Hidden Quality & Stress</span>
              <p className="text-slate-300">Performative when scared; completely quiet and competent when others are in danger.</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Scene Prompt
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {originalWordCount} words
                </span>
              </div>
              <textarea
                rows={4}
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                placeholder="Describe a scene for Cairo..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none placeholder:text-slate-600 resize-none leading-relaxed font-sans transition-colors"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Account Key
                </label>
                <input
                  type="text"
                  value={accountKey}
                  onChange={(e) => setAccountKey(e.target.value)}
                  placeholder="vn-test-key-001"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-purple-500 focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-slate-500">
                  Valid registered test key: <code className="text-purple-400">vn-test-key-001</code>
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleEnrich}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Calling NVIDIA NIM...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Enrich Scene with Cairo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400">Sample Scenes:</span>
            {[
              "Cairo is cornered by three armed guards in a luxury penthouse corridor.",
              "A frightened rookie team member is pinned down by sniper fire.",
              "Cairo steps onto the stage for a high-stakes auction pretending to be a billionaire buyer.",
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setScenePrompt(preset)}
                className="text-[11px] px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-700/60 transition-colors"
              >
                Preset {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-950/40 border border-rose-800/60 p-5 text-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <strong className="text-sm font-bold text-white block">Enrichment Request Failed</strong>
              <p>{errorMessage}</p>
              {errorMessage.includes("NVIDIA_API_KEY") && (
                <p className="text-slate-300 mt-2">
                  Tip: Open <code className="text-rose-300 font-mono">.env.local</code> and paste your NVIDIA NIM API key:
                  <br />
                  <code className="text-purple-300 font-mono">NVIDIA_API_KEY=nvapi-...</code>
                  <br />
                  Then restart your Next.js dev server.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison (Left: Original, Right: Enriched) */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Original Prompt */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Original Scene Prompt (Left)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {originalWordCount} words
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    &ldquo;{scenePrompt}&rdquo;
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  Raw input without psychological character conditioning.
                </div>
              </div>

              {/* Right Column: Enriched Prompt */}
              <div className="rounded-2xl bg-purple-950/30 border border-purple-800/50 p-6 flex flex-col justify-between space-y-4 shadow-lg shadow-purple-950/20">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-purple-800/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Enriched Prompt (Right)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-purple-300">
                        {enrichedWordCount} words
                      </span>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-purple-100 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-purple-900/60 whitespace-pre-wrap select-all">
                    &ldquo;{result.enriched_prompt}&rdquo;
                  </p>
                </div>
                <div className="text-[11px] text-purple-400/80 pt-2 border-t border-purple-800/40 flex items-center justify-between">
                  <span>Natural film direction formatted for video generation.</span>
                  <span className="font-semibold text-purple-300">
                    +{Math.max(0, enrichedWordCount - originalWordCount)} words injected
                  </span>
                </div>
              </div>
            </div>

            {/* Behavior Breakdown Below */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Full Behavior Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Facial Expression */}
                <div className="p-5 rounded-2xl bg-slate-900 border-l-4 border-l-purple-500 border border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Facial Expression
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {result.facial_expression || "—"}
                  </p>
                </div>

                {/* Body Language */}
                <div className="p-5 rounded-2xl bg-slate-900 border-l-4 border-l-blue-500 border border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Body Language
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {result.body_language || "—"}
                  </p>
                </div>

                {/* Emotional State */}
                <div className="p-5 rounded-2xl bg-slate-900 border-l-4 border-l-rose-500 border border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-400 mb-2">
                    <HeartHandshake className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Emotional State
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {result.emotional_state || "—"}
                  </p>
                </div>

                {/* Dialogue Direction */}
                <div className="p-5 rounded-2xl bg-slate-900 border-l-4 border-l-amber-500 border border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Dialogue Direction
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {result.dialogue_direction || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
