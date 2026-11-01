"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const characterId = searchParams.get("character_id") || "";
  const kind = searchParams.get("kind") || "rental"; // 'trial' | 'rental' | 'purchase' | 'free'
  const period = searchParams.get("period") || "30d"; // '1d' | '7d' | '30d'

  const [character, setCharacter] = useState<Character | null>(null);
  const [loadingChar, setLoadingChar] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Mock card state
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardName, setCardName] = useState("Studio Director");

  useEffect(() => {
    if (!characterId) {
      setLoadingChar(false);
      return;
    }
    apiFetch<{ character: Character }>(`/api/characters/${characterId}`).then(
      (res) => {
        setLoadingChar(false);
        if (res.ok && res.data?.character) {
          setCharacter(res.data.character);
        } else {
          setErrorMsg(res.error?.message || "Failed to load character.");
        }
      }
    );
  }, [characterId]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Compute pricing
  let priceCents = 0;
  let creditsIncluded = 50;
  let periodLabel = "1 Day Access";

  if (kind === "trial") {
    priceCents = 0;
    creditsIncluded = 15;
    periodLabel = "3-Day Free Trial";
  } else if (kind === "free") {
    priceCents = 0;
    creditsIncluded = 100;
    periodLabel = "Free Access (No Expiry)";
  } else if (kind === "purchase") {
    priceCents = character?.sale_price_cents || 75000;
    creditsIncluded = 99999;
    periodLabel = "Permanent Exclusive Buyout";
  } else {
    if (period === "7d") {
      priceCents = character?.price_weekly_cents || 2500;
      creditsIncluded = 200;
      periodLabel = "7 Days Access";
    } else if (period === "30d") {
      priceCents = character?.price_monthly_cents || 7500;
      creditsIncluded = 500;
      periodLabel = "30 Days Access";
    } else {
      priceCents = character?.price_daily_cents || 500;
      creditsIncluded = 50;
      periodLabel = "1 Day Access";
    }
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setProcessing(true);
    setErrorMsg(null);

    const res = await apiFetch<{ rental_id: string }>(`/api/checkout`, {
      method: "POST",
      body: JSON.stringify({
        character_id: character.id,
        kind,
        period,
        price_cents: priceCents,
      }),
    });

    setProcessing(false);
    if (res.ok && res.data?.rental_id) {
      router.push(`/studio/library/${res.data.rental_id}?success=true`);
    } else {
      setErrorMsg(res.error?.message || "Checkout failed. Please try again.");
    }
  };

  if (loadingChar) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        <p className="text-xs text-[var(--text-dim)] mt-3">Loading order details…</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-[var(--bad)]" />
        <h1 className="font-serif text-2xl text-[var(--text)]">Order Not Found</h1>
        <p className="text-xs text-[var(--text-dim)]">
          {errorMsg || "The character you are attempting to rent was not specified."}
        </p>
        <Link
          href="/marketplace"
          className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      {/* Test Mode Banner (Section 9.1) */}
      <div className="mb-8 p-4 bg-[var(--marquee)]/15 border border-[var(--marquee)]/40 rounded-[8px] flex items-center justify-between text-xs text-[var(--text)]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[var(--marquee)] animate-pulse" />
          <strong className="font-semibold text-[var(--marquee)]">
            Test Mode Active:
          </strong>
          <span>No real card charges move. Rental access is granted instantly.</span>
        </div>
        <span className="font-mono text-[11px] text-[var(--text-dim)]">
          Platform fee: 20%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Col (7): Card Form */}
        <div className="md:col-span-7 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 space-y-6 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl text-[var(--text)]">
              {kind === "trial"
                ? "Start Free Trial"
                : kind === "free"
                ? "Claim Free Character"
                : "Checkout & Licensing"}
            </h1>
            <p className="text-xs text-[var(--text-dim)] mt-1">
              Simulated sandbox checkout for production talent identity access.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[var(--bad)]/15 border border-[var(--bad)] rounded text-xs text-[var(--bad)]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            {kind !== "trial" && kind !== "free" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Card Number (Test Card)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-dim)]" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs font-mono text-[var(--text)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Expires
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs font-mono text-[var(--text)] text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs font-mono text-[var(--text)] text-center"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning access…
                </>
              ) : kind === "trial" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Start 3-day free trial (0.00)
                </>
              ) : kind === "free" ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Add to Library (Free)
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> Pay ${(priceCents / 100).toFixed(2)} (Test)
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-dim)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--glacier)]" />
            <span>End-to-end sandbox checkout with instant MCP provisioning</span>
          </div>
        </div>

        {/* Right Col (5): Order Summary */}
        <div className="md:col-span-5 bg-[var(--night)] border border-[var(--line)] rounded-[10px] p-6 space-y-4 text-xs">
          <span className="font-semibold text-[var(--text)] uppercase tracking-wider block pb-2 border-b border-[var(--line)]">
            Order Summary
          </span>

          <div className="flex items-center gap-3">
            {character.portrait_url && (
              <img
                src={character.portrait_url}
                alt={character.name}
                className="w-12 h-15 object-cover rounded-[2px] border border-[var(--line)]"
              />
            )}
            <div>
              <span className="font-serif text-lg text-[var(--text)] block leading-tight">
                {character.name}
              </span>
              <span className="font-mono text-[10px] text-[var(--text-dim)]">
                {character.id}
              </span>
            </div>
          </div>

          <div className="divide-y divide-[var(--line)] pt-2">
            <div className="py-2 flex justify-between">
              <span className="text-[var(--text-dim)]">Access Term:</span>
              <span className="text-[var(--text)] font-medium">{periodLabel}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[var(--text-dim)]">Enrichment Credits:</span>
              <span className="font-mono font-bold text-[var(--glacier)]">
                {creditsIncluded.toLocaleString()}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[var(--text-dim)]">MCP & Workspace Access:</span>
              <span className="text-[var(--ok)] font-medium">Included</span>
            </div>
            <div className="py-3 flex justify-between text-sm font-bold text-[var(--text)]">
              <span>Total Due:</span>
              <span className="font-mono">
                {priceCents === 0 ? "Free" : `$${(priceCents / 100).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
