"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Check, X, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { Offer } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function CreatorOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterId, setCounterId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadOffers = () => {
    apiFetch<{ offers: Offer[] }>("/api/offers?role=creator").then((res) => {
      setLoading(false);
      if (res.ok && res.data.offers) {
        setOffers(res.data.offers);
      }
    });
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleAction = async (offerId: string, action: "accept" | "decline" | "counter") => {
    setProcessingId(offerId);
    const body: any = { action };
    if (action === "counter") {
      body.counter_amount_cents = Math.round(parseFloat(counterAmount) * 100);
      body.counter_message = counterMessage;
    }

    const res = await apiFetch(`/api/offers/${offerId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    setProcessingId(null);
    setCounterId(null);
    if (res.ok) {
      loadOffers();
    }
  };

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
          Royalty & Sales
        </span>
        <h1 className="font-serif text-3xl text-[var(--text)] mt-1">
          Character Buyout Offers
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Review exclusive buyout bids from studios. Accepting a bid immediately sells and transfers ownership.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="py-20 text-center text-xs text-[var(--text-dim)]">
          No buyout offers received yet. Make sure "Accept offers" is enabled in your character settings.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-4 text-xs shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                <div>
                  <span className="font-serif text-xl text-[var(--text)] block leading-tight">
                    {offer.character?.name || offer.character_id}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-dim)]">
                    Offer from @{offer.studio?.username || "Studio"} • {new Date(offer.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-[var(--marquee)] block">
                    ${(offer.amount_cents / 100).toFixed(0)}
                  </span>
                  <span className="text-[10px] text-[var(--text-dim)]">
                    Net payout: ${((offer.amount_cents * 0.8) / 100).toFixed(0)} (after 20% platform fee)
                  </span>
                </div>
              </div>

              {(offer.message || (offer.messages && offer.messages.length > 0)) && (
                <p className="text-[var(--text-dim)] italic bg-[var(--panel-raised)] p-3 rounded">
                  "{offer.message || offer.messages?.[0]?.body}"
                </p>
              )}

              {/* Action buttons if open */}
              {offer.status === "open" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId === offer.id}
                      onClick={() => handleAction(offer.id, "accept")}
                      className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded hover:brightness-110 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept Buyout & Sell
                    </button>

                    <button
                      type="button"
                      disabled={processingId === offer.id}
                      onClick={() => setCounterId(counterId === offer.id ? null : offer.id)}
                      className="px-4 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-[var(--text)] rounded hover:border-[var(--glacier)]"
                    >
                      Counter-Offer
                    </button>

                    <button
                      type="button"
                      disabled={processingId === offer.id}
                      onClick={() => handleAction(offer.id, "decline")}
                      className="px-3 py-2 text-[var(--bad)] hover:underline"
                    >
                      Decline
                    </button>
                  </div>

                  {counterId === offer.id && (
                    <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded space-y-3">
                      <span className="font-semibold text-[var(--text)] block">
                        Submit Counter-Offer
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Amount in USD ($)"
                          value={counterAmount}
                          onChange={(e) => setCounterAmount(e.target.value)}
                          className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--text)] font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Optional message..."
                          value={counterMessage}
                          onChange={(e) => setCounterMessage(e.target.value)}
                          className="px-3 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-[var(--text)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAction(offer.id, "counter")}
                        className="px-4 py-1.5 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded text-xs"
                      >
                        Send Counter
                      </button>
                    </div>
                  )}
                </div>
              )}

              {offer.status !== "open" && (
                <span className="inline-block px-2 py-0.5 rounded uppercase font-mono text-[10px] bg-[var(--panel-raised)] text-[var(--text-dim)] font-medium">
                  Status: {offer.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
