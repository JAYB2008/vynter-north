"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Loader2, Layers } from "lucide-react";
import { SkillTemplate } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function CreatorSkillsPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SkillTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ templates: SkillTemplate[] }>(`/api/skills?creator_id=${user.id}`).then((res) => {
      setLoading(false);
      if (res.ok && res.data.templates) {
        setTemplates(res.data.templates);
      }
    });
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Creator Studio
          </span>
          <h1 className="font-serif text-3xl text-[var(--text)] mt-1">
            My Published Blueprints
          </h1>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Manage your behavioral building blocks and templates.
          </p>
        </div>

        <Link
          href="/dashboard/skills/new"
          className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Publish New Blueprint
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="py-20 text-center text-xs text-[var(--text-dim)]">
          You haven't published any skill blueprints yet.
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <span className="font-serif text-xl text-[var(--text)] block leading-tight">
                  {tmpl.title}
                </span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  {tmpl.category} • {tmpl.word_count} words • {tmpl.installs} installs
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[var(--text)]">
                  {tmpl.price_cents === 0 ? "Free" : `$${(tmpl.price_cents / 100).toFixed(2)}`}
                </span>
                <Link
                  href={`/skills/${tmpl.id}`}
                  className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] hover:border-[var(--glacier)]"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
