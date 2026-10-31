"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  ShieldCheck,
  Bot,
  Star,
  Users,
  Film,
  Zap,
} from "lucide-react";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { Character } from "@/lib/types";

export default function HomePage() {
  const words = ["perform", "behave", "react", "feel"];
  const [wordIndex, setWordIndex] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [words.length]);

  useEffect(() => {
    fetch("/api/characters?status=all")
      .then((r) => r.json())
      .then((d) => {
        if (d.characters) setCharacters(d.characters.slice(0, 6));
      })
      .catch((e) => console.warn(e));
  }, []);

  const scrollToDemo = () => {
    const el = document.getElementById("demo-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden py-20 sm:py-32 border-b border-app bg-gradient-to-b from-[#14142A] via-[#0F0F1A] to-[#08080F]">
        {/* Subtle Purple Gradient Mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#7C3AED]/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[#A78BFA]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Character Identity Registry & MCP Layer</span>
          </div>

          {/* Animated Headline with rotating word */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.15]">
            AI characters that actually{" "}
            <span className="inline-block relative">
              <span className="bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-purple-400 bg-clip-text text-transparent transition-all duration-500 underline decoration-[#7C3AED]/40 decoration-wavy underline-offset-8">
                {words[wordIndex]}
              </span>
            </span>{" "}
            like themselves.
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl text-base sm:text-xl text-[#94A3B8] font-normal leading-relaxed">
            Stop rewriting character personality in every prompt. Register once.
            The intelligence layer applies their personality to every scene —
            automatically, invisibly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#7C3AED]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={scrollToDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[#2A2A4A] bg-[#0F0F1A] hover:bg-[#1C1C35] text-white font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#A78BFA] fill-[#A78BFA]" />
              <span>See It Work</span>
            </button>
          </div>

          {/* Small row: Works with: Claude logo | ChatGPT logo — labeled "via MCP" */}
          <div className="pt-6 flex items-center gap-4 text-xs text-[#94A3B8]">
            <span className="uppercase tracking-wider font-semibold text-[10px]">
              Works with:
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14142A] border border-[#1E1E3A]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-bold text-white">Claude</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14142A] border border-[#1E1E3A]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">ChatGPT</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#7C3AED]/20 text-[#A78BFA] text-[10px] font-mono font-bold">
              via MCP
            </span>
          </div>
        </div>
      </section>

      {/* ================= LIVE DEMO SECTION ================= */}
      <section
        id="demo-section"
        className="py-20 border-b border-app bg-[#08080F]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Live Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-app tracking-tight">
              Type a scene. Watch your character come alive.
            </h2>
            <p className="text-sm text-secondary-app max-w-xl mx-auto">
              No login needed. Just describe what happens. The character intelligence adds posture, micro-expressions, and subtext automatically.
            </p>
          </div>

          <DemoInterface initialCharacters={characters} />
        </div>
      </section>

      {/* ================= HOW IT WORKS (3 STEPS) ================= */}
      <section className="py-20 border-b border-app bg-card-app">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Architecture Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-app tracking-tight">
              How Vynter North Works
            </h2>
            <p className="text-sm text-secondary-app max-w-xl mx-auto">
              From personality registration to production-ready AI video prompts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Register */}
            <div className="p-7 rounded-2xl bg-secondary-app border border-app space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-primary-app">
                1. Register Your Character
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                Upload images, write personality. Get permanent CVR ID. Define
                danger reactions, comedic tics, and core contradictions.
              </p>
            </div>

            {/* 2. Connect */}
            <div className="p-7 rounded-2xl bg-secondary-app border border-app space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-primary-app">
                2. Connect Your AI Tool
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                One MCP setup to Claude or ChatGPT. Permanent. Claude never sees
                the raw skill document — only the finished enriched prompt.
              </p>
            </div>

            {/* 3. Describe */}
            <div className="p-7 rounded-2xl bg-secondary-app border border-app space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-primary-app">
                3. Describe the Scene
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                Just say what happens. Character does the rest. Receive cinematographic
                behavioral instructions ready for Runway, Kling, or HigsField.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MARKETPLACE PREVIEW (6 CARDS) ================= */}
      <section className="py-20 bg-primary-app">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                Verified Personas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-app tracking-tight">
                Meet the characters
              </h2>
              <p className="text-sm text-secondary-app">
                AI characters with deep behavioral sheets ready for studio rentals.
              </p>
            </div>

            <Link
              href="/marketplace"
              className="text-xs font-semibold text-[#A78BFA] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Marketplace →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>

          <div className="text-center pt-6">
            <Link
              href="/marketplace"
              className="vn-button-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-lg"
            >
              <span>Explore All Characters on Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
