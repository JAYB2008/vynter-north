"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Edit3,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Star,
  Users,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Character } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type StatusTab = "all" | "active" | "draft" | "paused" | "sold";

export function CharactersClient() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/characters?status=all");
      const data = await res.json();
      if (data.characters) {
        setCharacters(data.characters);
      }
    } catch {
      toast.error("Failed to load your characters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleToggleStatus = async (char: Character) => {
    const nextStatus = char.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/characters/${char.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      toast.success(
        `Character ${char.name} is now ${nextStatus === "active" ? "active on marketplace" : "paused"}.`
      );
      fetchCharacters();
    } catch {
      toast.error("Could not change status.");
    }
  };

  const handleDelete = async (char: Character) => {
    if (!window.confirm(`Are you sure you want to delete ${char.name}?`)) return;

    try {
      const res = await fetch(`/api/characters/${char.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      toast.success(`${char.name} has been removed.`);
      fetchCharacters();
    } catch {
      toast.error("Could not delete character.");
    }
  };

  const filteredCharacters = characters.filter((c) => {
    const matchesTab = activeTab === "all" ? true : c.status === activeTab;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vibe_summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Creator Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight mt-1">
            My AI Characters
          </h1>
          <p className="text-xs sm:text-sm text-secondary-app mt-0.5">
            Manage your registered personas, update personality documents, and review rental activity.
          </p>
        </div>

        <Link
          href="/dashboard/characters/new"
          className="vn-button-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Character</span>
        </Link>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card-app border border-app overflow-x-auto">
          {(["all", "active", "draft", "paused", "sold"] as StatusTab[]).map(
            (tab) => {
              const count = characters.filter((c) =>
                tab === "all" ? true : c.status === tab
              ).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            }
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-app absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search my characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-card-app border border-app text-xs text-primary-app focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* Characters Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
          <span className="text-xs text-secondary-app">Loading characters...</span>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card-app border border-dashed border-app flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-elevated-app flex items-center justify-center text-muted-app">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primary-app">
            No characters found
          </h3>
          <p className="text-xs text-secondary-app max-w-sm">
            {activeTab !== "all"
              ? `You don't have any characters in '${activeTab}' status.`
              : "You haven't created any AI characters yet. Start by defining your first persona."}
          </p>
          <Link
            href="/dashboard/characters/new"
            className="vn-button-primary mt-2 px-4 py-2 text-xs font-semibold"
          >
            Create Your First Character
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((char) => {
            const isPaused = char.status === "paused";
            return (
              <div
                key={char.id}
                className="vn-card overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Image Banner */}
                  <div className="relative h-44 w-full bg-elevated-app overflow-hidden">
                    {char.avatar_url ? (
                      <img
                        src={char.avatar_url}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-700 to-indigo-900 flex items-center justify-center text-3xl font-black text-white">
                        {char.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-semibold text-white">
                      {char.id}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          char.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : char.status === "draft"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                        }`}
                      >
                        {char.status}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {char.name}
                      </h3>
                      <p className="text-xs text-purple-200 italic line-clamp-1">
                        "{char.vibe_summary}"
                      </p>
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-secondary-app">
                      <span className="flex items-center gap-1 font-semibold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{char.fame_score} Fame</span>
                      </span>
                      <span>
                        {char.total_rentals || 0} rentals • {char.total_views || 0} views
                      </span>
                    </div>

                    <p className="text-xs text-secondary-app line-clamp-2">
                      {char.core_trait}
                    </p>

                    <div className="text-xs font-semibold text-primary-app">
                      {char.is_free
                        ? "Free Character"
                        : `${formatCurrency(char.rental_price_daily)}/day • ${formatCurrency(
                            char.rental_price_monthly
                          )}/mo`}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: Edit | Pause/Activate | View on Marketplace | Delete */}
                <div className="p-3 bg-secondary-app border-t border-app flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/characters/${char.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors"
                      title="Edit character profile"
                    >
                      <Edit3 className="w-4 h-4 text-[#A78BFA]" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(char)}
                      className="p-1.5 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors cursor-pointer"
                      title={isPaused ? "Activate character" : "Pause character"}
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Pause className="w-4 h-4 text-amber-400" />
                      )}
                    </button>

                    <Link
                      href={`/marketplace/${char.id}`}
                      className="p-1.5 rounded-lg hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors"
                      title="View live on marketplace"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(char)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary-app hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete character"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
