"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Sparkles,
  Check,
  Copy,
  Lock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { SkillTemplate, Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { user, isAuthenticated } = useAuth();

  const [template, setTemplate] = useState<SkillTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [acquiring, setAcquiring] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Apply to character picker modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [selectedField, setSelectedField] = useState("full_sheet");
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    apiFetch<{ template: SkillTemplate }>(`/api/skills/${id}`).then((res) => {
      setLoading(false);
      if (res.ok && res.data.template) {
        setTemplate(res.data.template);
        if (res.data.template.content) {
          setUnlockedContent(res.data.template.content);
        }
      }
    });
  }, [id]);

  const handleAcquire = async () => {
    if (!isAuthenticated) {
      router.push(`/signin?next=/skills/${id}`);
      return;
    }

    setAcquiring(true);
    const res = await apiFetch<{ content: string }>(`/api/skills/${id}/acquire`, {
      method: "POST",
    });
    setAcquiring(false);

    if (res.ok && res.data.content) {
      setUnlockedContent(res.data.content);
    }
  };

  const handleCopyContent = () => {
    if (!unlockedContent) return;
    navigator.clipboard.writeText(unlockedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Apply modal and load creator's draft/active characters
  const handleOpenApplyModal = async () => {
    setShowApplyModal(true);
    if (user) {
      const res = await apiFetch<{ characters: Character[] }>(
        `/api/characters?owner_id=${user.id}`
      );
      if (res.ok && res.data.characters) {
        setMyCharacters(res.data.characters);
        if (res.data.characters.length > 0) {
          setSelectedCharacterId(res.data.characters[0].id);
        }
      }
    }
  };

  // Apply template content as a draft change to chosen field
  const handleApplyToCharacter = async () => {
    if (!selectedCharacterId || !unlockedContent) return;
    setApplying(true);

    // Fetch existing character
    const charRes = await apiFetch<{ character: Character }>(
      `/api/characters/${selectedCharacterId}`
    );
    if (!charRes.ok) {
      setApplying(false);
      return;
    }

    const existingChar = charRes.data.character;
    const existingVal = (existingChar as any)[selectedField] || "";
    const updatedVal = existingVal
      ? `${existingVal}\n\n/* Added from ${template?.title} blueprint */\n${unlockedContent}`
      : unlockedContent;

    const updateRes = await apiFetch(`/api/characters/${selectedCharacterId}`, {
      method: "PATCH",
      body: JSON.stringify({
        [selectedField]: updatedVal,
      }),
    });

    setApplying(false);
    if (updateRes.ok) {
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        setShowApplyModal(false);
        router.push(`/dashboard/characters/${selectedCharacterId}/edit`);
      }, 1200);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="font-serif text-2xl text-[var(--text)]">Template Not Found</h1>
        <Link
          href="/skills"
          className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
        >
          Return to Skills
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Back Link */}
      <div>
        <Link
          href="/skills"
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blueprints
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] font-mono text-[10px] uppercase">
              {template.category.replace("_", " ")}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
              {template.title}
            </h1>
          </div>

          <div className="text-right">
            <span className="font-mono text-2xl font-bold text-[var(--text)] block">
              {template.price_cents === 0 ? "Free" : `$${(template.price_cents / 100).toFixed(2)}`}
            </span>
            <span className="text-[11px] text-[var(--text-dim)]">
              {template.installs || 0} installs
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 lg:p-8 space-y-8 shadow-sm">
        {/* Value Section (Section 7.5: what it adds 3-5 bullets) */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[var(--glacier)] uppercase tracking-wider block">
            What This Blueprint Adds
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {(template.what_it_adds || [
              "Structured behavioral triggers for sudden pressure",
              "Signature speech cadence and deliberate pauses",
              "Consistent center-of-gravity physical tells",
            ]).map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-[var(--panel-raised)] rounded-[6px]">
                <Check className="w-4 h-4 text-[var(--ok)] shrink-0 mt-0.5" />
                <span className="text-[var(--text)]">{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Before / After Mini Demo (Section 7.5) */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
            Before & After Behavior Demonstration
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[8px] space-y-1.5">
              <span className="font-semibold text-[var(--text-dim)] uppercase text-[10px] block">
                Without Blueprint (Generic Scene Action):
              </span>
              <p className="text-[var(--text-dim)] italic">
                "{template.sample_scene || "The character enters a tense negotiation and asks for terms."}"
              </p>
            </div>

            <div className="p-4 bg-[var(--night)] border border-[var(--glacier)] rounded-[8px] space-y-1.5">
              <span className="font-semibold text-[var(--glacier)] uppercase text-[10px] block">
                With Blueprint Applied:
              </span>
              <p className="text-[var(--text)] leading-relaxed">
                "{template.sample_output || "The character takes the seat furthest from the door without speaking, fixing their cuff links to break eye contact before setting down terms with clipped, deliberate pauses."}"
              </p>
            </div>
          </div>
        </div>

        {/* Public Excerpt (<=150 words) */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
            Public Excerpt Preview (≤150 words)
          </span>
          <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] font-mono text-xs text-[var(--text-dim)] leading-relaxed">
            "{template.preview_excerpt || template.summary}"
          </div>
        </div>

        {/* Unlocked Content OR Action Button (Section 7.5) */}
        {unlockedContent ? (
          <div className="p-6 bg-[var(--night)] border border-[var(--glacier)] rounded-[10px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--ok)]" />
                <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Full Blueprint Unlocked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded hover:border-[var(--glacier)] flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3 h-3 text-[var(--ok)]" /> : <Copy className="w-3 h-3" />}
                  Copy Blueprint
                </button>
                <button
                  type="button"
                  onClick={handleOpenApplyModal}
                  className="px-4 py-1.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" /> Apply to one of my characters
                </button>
              </div>
            </div>

            <pre className="text-xs text-[var(--text)] font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto p-2">
              {unlockedContent}
            </pre>
          </div>
        ) : (
          <div className="p-6 bg-[var(--night)] border border-[var(--line)] rounded-[10px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[var(--text-dim)]" />
              <div>
                <span className="text-xs font-bold text-[var(--text)] block">
                  Full Content Locked ({template.word_count || 150} words)
                </span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Unlock to reveal complete behavioral sheet text, prompt injection rules, and paste into character drafts.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcquire}
              disabled={acquiring}
              className="px-6 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
            >
              {acquiring ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : template.price_cents === 0 ? (
                "Get Blueprint Free"
              ) : (
                `Buy Blueprint ($${(template.price_cents / 100).toFixed(2)})`
              )}
            </button>
          </div>
        )}
      </div>

      {/* Section 7.5 Apply to Character Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-2xl text-[var(--text)]">
              Apply Blueprint to Character
            </h3>
            <p className="text-xs text-[var(--text-dim)]">
              Paste this blueprint directly into your character draft in the editor.
            </p>

            {myCharacters.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-dim)]">
                You have no character drafts in progress. Create a character first to apply blueprints.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[var(--text-dim)] font-medium mb-1">
                    Select Target Character:
                  </label>
                  <select
                    value={selectedCharacterId}
                    onChange={(e) => setSelectedCharacterId(e.target.value)}
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
                    Target Sheet Field:
                  </label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-[var(--text)]"
                  >
                    <option value="full_sheet">Full Personality Sheet</option>
                    <option value="behavior_danger">Danger & High Stakes Behavior</option>
                    <option value="behavior_funny">Comedic Reaction</option>
                    <option value="behavior_emotional">Emotional Vulnerability</option>
                    <option value="movement_style">Movement Style</option>
                    <option value="verbal_habits">Verbal Habits & Rhythm</option>
                  </select>
                </div>

                {appliedSuccess && (
                  <span className="text-xs text-[var(--ok)] font-medium block">
                    ✓ Applied to character draft! Opening editor…
                  </span>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-3 py-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyToCharacter}
                    disabled={applying}
                    className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded text-xs hover:brightness-110 flex items-center gap-1.5"
                  >
                    {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply as Draft Change"}
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
