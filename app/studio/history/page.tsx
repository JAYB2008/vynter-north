"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Copy, Check, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Generation } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function StudioHistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ generations: Generation[] }>("/api/history").then((res) => {
      setLoading(false);
      if (res.ok && res.data.generations) {
        setGenerations(res.data.generations);
      }
    });
  }, []);

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        <p className="text-xs text-[var(--text-dim)] mt-3">Loading production generation logs…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="pb-4 border-b border-[var(--line)]">
        <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
          Audit & Export
        </span>
        <h1 className="font-serif text-3xl text-[var(--text)] mt-1">
          Enrichment Generation History
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Complete log of scene enrichments produced via web workspace and remote MCP calls.
        </p>
      </div>

      {generations.length === 0 ? (
        <div className="py-20 text-center text-xs text-[var(--text-dim)]">
          No scene generations recorded yet. Use the workspace or connect via MCP to enrich scenes.
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-3 text-xs"
            >
              <div className="flex items-center justify-between text-[var(--text-dim)] pb-2 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text)]">
                    {gen.character_id}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--panel-raised)] text-[10px] uppercase font-mono">
                    {gen.source}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                      gen.status === "kept"
                        ? "bg-[var(--ok)]/15 text-[var(--ok)]"
                        : "bg-[var(--line)] text-[var(--text-dim)]"
                    }`}
                  >
                    {gen.status}
                  </span>
                </div>
                <span className="font-mono text-[11px]">
                  {new Date(gen.created_at).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[var(--text-dim)] uppercase block mb-0.5">
                  Input Scene:
                </span>
                <p className="text-[var(--text-dim)] italic">"{gen.scene_text}"</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-[var(--text)] uppercase">
                    Enriched Acting Direction:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyPrompt(gen.id, gen.enriched_prompt || "")}
                    className="text-[var(--glacier)] hover:underline flex items-center gap-1"
                  >
                    {copiedId === gen.id ? (
                      <Check className="w-3 h-3 text-[var(--ok)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy prompt
                  </button>
                </div>
                <p className="text-[var(--text)] leading-relaxed whitespace-pre-wrap font-sans">
                  {gen.enriched_prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
