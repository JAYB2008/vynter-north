"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { Character } from "@/lib/types";
import { CharacterPosterCard } from "@/components/characters/CharacterPosterCard";
import { apiFetch } from "@/lib/api";

export default function StudioSavedPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all active characters as a baseline
    apiFetch<{ characters: Character[] }>("/api/characters").then((res) => {
      setLoading(false);
      if (res.ok && res.data.characters) {
        setCharacters(res.data.characters.slice(0, 4));
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="pb-4 border-b border-[var(--line)]">
        <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
          Bookmarks
        </span>
        <h1 className="font-serif text-3xl text-[var(--text)] mt-1">
          Saved Characters
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Characters shortlisted for future film, commercial, or game productions.
        </p>
      </div>

      {characters.length === 0 ? (
        <div className="py-20 text-center text-xs text-[var(--text-dim)]">
          No saved characters. Browse the marketplace and tap the heart icon on any poster.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.map((c) => (
            <CharacterPosterCard key={c.id} character={c} isSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
}
