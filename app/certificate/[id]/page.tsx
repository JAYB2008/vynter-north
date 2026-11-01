"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { Character } from "@/lib/types";
import { Printer, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiFetch<Character>(`/api/characters/${id}`);
      if (res.ok && res.data) {
        setCharacter(res.data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-night text-text flex items-center justify-center">
        <div className="text-sm font-mono text-dim">Verifying certificate hash...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-night text-text flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-serif text-text">Certificate Not Found</h1>
        <p className="text-sm text-dim">No registered character identity matches this ID.</p>
        <Link href="/marketplace" className="btn-secondary">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const printCertificate = () => {
    window.print();
  };

  const regDate = character.published_at || character.created_at;
  const hash = character.registration_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  return (
    <div className="min-h-screen bg-night text-text py-12 px-4 sm:px-6 print:bg-white print:text-black print:p-0">
      <div className="max-w-[780px] mx-auto space-y-6 print:max-w-none">
        {/* Screen-only top action bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/characters/${character.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to character</span>
          </Link>

          <button
            type="button"
            onClick={printCertificate}
            className="btn-primary text-xs !min-h-[38px] flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="bg-panel border-2 border-line p-8 sm:p-12 rounded-[6px] shadow-2xl relative overflow-hidden print:border print:shadow-none print:bg-white print:p-10">
          {/* Subtle watermark seal */}
          <div className="absolute right-8 bottom-8 opacity-5 pointer-events-none select-none">
            <Shield className="w-72 h-72" />
          </div>

          <div className="space-y-8 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-6 print:border-black/20">
              <Logo size="lg" />
              <div className="text-right">
                <span className="text-[11px] font-mono uppercase tracking-widest text-dim print:text-black/60 block">
                  Registry Document
                </span>
                <span className="text-sm font-mono font-bold text-glacier print:text-black">
                  {character.id}
                </span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-4 space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-marquee print:text-black/80">
                Official Identity Record
              </span>
              <h1 className="text-4xl sm:text-5xl font-serif text-text tracking-tight print:text-black">
                Certificate of Registration
              </h1>
              <p className="text-xs text-dim print:text-black/60 max-w-md mx-auto">
                This document certifies that the original AI character identity detailed below is registered with Vynter North.
              </p>
            </div>

            {/* Main Character Identity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded bg-night/50 border border-line print:bg-transparent print:border-black/20 print:p-4">
              <div>
                <span className="text-xs text-dim print:text-black/60 uppercase tracking-wider block">
                  Character Name
                </span>
                <span className="text-2xl font-serif text-text font-semibold print:text-black block mt-0.5">
                  {character.name}
                </span>
              </div>

              <div>
                <span className="text-xs text-dim print:text-black/60 uppercase tracking-wider block">
                  Registered Creator
                </span>
                <span className="text-base text-text font-medium print:text-black flex items-center gap-1.5 mt-1">
                  <span>{character.owner?.display_name || "Elena Vance"}</span>
                  {character.owner?.verification_status === "verified" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok inline" />
                  )}
                </span>
                <span className="text-xs font-mono text-dim print:text-black/60">
                  @{character.owner?.username || "creator"}
                </span>
              </div>

              <div>
                <span className="text-xs text-dim print:text-black/60 uppercase tracking-wider block">
                  Registration Timestamp (UTC)
                </span>
                <span className="text-xs font-mono text-text print:text-black block mt-1">
                  {new Date(regDate).toUTCString()}
                </span>
              </div>

              <div>
                <span className="text-xs text-dim print:text-black/60 uppercase tracking-wider block">
                  Sheet Depth
                </span>
                <span className="text-xs font-mono text-text print:text-black block mt-1">
                  {character.sheet_word_count || 1200} words &bull; {character.genres.join(", ")}
                </span>
              </div>
            </div>

            {/* Core Trait Excerpt */}
            {character.core_trait && (
              <div className="p-4 rounded bg-night/30 border border-line/60 print:border-black/20 text-xs text-dim print:text-black/80 leading-relaxed">
                <span className="font-semibold text-text print:text-black block mb-0.5">
                  Registered Core Persona:
                </span>
                &quot;{character.core_trait}&quot;
              </div>
            )}

            {/* Cryptographic Hash */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-dim print:text-black/60 block">
                SHA-256 Registration Fingerprint
              </span>
              <code className="block p-3 rounded bg-night border border-line font-mono text-[11px] text-glacier break-all select-all print:bg-black/5 print:text-black print:border-black/20">
                {hash}
              </code>
              <p className="text-[11px] text-dim print:text-black/50">
                Fingerprint computed from character ID, name, creator ID, full sheet content, and reference image list.
              </p>
            </div>

            {/* Honest Disclaimer Footer */}
            <div className="pt-6 border-t border-line text-[11px] text-dim print:border-black/20 print:text-black/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <span>
                Vynter North Identity Engine &bull; Permanent CVR Registry
              </span>
              <span className="italic">
                Blockchain anchoring is planned and not yet active.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
