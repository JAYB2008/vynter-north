"use client";

import { useEffect, useState } from "react";
import { Sparkles, BrainCircuit, ArrowRight } from "lucide-react";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { Character } from "@/lib/types";

export default function DemoPage() {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((d) => {
        if (d.characters) setCharacters(d.characters);
      })
      .catch((e) => console.warn(e));
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-[#A78BFA]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Scene Intelligence Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-primary-app tracking-tight">
          Test Character Personality Live
        </h1>
        <p className="text-sm sm:text-base text-secondary-app max-w-xl">
          Experience what happens when Claude or ChatGPT calls the Vynter North
          MCP layer. Type any scene to see it transformed into cinematic film
          direction.
        </p>
      </div>

      <DemoInterface initialCharacters={characters} />
    </div>
  );
}
