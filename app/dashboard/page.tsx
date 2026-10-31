"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Clapperboard,
  Users,
  DollarSign,
  Star,
  Bookmark,
  Coins,
  Clock,
  ArrowRight,
  Edit3,
  Pause,
  Play,
  RotateCw,
  Copy,
  Check,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Character, Rental } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DemoInterface } from "@/components/demo/DemoInterface";

export default function DashboardOverviewPage() {
  const { user, role } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/characters?status=all")
        .then((r) => r.json())
        .then((d) => d.characters || []),
      fetch("/api/rentals")
        .then((r) => r.json())
        .then((d) => d.rentals || []),
    ])
      .then(([chars, rents]) => {
        setCharacters(chars);
        setRentals(rents);
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePause = async (char: Character) => {
    const nextStatus = char.status === "active" ? "paused" : "active";
    try {
      await fetch(`/api/characters/${char.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(`${char.name} status updated to ${nextStatus}.`);
      setCharacters((prev) =>
        prev.map((c) => (c.id === char.id ? { ...c, status: nextStatus } : c))
      );
    } catch {
      toast.error("Status update failed.");
    }
  };

  // Recent activity mock data
  const recentActivity = [
    {
      id: "act-1",
      title: "New 30-Day Lease",
      desc: "Apex CineLabs rented Cairo for high-tension thriller series.",
      time: "2 hours ago",
      icon: Clapperboard,
    },
    {
      id: "act-2",
      title: "5-Star Review Received",
      desc: '"Sable delivered unbelievable stillness in our political thriller episode."',
      time: "1 day ago",
      icon: Star,
    },
    {
      id: "act-3",
      title: "Generation Credit Milestone",
      desc: "Your character Drew crossed 400 scene prompt enrichments.",
      time: "3 days ago",
      icon: Sparkles,
    },
  ];

  // =====================
  // CREATOR VIEW
  // =====================
  if (role === "creator") {
    const totalChars = characters.length;
    const activeRentalsCount = characters.reduce(
      (sum, c) => sum + (c.total_rentals || 0),
      0
    );
    const avgFame =
      characters.length > 0
        ? Math.round(
            characters.reduce((acc, c) => acc + (c.fame_score || 0), 0) /
              characters.length
          )
        : 95;

    return (
      <div className="space-y-8 pb-12">
        {/* Creator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Creator Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight mt-1">
              Welcome back, {user?.display_name || "Creator"}
            </h1>
            <p className="text-xs sm:text-sm text-secondary-app mt-0.5">
              Monitor character performance, track active studio rentals, and edit behavioral sheets.
            </p>
          </div>

          <Link
            href="/dashboard/characters/new"
            className="vn-button-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Character</span>
          </Link>
        </div>

        {/* Stats Row: Total Characters | Active Rentals | Total Earnings | Average Fame Score */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="vn-card p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
              Total Characters
            </span>
            <div className="text-2xl sm:text-3xl font-black text-primary-app">
              {totalChars}
            </div>
            <p className="text-[11px] text-secondary-app">In your active catalog</p>
          </div>

          <div className="vn-card p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
              Active Rentals
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#A78BFA]">
              {activeRentalsCount || 48}
            </div>
            <p className="text-[11px] text-secondary-app">Live across studios</p>
          </div>

          <div className="vn-card p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
              Total Earnings
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatCurrency(user?.total_earnings || 14250.0)}
            </div>
            <p className="text-[11px] text-secondary-app">Lifetime royalties accrued</p>
          </div>

          <div className="vn-card p-5 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
              Average Fame Score
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-1.5">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>{avgFame}</span>
            </div>
            <p className="text-[11px] text-secondary-app">Top 5% across registry</p>
          </div>
        </div>

        {/* My Characters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary-app">
                My Characters
              </h2>
              <p className="text-xs text-secondary-app">
                Quick actions for your registered character personas.
              </p>
            </div>
            <Link
              href="/dashboard/characters"
              className="text-xs font-semibold text-[#A78BFA] hover:text-white flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {characters.slice(0, 3).map((char) => (
              <div
                key={char.id}
                className="vn-card overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-elevated-app overflow-hidden">
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
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white">
                      {char.id}
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
                        {char.status}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {char.name}
                      </h3>
                      <p className="text-xs text-purple-200 italic line-clamp-1">
                        "{char.vibe_summary}"
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
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

                {/* Edit | Pause | Analytics buttons */}
                <div className="p-3 bg-secondary-app border-t border-app flex items-center justify-between text-xs font-semibold">
                  <Link
                    href={`/dashboard/characters/${char.id}/edit`}
                    className="flex items-center gap-1 text-[#A78BFA] hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleTogglePause(char)}
                    className="flex items-center gap-1 text-secondary-app hover:text-primary-app cursor-pointer"
                  >
                    {char.status === "paused" ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Activate</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/dashboard/earnings"
                    className="flex items-center gap-1 text-secondary-app hover:text-primary-app"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Analytics</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="vn-card p-6 space-y-4">
          <h2 className="text-base font-bold text-primary-app">
            Recent Studio Activity & Reviews
          </h2>
          <div className="divide-y divide-app">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="py-3.5 flex items-start gap-3.5 first:pt-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-elevated-app border border-app text-[#A78BFA] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary-app">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-app">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-app">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // STUDIO VIEW
  // =====================
  const activeRentalsList = rentals.filter((r) => r.status === "active");
  const totalCredits = rentals.reduce(
    (sum, r) => sum + (r.generation_credits || 0),
    0
  );
  const totalCreditsUsed = rentals.reduce(
    (sum, r) => sum + (r.credits_used || 0),
    0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Production Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight mt-1">
            Welcome back, {user?.studio_name || user?.display_name || "Studio Lead"}
          </h1>
          <p className="text-xs sm:text-sm text-secondary-app mt-0.5">
            Manage your character identity leases, review MCP tokens, and test scene prompts.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="vn-button-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          <Clapperboard className="w-4 h-4" />
          <span>Browse Characters</span>
        </Link>
      </div>

      {/* Stats Row: Active Rentals | Characters Available | Total Credits | Generations Used */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="vn-card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
            Active Rentals
          </span>
          <div className="text-2xl sm:text-3xl font-black text-primary-app">
            {activeRentalsList.length || 3}
          </div>
          <p className="text-[11px] text-secondary-app">Characters ready in MCP</p>
        </div>

        <div className="vn-card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
            Characters Available
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#A78BFA]">
            {characters.length || 6}
          </div>
          <p className="text-[11px] text-secondary-app">On global marketplace</p>
        </div>

        <div className="vn-card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
            Total Credits
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {totalCredits || 850}
          </div>
          <p className="text-[11px] text-secondary-app">Balance across all leases</p>
        </div>

        <div className="vn-card p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app block">
            Generations Used
          </span>
          <div className="text-2xl sm:text-3xl font-black text-primary-app">
            {totalCreditsUsed || 142}
          </div>
          <p className="text-[11px] text-secondary-app">Enriched scene prompts</p>
        </div>
      </div>

      {/* Active Rentals Section: character + expiry + credits remaining + "Use in Demo" button */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-app">
              Active Studio Leases
            </h2>
            <p className="text-xs text-secondary-app">
              Characters linked to your MCP configuration.
            </p>
          </div>
          <Link
            href="/dashboard/rentals"
            className="text-xs font-semibold text-[#A78BFA] hover:text-white flex items-center gap-1"
          >
            <span>View all rentals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rentals.slice(0, 4).map((r) => {
            const char = r.character;
            const creditsLeft = Math.max(
              0,
              r.generation_credits - r.credits_used
            );

            return (
              <div
                key={r.id}
                className="vn-card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-elevated-app overflow-hidden shrink-0 border border-app flex items-center justify-center font-bold text-white">
                    {char?.avatar_url ? (
                      <img
                        src={char.avatar_url}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      char?.name.slice(0, 2).toUpperCase() || "VN"
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-primary-app truncate">
                      {char?.name || "AI Character"}
                    </h4>
                    <p className="text-[11px] text-muted-app truncate">
                      {r.expires_at ? `Expires ${formatDate(r.expires_at)}` : "Permanent License"}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      {creditsLeft} credits left
                    </p>
                  </div>
                </div>

                <Link
                  href={`/demo?character=${encodeURIComponent(
                    char?.name || "Cairo"
                  )}`}
                  className="px-3 py-1.5 rounded-xl bg-elevated-app hover:bg-[#1C1C35] text-xs font-semibold text-primary-app border border-app transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Use in Demo</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Demo Section: Embedded simulator using their active characters */}
      <div className="space-y-4 pt-4 border-t border-app">
        <div>
          <h2 className="text-lg font-bold text-primary-app">
            Instant Scene Simulator
          </h2>
          <p className="text-xs text-secondary-app">
            Test how your rented characters perform in specific scene situations right now.
          </p>
        </div>

        <DemoInterface initialCharacters={characters} />
      </div>
    </div>
  );
}
