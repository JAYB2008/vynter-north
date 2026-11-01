"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Download,
  BookOpen,
  Tag,
  Check,
  Loader2,
} from "lucide-react";
import { SkillTemplate } from "@/lib/types";
import { apiFetch } from "@/lib/api";

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "personality", label: "Personality Types" },
  { id: "movement", label: "Movement Styles" },
  { id: "dialogue", label: "Dialogue Systems" },
  { id: "genre_pack", label: "Genre Packs" },
  { id: "full_template", label: "Full Sheets" },
];

export default function SkillsMarketplacePage() {
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const loadTemplates = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (search.trim()) params.set("search", search.trim());

    const res = await apiFetch<{ templates: SkillTemplate[] }>(
      `/api/skills?${params.toString()}`
    );
    setLoading(false);
    if (res.ok && res.data.templates) {
      setTemplates(res.data.templates);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTemplates();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Building Blocks
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[var(--text)] mt-1">
            Skills & Personality Blueprints
          </h1>
          <p className="text-sm text-[var(--text-dim)] max-w-2xl mt-1">
            Modular behavioral modules for character sheets: speech patterns, combat movement styles, and genre archetypes ($0–$15).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/skills/new"
            className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Publish Blueprint
          </Link>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto p-1 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-[5px] font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-[var(--panel-raised)] text-[var(--text)] font-semibold shadow-sm"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints…"
            className="w-full pl-9 pr-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
          />
        </form>
      </div>

      {/* Grid of Templates (Section 7.5: shows "adds:" first two bullets) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-56 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <Layers className="w-10 h-10 mx-auto text-[var(--text-dim)]" />
          <h3 className="font-serif text-2xl text-[var(--text)]">No Templates Found</h3>
          <p className="text-xs text-[var(--text-dim)]">
            No blueprints match your filter criteria. Be the first to share a modular personality or dialogue pack.
          </p>
          <Link
            href="/dashboard/skills/new"
            className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
          >
            Create a Blueprint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-[var(--glacier)] transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] font-mono text-[10px] uppercase">
                    {tmpl.category.replace("_", " ")}
                  </span>
                  <span className="font-mono text-sm font-bold text-[var(--text)]">
                    {tmpl.price_cents === 0 ? "Free" : `$${(tmpl.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>

                <Link
                  href={`/skills/${tmpl.id}`}
                  className="font-serif text-2xl text-[var(--text)] group-hover:text-[var(--glacier)] transition-colors block leading-tight"
                >
                  {tmpl.title}
                </Link>

                <p className="text-xs text-[var(--text-dim)] line-clamp-2 leading-relaxed">
                  {tmpl.summary}
                </p>

                {/* Section 7.5: "adds: the first two bullets" */}
                {tmpl.what_it_adds && tmpl.what_it_adds.length > 0 && (
                  <div className="pt-2 border-t border-[var(--line)] space-y-1 text-xs">
                    <span className="text-[11px] font-semibold text-[var(--glacier)] uppercase block">
                      Adds:
                    </span>
                    {tmpl.what_it_adds.slice(0, 2).map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[var(--text-dim)] text-[11px]">
                        <Check className="w-3 h-3 text-[var(--ok)] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--text-dim)]">
                <span className="font-mono text-[11px]">
                  {tmpl.word_count || 150} words • {tmpl.installs || 0} installs
                </span>
                <Link
                  href={`/skills/${tmpl.id}`}
                  className="text-[var(--glacier)] hover:underline font-semibold flex items-center gap-1"
                >
                  Inspect <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
