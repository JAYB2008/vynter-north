import Link from "next/link";
import { Users, Film, Sparkles, ArrowRight, Cpu, CheckCircle2, Bot } from "lucide-react";

export default function HomePage() {
  const cards = [
    {
      title: "Characters",
      subtitle: "Character Registry & Profiles",
      description: "Define unique physical styles, personality traits, and dialogue rules for each AI character.",
      href: "/characters",
      icon: Users,
      badge: "Step 1",
      accent: "from-blue-500/10 to-purple-500/10",
      iconColor: "text-blue-600",
      border: "hover:border-blue-400",
    },
    {
      title: "Video Studio",
      subtitle: "Prompt Enrichment & Video Gen",
      description: "Type any plain scene. The Character Intelligence Layer automatically injects behavioral nuance.",
      href: "/studio",
      icon: Film,
      badge: "Core Validation",
      accent: "from-purple-500/15 to-pink-500/15",
      iconColor: "text-[#7C3AED]",
      border: "hover:border-[#7C3AED]",
    },
    {
      title: "Test Intelligence",
      subtitle: "Side-by-Side Comparison",
      description: "See exactly how raw scene prompts transform into rich, character-specific behavioral directions.",
      href: "/demo",
      icon: Sparkles,
      badge: "Live Proof",
      accent: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-600",
      border: "hover:border-emerald-400",
    },
    {
      title: "MCP Connector",
      subtitle: "Claude Desktop Integration",
      description: "Connect Vynter North's character intelligence layer directly to Claude via standard Model Context Protocol.",
      href: "/connect",
      icon: Bot,
      badge: "Claude MCP",
      accent: "from-amber-500/10 to-purple-500/10",
      iconColor: "text-purple-600",
      border: "hover:border-purple-400",
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-xs font-semibold tracking-wide uppercase mb-6 shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-[#7C3AED]" />
          Proof-of-Concept Prototype
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
          Vynter North <span className="text-[#7C3AED]">— POC</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed mb-6">
          Character Intelligence System Validation
        </p>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Proving that when an AI character has a defined psychological and physical skill profile,
          the system can automatically enrich raw studio scene prompts with authentic, consistent behavior.
        </p>
      </div>

      {/* Four Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative flex flex-col justify-between p-7 rounded-2xl bg-white border border-slate-200 ${card.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${card.accent} border border-slate-100 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {card.badge}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[#7C3AED] transition-colors">
                  {card.title}
                </h2>
                <p className="text-xs font-semibold text-[#7C3AED] mb-3">
                  {card.subtitle}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              <div className="flex items-center text-sm font-semibold text-[#7C3AED] group-hover:text-[#6D28D9] transition-colors gap-1.5 pt-4 border-t border-slate-100">
                <span>Explore section</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Validation Hypothesis Callout */}
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Validation Objective
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              What This Proof of Concept Proves
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When a studio types: <span className="text-slate-900 font-medium italic">&ldquo;James trips and falls during football practice in front of the whole team&rdquo;</span>,
              the Character Intelligence Layer automatically detects James&apos;s anxiety, his pride, and his formal defense mechanism, generating facial, postural, and behavioral instructions automatically without the studio writing extra words.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            <Link
              href="/connect"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-900/90 hover:bg-purple-900 text-white font-medium text-sm text-center shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-purple-300" />
              <span>Connect MCP (Claude)</span>
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium text-sm text-center shadow-md shadow-[#7C3AED]/20 transition-all"
            >
              Run Live Test
            </Link>
            <Link
              href="/studio"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm text-center border border-slate-300 transition-all shadow-xs"
            >
              Open Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
