"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Bot,
  BrainCircuit,
  ShieldCheck,
  Video,
  CheckCircle2,
  Users,
  Layers,
  ChevronRight,
} from "lucide-react";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { Character } from "@/lib/types";

export default function HomePage() {
  const words = ["perform", "behave", "react", "feel"];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWordIdx((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [words.length]);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((d) => {
        if (d.characters) setCharacters(d.characters);
      })
      .catch((e) => console.warn("Failed to load preview characters", e));
  }, []);

  const scrollToDemo = () => {
    const el = document.getElementById("live-demo-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 border-b border-app bg-gradient-to-b from-card-app/50 via-primary-app to-primary-app">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C3AED]/30 bg-purple-500/10 text-xs font-semibold text-[#A78BFA] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>The Character Intelligence Layer for AI Entertainment</span>
          </div>

          {/* Animated Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-primary-app leading-[1.1] max-w-4xl">
            AI characters that actually{" "}
            <span className="inline-block relative text-[#7C3AED] min-w-[200px] text-left transition-all duration-300">
              {words[currentWordIdx]}
            </span>
            <br />
            like themselves.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-secondary-app max-w-2xl font-normal leading-relaxed">
            Stop rewriting character personality in every prompt. Register your AI
            character once. The intelligence layer applies their personality to
            every scene — automatically, invisibly, in the tools you already use.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <Link
              href="/signup"
              className="vn-button-primary px-8 py-3.5 text-base font-bold shadow-xl shadow-purple-600/25 flex items-center gap-2"
            >
              <span>Try It Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToDemo}
              className="px-8 py-3.5 rounded-md border border-app hover:border-[#7C3AED] bg-card-app text-secondary-app hover:text-primary-app text-base font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <span>See It Work</span>
              <ChevronRight className="w-4 h-4 text-muted-app" />
            </button>
          </div>

          {/* Connected To Row */}
          <div className="mt-8 flex flex-col items-center gap-3 pt-6 border-t border-app/60 w-full max-w-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-app">
              Connected via Model Context Protocol (MCP) to:
            </span>
            <div className="flex items-center gap-6 text-sm font-medium text-secondary-app">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-app border border-app">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-primary-app">Claude Desktop</span>
                <span className="text-[10px] text-muted-app font-mono">MCP</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-app border border-app">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="font-semibold text-primary-app">Claude.ai Web</span>
                <span className="text-[10px] text-muted-app font-mono">SSE</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-app border border-app">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-primary-app">ChatGPT</span>
                <span className="text-[10px] text-muted-app font-mono">Actions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DEMO SECTION */}
      <section id="live-demo-section" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-app bg-secondary-app/40">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-[#A78BFA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Simulator</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary-app tracking-tight">
              Type a scene. Watch it become a character.
            </h2>
            <p className="text-sm sm:text-base text-secondary-app">
              You just describe what happens. The Vynter North intelligence layer
              retrieves the character's encrypted personality sheet and enriches it
              with surgical behavioral, physical, and dialogue direction.
            </p>
          </div>

          <DemoInterface initialCharacters={characters} />
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-app bg-primary-app">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
            <span className="text-xs font-bold tracking-wider text-[#7C3AED] uppercase">
              The Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-app tracking-tight">
              How Vynter North Works
            </h2>
            <p className="text-sm text-secondary-app">
              Zero manual prompt engineering for studios. Absolute identity
              consistency for creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="vn-card p-6 flex flex-col gap-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-[#7C3AED]/30">
                1
              </div>
              <h3 className="text-lg font-bold text-primary-app">
                Register Your Character
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                Upload reference images and write the comprehensive 1,000+
                character personality sheet. Your character receives a permanent
                verified CVR ID.
              </p>
            </div>

            {/* Step 2 */}
            <div className="vn-card p-6 flex flex-col gap-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-[#7C3AED]/30">
                2
              </div>
              <h3 className="text-lg font-bold text-primary-app">
                Connect to Your AI Tool
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                Add our MCP server to Claude Desktop or Claude.ai Web with one
                config line. One setup gives your AI assistant instant access to
                your rented roster.
              </p>
            </div>

            {/* Step 3 */}
            <div className="vn-card p-6 flex flex-col gap-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-[#7C3AED]/30">
                3
              </div>
              <h3 className="text-lg font-bold text-primary-app">
                Describe the Scene
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                Just describe what happens. Our intelligence layer calls NVIDIA
                NIM and returns a complete, film-directed behavioral prompt ready
                for Runway, Kling, or HigsField.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-secondary-app/20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-wider text-[#7C3AED] uppercase">
                Marketplace
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-app tracking-tight">
                Meet the Characters
              </h2>
              <p className="text-sm text-secondary-app">
                Pre-trained, fully copyrighted, ready for immediate episodic or commercial rental.
              </p>
            </div>

            <Link
              href="/marketplace"
              className="vn-button-primary px-5 py-2.5 text-sm font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>View Full Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.slice(0, 6).map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
