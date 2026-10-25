"use client";

import { useState } from "react";
import { GenerationLog } from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export function HistoryItemClient({ log }: { log: GenerationLog }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const characterName = log.character?.name || "AI Character";
  const createdDate = new Date(log.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Truncation
  const origTruncated =
    log.original_prompt.length > 100
      ? log.original_prompt.slice(0, 100) + "..."
      : log.original_prompt;

  const enrichTruncated =
    log.enriched_prompt.length > 150
      ? log.enriched_prompt.slice(0, 150) + "..."
      : log.enriched_prompt;

  const origWords = log.original_prompt.trim().split(/\s+/).length;
  const enrichWords = log.enriched_prompt.trim().split(/\s+/).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(log.enriched_prompt);
    setHasCopied(true);
    toast.success("Enriched prompt copied!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all p-6 space-y-4 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          <h3 className="font-bold text-slate-900 text-base">{characterName}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            {origWords} words → {enrichWords} words
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{createdDate}</span>
        </div>
      </div>

      {/* Summary Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Original preview */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Original Scene Prompt
          </span>
          <p className="text-slate-700 italic line-clamp-2">
            &ldquo;{origTruncated}&rdquo;
          </p>
        </div>

        {/* Enriched preview */}
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
          <span className="font-bold text-[#7C3AED] uppercase tracking-wider block mb-1">
            Enriched Prompt Preview
          </span>
          <p className="text-purple-950 line-clamp-2">
            &ldquo;{enrichTruncated}&rdquo;
          </p>
        </div>
      </div>

      {/* Embedded Video Player if video_url exists */}
      {log.video_url && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black max-w-md mx-auto aspect-video shadow-sm">
          <video
            src={log.video_url}
            controls
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Expand/Collapse Section */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors cursor-pointer"
        >
          <span>{isExpanded ? "Hide Details" : "View Full Details"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Original Prompt */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Original Prompt
                </span>
                <span className="text-[11px] text-slate-500">{origWords} words</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {log.original_prompt}
              </p>
            </div>

            {/* Full Enriched Prompt */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                  Full Enriched Prompt
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-purple-700 font-medium">{enrichWords} words</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-purple-100 text-[#7C3AED] transition-colors"
                    title="Copy full prompt"
                  >
                    {hasCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-purple-950 whitespace-pre-wrap leading-relaxed font-sans">
                {log.enriched_prompt}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
