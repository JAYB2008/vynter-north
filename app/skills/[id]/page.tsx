"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Download,
  Copy,
  Check,
  ArrowLeft,
  User,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SkillTemplate } from "@/lib/types";

export default function SkillTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [template, setTemplate] = useState<SkillTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => {
        if (d.templates) {
          const found = d.templates.find((t: SkillTemplate) => t.id === id);
          if (found) setTemplate(found);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    if (!template) return;
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    toast.success("Blueprint copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary-app">Template Not Found</h2>
        <Link href="/skills" className="vn-button-primary px-4 py-2 text-xs font-semibold">
          Back to Skills
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/skills"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Skill Templates</span>
      </Link>

      <div className="vn-card p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-[#A78BFA]">
              {template.category.replace("_", " ")}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
              FREE
            </span>
          </div>

          <h1 className="text-3xl font-black text-primary-app">
            {template.title}
          </h1>

          <p className="text-sm text-secondary-app">{template.description}</p>
        </div>

        {/* Full Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-app">
              Full Template Content
            </span>
            <button
              onClick={handleCopy}
              className="vn-button-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Content"}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-secondary-app border border-app text-xs font-mono text-primary-app leading-relaxed select-all overflow-x-auto whitespace-pre-wrap">
            {template.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
