"use client";

import { use, useEffect, useState } from "react";
import { CharacterSheetForm } from "@/components/characters/CharacterSheetForm";
import { Character } from "@/lib/types";

export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/characters/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.character) {
          setCharacter(data.character);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
        <span className="text-xs text-secondary-app">Loading character profile...</span>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="py-16 text-center text-sm text-secondary-app">
        Character not found.
      </div>
    );
  }

  return <CharacterSheetForm initialCharacter={character} isEditMode={true} />;
}
