"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Plus, X, Loader2, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function NewSkillTemplatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personality");
  const [summary, setSummary] = useState("");
  const [whatItAdds, setWhatItAdds] = useState<string[]>([
    "Distinctive physical reaction under sudden conflict",
    "Measured vocal delivery and deliberate pauses",
  ]);
  const [bulletInput, setBulletInput] = useState("");
  const [sampleScene, setSampleScene] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [previewExcerpt, setPreviewExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("0");
  const [tags, setTags] = useState<string[]>(["Behavioral", "Dialogue"]);
  const [tagInput, setTagInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      setErrorMsg("Title, summary, and blueprint content are required.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const priceCents = Math.round((parseFloat(price) || 0) * 100);

    const res = await apiFetch<any>("/api/skills", {
      method: "POST",
      body: JSON.stringify({
        title,
        category,
        summary,
        what_it_adds: whatItAdds,
        sample_scene: sampleScene || null,
        sample_output: sampleOutput || null,
        preview_excerpt: previewExcerpt || null,
        content,
        price_cents: priceCents,
        tags,
      }),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/skills");
    } else {
      setErrorMsg(res.error.message || "Failed to publish blueprint.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div>
        <Link
          href="/skills"
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blueprints
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)]">
          Publish a Behavioral Blueprint
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Share modular personality systems, speech patterns, or genre packs with other creators and studios ($0–$15).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 lg:p-8 space-y-6 text-xs shadow-sm"
      >
        {errorMsg && (
          <div className="p-3 bg-[var(--bad)]/15 border border-[var(--bad)] rounded text-xs text-[var(--bad)]">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
              Blueprint Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Calculated Understatement System"
              className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
            >
              <option value="personality">Personality Type</option>
              <option value="movement">Movement Style</option>
              <option value="dialogue">Dialogue System</option>
              <option value="genre_pack">Genre Pack</option>
              <option value="full_template">Full Sheet</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
            Short Summary *
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One-sentence description of the behavioral tone or technique..."
            className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
          />
        </div>

        {/* What it adds (3-5 bullets) */}
        <div className="space-y-2">
          <label className="block font-semibold text-[var(--text)] uppercase tracking-wider">
            What It Adds (3–5 concrete bullets shown on marketplace)
          </label>
          <div className="space-y-1.5">
            {whatItAdds.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={b}
                  onChange={(e) => {
                    const copy = [...whatItAdds];
                    copy[idx] = e.target.value;
                    setWhatItAdds(copy);
                  }}
                  className="w-full px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
                />
                <button
                  type="button"
                  onClick={() => setWhatItAdds(whatItAdds.filter((_, i) => i !== idx))}
                  className="text-[var(--text-dim)] hover:text-[var(--bad)] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          {whatItAdds.length < 5 && (
            <button
              type="button"
              onClick={() => setWhatItAdds([...whatItAdds, ""])}
              className="text-[var(--glacier)] hover:underline flex items-center gap-1 font-medium pt-1"
            >
              <Plus className="w-3 h-3" /> Add bullet
            </button>
          )}
        </div>

        {/* Before / After Mini Demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
              Sample Scene (Before)
            </label>
            <textarea
              rows={3}
              value={sampleScene}
              onChange={(e) => setSampleScene(e.target.value)}
              placeholder="e.g. Cairo is cornered in an alley..."
              className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
              Sample Acting Direction (After)
            </label>
            <textarea
              rows={3}
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              placeholder="Describe resulting behavior with this blueprint applied..."
              className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
            />
          </div>
        </div>

        {/* Public Excerpt */}
        <div>
          <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
            Public Excerpt (≤150 words shown before unlocking)
          </label>
          <textarea
            rows={3}
            value={previewExcerpt}
            onChange={(e) => setPreviewExcerpt(e.target.value)}
            placeholder="Teaser paragraph visible to visitors..."
            className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
          />
        </div>

        {/* Full Blueprint Content */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-[var(--text)] uppercase tracking-wider">
              Full Blueprint Content * (Unlocked upon acquisition)
            </label>
            <span className="font-mono text-[var(--text-dim)]">
              {wordCount} words
            </span>
          </div>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the full system prompt instructions, trait definitions, and behavioral guidelines..."
            className="w-full px-3 py-2 bg-[var(--night)] border border-[var(--line)] rounded text-xs font-mono text-[var(--text)]"
          />
        </div>

        {/* Price ($0–$15) */}
        <div>
          <label className="block font-semibold text-[var(--text)] mb-1 uppercase tracking-wider">
            Price in USD ($0 to $15 max)
          </label>
          <input
            type="number"
            min={0}
            max={15}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-40 px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs font-mono text-[var(--text)]"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing blueprint…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Publish Blueprint
            </>
          )}
        </button>
      </form>
    </div>
  );
}
