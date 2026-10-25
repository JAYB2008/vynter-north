import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterById } from "@/lib/db";
import {
  Sparkles,
  Film,
  ArrowLeft,
  Activity,
  Smile,
  MessageSquare,
  Quote,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacterById(id);

  if (!character) {
    notFound();
  }

  const s = character.skills;
  const createdDate = new Date(character.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        href="/characters"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all characters
      </Link>

      {/* Header Profile Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-white via-white to-purple-50/30 border border-slate-200 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-[#7C3AED] border border-purple-200">
                {s?.core_trait || "Dynamic"}
              </span>
              <span className="text-xs text-slate-500">Registered {createdDate}</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">
              {character.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              {character.description || s?.vibe_summary || "Character registered with verified psychological behavioral architecture."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            <Link
              href={`/studio?character=${character.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/20 transition-all text-center"
            >
              <Film className="w-4 h-4" />
              Go to Video Studio
            </Link>

            <Link
              href={`/demo?character=${character.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm border border-slate-200 transition-all text-center"
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              Test This Character
            </Link>
          </div>
        </div>

        {/* Vibe Summary Banner */}
        {s?.vibe_summary && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3">
            <Quote className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-700 italic">
              &ldquo;{s.vibe_summary}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Skills Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Physical Style */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 text-slate-900">
            <Activity className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800">
              Physical Style
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Resting Expression</span>
              <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.resting_expression || "Neutral"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Movement Style</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.movement_style || "Unspecified"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Signature Gesture</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.signature_gesture || "Unspecified"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Stress Reaction</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.stress_reaction || "Unspecified"}
              </p>
            </div>
          </div>
        </div>

        {/* Personality Profile */}
        <div className="p-6 rounded-2xl bg-white border border-purple-200 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-purple-100 text-[#7C3AED]">
            <Smile className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-[#7C3AED]">
              Personality Profile
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Core & Secondary Trait</span>
              <p className="font-semibold text-slate-900 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                {s?.core_trait || "Dynamic"}{s?.secondary_trait ? ` • ${s.secondary_trait}` : ""}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Handling Danger</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.handles_danger || "Unspecified"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">What Makes Them Laugh</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.what_makes_laugh || "Unspecified"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">What Makes Them Angry</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.what_makes_angry || "Unspecified"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Hidden Quality</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.hidden_quality || "Unspecified"}
              </p>
            </div>
          </div>
        </div>

        {/* Dialogue Style */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 text-slate-900">
            <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800">
              Dialogue Style
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Speaking Pace</span>
              <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.speaking_pace || "Normal"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Humor Style</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.humor_style || "Dry/Sarcastic"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Language Mixing</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {s?.language_mixing || "None"}
              </p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Catchphrase / Habit</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                &ldquo;{s?.catchphrase || "None defined"}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
