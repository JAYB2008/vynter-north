"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Clock, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Offer } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function StudioOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ offers: Offer[] }>("/api/offers?role=studio").then((res) => {
      setLoading(false);
      if (res.ok && res.data.offers) {
        setOffers(res.data.offers);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="pb-4 border-b border-[var(--line)]">
        <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
          Commercial Negotiations
        </span>
        <h1 className="font-serif text-3xl text-[var(--text)] mt-1">
          Submitted Buyout Offers
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Permanent character acquisition offers submitted to creators.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="py-20 text-center text-xs text-[var(--text-dim)]">
          No buyout offers submitted yet. When a character accepts offers, you can submit on their profile page.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/characters/${offer.character_id}`}
                    className="font-serif text-lg text-[var(--text)] hover:text-[var(--glacier)]"
                  >
                    {offer.character?.name || offer.character_id}
                  </Link>
                  <span className="font-mono text-[10px] text-[var(--text-dim)]">
                    {offer.character_id}
                  </span>
                </div>
                <div className="text-[var(--text-dim)]">
                  Offered Amount:{" "}
                  <strong className="text-[var(--text)] font-mono">
                    ${(offer.amount_cents / 100).toFixed(0)}
                  </strong>
                </div>
                <span className="text-[11px] text-[var(--text-dim)] font-mono">
                  Submitted {new Date(offer.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium uppercase font-mono ${
                    offer.status === "accepted"
                      ? "bg-[var(--ok)]/15 text-[var(--ok)]"
                      : offer.status === "declined"
                      ? "bg-[var(--bad)]/15 text-[var(--bad)]"
                      : offer.status === "countered"
                      ? "bg-[var(--marquee)]/15 text-[var(--marquee)]"
                      : "bg-[var(--panel-raised)] text-[var(--text-dim)]"
                  }`}
                >
                  {offer.status}
                </span>

                <Link
                  href={`/characters/${offer.character_id}`}
                  className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] hover:border-[var(--glacier)]"
                >
                  View character
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
