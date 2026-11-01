"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  BookmarkPlus,
  Loader2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Film,
  Plus,
} from "lucide-react";
import { Rental, Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const preselectedCharacterId = searchParams.get("character") || "";

  // Available characters for this studio (rentals + demo + free + owned)
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  // Multi-character selection (Section 9.7 & 11)
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>(
    preselectedCharacterId ? [preselectedCharacterId] : []
  );

  const [sceneText, setSceneText] = useState(
    "Cairo sits at an outdoor café sipping an espresso. A silver sedan pulls up to the curb and someone lowers the passenger window."
  );

  const [sceneGroupId, setSceneGroupId] = useState<string>(
    () => `group-${Date.now()}`
  );
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentOutputs, setEnrichmentOutputs] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Previews count per group (Section 9.2)
  const [previewIndex, setPreviewIndex] = useState(0);
  const [freePreviewsRemaining, setFreePreviewsRemaining] = useState(10);

  // Keep / Discard statuses per generation
  const [actionStatuses, setActionStatuses] = useState<
    Record<string, "preview" | "kept" | "discarded">
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showWhyPanel, setShowWhyPanel] = useState(true);

  // History sidebar
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<{ rentals: Rental[] }>("/api/rentals").then((res) => {
      setLoadingRentals(false);
      if (res.ok && res.data.rentals) {
        setRentals(res.data.rentals);
        if (
          !preselectedCharacterId &&
          res.data.rentals.length > 0 &&
          selectedCharIds.length === 0
        ) {
          setSelectedCharIds([res.data.rentals[0].character_id]);
        }
      }
    });
  }, [preselectedCharacterId]);

  const toggleCharacter = (charId: string) => {
    if (selectedCharIds.includes(charId)) {
      if (selectedCharIds.length > 1) {
        setSelectedCharIds(selectedCharIds.filter((id) => id !== charId));
      }
    } else {
      setSelectedCharIds([...selectedCharIds, charId]);
    }
  };

  // Run Enrichment for all selected characters (Section 11 multi-character support)
  const handleEnrich = async (isRetry = false) => {
    if (!sceneText.trim()) return;
    if (selectedCharIds.length === 0) {
      setErrorMsg("Please select at least one character.");
      return;
    }

    setIsEnriching(true);
    setErrorMsg(null);

    const outputs: any[] = [];
    const currentGroup = isRetry ? sceneGroupId : `group-${Date.now()}`;
    if (!isRetry) setSceneGroupId(currentGroup);

    try {
      for (const charId of selectedCharIds) {
        // Build also_present context for other selected characters
        const otherChars = rentals
          .filter((r) => selectedCharIds.includes(r.character_id) && r.character_id !== charId)
          .map((r) => r.character?.name || r.character_id);

        const res = await apiFetch<any>("/api/enrich", {
          method: "POST",
          body: JSON.stringify({
            character_id: charId,
            scene: sceneText.trim(),
            scene_group: currentGroup,
            source: "web",
            also_present: otherChars,
          }),
        });

        if (res.ok && res.data) {
          outputs.push(res.data);
          setPreviewIndex(res.data.preview_index || previewIndex + 1);
          setFreePreviewsRemaining(res.data.free_previews_remaining ?? 9);
        } else {
          setErrorMsg(res.error?.message || "Enrichment failed for a selected character.");
        }
      }

      setEnrichmentOutputs(outputs);

      if (outputs.length > 0) {
        setHistoryItems([
          {
            id: currentGroup,
            scene: sceneText.trim(),
            outputs,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...historyItems,
        ]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Enrichment execution error.");
    } finally {
      setIsEnriching(false);
    }
  };

  // Keep Generation (charges 1 credit, Section 9.2)
  const handleKeep = async (generationId: string) => {
    const res = await apiFetch<any>("/api/generations/action", {
      method: "POST",
      body: JSON.stringify({ generation_id: generationId, action: "keep" }),
    });
    if (res.ok) {
      setActionStatuses((prev) => ({ ...prev, [generationId]: "kept" }));
    }
  };

  // Discard Generation (free, Section 9.2)
  const handleDiscard = async (generationId: string) => {
    const res = await apiFetch<any>("/api/generations/action", {
      method: "POST",
      body: JSON.stringify({ generation_id: generationId, action: "discard" }),
    });
    if (res.ok) {
      setActionStatuses((prev) => ({ ...prev, [generationId]: "discarded" }));
    }
  };

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--line)] mb-8 gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Studio Production Environment
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Scene Enrichment Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Describe the physical sequence. Characters apply their distinctive psychological behavior and acting delivery.
          </p>
        </div>

        <Link
          href="/studio/library"
          className="text-xs text-[var(--glacier)] hover:underline flex items-center gap-1 font-medium"
        >
          Manage studio rentals →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Workspace Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Character Chips Multi-Select */}
          <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-3">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
              Characters in Scene (Select one or more for group dialogue)
            </span>

            {loadingRentals ? (
              <span className="text-xs text-[var(--text-dim)] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading characters…
              </span>
            ) : rentals.length === 0 ? (
              <div className="text-xs text-[var(--text-dim)] flex items-center justify-between">
                <span>No active character rentals in your library.</span>
                <Link
                  href="/marketplace"
                  className="text-[var(--glacier)] hover:underline font-semibold"
                >
                  Start free trial on marketplace →
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rentals.map((r) => {
                  const char = r.character;
                  const isSelected = selectedCharIds.includes(r.character_id);
                  const creditsLeft = r.credits_total - r.credits_used;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleCharacter(r.character_id)}
                      className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border flex items-center gap-2 transition-colors ${
                        isSelected
                          ? "bg-[var(--glacier)] text-[var(--glacier-ink)] border-[var(--glacier)]"
                          : "bg-[var(--panel-raised)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]"
                      }`}
                    >
                      <span className="font-semibold">{char?.name || r.character_id}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({creditsLeft} cr)
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scene Textarea (Section 9.7) */}
          <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                Describe What Happens
              </label>
              <span className="text-[11px] font-mono text-[var(--text-dim)]">
                {sceneText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={5}
              value={sceneText}
              onChange={(e) => setSceneText(e.target.value)}
              placeholder="Describe only what happens. Don't describe feelings or behaviour — the character adds that."
              className="w-full px-4 py-3 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)] resize-none"
            />

            {errorMsg && (
              <div className="p-3 bg-[var(--bad)]/15 border border-[var(--bad)] rounded text-xs text-[var(--bad)] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[var(--text-dim)]">
                Up to 10 free previews per scene group. Credits deducted only when clicking Keep.
              </span>

              <button
                type="button"
                onClick={() => handleEnrich(false)}
                disabled={isEnriching || !sceneText.trim()}
                className="px-6 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enriching scene…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Run Enrichment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enriched Results Cards */}
          {enrichmentOutputs.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl text-[var(--text)]">
                  Camera-Ready Direction ({enrichmentOutputs.length})
                </h3>
                {/* Free preview counter from Section 9.2 */}
                <span className="text-xs font-mono text-[var(--glacier)]">
                  {freePreviewsRemaining > 0
                    ? `Retry ${10 - freePreviewsRemaining} of 10 free`
                    : "Previews now charged immediately"}
                </span>
              </div>

              {enrichmentOutputs.map((out, idx) => {
                const status = actionStatuses[out.generation_id] || "preview";
                return (
                  <div
                    key={idx}
                    className="p-6 bg-[var(--night)] border border-[var(--line)] rounded-[10px] space-y-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--text)] text-sm">
                          {out.character?.name || `Character ${idx + 1}`}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-dim)]">
                          {out.word_count?.original} words in → {out.word_count?.enriched} words out ({out.word_count?.multiplier})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {status === "kept" ? (
                          <span className="px-2 py-0.5 rounded bg-[var(--ok)]/15 text-[var(--ok)] font-medium flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3" /> Kept (1 credit charged)
                          </span>
                        ) : status === "discarded" ? (
                          <span className="px-2 py-0.5 rounded bg-[var(--line)] text-[var(--text-dim)] text-[11px]">
                            Discarded
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleKeep(out.generation_id)}
                              className="px-3 py-1 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110 flex items-center gap-1"
                            >
                              <BookmarkPlus className="w-3 h-3" /> Keep (Charge credit)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDiscard(out.generation_id)}
                              className="px-2.5 py-1 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] rounded flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Discard
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEnrich(true)}
                              className="px-2.5 py-1 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded hover:border-[var(--glacier)] flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Retry
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => copyPrompt(out.generation_id, out.enriched_prompt)}
                          className="p-1.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] hover:text-[var(--text)]"
                          title="Copy prompt"
                        >
                          {copiedId === out.generation_id ? (
                            <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Acting Prompt Text */}
                    <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap font-sans">
                      {out.enriched_prompt}
                    </p>

                    {/* Breakdown accordion */}
                    <div className="pt-3 border-t border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() => setShowWhyPanel(!showWhyPanel)}
                        className="flex items-center gap-2 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
                      >
                        <Layers className="w-3.5 h-3.5 text-[var(--glacier)]" />
                        <span>Why this output & Behavioral Attribution</span>
                        {showWhyPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {showWhyPanel && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                          <div className="p-3 bg-[var(--panel)] border border-[var(--line)] rounded">
                            <span className="text-[10px] uppercase text-[var(--text-dim)] font-semibold block mb-0.5">
                              Facial
                            </span>
                            <p className="text-[11px] text-[var(--text)] line-clamp-3">
                              {out.facial_expression}
                            </p>
                          </div>
                          <div className="p-3 bg-[var(--panel)] border border-[var(--line)] rounded">
                            <span className="text-[10px] uppercase text-[var(--text-dim)] font-semibold block mb-0.5">
                              Body Language
                            </span>
                            <p className="text-[11px] text-[var(--text)] line-clamp-3">
                              {out.body_language}
                            </p>
                          </div>
                          <div className="p-3 bg-[var(--panel)] border border-[var(--line)] rounded">
                            <span className="text-[10px] uppercase text-[var(--text-dim)] font-semibold block mb-0.5">
                              Emotion
                            </span>
                            <p className="text-[11px] text-[var(--text)] line-clamp-3">
                              {out.emotional_state}
                            </p>
                          </div>
                          <div className="p-3 bg-[var(--panel)] border border-[var(--line)] rounded">
                            <span className="text-[10px] uppercase text-[var(--text-dim)] font-semibold block mb-0.5">
                              Dialogue Delivery
                            </span>
                            <p className="text-[11px] text-[var(--text)] line-clamp-3">
                              {out.dialogue_direction}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar History Column (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--glacier)]" />
              Session History
            </span>
            <span className="text-[10px] font-mono text-[var(--text-dim)]">
              {historyItems.length} runs
            </span>
          </div>

          {historyItems.length === 0 ? (
            <p className="text-xs text-[var(--text-dim)] italic">
              Your enriched scene history in this workspace will appear here.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {historyItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSceneText(item.scene);
                    setEnrichmentOutputs(item.outputs);
                  }}
                  className="w-full p-3 bg-[var(--panel-raised)] border border-[var(--line)] hover:border-[var(--glacier)] rounded-[6px] text-left text-xs space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] font-mono">
                    <span>{item.timestamp}</span>
                    <span>{item.outputs?.length} character(s)</span>
                  </div>
                  <p className="text-[var(--text)] line-clamp-2 leading-relaxed">
                    "{item.scene}"
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
