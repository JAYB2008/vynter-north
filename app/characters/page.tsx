import Link from "next/link";
import { CHARACTERS } from "@/lib/characters";
import { Sparkles, ArrowRight, ShieldCheck, Film, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CharactersPage() {
  const characters = CHARACTERS;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#2D2D4E]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A2E] border border-[#2D2D4E] text-[#A78BFA] text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Character Registry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F9FAFB]">
            Verified AI Characters
          </h1>
          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl">
            Pre-registered AI talent with encrypted behavioral parameters,
            movement habits, and crisis reactions.
          </p>
        </div>

        <Link
          href="/demo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-[#7C3AED]/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Studio Demo</span>
        </Link>
      </div>

      {/* Grid of Character Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {characters.map((char) => (
          <div
            key={char.id}
            className="p-8 rounded-3xl bg-[#1A1A2E] border border-[#2D2D4E] flex flex-col justify-between space-y-6 hover:border-[#7C3AED]/70 transition-all duration-300 hover:-translate-y-1 shadow-2xl relative overflow-hidden group"
          >
            {/* Top ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#7C3AED]/20 transition-all" />

            <div className="space-y-5 relative z-10">
              {/* Header: Face Placeholder (gradient avatar with initials) & CVR ID */}
              <div className="flex items-center justify-between">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${
                    char.avatar_gradient || "from-purple-600 to-indigo-800"
                  } flex items-center justify-center text-white font-black text-xl shadow-lg`}
                >
                  {char.avatar_initials || char.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#0F0F1A] border border-[#2D2D4E] text-[#A78BFA] block">
                    {char.id}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                    ● Active — Available
                  </span>
                </div>
              </div>

              {/* Name & Vibe summary */}
              <div>
                <h2 className="text-2xl font-black text-[#F9FAFB] tracking-tight group-hover:text-[#A78BFA] transition-colors">
                  {char.name}
                </h2>
                <p className="text-xs text-[#A78BFA] italic mt-1 font-medium">
                  &ldquo;{char.vibe_summary}&rdquo;
                </p>
              </div>

              {/* Core Trait */}
              <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#2D2D4E] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                  Core Trait
                </span>
                <p className="text-xs text-[#F9FAFB] leading-relaxed line-clamp-3">
                  {char.core_trait}
                </p>
              </div>

              {/* Genre chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">
                  Allowed Genres
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {char.allowed_genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#0F0F1A] border border-[#2D2D4E] text-[#F9FAFB]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="pt-4 border-t border-[#2D2D4E] flex items-center gap-3 relative z-10">
              <Link
                href={`/characters/${char.id}`}
                className="flex-1 text-center py-2.5 px-4 rounded-xl bg-[#0F0F1A] hover:bg-[#252542] text-xs font-semibold text-[#F9FAFB] border border-[#2D2D4E] transition-colors"
              >
                View Profile
              </Link>

              <Link
                href={`/demo?character=${char.id}`}
                className="py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-[#7C3AED]/25 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try This Character</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
