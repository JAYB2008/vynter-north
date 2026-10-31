"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Bot, ArrowRight } from "lucide-react";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { Character, Rental } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function DemoPage() {
  const { user, isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    fetch("/api/characters?status=all")
      .then((r) => r.json())
      .then((d) => {
        if (d.characters) setCharacters(d.characters);
      })
      .catch((e) => console.warn(e));

    // If logged in, also fetch studio's rented characters to include in dropdown
    if (isAuthenticated) {
      fetch("/api/rentals")
        .then((r) => r.json())
        .then((data) => {
          if (data.rentals) {
            const rentedChars = data.rentals
              .map((r: Rental) => r.character)
              .filter(Boolean);
            if (rentedChars.length > 0) {
              setCharacters((prev) => {
                const map = new Map<string, Character>();
                [...rentedChars, ...prev].forEach((c) => map.set(c.id, c));
                return Array.from(map.values());
              });
            }
          }
        })
        .catch((e) => console.warn(e));
    }
  }, [isAuthenticated]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      {/* Header & Subtext */}
      <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-[#A78BFA]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>No Login Required</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-primary-app tracking-tight">
          Try the Character Intelligence Layer
        </h1>
        <p className="text-sm sm:text-base text-secondary-app max-w-xl">
          Type any scene. See how character personality is automatically applied.
        </p>
      </div>

      {/* Demo Interface */}
      <DemoInterface initialCharacters={characters} />
    </div>
  );
}
