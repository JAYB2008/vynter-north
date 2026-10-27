"use client";

import Link from "next/link";
import { Star, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Character } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  onTryDemo?: (character: Character) => void;
}

export function CharacterCard({ character, onTryDemo }: CharacterCardProps) {
  const getGradient = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("cairo")) return "from-purple-600 via-indigo-600 to-violet-900";
    if (n.includes("sable")) return "from-cyan-600 via-blue-700 to-slate-900";
    if (n.includes("drew")) return "from-amber-500 via-orange-600 to-rose-800";
    if (n.includes("nyx")) return "from-fuchsia-600 via-pink-600 to-purple-900";
    return "from-violet-600 via-indigo-700 to-slate-900";
  };

  const priceText = character.is_free
    ? "Free"
    : character.rental_price_daily > 0
    ? `From ${formatCurrency(character.rental_price_daily)}/day`
    : character.purchase_price
    ? `${formatCurrency(character.purchase_price)} purchase`
    : "Rental only";

  return (
    <div className="vn-card overflow-hidden flex flex-col group">
      {/* Top Banner / Avatar */}
      <div className="relative h-48 w-full overflow-hidden bg-elevated-app">
        {character.avatar_url ? (
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-tr ${getGradient(
              character.name
            )} flex items-center justify-center`}
          >
            <span className="text-4xl font-black text-white/90 tracking-tighter">
              {character.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Fame Score Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>{character.fame_score}</span>
        </div>

        {/* CVR ID pill */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-medium text-white/80">
          {character.id}
        </div>

        {/* Name and Vibe on bottom of image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white leading-tight">
            {character.name}
          </h3>
          <p className="text-xs text-purple-200 italic line-clamp-1 mt-0.5">
            "{character.vibe_summary}"
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1.5">
          {character.genres.slice(0, 3).map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-elevated-app text-secondary-app border border-app"
            >
              {g}
            </span>
          ))}
          {character.genres.length > 3 && (
            <span className="text-[10px] text-muted-app self-center">
              +{character.genres.length - 3}
            </span>
          )}
        </div>

        {/* Description preview */}
        <p className="text-xs text-secondary-app line-clamp-2">
          {character.description}
        </p>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-app flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-muted-app block uppercase tracking-wider font-semibold">
              Access
            </span>
            <span className="text-sm font-extrabold text-primary-app">
              {priceText}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onTryDemo ? (
              <button
                onClick={() => onTryDemo(character)}
                className="px-2.5 py-1.5 rounded-md border border-app hover:border-[#7C3AED] bg-elevated-app text-xs font-semibold text-secondary-app hover:text-primary-app flex items-center gap-1 transition-all"
                title="Test with demo scene"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Demo</span>
              </button>
            ) : (
              <Link
                href={`/demo?character=${encodeURIComponent(character.name)}`}
                className="px-2.5 py-1.5 rounded-md border border-app hover:border-[#7C3AED] bg-elevated-app text-xs font-semibold text-secondary-app hover:text-primary-app flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Demo</span>
              </Link>
            )}

            <Link
              href={`/marketplace/${character.id}`}
              className="px-3 py-1.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
