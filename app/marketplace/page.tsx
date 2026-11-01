"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { Character } from "@/lib/types";
import { CharacterPosterCard } from "@/components/characters/CharacterPosterCard";
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
  "Crime",
  "Mystery",
  "Romance",
];

const TIERS = ["all", "newcomer", "rising", "established", "veteran", "legend"];

export default function MarketplacePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "free" | "rent" | "sale" | "rising"
  >("all");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedSort, setSelectedSort] = useState("fame");
  const [trialOnly, setTrialOnly] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Compare selection (2-3 items)
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  const fetchCharacters = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedGenre !== "All") params.set("genre", selectedGenre);
    if (selectedTier !== "all") params.set("tier", selectedTier);
    if (selectedSort) params.set("sort", selectedSort);

    if (activeTab === "free") {
      params.set("price_filter", "free");
    } else if (activeTab === "rent") {
      params.set("price_filter", "rent");
    } else if (activeTab === "sale") {
      params.set("price_filter", "sale");
    }

    const res = await apiFetch<{ characters: Character[] }>(
      `/api/characters?${params.toString()}`
    );
    setLoading(false);
    if (res.ok && res.data.characters) {
      let list = res.data.characters;
      // Filter for Rising tab: no demo reel or below fame threshold 100
      if (activeTab === "rising") {
        list = list.filter((c) => c.fame_score < 100 || c.fame_tier === "newcomer" || c.fame_tier === "rising");
      }
      if (trialOnly) {
        list = list.filter((c) => c.trial_enabled);
      }
      setCharacters(list);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [activeTab, selectedGenre, selectedTier, selectedSort, trialOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCharacters();
  };

  const toggleCompare = (id: string) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter((x) => x !== id));
    } else {
      if (comparedIds.length >= 3) {
        setComparedIds([...comparedIds.slice(1), id]);
      } else {
        setComparedIds([...comparedIds, id]);
      }
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setActiveTab("all");
    setSelectedGenre("All");
    setSelectedTier("all");
    setSelectedSort("fame");
    setTrialOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Identity Registry
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[var(--text)] mt-1">
            Character Talent Marketplace
          </h1>
          <p className="text-sm text-[var(--text-dim)] max-w-xl mt-1.5">
            Rent verified AI character identities. Describe scenes in Claude, ChatGPT or workspace — our server writes how they actually behave.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters or tags…"
            className="w-full pl-9 pr-4 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
          />
        </form>
      </div>

      {/* Tabs and Quick Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 pb-4">
        {/* The 5 Required Tabs */}
        <div className="flex gap-1 overflow-x-auto p-1 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] text-xs">
          {[
            { id: "all", label: "All Talent" },
            { id: "free", label: "Free" },
            { id: "rent", label: "For Rent" },
            { id: "sale", label: "For Sale" },
            { id: "rising", label: "Rising" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-[5px] font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[var(--panel-raised)] text-[var(--text)] font-semibold shadow-sm"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
          >
            <option value="fame">Sort by: Fame Score</option>
            <option value="rating">Sort by: Rating</option>
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rentals">Most Rented</option>
          </select>

          <button
            type="button"
            onClick={() => setShowDrawer(!showDrawer)}
            className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)] hover:border-[var(--glacier)] flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showDrawer && (
        <div className="p-5 mb-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
              Filter Talent
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[var(--glacier)] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Genre */}
            <div>
              <span className="text-[var(--text-dim)] font-medium block mb-2">
                Genre
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGenre(g)}
                    className={`px-2 py-1 rounded-[4px] border ${
                      selectedGenre === g
                        ? "bg-[var(--glacier)] text-[var(--glacier-ink)] border-[var(--glacier)]"
                        : "bg-[var(--panel-raised)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Fame Tier */}
            <div>
              <span className="text-[var(--text-dim)] font-medium block mb-2">
                Fame Tier
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTier(t)}
                    className={`px-2 py-1 rounded-[4px] uppercase text-[10px] border ${
                      selectedTier === t
                        ? "bg-[var(--marquee)] text-black border-[var(--marquee)] font-bold"
                        : "bg-[var(--panel-raised)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Trial Check */}
            <div>
              <span className="text-[var(--text-dim)] font-medium block mb-2">
                Availability
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={trialOnly}
                  onChange={(e) => setTrialOnly(e.target.checked)}
                  className="w-4 h-4 accent-[var(--glacier)]"
                />
                <span>3-Day Trial Available Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="pb-4 text-xs text-[var(--text-dim)]">
        Showing {characters.length} {characters.length === 1 ? "character" : "characters"}
      </div>

      {/* Poster Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="aspect-[4/5] bg-[var(--panel)] border border-[var(--line)] rounded-[2px] animate-pulse"
            />
          ))}
        </div>
      ) : characters.length === 0 ? (
        /* Empty State */
        <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--panel-raised)] border border-[var(--line)] flex items-center justify-center text-[var(--text-dim)]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-[var(--text)]">
            No Characters Found
          </h3>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            {search || selectedGenre !== "All" || selectedTier !== "all"
              ? "No characters match your filter criteria. Try adjusting your parameters or clear filters."
              : "Be the first creator to register an original character in the Vynter North identity catalog."}
          </p>

          <div className="pt-2">
            {search || selectedGenre !== "All" ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                href="/dashboard/characters/new"
                className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Register a character
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.map((char) => (
            <CharacterPosterCard
              key={char.id}
              character={char}
              isCompared={comparedIds.includes(char.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      {/* Floating Compare Bar */}
      {comparedIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-6 py-3.5 bg-[var(--night)] border border-[var(--glacier)] rounded-[10px] shadow-2xl flex items-center gap-4 text-xs">
          <span className="font-medium text-[var(--text)]">
            {comparedIds.length} characters selected for comparison
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/marketplace/compare?ids=${comparedIds.join(",")}`}
              className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded-[4px] hover:brightness-110 flex items-center gap-1.5"
            >
              Compare side-by-side <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setComparedIds([])}
              className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
