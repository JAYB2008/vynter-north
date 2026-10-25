import Link from "next/link";
import { getAllCharacters } from "@/lib/db";
import { Plus, User, Sparkles, Film, ArrowRight, Shield, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const characters = await getAllCharacters();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Registered Characters
          </h1>
          <p className="text-sm text-slate-600">
            AI characters with verified psychological profiles and behavioral skillsets
          </p>
        </div>

        <Link
          href="/characters/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Character
        </Link>
      </div>

      {/* Grid or Empty State */}
      {characters.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 rounded-2xl bg-white my-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#7C3AED]">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No characters found</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Get started by creating your first AI character with physical styles, personality traits, and dialogue directions.
          </p>
          <Link
            href="/characters/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Character
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {characters.map((char) => {
            const skills = char.skills;
            const coreTrait = skills?.core_trait || "Dynamic";
            const vibe = skills?.vibe_summary || char.description || "Character with calibrated behavioral parameters.";
            const createdDate = new Date(char.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={char.id}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200 hover:border-[#7C3AED]/60 p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#7C3AED] border border-purple-200">
                      <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                      {coreTrait}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {createdDate}
                    </span>
                  </div>

                  {/* Character Name */}
                  <Link href={`/characters/${char.id}`} className="block group-hover:text-[#7C3AED] transition-colors">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {char.name}
                    </h2>
                  </Link>

                  {/* Vibe Summary */}
                  <p className="text-sm text-slate-700 line-clamp-3 mb-4 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Vibe Summary</span>
                    {vibe}
                  </p>

                  {/* Key Traits preview */}
                  {skills && (
                    <div className="space-y-2 text-xs mb-6">
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Resting Expression:</span>
                        <span className="font-semibold text-slate-800">{skills.resting_expression || "Neutral"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Speaking Pace:</span>
                        <span className="font-semibold text-slate-800">{skills.speaking_pace || "Normal"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-500">Humor Style:</span>
                        <span className="font-semibold text-slate-800">{skills.humor_style || "Dry"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
                  <Link
                    href={`/characters/${char.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    View Skills
                  </Link>
                  <Link
                    href={`/studio?character=${char.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white border border-purple-200 transition-all"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Test in Studio</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
