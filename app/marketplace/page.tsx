"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  RotateCcw,
} from "lucide-react";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { Character } from "@/lib/types";

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Adventure",
  "Romance",
  "Horror",
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "rent", label: "For Rent" },
  { value: "purchase", label: "For Sale" },
];

const SORT_OPTIONS = [
  { value: "fame", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price Low-High" },
  { value: "price_desc", label: "Price High-Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function MarketplacePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("fame");

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
      if (selectedStatus !== "all") params.set("type", selectedStatus);
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
  }, [selectedStatus, selectedGenres, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCharacters();
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedGenres([]);
    setSelectedSort("fame");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-app pb-6">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#7C3AED] uppercase">
            Character Identity Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-app tracking-tight mt-1">
            Character Marketplace
          </h1>
          <p className="text-sm text-secondary-app max-w-2xl mt-1.5">
            Rent or buy verified AI character personalities. The intelligence layer applies their distinct behavior, tone, and physical habits into Claude and ChatGPT.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-elevated-app border border-app text-secondary-app shrink-0">
          <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>{characters.length} Registered Identities</span>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* ================= LEFT SIDEBAR FILTERS ================= */}
        <aside className="w-full lg:col-span-1 vn-card p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-app">
            <div className="flex items-center gap-2 text-sm font-bold text-primary-app">
              <Filter className="w-4 h-4 text-[#7C3AED]" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-muted-app hover:text-[#7C3AED] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Search by name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-app">
              Search by name
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-muted-app absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search character name..."
                className="vn-input w-full pl-9 pr-3 py-2 text-xs"
              />
            </form>
          </div>

          {/* 2. Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-app">
              Status
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setSelectedStatus(status.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-center border transition-all ${
                    selectedStatus === status.value
                      ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-sm"
                      : "bg-secondary-app border-app text-secondary-app hover:border-[#7C3AED]"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Genre Checkboxes */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-app">
              Genres
            </label>
            <div className="space-y-1.5">
              {GENRES.map((genre) => {
                const checked = selectedGenres.includes(genre);
                return (
                  <label
                    key={genre}
                    className="flex items-center gap-2.5 text-xs text-secondary-app hover:text-primary-app cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGenre(genre)}
                      className="rounded border-app text-[#7C3AED] focus:ring-[#7C3AED] w-4 h-4 accent-[#7C3AED]"
                    />
                    <span>{genre}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Sort Options */}
          <div className="space-y-2 pt-2 border-t border-app">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-app">
              Sort By
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="vn-input w-full px-3 py-2 text-xs font-medium cursor-pointer"
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* ================= RIGHT CHARACTER GRID ================= */}
        {/* 3 col desktop / 2 tablet / 1 mobile */}
        <div className="w-full lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                No characters found
              </h3>
              <p className="text-sm text-secondary-app max-w-sm">
                Try clearing or adjusting your search filters.
              </p>
              <button
                onClick={resetFilters}
                className="vn-button-primary px-4 py-2 text-xs font-semibold mt-2"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
