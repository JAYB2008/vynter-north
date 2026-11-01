"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Film, Sparkles, Star, ShieldAlert, Loader2 } from "lucide-react";
import { Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCharacters = () => {
    apiFetch<{ characters: Character[] }>("/api/characters?status=all").then((res) => {
      setLoading(false);
      if (res.ok && res.data.characters) {
        setCharacters(res.data.characters);
      }
    });
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const handleToggle = async (characterId: string, flag: string, currentVal: boolean) => {
    setUpdatingId(characterId);
    const body: any = {};
    if (flag === "suspend") {
      body.suspend = !currentVal;
    } else {
      body[flag] = !currentVal;
    }

    const res = await apiFetch(`/api/admin/characters/${characterId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    setUpdatingId(null);
    if (res.ok) {
      loadCharacters();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)]">
          Character Catalog Moderation
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Toggle platform-level flags: Featured cards, Demo availability (for landing hero), Legend tier induction, and suspension.
        </p>
      </div>

      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--panel-raised)] text-[var(--text-dim)] font-semibold uppercase">
                <th className="py-3 px-4">Character</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3 text-center">Featured</th>
                <th className="py-3 px-3 text-center">Demo Hero</th>
                <th className="py-3 px-3 text-center">Legend Tier</th>
                <th className="py-3 px-3 text-center">Status / Suspend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {characters.map((c) => {
                const isSuspended = c.status === "suspended";
                const isWorking = updatingId === c.id;

                return (
                  <tr key={c.id} className="hover:bg-[var(--panel-raised)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {c.portrait_url && (
                          <img
                            src={c.portrait_url}
                            alt={c.name}
                            className="w-8 h-10 object-cover rounded-[2px] border border-[var(--line)] shrink-0"
                          />
                        )}
                        <div>
                          <Link
                            href={`/characters/${c.id}`}
                            className="font-serif text-sm font-bold text-[var(--text)] hover:text-[var(--glacier)] block leading-tight"
                          >
                            {c.name}
                          </Link>
                          <span className="font-mono text-[10px] text-[var(--text-dim)]">
                            {c.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[var(--text-dim)] font-mono text-[11px]">
                      {c.owner?.username || "creator"}
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(c.is_featured)}
                        disabled={isWorking}
                        onChange={() => handleToggle(c.id, "is_featured", Boolean(c.is_featured))}
                        className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
                      />
                    </td>

                    {/* Demo Hero toggle */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(c.is_demo)}
                        disabled={isWorking}
                        onChange={() => handleToggle(c.id, "is_demo", Boolean(c.is_demo))}
                        className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
                      />
                    </td>

                    {/* Legend Tier toggle */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(c.is_legend)}
                        disabled={isWorking}
                        onChange={() => handleToggle(c.id, "is_legend", Boolean(c.is_legend))}
                        className="w-4 h-4 accent-[var(--marquee)] cursor-pointer"
                      />
                    </td>

                    {/* Suspend toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() => handleToggle(c.id, "suspend", isSuspended)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium ${
                          isSuspended
                            ? "bg-[var(--bad)] text-white"
                            : "bg-[var(--panel-raised)] text-[var(--text-dim)] hover:text-[var(--bad)] border border-[var(--line)]"
                        }`}
                      >
                        {isSuspended ? "Suspended" : "Active (Suspend)"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
