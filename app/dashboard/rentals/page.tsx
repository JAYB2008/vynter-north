"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Copy,
  Check,
  RotateCw,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Search,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Rental } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type TabOption = "active" | "expired" | "all";

export default function StudioRentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabOption>("active");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rentals");
      const data = await res.json();
      if (data.rentals) {
        setRentals(data.rentals);
      }
    } catch {
      toast.error("Failed to load studio rentals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success("MCP token copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRenew = (charName: string) => {
    toast.info(`Renewing lease for ${charName}... Redirecting to marketplace.`);
  };

  const isExpired = (r: Rental) => {
    if (r.status === "expired") return true;
    if (!r.expires_at) return false;
    return new Date(r.expires_at).getTime() < Date.now();
  };

  const filteredRentals = rentals.filter((r) => {
    const expired = isExpired(r);
    if (activeTab === "active") return !expired && r.status === "active";
    if (activeTab === "expired") return expired || r.status === "expired";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Production Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight mt-1">
            Studio Character Rentals
          </h1>
          <p className="text-xs sm:text-sm text-secondary-app mt-0.5">
            Active character leases, generation credits, and MCP token keys for Claude and ChatGPT.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="vn-button-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Browse Marketplace</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card-app border border-app w-fit">
        {(["active", "expired", "all"] as TabOption[]).map((tab) => {
          const count = rentals.filter((r) => {
            const exp = isExpired(r);
            if (tab === "active") return !exp && r.status === "active";
            if (tab === "expired") return exp || r.status === "expired";
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#7C3AED] text-white shadow-sm"
                  : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Rentals List */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
          <span className="text-xs text-secondary-app">Loading active leases...</span>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card-app border border-dashed border-app flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-elevated-app flex items-center justify-center text-muted-app">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primary-app">
            No rentals in this category
          </h3>
          <p className="text-xs text-secondary-app max-w-sm">
            {activeTab === "active"
              ? "You do not have any active character rentals. Explore the marketplace to lease characters with MCP tokens."
              : "No expired rentals found."}
          </p>
          <Link
            href="/marketplace"
            className="vn-button-primary mt-2 px-4 py-2 text-xs font-semibold"
          >
            Explore Characters
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map((rental) => {
            const expired = isExpired(rental);
            const char = rental.character;
            const creditsLeft = Math.max(
              0,
              rental.generation_credits - rental.credits_used
            );

            return (
              <div
                key={rental.id}
                className="vn-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Character Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-elevated-app border border-app overflow-hidden shrink-0 flex items-center justify-center">
                    {char?.avatar_url ? (
                      <img
                        src={char.avatar_url}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-black text-white">
                        {char?.name ? char.name.slice(0, 2).toUpperCase() : "VN"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-primary-app">
                        {char?.name || "AI Character"}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated-app border border-app text-secondary-app">
                        {rental.character_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          expired
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {expired ? "Expired" : `${rental.rental_type} Lease`}
                      </span>
                    </div>

                    <p className="text-xs text-[#A78BFA] italic">
                      "{char?.vibe_summary || "Character intelligence registered"}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-app pt-1">
                      <span className="flex items-center gap-1 text-muted-app">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {rental.expires_at
                            ? `Expires ${formatDate(rental.expires_at)}`
                            : "Permanent License"}
                        </span>
                      </span>

                      <span>•</span>

                      <span>
                        Credits:{" "}
                        <strong className="text-primary-app">
                          {creditsLeft} / {rental.generation_credits}
                        </strong>{" "}
                        used ({rental.credits_used} used)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: MCP Token & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  {/* Monospace MCP Token */}
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-secondary-app border border-app">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[9px] uppercase tracking-wider text-muted-app font-bold block">
                        MCP Token
                      </span>
                      <code className="text-xs font-mono text-primary-app block select-all">
                        {rental.mcp_token.slice(0, 14)}...
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyToken(rental.mcp_token)}
                      className="p-1.5 rounded-lg bg-card-app hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors cursor-pointer"
                      title="Copy full token"
                    >
                      {copiedToken === rental.mcp_token ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/demo?character=${encodeURIComponent(
                        char?.name || "Cairo"
                      )}`}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-elevated-app hover:bg-[#1C1C35] text-xs font-semibold text-primary-app border border-app transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>Test in Demo</span>
                    </Link>

                    {expired ? (
                      <Link
                        href={`/marketplace/${rental.character_id}`}
                        onClick={() => handleRenew(char?.name || "")}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Renew</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/marketplace/${rental.character_id}`}
                        className="p-2 rounded-xl border border-app bg-card-app hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors"
                        title="View Marketplace Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
