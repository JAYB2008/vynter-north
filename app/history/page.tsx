import { getAllGenerationLogs } from "@/lib/db";
import { HistoryItemClient } from "@/components/HistoryItemClient";
import {
  History,
  BarChart3,
  Layers,
  Users,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const logs = await getAllGenerationLogs();

  // Metrics computation for Prompt 6 Test Results section
  const totalGenerations = logs.length;

  let totalOriginalWords = 0;
  let totalEnrichedWords = 0;
  const testedCharactersSet = new Set<string>();

  logs.forEach((log) => {
    const origWords = log.original_prompt.trim().split(/\s+/).length;
    const enrichWords = log.enriched_prompt.trim().split(/\s+/).length;
    totalOriginalWords += origWords;
    totalEnrichedWords += enrichWords;
    if (log.character?.name) {
      testedCharactersSet.add(log.character.name);
    }
  });

  const avgOriginalWords =
    totalGenerations > 0 ? Math.round(totalOriginalWords / totalGenerations) : 0;
  const avgEnrichedWords =
    totalGenerations > 0 ? Math.round(totalEnrichedWords / totalGenerations) : 0;
  const avgMultiplier =
    totalOriginalWords > 0
      ? (totalEnrichedWords / totalOriginalWords).toFixed(1)
      : "0";

  const testedCharactersList = Array.from(testedCharactersSet);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-[#7C3AED]" />
            Generation History
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete audit log of scene prompts and Character Intelligence enrichments
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-[#7C3AED]">
          <Layers className="w-4 h-4 text-[#7C3AED]" />
          <span>{totalGenerations} Logged Generations</span>
        </div>
      </div>

      {/* Logs Feed */}
      {logs.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl bg-white border border-dashed border-slate-300 shadow-xs">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No generations recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Test the Character Intelligence Layer in the Video Studio to begin recording prompt enrichments and video generations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <HistoryItemClient key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* TEST RESULTS SECTION (As required by Prompt 6) */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#7C3AED]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">POC Test Results & Analytics</h2>
            <p className="text-xs text-slate-500">
              Quantitative validation metrics of prompt enrichment across tested characters
            </p>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Total Generations
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalGenerations}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
              Avg. Original Words
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-700">
              {avgOriginalWords}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
            <span className="text-[11px] font-bold uppercase text-[#7C3AED] block mb-1">
              Avg. Enriched Words
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#7C3AED]">
              {avgEnrichedWords}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <span className="text-[11px] font-bold uppercase text-purple-700 block mb-1">
              Enrichment Multiplier
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{avgMultiplier}x</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 inline" />
            </div>
          </div>
        </div>

        {/* Tested Characters List */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Users className="w-4 h-4 text-[#7C3AED]" />
            <span>Characters Tested in This Validation</span>
          </div>

          {testedCharactersList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {testedCharactersList.map((charName) => (
                <span
                  key={charName}
                  className="px-3 py-1 rounded-lg bg-white text-xs font-semibold text-[#7C3AED] border border-purple-200 shadow-xs"
                >
                  {charName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No characters tested yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
