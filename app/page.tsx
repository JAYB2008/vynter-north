import Link from "next/link";
import { Sparkles, ArrowRight, Bot, Star, Play, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-24 sm:py-32 border-b border-[#1E1E3A] bg-gradient-to-b from-[#14142A] via-[#0F0F1A] to-[#08080F]">
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#7C3AED]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Character Intelligence Layer</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI characters that behave <span className="bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-purple-400 bg-clip-text text-transparent">like themselves.</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl text-base sm:text-xl text-[#94A3B8] font-normal leading-relaxed">
            Register your AI character once. The intelligence layer applies their personality to every scene — automatically.
          </p>

          {/* Two Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#7C3AED]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[#2A2A4A] bg-[#0F0F1A] hover:bg-[#1C1C35] text-white font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#A78BFA] fill-[#A78BFA]" />
              <span>See It Work</span>
            </Link>
          </div>
        </div>
      </section>

      {/* THREE FEATURE CARDS: 1. Register → 2. Connect → 3. Create */}
      <section className="py-20 border-b border-[#1E1E3A] bg-[#08080F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How Vynter North Works
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">
              Three seamless steps from character registration to AI video production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Register */}
            <div className="p-7 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-white">Register</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Build a deep personality profile. Define their verbal habits, movement styles, stress reactions, and core contradictions.
              </p>
            </div>

            {/* 2. Connect */}
            <div className="p-7 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-white">Connect</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Link your Vynter account key to Claude Desktop, ChatGPT, or custom video workflows using our native MCP server.
              </p>
            </div>

            {/* 3. Create */}
            <div className="p-7 rounded-2xl bg-[#14142A] border border-[#1E1E3A] space-y-4 hover:border-[#7C3AED]/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-white">Create</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Input any raw scene prompt. The intelligence layer weaves in exact behavioral nuances and outputs ready-to-render instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE CHARACTERS SECTION (Placeholder) */}
      <section className="py-20 bg-[#0F0F1A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Explore Characters
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Browse registered AI personas ready for production rentals.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-xs font-semibold text-[#A78BFA] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View full marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Placeholder grid for characters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#14142A] border border-dashed border-[#2A2A4A] flex flex-col items-center justify-center text-center py-16 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1C35] flex items-center justify-center text-[#A78BFA]">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-white">Marketplace Catalog</p>
              <p className="text-xs text-[#94A3B8] max-w-xs">
                Character registry and marketplace catalog will populate automatically.
              </p>
              <Link
                href="/marketplace"
                className="mt-2 px-4 py-2 rounded-xl bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-[#A78BFA] transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#14142A] border border-dashed border-[#2A2A4A] flex flex-col items-center justify-center text-center py-16 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1C35] flex items-center justify-center text-[#A78BFA]">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-white">Creator Registrations</p>
              <p className="text-xs text-[#94A3B8] max-w-xs">
                Register new personas with behavioral sheets, reference images, and voice profiles.
              </p>
              <Link
                href="/characters/new"
                className="mt-2 px-4 py-2 rounded-xl bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-[#A78BFA] transition-colors"
              >
                Register Character
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#14142A] border border-dashed border-[#2A2A4A] flex flex-col items-center justify-center text-center py-16 space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-full bg-[#1C1C35] flex items-center justify-center text-[#A78BFA]">
                <Bot className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-white">MCP Connection</p>
              <p className="text-xs text-[#94A3B8] max-w-xs">
                Connect your studio tools to Claude & ChatGPT with one click.
              </p>
              <Link
                href="/connect"
                className="mt-2 px-4 py-2 rounded-xl bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-[#A78BFA] transition-colors"
              >
                Set Up Connection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
