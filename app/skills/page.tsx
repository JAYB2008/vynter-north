"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Plus,
  Check,
  X,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { SkillTemplate, SkillCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = [
  { id: "All", label: "All" },
  { id: "personality", label: "Personality Types" },
  { id: "movement", label: "Movement Styles" },
  { id: "dialogue", label: "Dialogue Systems" },
  { id: "full_template", label: "Full Templates" },
  { id: "genre", label: "Genre Packs" },
];

export default function SkillsPage() {
  const { user, role, isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [modalTemplate, setModalTemplate] = useState<SkillTemplate | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Creation form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SkillCategory>("personality");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/skills${selectedCategory !== "All" ? `?category=${selectedCategory}` : ""}`
      );
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (e) {
      console.warn("Failed to fetch templates", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !content) return;

    setCreating(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          content,
          price: isFree ? 0 : Number(price),
          is_free: isFree,
          creator_id: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Skill template published to marketplace!");
      setCreateModalOpen(false);
      setTitle("");
      setDescription("");
      setContent("");
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish template");
    } finally {
      setCreating(false);
    }
  };

  const handleUseOrBuy = (t: SkillTemplate) => {
    navigator.clipboard.writeText(t.content);
    toast.success(`Template content copied for use in character creation!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-app pb-8">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#7C3AED] uppercase">
            Prompt Engineering Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-app tracking-tight mt-1">
            Character Skill Templates
          </h1>
          <p className="text-sm text-secondary-app max-w-2xl mt-1.5">
            Pre-written personality templates, dialogue systems, and behavioral frameworks created by experienced character builders.
          </p>
        </div>

        {role === "creator" && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="vn-button-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Template</span>
          </button>
        )}
      </div>

      {/* Creator Banner */}
      {role === "creator" && (
        <div className="vn-card p-6 border-[#7C3AED]/30 bg-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-[#A78BFA] shrink-0">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-app">
                Share Your Character Engineering Expertise
              </h3>
              <p className="text-xs text-secondary-app">
                Sell skill templates and earn royalties every time studios use your behavioral frameworks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="vn-button-primary px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer"
          >
            Create Template
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-app">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-sm"
                  : "bg-card-app border-app text-secondary-app hover:text-primary-app hover:border-[#7C3AED]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vn-card h-64 animate-pulse bg-elevated-app/50 border-app" />
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div key={t.id} className="vn-card p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-[#A78BFA] border border-purple-500/20">
                    {t.category}
                  </span>
                  <span className="text-xs font-extrabold text-primary-app">
                    {t.is_free ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      formatCurrency(t.price)
                    )}
                  </span>
                </div>

                <h3 className="text-base font-bold text-primary-app leading-tight">
                  {t.title}
                </h3>
                <p className="text-xs text-secondary-app line-clamp-2">
                  {t.description}
                </p>

                {/* Snippet preview */}
                <div className="p-2.5 rounded-lg bg-elevated-app border border-app text-[11px] text-muted-app font-mono line-clamp-2">
                  "{t.content}"
                </div>
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-between">
                <span className="text-[11px] text-muted-app">
                  {t.purchases} uses
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalTemplate(t)}
                    className="px-2.5 py-1.5 rounded-md border border-app hover:border-[#7C3AED] text-xs font-semibold text-secondary-app hover:text-primary-app"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleUseOrBuy(t)}
                    className="vn-button-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>{t.is_free ? "Use Free" : `Buy ${formatCurrency(t.price)}`}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vn-card p-12 text-center text-secondary-app">
          No templates found in this category.
        </div>
      )}

      {/* Preview Modal */}
      {modalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="vn-card w-full max-w-lg p-6 bg-card-app border-app shadow-2xl relative flex flex-col gap-4">
            <button
              onClick={() => setModalTemplate(null)}
              className="absolute top-4 right-4 text-muted-app hover:text-primary-app"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-[#A78BFA] uppercase">
                {modalTemplate.category}
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {modalTemplate.is_free ? "Free" : formatCurrency(modalTemplate.price)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-primary-app">
              {modalTemplate.title}
            </h3>
            <p className="text-xs text-secondary-app">
              {modalTemplate.description}
            </p>
            <div className="p-4 rounded-xl bg-elevated-app border border-app text-xs font-mono text-primary-app whitespace-pre-line max-h-60 overflow-y-auto">
              {modalTemplate.content}
            </div>
            <button
              onClick={() => {
                handleUseOrBuy(modalTemplate);
                setModalTemplate(null);
              }}
              className="vn-button-primary py-2.5 text-xs font-bold"
            >
              Copy Template for Character Creation
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTemplate}
            className="vn-card w-full max-w-lg p-6 bg-card-app border-app shadow-2xl relative flex flex-col gap-4"
          >
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-muted-app hover:text-primary-app"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-primary-app">
              Publish Character Skill Template
            </h3>

            <div>
              <label className="text-xs font-semibold text-secondary-app block mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. High-Tension Interrogation Dialogue Framework"
                className="vn-input w-full p-2.5 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary-app block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="vn-input w-full p-2.5 text-xs"
              >
                <option value="personality">Personality Types</option>
                <option value="movement">Movement Styles</option>
                <option value="dialogue">Dialogue Systems</option>
                <option value="full_template">Full Templates</option>
                <option value="genre">Genre Packs</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary-app block mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of how this template elevates character performances..."
                className="vn-input w-full p-2.5 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary-app block mb-1">
                Skill / Prompt Template Content
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the precise behavioral rules, dialect traits, or movement cues..."
                className="vn-input w-full p-2.5 text-xs font-mono"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-primary-app cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded text-[#7C3AED]"
                />
                <span>Offer For Free</span>
              </label>

              {!isFree && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-secondary-app">Price ($):</span>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="vn-input w-20 p-1.5 text-xs"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="vn-button-primary py-2.5 text-xs font-bold mt-2"
            >
              {creating ? "Publishing..." : "Publish to Marketplace"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
