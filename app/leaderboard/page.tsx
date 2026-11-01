"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Trophy, ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

const GENRES = [
  "All",
  "Action",
  "Drama",
  "Thriller",
  "Comedy",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Adventure",
];

const TIERS = ["all", "newcomer", "rising", "established", "veteran", "legend"];

export default function LeaderboardPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedTier, setSelectedTier] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort", "fame");
    params.set("limit", "50");
    if (selectedGenre !== "All") params.set("genre", selectedGenre);
    if (selectedTier !== "all") params.set("tier", selectedTier);

    apiFetch<{ characters: Character[] }>(`/api/characters?${params.toString()}`).then(
      (res) => {
        setLoading(false);
        if (res.ok && res.data.characters) {
          setCharacters(res.data.characters);
        }
      }
    );
  }, [selectedGenre, selectedTier]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[var(--marquee)]" />
            Registry Standings
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Character Fame Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Top 50 original AI characters ranked by verified studio rentals, production usage, and critical reviews.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                Genre: {g}
              </option>
            ))}
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-xs text-[var(--text)] uppercase"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                Tier: {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table (Section 7.7) */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        </div>
      ) : characters.length === 0 ? (
        <div className="py-20 text-center text-xs text-[var(--text-dim)]">
          No characters found matching the selected filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--line)] rounded-[8px] bg-[var(--panel)] shadow-sm">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--panel-raised)] text-[var(--text-dim)] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center">Rank</th>
                <th className="py-3 px-3 w-16 text-center">Change</th>
                <th className="py-3 px-4">Talent</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 font-mono">Fame Score</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 font-mono">Rentals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {characters.map((c, idx) => {
                const rank = idx + 1;
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-[var(--panel-raised)] transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[var(--text)] text-sm">
                      {rank <= 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--marquee)] text-black font-extrabold text-xs">
                          {rank}
                        </span>
                      ) : (
                        rank
                      )}
                    </td>

                    {/* Movement since last week */}
                    <td className="py-3.5 px-3 text-center font-mono text-[11px] text-[var(--text-dim)]">
                      <span className="inline-flex items-center gap-0.5 text-[var(--text-dim)]">
                        <Minus className="w-3 h-3" /> 0
                      </span>
                    </td>

                    {/* Character Poster Thumbnail & Name */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/characters/${c.id}`}
                        className="flex items-center gap-3 group-hover:text-[var(--glacier)] transition-colors"
                      >
                        {c.portrait_url ? (
                          <img
                            src={c.portrait_url}
                            alt={c.name}
                            className="w-9 h-11 object-cover rounded-[2px] border border-[var(--line)] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-11 rounded-[2px] bg-[var(--panel-raised)] border border-[var(--line)] flex items-center justify-center font-serif text-sm">
                            {c.name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <span className="font-serif text-base text-[var(--text)] block leading-tight">
                            {c.name}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--text-dim)]">
                            {c.id}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Tier */}
                    <td className="py-3.5 px-4 font-medium uppercase font-mono text-[11px] text-[var(--marquee)]">
                      {c.fame_tier}
                    </td>

                    {/* Fame Score */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--text)] text-sm">
                      {c.fame_score}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[var(--marquee)] text-[var(--marquee)]" />
                        <span className="font-semibold text-[var(--text)]">
                          {c.rating_avg.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-[var(--text-dim)]">
                          ({c.review_count})
                        </span>
                      </div>
                    </td>

                    {/* Rentals */}
                    <td className="py-3.5 px-4 font-mono text-[var(--text)]">
                      {c.rental_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
