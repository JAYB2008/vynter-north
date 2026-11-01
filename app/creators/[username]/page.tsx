"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Globe, Calendar, User, Sparkles } from "lucide-react";
import { CharacterPosterCard } from "@/components/characters/CharacterPosterCard";
import { Character } from "@/lib/types";

interface CreatorProfileData {
  creator: {
    id: string;
    username: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    website: string | null;
    creator_specialties: string[];
    verification_status: string;
    created_at: string;
  };
  characters: Character[];
}

export default function CreatorProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const [data, setData] = useState<CreatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/creators/${params.username}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) {
          setError(res.error?.message || "Creator not found.");
        } else {
          setData(res.data);
        }
      })
      .catch(() => {
        setError("Couldn't reach Vynter North. Check your connection.");
      })
      .finally(() => setLoading(false));
  }, [params.username]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-8 bg-[var(--panel-raised)] rounded w-48" />
        <div className="h-40 bg-[var(--panel-raised)] rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-[var(--panel-raised)] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-display font-medium text-[var(--text)]">
          Creator not found
        </h1>
        <p className="text-sm text-[var(--text-dim)]">
          {error || "The creator you're looking for doesn't exist or has moved."}
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Browse marketplace
        </Link>
      </div>
    );
  }

  const { creator, characters } = data;
  const isVerified = creator.verification_status === "verified";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Top back nav */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to marketplace
        </Link>
      </div>

      {/* Creator Profile Header */}
      <div className="vn-panel p-8 rounded-lg border border-[var(--line)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--panel-raised)] border border-[var(--line)] flex items-center justify-center text-xl font-bold text-[var(--glacier)] overflow-hidden shrink-0">
              {creator.avatar_url ? (
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                creator.display_name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-medium text-[var(--text)]">
                  {creator.display_name}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--ok)] bg-[var(--ok)]/10 px-2 py-0.5 rounded border border-[var(--ok)]/20">
                    <CheckCircle className="w-3 h-3" /> Verified creator
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] text-[var(--text-dim)] bg-[var(--panel-raised)] px-2 py-0.5 rounded border border-[var(--line)]">
                    Creator
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-[var(--text-dim)]">
                @{creator.username}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(creator.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
            </div>
            {creator.website && (
              <a
                href={creator.website.startsWith("http") ? creator.website : `https://${creator.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[var(--glacier)] hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-[var(--text)] max-w-2xl leading-relaxed">
            {creator.bio}
          </p>
        )}

        {/* Specialties */}
        {creator.creator_specialties && creator.creator_specialties.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[var(--line)]">
            <span className="text-xs text-[var(--text-dim)]">Specialties:</span>
            {creator.creator_specialties.map((spec) => (
              <span
                key={spec}
                className="text-xs px-2.5 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text)] border border-[var(--line)]"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Roster of Published Characters */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-medium text-[var(--text)]">
              Characters ({characters.length})
            </h2>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">
              Original AI character identities created by @{creator.username}.
            </p>
          </div>
        </div>

        {characters.length === 0 ? (
          <div className="vn-panel p-12 text-center rounded-lg text-xs text-[var(--text-dim)]">
            This creator has not published any characters yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {characters.map((char) => (
              <CharacterPosterCard key={char.id} character={char} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
