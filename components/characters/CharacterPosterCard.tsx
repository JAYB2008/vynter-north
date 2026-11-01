"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Heart, Check, Sparkles, Film } from "lucide-react";
import { Character, FameTier } from "@/lib/types";

interface CharacterPosterCardProps {
  character: Character;
  isSaved?: boolean;
  onToggleSave?: (characterId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (characterId: string) => void;
  onQuickTry?: (character: Character) => void;
}

export function CharacterPosterCard({
  character,
  isSaved = false,
  onToggleSave,
  isCompared = false,
  onToggleCompare,
  onQuickTry,
}: CharacterPosterCardProps) {
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const portrait = character.portrait_url || character.avatar_url;

  // Fame Tier Mark
  const getFameGlyph = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "legend":
        return "✦";
      case "veteran":
        return "★";
      case "established":
        return "◆";
      case "rising":
        return "▲";
      default:
        return "●";
    }
  };

  const fameDisplay = `${getFameGlyph(character.fame_tier)} ${
    character.fame_tier.charAt(0).toUpperCase() + character.fame_tier.slice(1)
  }`;

  // Price formatting
  const priceDisplay = character.is_free
    ? "Free"
    : character.price_daily_cents > 0
    ? `From $${(character.price_daily_cents / 100).toFixed(0)}/day`
    : character.sale_enabled && character.sale_price_cents
    ? `$${(character.sale_price_cents / 100).toFixed(0)} to buy`
    : "Rental only";

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onToggleSave) onToggleSave(character.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCompare) onToggleCompare(character.id);
  };

  return (
    <div className="group relative flex flex-col transition-transform duration-200 focus-within:ring-2 focus-within:ring-[var(--glacier)] outline-none rounded-[2px]">
      {/* 4:5 Poster */}
      <Link
        href={`/characters/${character.id}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-[var(--panel)] border border-[var(--line)] rounded-[2px]"
      >
        {portrait && !imgError ? (
          <img
            src={portrait}
            alt={character.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[var(--panel-raised)] to-[var(--night)] text-[var(--text-dim)]">
            <span className="font-serif text-4xl text-[var(--text)] tracking-wider">
              {character.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="mt-2 text-xs font-mono text-[var(--text-dim)]">
              {character.id}
            </span>
          </div>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--night)]/90 via-transparent to-black/30 pointer-events-none" />

        {/* Top-Right: Fame Tier Mark */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[2px] bg-[var(--night)]/85 backdrop-blur-md border border-[var(--line)] text-[11px] font-medium text-[var(--marquee)] flex items-center gap-1.5 shadow-sm">
          <span>{fameDisplay}</span>
          <span className="text-[10px] text-[var(--text-dim)] font-mono">
            {character.fame_score}
          </span>
        </div>

        {/* Top-Left: Trial or Sale Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {character.trial_enabled && !character.is_free && (
            <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--glacier)] text-[var(--glacier-ink)] text-[10px] font-semibold tracking-wide uppercase">
              3-Day Trial
            </span>
          )}
          {character.is_demo && (
            <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--panel-raised)] text-[var(--text)] border border-[var(--line)] text-[10px] font-medium">
              Demo character
            </span>
          )}
        </div>

        {/* Bottom Actions on Hover */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-between pointer-events-auto">
          {onQuickTry ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickTry(character);
              }}
              className="px-2.5 py-1.5 bg-[var(--glacier)] text-[var(--glacier-ink)] rounded-[2px] text-xs font-medium hover:brightness-110 flex items-center gap-1 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try character
            </button>
          ) : (
            <span className="px-2.5 py-1.5 bg-[var(--panel-raised)] text-[var(--text)] border border-[var(--line)] rounded-[2px] text-xs font-medium">
              View character
            </span>
          )}

          <div className="flex items-center gap-1">
            {onToggleCompare && (
              <button
                type="button"
                onClick={handleCompareClick}
                title="Compare character"
                className={`p-1.5 rounded-[2px] border backdrop-blur-md transition-colors ${
                  isCompared
                    ? "bg-[var(--glacier)] border-[var(--glacier)] text-[var(--glacier-ink)]"
                    : "bg-[var(--night)]/80 border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveClick}
              title={saved ? "Remove from saved" : "Save character"}
              className={`p-1.5 rounded-[2px] border backdrop-blur-md transition-colors ${
                saved
                  ? "bg-[var(--bad)]/20 border-[var(--bad)] text-[var(--bad)]"
                  : "bg-[var(--night)]/80 border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>
      </Link>

      {/* Credit Section Under the Poster */}
      <div className="pt-2.5 pb-1 flex flex-col">
        {/* Slate: Registration ID */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-dim)] font-mono">
          <span>{character.id}</span>
          <span className="text-[var(--text-dim)]">
            {character.genres?.[0] || "Drama"}
          </span>
        </div>

        {/* Character Name in Display Serif */}
        <Link
          href={`/characters/${character.id}`}
          className="font-serif text-2xl text-[var(--text)] leading-tight mt-0.5 hover:text-[var(--glacier)] transition-colors line-clamp-1"
        >
          {character.name}
        </Link>

        {/* Vibe Summary */}
        <p className="text-xs text-[var(--text-dim)] line-clamp-1 mt-0.5">
          {character.vibe_summary || character.tagline || "Original character"}
        </p>

        {/* Price & Rating Bar */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--line)] text-xs">
          <span className="font-medium text-[var(--text)]">{priceDisplay}</span>

          <div className="flex items-center gap-1 text-[var(--text-dim)]">
            {character.review_count > 0 ? (
              <>
                <Star className="w-3.5 h-3.5 fill-[var(--marquee)] text-[var(--marquee)]" />
                <span className="font-medium text-[var(--text)]">
                  {character.rating_avg.toFixed(1)}
                </span>
                <span className="text-[10px]">({character.review_count})</span>
              </>
            ) : (
              <span className="text-[11px] text-[var(--text-dim)]">Unrated</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility export
export { CharacterPosterCard as CharacterCard };
