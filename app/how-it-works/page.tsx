import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Terminal, FileCheck, Layers } from "lucide-react";

export const metadata = {
  title: "How It Works — Vynter North",
  description: "The character intelligence layer for AI video and interactive productions.",
};

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-display font-medium text-[var(--text)] tracking-tight">
          How Vynter North Works
        </h1>
        <p className="text-base text-[var(--text-dim)] leading-relaxed">
          AI video models can create any visual scene, but they cannot maintain the same character twice. Vynter North stores a character's identity once and delivers scene-specific acting direction to any tool.
        </p>
      </div>

      {/* The Core Architecture Diagram (MCP Flow) */}
      <div className="vn-panel p-8 sm:p-10 rounded-lg border border-[var(--line)] space-y-8 bg-[var(--panel)]">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--glacier)]">
            Architecture Diagram
          </div>
          <h2 className="text-2xl font-display font-medium text-[var(--text)]">
            The Remote MCP Connection Loop
          </h2>
          <p className="text-sm text-[var(--text-dim)]">
            How your video tool talks to our character intelligence server without ever leaking the character profile.
          </p>
        </div>

        {/* Visual Flow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          {/* Step 1 */}
          <div className="bg-[var(--panel-raised)] p-5 rounded border border-[var(--line)] space-y-2">
            <div className="w-8 h-8 rounded bg-[var(--glacier)]/10 text-[var(--glacier)] font-bold text-xs flex items-center justify-center mx-auto">
              1
            </div>
            <div className="text-xs font-bold text-[var(--text)]">Studio Prompts</div>
            <div className="text-[11px] text-[var(--text-dim)] leading-tight">
              Studio writes only the plot: "Cairo enters a job interview."
            </div>
          </div>

          <div className="hidden md:flex justify-center text-[var(--text-dim)]">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 2 */}
          <div className="bg-[var(--panel-raised)] p-5 rounded border border-[var(--line)] space-y-2">
            <div className="w-8 h-8 rounded bg-[var(--glacier)]/10 text-[var(--glacier)] font-bold text-xs flex items-center justify-center mx-auto">
              2
            </div>
            <div className="text-xs font-bold text-[var(--text)]">Claude / ChatGPT</div>
            <div className="text-[11px] text-[var(--text-dim)] leading-tight">
              Calls Vynter North remote MCP server via HTTP JSON-RPC.
            </div>
          </div>

          <div className="hidden md:flex justify-center text-[var(--text-dim)]">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 3 */}
          <div className="bg-[var(--panel-raised)] p-5 rounded border border-[var(--glacier)] space-y-2 ring-1 ring-[var(--glacier)]/30">
            <div className="w-8 h-8 rounded bg-[var(--glacier)] text-[var(--glacier-ink)] font-bold text-xs flex items-center justify-center mx-auto">
              3
            </div>
            <div className="text-xs font-bold text-[var(--glacier)]">Vynter North Server</div>
            <div className="text-[11px] text-[var(--text-dim)] leading-tight">
              Matches situation, filters sheet paragraphs, and directs via NIM.
            </div>
          </div>
        </div>

        {/* Return Flow */}
        <div className="p-4 rounded bg-[var(--panel-raised)] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" />
            <span className="text-[var(--text)]">
              <strong>Return Trip:</strong> Finished behavioral direction travels back to Claude / ChatGPT → Studio pastes into Sora, Runway, Kling, or HigsField.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-dim)] shrink-0">
            Private sheet never sent
          </span>
        </div>
      </div>

      {/* Two Columns: Creator Side vs Studio Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Creator Side */}
        <div className="vn-panel p-8 rounded-lg border border-[var(--line)] space-y-6">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-[var(--glacier)]" />
            <h3 className="text-xl font-display font-medium text-[var(--text)]">
              For Creators
            </h3>
          </div>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            You own original AI character identities. Build deep personality profiles and monetize their appearances across studios.
          </p>

          <ol className="space-y-4 text-xs">
            <li className="flex gap-3">
              <span className="font-mono text-[var(--glacier)] font-bold">01.</span>
              <div>
                <strong className="text-[var(--text)] block">Register Identity & Look</strong>
                <span className="text-[var(--text-dim)]">Upload reference headshots and write a 1,000+ word personality and situational behavior sheet.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--glacier)] font-bold">02.</span>
              <div>
                <strong className="text-[var(--text)] block">Permanent CVR Slate</strong>
                <span className="text-[var(--text-dim)]">Each character receives a certified CVR ID (e.g. CVR-2026-00001) with a cryptographic SHA-256 ledger fingerprint.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--glacier)] font-bold">03.</span>
              <div>
                <strong className="text-[var(--text)] block">Earn on Every Rental</strong>
                <span className="text-[var(--text-dim)]">Set your daily, weekly, and monthly rates. Multiple studios can rent concurrently; earnings accumulate automatically.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* Studio Side */}
        <div className="vn-panel p-8 rounded-lg border border-[var(--line)] space-y-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[var(--marquee)]" />
            <h3 className="text-xl font-display font-medium text-[var(--text)]">
              For Studios & Filmmakers
            </h3>
          </div>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            Stop re-explaining characters in every single video prompt. Cast consistent talent across full series and commercials.
          </p>

          <ol className="space-y-4 text-xs">
            <li className="flex gap-3">
              <span className="font-mono text-[var(--marquee)] font-bold">01.</span>
              <div>
                <strong className="text-[var(--text)] block">Browse & Try for 3 Days Free</strong>
                <span className="text-[var(--text-dim)]">Cast from the marketplace. Every character includes a 3-day trial with 15 test credits to verify fit.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--marquee)] font-bold">02.</span>
              <div>
                <strong className="text-[var(--text)] block">Connect Claude or ChatGPT</strong>
                <span className="text-[var(--text-dim)]">Add your personal Streamable HTTP link as a custom connector. No local terminal installation required.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-[var(--marquee)] font-bold">03.</span>
              <div>
                <strong className="text-[var(--text)] block">Direct Scenes in Natural Language</strong>
                <span className="text-[var(--text-dim)]">Type what happens. The intelligence layer injects gestures, emotional cadence, and speech tone automatically.</span>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* The Intelligence Layer Deep Dive */}
      <div className="vn-panel p-8 sm:p-10 rounded-lg border border-[var(--line)] space-y-6">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[var(--glacier)]" />
          <h3 className="text-2xl font-display font-medium text-[var(--text)]">
            Inside the Intelligence Engine
          </h3>
        </div>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed max-w-3xl">
          Traditional prompts dump entire personality descriptions into the model, leading to confusion and prompt bloat. Vynter North uses selective paragraph retrieval:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[var(--panel-raised)] p-4 rounded border border-[var(--line)] space-y-1.5">
            <div className="font-semibold text-[var(--text)]">1. Scene Classification</div>
            <div className="text-[var(--text-dim)]">
              Categorizes prompts into danger, social, conflict, emotional, or light comedy to select exact situational behavior.
            </div>
          </div>

          <div className="bg-[var(--panel-raised)] p-4 rounded border border-[var(--line)] space-y-1.5">
            <div className="font-semibold text-[var(--text)]">2. Paragraph Scoring</div>
            <div className="text-[var(--text-dim)]">
              Scores the character's full sheet by relevance, extracting only the top paragraphs up to 900 words.
            </div>
          </div>

          <div className="bg-[var(--panel-raised)] p-4 rounded border border-[var(--line)] space-y-1.5">
            <div className="font-semibold text-[var(--text)]">3. Detail Matching</div>
            <div className="text-[var(--text-dim)]">
              Matches output length to your input: short prompts get tight direction; camera-rich scenes preserve all explicit instructions.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8 space-y-4">
        <h3 className="text-2xl font-display font-medium text-[var(--text)]">
          Ready to direct your first scene?
        </h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/demo"
            className="px-6 py-3 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110"
          >
            Try the interactive board
          </Link>
          <Link
            href="/marketplace"
            className="px-6 py-3 border border-[var(--line)] text-xs text-[var(--text)] font-semibold rounded hover:bg-[var(--panel-raised)]"
          >
            Explore character registry
          </Link>
        </div>
      </div>
    </div>
  );
}
