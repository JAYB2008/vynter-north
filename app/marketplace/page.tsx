"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  Check,
  Star,
  Users,
} from "lucide-react";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { Character } from "@/lib/types";

const GENRES = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Adventure",
  "Romance",
  "Horror",
];

const TYPES = [
  { value: "all", label: "All Types" },
  { value: "free", label: "Free (Community)" },
  { value: "rent", label: "For Rent" },
  { value: "purchase", label: "For Sale" },
];

const SORTS = [
  { value: "newest", label: "Newest First" },
  { value: "fame", label: "Most Popular (Fame)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "price_desc", label: "Price (High to Low)" },
];

export default function MarketplacePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("fame");

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedGenre !== "All") params.set("genre", selectedGenre);
      if (selectedType !== "all") params.set("type", selectedType);
      if (selectedSort) params.set("sort", selectedSort);

      const res = await fetch(`/api/characters?${params.toString()}`);
      const data = await res.json();
      if (data.characters) setCharacters(data.characters);
    } catch (e) {
      console.warn("Failed to fetch characters", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [selectedGenre, selectedType, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCharacters();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-app pb-8">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#7C3AED] uppercase">
            Global Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-app tracking-tight mt-1">
            Character Marketplace
          </h1>
          <p className="text-sm text-secondary-app max-w-2xl mt-1.5">
            Rent verified AI character personalities for video generation. Each character comes with an encrypted skill profile that directs their emotions, posture, and dialogue across your tools.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-elevated-app border border-app text-secondary-app shrink-0">
          <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>{characters.length} Registered Identities</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Search Bar + Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 w-full"
          >
            <Search className="w-4 h-4 text-muted-app absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by character name, core trait, or vibe..."
              className="vn-input w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </form>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="vn-input px-3.5 py-2.5 text-sm font-medium cursor-pointer w-full sm:w-auto"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="vn-input px-3.5 py-2.5 text-sm font-medium cursor-pointer w-full sm:w-auto"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-sm"
                    : "bg-card-app border-app text-secondary-app hover:text-primary-app hover:border-[#7C3AED]"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Characters */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="vn-card h-80 animate-pulse bg-elevated-app/50 border-app"
            />
          ))}
        </div>
      ) : characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      ) : (
        <div className="vn-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <Users className="w-12 h-12 text-muted-app opacity-40" />
          <h3 className="text-lg font-bold text-primary-app">
            No characters found matching criteria
          </h3>
          <p className="text-sm text-secondary-app max-w-sm">
            Try adjusting your search terms, genre filter, or pricing filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedGenre("All");
              setSelectedType("all");
            }}
            className="vn-button-primary px-4 py-2 text-xs font-semibold mt-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
