"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Plus,
  Check,
  X,
  ArrowRight,
  Download,
  Copy,
  BookOpen,
  User,
  Tag,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { SkillTemplate, SkillCategory } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = [
  { id: "All", label: "All" },
  { id: "personality", label: "Personality Types" },
  { id: "movement", label: "Movement Styles" },
  { id: "dialogue", label: "Dialogue Systems" },
  { id: "genre_pack", label: "Genre Packs" },
  { id: "full_template", label: "Full Templates" },
];

export default function SkillsMarketplacePage() {
  const { user, role, isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Template Preview Modal
  const [activeModalTemplate, setActiveModalTemplate] = useState<SkillTemplate | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/skills${selectedCategory !== "All" ? `?category=${selectedCategory}` : ""}`
      );
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch {
      toast.error("Failed to load skill templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const handleGetTemplate = (tpl: SkillTemplate) => {
    if (!downloadedIds.includes(tpl.id)) {
      setDownloadedIds([...downloadedIds, tpl.id]);
    }
    navigator.clipboard.writeText(tpl.content);
    setCopiedId(tpl.id);
    toast.success(`Template '${tpl.title}' copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "personality":
        return "bg-purple-500/15 text-[#A78BFA] border-purple-500/30";
      case "movement":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "dialogue":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "genre_pack":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "full_template":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-purple-500/15 text-[#A78BFA] border-purple-500/30";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-1.5 border-b border-app pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
          Skill Frameworks
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-primary-app tracking-tight">
          Character Skill Templates
        </h1>
        <p className="text-sm text-secondary-app max-w-2xl">
          Pre-written personality frameworks, dialogue systems, and behavioral blueprints by experienced character builders.
        </p>
      </div>

      {/* Creator CTA (if logged in as creator) */}
      {role === "creator" && (
        <div className="vn-card p-6 rounded-2xl bg-gradient-to-r from-[#14142A] via-[#1C1C35] to-[#14142A] border border-[#7C3AED]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-primary-app">
              Share Your Expertise
            </h3>
            <p className="text-xs sm:text-sm text-secondary-app">
              Publish character blueprints and skill templates to help the community build consistent characters.
            </p>
          </div>

          <Link
            href="/skills/new"
            className="vn-button-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </Link>
        </div>
      )}

      {/* Category Tabs: All | Personality Types | Movement Styles | Dialogue Systems | Genre Packs | Full Templates */}
      <div className="flex items-center gap-2 border-b border-app pb-3 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#7C3AED] text-white shadow-sm font-bold"
                  : "bg-card-app text-secondary-app hover:text-primary-app hover:bg-elevated-app border border-app"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
          <span className="text-xs text-secondary-app">Loading blueprints...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card-app border border-dashed border-app flex flex-col items-center gap-3">
          <Layers className="w-10 h-10 text-muted-app" />
          <h3 className="text-base font-bold text-primary-app">No templates found</h3>
          <p className="text-xs text-secondary-app">
            Be the first to create and publish a template for this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const isDownloaded = downloadedIds.includes(tpl.id);
            const isCopied = copiedId === tpl.id;

            return (
              <div
                key={tpl.id}
                className="vn-card p-6 flex flex-col justify-between space-y-4 group hover:border-[#7C3AED]/70 transition-all"
              >
                <div className="space-y-3">
                  {/* Category badge + Price */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider capitalize ${getCategoryColor(
                        tpl.category
                      )}`}
                    >
                      {tpl.category.replace("_", " ")}
                    </span>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      FREE
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-primary-app group-hover:text-[#A78BFA] transition-colors">
                    {tpl.title}
                  </h3>

                  {/* Creator name + word count badge */}
                  <div className="flex items-center justify-between text-xs text-secondary-app pt-1">
                    <span className="flex items-center gap-1.5 font-medium truncate">
                      <User className="w-3.5 h-3.5 text-muted-app" />
                      <span>{tpl.creator?.display_name || "Community Architect"}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded bg-elevated-app border border-app text-[11px] font-mono text-muted-app shrink-0">
                      {tpl.word_count || 420} words
                    </span>
                  </div>

                  {/* Preview text (200 chars then ...) */}
                  <p className="text-xs text-secondary-app leading-relaxed line-clamp-3">
                    {tpl.preview_text || tpl.description}
                  </p>

                  {/* Tags */}
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tpl.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary-app text-muted-app border border-app"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Preview button & Get Template / Download Free */}
                <div className="pt-4 border-t border-app flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalTemplate(tpl)}
                    className="px-3.5 py-2 rounded-xl border border-app bg-elevated-app hover:border-[#7C3AED] text-xs font-semibold text-secondary-app hover:text-primary-app transition-colors cursor-pointer"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGetTemplate(tpl)}
                    className="vn-button-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Free</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TEMPLATE PREVIEW MODAL ================= */}
      {activeModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="vn-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative border-[#7C3AED]/50">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-elevated-app text-secondary-app hover:text-primary-app"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider capitalize ${getCategoryColor(
                    activeModalTemplate.category
                  )}`}
                >
                  {activeModalTemplate.category.replace("_", " ")}
                </span>
                <span className="text-xs font-mono text-muted-app">
                  {activeModalTemplate.word_count || 420} words
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  FREE
                </span>
              </div>

              <h2 className="text-2xl font-black text-primary-app">
                {activeModalTemplate.title}
              </h2>
              <p className="text-xs text-secondary-app">
                Created by {activeModalTemplate.creator?.display_name || "Community Architect"}
              </p>
            </div>

            {/* What it includes */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-app">
                What it includes
              </h4>
              <p className="text-xs sm:text-sm text-secondary-app leading-relaxed">
                {activeModalTemplate.description}
              </p>
            </div>

            {/* Preview text (300 chars) */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-app">
                Blueprint Preview
              </h4>
              <div className="p-4 rounded-xl bg-secondary-app border border-app text-xs font-mono text-primary-app leading-relaxed select-all">
                {activeModalTemplate.preview_text ||
                  activeModalTemplate.content.slice(0, 300) + "..."}
              </div>
            </div>

            {/* Compatible Genres / Tags */}
            {activeModalTemplate.tags && activeModalTemplate.tags.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-app">
                  Compatible Genres
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalTemplate.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-elevated-app border border-app text-secondary-app"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Free / Copy Full Content */}
            <div className="pt-4 border-t border-app flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveModalTemplate(null)}
                className="px-4 py-2 rounded-xl border border-app bg-elevated-app text-xs font-semibold text-secondary-app hover:text-primary-app"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleGetTemplate(activeModalTemplate)}
                className="vn-button-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Free & Copy Full Blueprint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
