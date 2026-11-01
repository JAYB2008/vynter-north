import Link from "next/link";
import { CheckCircle2, Clock, Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Roadmap — Vynter North",
  description: "Product roadmap and upcoming features for the character intelligence registry.",
};

export default function RoadmapPage() {
  const roadmapItems = [
    {
      category: "Live",
      badgeClass: "bg-[var(--ok)]/15 text-[var(--ok)] border-[var(--ok)]/30",
      icon: CheckCircle2,
      items: [
        {
          title: "Character Identity Registry & CVR Slate",
          desc: "Permanent CVR IDs (e.g. CVR-2026-00001), 1,000+ word personality sheets, situational behavior profiles, and printable certificates with SHA-256 fingerprints.",
        },
        {
          title: "Character Intelligence Engine",
          desc: "Server-side paragraph retrieval, scene category classification (danger, social, emotional, conflict, comedy), and dynamic prompt enrichment via NVIDIA NIM.",
        },
        {
          title: "Remote Streamable HTTP MCP Server",
          desc: "Direct JSON-RPC connector for Claude (web, mobile, desktop) and ChatGPT. Supports list_my_characters, check_character, enrich_scene, keep_generation, discard_generation, and account_status.",
        },
        {
          title: "Talent Marketplace & Sandboxed Commercials",
          desc: "Full marketplace with poster cards, 5 browsing tabs, 3-day trials with 15 credits, 1d/7d/30d rentals, buyout offers, and side-by-side comparison.",
        },
      ],
    },
    {
      category: "Building",
      badgeClass: "bg-[var(--marquee)]/15 text-[var(--marquee)] border-[var(--marquee)]/30",
      icon: Clock,
      items: [
        {
          title: "Fame Depth & Multi-Dimensional Reviews",
          desc: "Detailed scoring across consistency, personality depth, and value for price with studio verified rental badges and creator single-reply threads.",
        },
        {
          title: "Multi-Character Scene Interaction Context",
          desc: "Enriching group scenes with contextual awareness of other characters present (e.g. Cairo and Sable interacting in high-tension environments).",
        },
        {
          title: "Audition & Casting Calls Board",
          desc: "Direct studio briefs with budget, deadlines, and minimum fame tiers where creators can submit characters for consideration.",
        },
      ],
    },
    {
      category: "Planned",
      badgeClass: "bg-[var(--glacier)]/15 text-[var(--glacier)] border-[var(--glacier)]/30",
      icon: Sparkles,
      items: [
        {
          title: "Voice-in-Video via Platform Partnership",
          desc: "Direct voice delivery synthesis connected with video generation engines using creator-uploaded acoustic baseline recordings.",
        },
        {
          title: "Native HigsField Video Integration",
          desc: "One-click character injection directly inside HigsField video creation workspaces without copying prompts manually.",
        },
        {
          title: "CharacterMind Offline Runtime for Games & Robotics",
          desc: "Buyout-only offline intelligence packs with plugins for Godot, Unity, and Unreal Engine for interactive NPCs and autonomous agents.",
        },
        {
          title: "Creator Identity Verification & Legal IP Protection",
          desc: "Official government ID verification for talent creators and legal takedown enforcement for unauthorized character clones.",
        },
        {
          title: "Cryptographic Blockchain Anchoring",
          desc: "Anchoring CVR identity hashes and ownership transfers to public decentralized ledgers for verifiable provenance.",
        },
        {
          title: "Live Production Payments & Creator Payouts",
          desc: "Transitioning test sandboxes to live Stripe Connect bank transfers with automatic 20% platform fee settlement.",
        },
        {
          title: "Annual AI Character Awards",
          desc: "Industry recognition and honors for the most iconic, widely cast AI characters in film and advertising.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-display font-medium text-[var(--text)] tracking-tight">
          Product Roadmap
        </h1>
        <p className="text-base text-[var(--text-dim)] mt-2 max-w-2xl leading-relaxed">
          Our milestone progression as we build the world's primary identity registry and intelligence layer for synthetic characters.
        </p>
      </div>

      <div className="space-y-12">
        {roadmapItems.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.category} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--line)]">
                <span
                  className={`text-xs uppercase font-mono px-2.5 py-0.5 rounded border font-semibold flex items-center gap-1.5 ${section.badgeClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section.category}
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  {section.items.length} milestones
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="vn-panel p-5 rounded-lg border border-[var(--line)] space-y-2 bg-[var(--panel)]"
                  >
                    <h3 className="text-sm font-semibold text-[var(--text)]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
