import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronDown,
  Layers,
  Film,
  Lock,
  ExternalLink,
} from "lucide-react";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { CharacterPosterCard } from "@/components/characters/CharacterPosterCard";
import { getCharacters, getGenerationsList } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vynter North — Character Identity Registry & Intelligence Layer",
  description:
    "Write the scene. Your character already knows how to play it. Vynter North stores character personality once and delivers camera-ready behavioral acting direction to Claude, ChatGPT and video tools.",
};

export default async function HomePage() {
  const session = await getSession();
  const admin = isAdmin(session);

  // Fetch real database records (no fake data)
  const demoCharacters = await getCharacters({ is_demo: true });
  const featuredCharacters = await getCharacters({ is_featured: true });
  const allCharacters = await getCharacters();
  const generations = await getGenerationsList();

  const totalRegistered = allCharacters.filter((c) => c.status !== "deleted").length;
  const totalEnriched = generations.length;

  // Real sample character certificate link if exists
  const sampleCertificateId = allCharacters[0]?.id;

  return (
    <div className="flex flex-col w-full">
      {/* Live counters thin strip: only shown when >= 10 (Section 7.1) */}
      {totalRegistered >= 10 && totalEnriched >= 10 && (
        <div className="w-full py-2 bg-[var(--panel-raised)] border-b border-[var(--line)] text-center text-xs font-mono text-[var(--text-dim)]">
          <span>{totalRegistered} original characters registered</span>
          <span className="mx-2">•</span>
          <span>{totalEnriched} scene directions generated</span>
        </div>
      )}

      {/* 1. HERO SECTION & LIVE DIRECTION BOARD */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Headline & Subhead */}
          <div className="max-w-3xl space-y-4">
            <h1 className="font-serif text-5xl sm:text-6xl text-[var(--text)] tracking-tight leading-[1.08]">
              Write the scene. Your character already knows how to play it.
            </h1>
            <p className="text-[17px] text-[var(--text-dim)] leading-relaxed">
              Vynter North stores a character's personality once. Every time a studio describes a scene, our server writes how that character would actually behave — in Claude, ChatGPT or any video tool.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#direction-board"
                className="px-6 py-3 rounded-[6px] bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold hover:brightness-110 flex items-center gap-1.5 transition-colors"
              >
                Try it now <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-[6px] border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--text)] text-xs font-medium hover:border-[var(--glacier)] transition-colors"
              >
                Register a character
              </Link>
            </div>
          </div>

          {/* Working Direction Board */}
          <div id="direction-board" className="pt-4 scroll-mt-24">
            <DemoInterface initialCharacters={demoCharacters} isAdmin={admin} />
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (In exactly two sentences, Section 7.1) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            The Problem
          </span>
          <p className="font-serif text-2xl sm:text-3xl text-[var(--text)] leading-snug">
            AI video tools can make any scene, but not the same character twice. Studios re-describe personality in every prompt, and creators have no way to own or earn from the characters they build.
          </p>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Two columns: Creators & Studios, sequence numbering) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
              Architecture & Lifecycle
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
              How Vynter North Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* For Creators */}
            <div className="p-8 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-6">
              <div>
                <span className="text-xs font-mono text-[var(--marquee)] font-semibold uppercase tracking-wider">
                  For Creators
                </span>
                <h3 className="font-serif text-2xl text-[var(--text)] mt-1">
                  Register & Monetize Original Identities
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    1.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Write the character sheet</strong>
                    <span className="text-[var(--text-dim)]">
                      Author a 1,000+ word personality master sheet covering core motivations, contradictions, speech cadence, and situation behaviors.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    2.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Publish & receive permanent CVR ID</strong>
                    <span className="text-[var(--text-dim)]">
                      The sheet is cryptographically fingerprinted on our server and given a public registration certificate (e.g. CVR-2026-00001).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    3.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Studios rent or buy</strong>
                    <span className="text-[var(--text-dim)]">
                      Multiple video teams rent simultaneous access periods or submit purchase offers for exclusive character buyouts.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    4.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">You earn royalties</strong>
                    <span className="text-[var(--text-dim)]">
                      Keep 80% of all rental fees and buyouts as studios enrich scenes with your talent.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* For Studios */}
            <div className="p-8 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-6">
              <div>
                <span className="text-xs font-mono text-[var(--glacier)] font-semibold uppercase tracking-wider">
                  For Studios & Filmmakers
                </span>
                <h3 className="font-serif text-2xl text-[var(--text)] mt-1">
                  Cast Consistent Talent Into Any Tool
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    1.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Pick a character</strong>
                    <span className="text-[var(--text-dim)]">
                      Browse verified casting headshots, inspect situational excerpt samples, and review ratings from past productions.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    2.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Try free for 3 days</strong>
                    <span className="text-[var(--text-dim)]">
                      Start an instant 15-credit trial without payment to test scene consistency before committing.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    3.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Connect Claude or ChatGPT</strong>
                    <span className="text-[var(--text-dim)]">
                      Add your private Vynter North MCP connector link directly into Claude or ChatGPT to use your rented talent inline.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono text-[var(--glacier)] font-bold text-sm shrink-0">
                    4.
                  </span>
                  <div>
                    <strong className="text-[var(--text)] block mb-0.5">Describe scenes simply</strong>
                    <span className="text-[var(--text-dim)]">
                      Type only the physical action. Our server returns rich, camera-ready acting direction tailored to your scene.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CHARACTERS (Hide if none, Section 7.1) */}
      {featuredCharacters.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
                  Curated Roster
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
                  Featured Character Talent
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="text-xs text-[var(--glacier)] hover:underline flex items-center gap-1 font-medium"
              >
                View all talent <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredCharacters.slice(0, 4).map((c) => (
                <CharacterPosterCard key={c.id} character={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. WHAT'S PROTECTED (Plain honest statements) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
              Security & Ownership
            </span>
            <h2 className="font-serif text-3xl text-[var(--text)] mt-1">
              What Is Protected
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-2">
              <span className="font-semibold text-[var(--text)] block text-sm">
                The sheet never leaves our server
              </span>
              <p className="text-[var(--text-dim)] leading-relaxed">
                Neither renters nor external AI models (Claude, ChatGPT) ever receive the raw personality sheet. Our server reads it internally and returns finished acting direction only.
              </p>
            </div>

            <div className="p-5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-2">
              <span className="font-semibold text-[var(--text)] block text-sm">
                Cryptographic registration
              </span>
              <p className="text-[var(--text-dim)] leading-relaxed">
                Every character receives a permanent registration slate (e.g. CVR-2026-00001) and a SHA-256 fingerprint certificate anchoring ownership.
              </p>
              {sampleCertificateId && (
                <Link
                  href={`/certificate/${sampleCertificateId}`}
                  className="text-[var(--glacier)] hover:underline text-[11px] block mt-1"
                >
                  View example certificate →
                </Link>
              )}
            </div>

            <div className="p-5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-2">
              <span className="font-semibold text-[var(--text)] block text-sm">
                Finished prompts only
              </span>
              <p className="text-[var(--text-dim)] leading-relaxed">
                Studios receive only the behavioral acting instructions needed for that specific scene. Personality traits cannot be dumped or reverse engineered.
              </p>
            </div>

            <div className="p-5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-2">
              <span className="font-semibold text-[var(--text)] block text-sm">
                Automatic rental expiration
              </span>
              <p className="text-[var(--text-dim)] leading-relaxed">
                Access tokens and credits automatically terminate when rental periods end. A 10-day grace period allows renewal before characters leave the studio library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WORKS WITH (Claude, ChatGPT via MCP; HigsField planned) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto space-y-6">
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider block text-center">
            Integrations
          </span>
          <h2 className="font-serif text-3xl text-[var(--text)] text-center">
            Works Across Your Production Pipeline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs">
            <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-2 text-center">
              <span className="font-bold text-[var(--text)] text-sm block">
                Claude (Web, Desktop, Mobile)
              </span>
              <p className="text-[var(--text-dim)]">
                Connect via custom MCP connector link. Call any rented character directly in chat conversations.
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-[var(--ok)]/15 text-[var(--ok)] text-[10px] font-medium">
                Live via MCP
              </span>
            </div>

            <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-2 text-center">
              <span className="font-bold text-[var(--text)] text-sm block">
                ChatGPT
              </span>
              <p className="text-[var(--text-dim)]">
                Add Vynter North as an Advanced App Connector using Developer Mode over Streamable HTTP.
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-[var(--ok)]/15 text-[var(--ok)] text-[10px] font-medium">
                Live via MCP
              </span>
            </div>

            <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-2 text-center">
              <span className="font-bold text-[var(--text)] text-sm block">
                HigsField Video AI
              </span>
              <p className="text-[var(--text-dim)]">
                Direct export of enriched behavioral camera direction into generative video sequences.
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] text-[10px] font-medium">
                Native integration planned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING & ROADMAP TEASER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Creator Plans Teaser */}
          <div className="space-y-4 text-xs">
            <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider block">
              Creator Plans
            </span>
            <h3 className="font-serif text-2xl text-[var(--text)]">
              Register Original Character Identities
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px]">
                <span className="font-bold text-[var(--text)] block">Free</span>
                <span className="text-[var(--text-dim)]">1 character cataloged</span>
              </div>
              <div className="p-3.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px]">
                <span className="font-bold text-[var(--text)] block">Starter ($9/mo)</span>
                <span className="text-[var(--text-dim)]">3 characters + 5-scene reel</span>
              </div>
              <div className="p-3.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px]">
                <span className="font-bold text-[var(--text)] block">Creator ($25/mo)</span>
                <span className="text-[var(--text-dim)]">10 characters + full reel</span>
              </div>
              <div className="p-3.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px]">
                <span className="font-bold text-[var(--text)] block">Studio ($60/mo)</span>
                <span className="text-[var(--text-dim)]">Unlimited characters</span>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-[var(--glacier)] hover:underline inline-flex items-center gap-1 font-medium pt-2"
            >
              See complete pricing details →
            </Link>
          </div>

          {/* Roadmap Teaser */}
          <div className="space-y-4 text-xs">
            <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider block">
              Product Roadmap
            </span>
            <h3 className="font-serif text-2xl text-[var(--text)]">
              Upcoming Intelligence Infrastructure
            </h3>
            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] flex items-center justify-between">
                <span>CharacterMind offline runtime for Godot & Unity</span>
                <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--text-dim)] text-[10px]">
                  Planned
                </span>
              </div>
              <div className="p-3 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] flex items-center justify-between">
                <span>Voice delivery cloning & acoustic matching</span>
                <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--text-dim)] text-[10px]">
                  Planned
                </span>
              </div>
              <div className="p-3 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] flex items-center justify-between">
                <span>Native HigsField video director plugin</span>
                <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--text-dim)] text-[10px]">
                  Planned
                </span>
              </div>
            </div>
            <Link
              href="/roadmap"
              className="text-[var(--glacier)] hover:underline inline-flex items-center gap-1 font-medium pt-2"
            >
              View complete technical roadmap →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQ (8 Real Questions from Section 7.1) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
              Answers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {[
              {
                q: "Does Claude or ChatGPT see my character's personality sheet?",
                a: "No. The private character sheet stays permanently on Vynter North's server. When Claude calls our MCP server, our engine reads the sheet, retrieves only the paragraphs relevant to the scene, and returns finished acting direction. Claude only relays that finished direction.",
              },
              {
                q: "How do character rentals expire?",
                a: "Rentals run for the period you choose (1 day, 7 days, or 30 days). When the period ends, the character enters a 10-day grace period where it remains visible in your library with a countdown and a Renew button. After grace ends, it moves to past rentals.",
              },
              {
                q: "Can I sell a character permanently?",
                a: "Yes. Creators can enable the buyout toggle and set an exclusive sale price (minimum 10× monthly rental). When a studio buys a character, it is permanently transferred to their library and removed from the marketplace roster.",
              },
              {
                q: "What happens when enrichment credits run out?",
                a: "Previews and retries are free up to 10 previews per scene group. Credits are deducted only when you click Keep. If your balance reaches 0, you can top up +100 credits for $5 or renew your rental term without losing draft scenes.",
              },
              {
                q: "Is voice audio analysis supported today?",
                a: "We support a detailed written voice profile (pitch, tone, cadence, verbal habits, and pauses) which is what video tools receive today. Audio sample uploads are preserved for future voice synthesis partnerships.",
              },
              {
                q: "Are financial transactions live or in test mode?",
                a: "Payments are currently operating in test mode. No live card charges move during this evaluation phase; all checkout orders and payouts are simulated with the 20% platform fee.",
              },
              {
                q: "Who owns the copyright to the registered character?",
                a: "Creators retain full legal ownership of their original character identities. Studios purchase non-exclusive operational licenses to use character direction for agreed production mediums.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1.5"
              >
                <span className="font-semibold text-[var(--text)] text-sm block">
                  {faq.q}
                </span>
                <p className="text-[var(--text-dim)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
