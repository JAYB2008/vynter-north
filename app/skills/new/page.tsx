"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { SkillCategory } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function NewSkillTemplatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SkillCategory>("personality");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error("Please fill in title, description, and full content.");
      return;
    }

    if (content.length < 200) {
      toast.error("Template content must be at least 200 characters.");
      return;
    }

    setPublishing(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          tags: parsedTags,
          preview_text:
            previewText.trim() || content.slice(0, 200).trim() + "...",
          content,
          price: Number(price) || 0,
          is_free: Number(price) === 0,
          creator_id: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Skill template published!");
      router.push("/skills");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish template.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        href="/skills"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Skill Templates</span>
      </Link>

      <div className="vn-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Creator Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-app">
            Publish Character Skill Template
          </h1>
          <p className="text-xs sm:text-sm text-secondary-app">
            Share reusable personality modules, crisis reflexes, or dialogue styles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary-app block">
              Template Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hyper-Vigilant Tactical Stoic Blueprint"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary-app border border-app text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="personality">Personality Types</option>
                <option value="movement">Movement Styles</option>
                <option value="dialogue">Dialogue Systems</option>
                <option value="genre_pack">Genre Packs</option>
                <option value="full_template">Full Templates</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Price ($0 = Free)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary-app block">
              Short Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this template includes and how it shapes scene direction."
              className="w-full p-3 rounded-xl bg-secondary-app border border-app text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary-app block">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. military, thriller, sci-fi, disciplined"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-secondary-app">
                Preview Text (max 300 chars — shown publicly)
              </label>
              <span className="text-[11px] text-muted-app">
                {previewText.length}/300
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="First teaser paragraph shown on marketplace cards before downloading."
              className="w-full p-3 rounded-xl bg-secondary-app border border-app text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-secondary-app">
                Full Blueprint Content (min 200 chars) *
              </label>
              <span className="text-[11px] font-mono text-[#A78BFA]">
                {wordCount} words • {content.length} chars
              </span>
            </div>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full skill instructions, physical habits, dialogue rules, and contradiction principles here."
              className="w-full p-4 rounded-xl bg-secondary-app border border-app text-sm font-mono text-primary-app leading-relaxed focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <button
            type="submit"
            disabled={publishing}
            className="vn-button-primary w-full py-3 text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publish Template to Marketplace</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
