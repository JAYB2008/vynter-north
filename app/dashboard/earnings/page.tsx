"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Users,
  Download,
  Loader2,
} from "lucide-react";
import { Transaction, Character } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function CreatorEarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ transactions: Transaction[]; characters: Character[] }>(
      "/api/transactions"
    ).then((res) => {
      setLoading(false);
      if (res.ok && res.data) {
        setTransactions(res.data.transactions || []);
        setCharacters(res.data.characters || []);
      }
    });
  }, []);

  // Compute real totals from transactions where user is payee
  const totalEarnedCents = transactions.reduce(
    (acc, t) => acc + (t.amount_cents - t.platform_fee_cents),
    0
  );

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const thisMonthCents = transactions
    .filter((t) => new Date(t.created_at).getTime() >= thirtyDaysAgo)
    .reduce((acc, t) => acc + (t.amount_cents - t.platform_fee_cents), 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Test Mode & Payout Notice Banner (Section 8.3 & 9.1) */}
      <div className="p-4 bg-[var(--marquee)]/15 border border-[var(--marquee)]/40 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text)]">
        <div>
          <strong className="text-[var(--marquee)] block sm:inline mr-2">
            Test Mode Active:
          </strong>
          <span>
            Simulated marketplace earnings with 20% platform fee. Payouts open when live payments launch.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[var(--text-dim)] shrink-0">
          Royalty Split: 80% Creator / 20% Platform
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Royalty Ledger
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Creator Earnings & Royalties
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Revenue generated from character rentals and exclusive studio buyouts.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-dim)] font-medium">Total Net Royalties (Test)</span>
          <span className="font-mono text-3xl font-bold text-[var(--text)] block">
            ${(totalEarnedCents / 100).toFixed(2)}
          </span>
          <span className="text-[11px] text-[var(--text-dim)] block">
            Across {transactions.length} transactions
          </span>
        </div>

        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-dim)] font-medium">Last 30 Days</span>
          <span className="font-mono text-3xl font-bold text-[var(--glacier)] block">
            ${(thisMonthCents / 100).toFixed(2)}
          </span>
          <span className="text-[11px] text-[var(--text-dim)] block">
            Current calendar window
          </span>
        </div>

        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-1 shadow-sm">
          <span className="text-xs text-[var(--text-dim)] font-medium">Active Licensed Characters</span>
          <span className="font-mono text-3xl font-bold text-[var(--marquee)] block">
            {characters.length}
          </span>
          <span className="text-[11px] text-[var(--text-dim)] block">
            Generating rental royalties
          </span>
        </div>
      </div>

      {/* Per-Character Performance Table (Section 8.3) */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 space-y-4 shadow-sm">
        <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
          Revenue Breakdown by Character
        </span>

        {characters.length === 0 ? (
          <p className="text-xs text-[var(--text-dim)] italic py-6 text-center">
            No characters registered yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--text-dim)] font-semibold uppercase">
                  <th className="py-2.5 px-3">Character</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 font-mono">Rentals</th>
                  <th className="py-2.5 px-3 font-mono">Gross Volume</th>
                  <th className="py-2.5 px-3 font-mono">Net Royalties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {characters.map((c) => {
                  const charTxs = transactions.filter((t) => t.character_id === c.id);
                  const gross = charTxs.reduce((acc, t) => acc + t.amount_cents, 0);
                  const net = charTxs.reduce(
                    (acc, t) => acc + (t.amount_cents - t.platform_fee_cents),
                    0
                  );

                  return (
                    <tr key={c.id} className="hover:bg-[var(--panel-raised)]">
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/characters/${c.id}`}
                          className="font-serif text-sm text-[var(--text)] hover:text-[var(--glacier)] font-bold block"
                        >
                          {c.name}
                        </Link>
                        <span className="font-mono text-[10px] text-[var(--text-dim)]">
                          {c.id}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-[var(--panel-raised)]">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{c.rental_count}</td>
                      <td className="py-3 px-3 font-mono">${(gross / 100).toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[var(--ok)]">
                        ${(net / 100).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions List (Section 8.3) */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 space-y-4 shadow-sm">
        <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
          Recent Transactions & Fees
        </span>

        {transactions.length === 0 ? (
          <p className="text-xs text-[var(--text-dim)] italic py-6 text-center">
            No transactions recorded yet. When studios rent or buy your talent, entries will log here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--text-dim)] font-semibold uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Kind</th>
                  <th className="py-2.5 px-3">Character</th>
                  <th className="py-2.5 px-3 font-mono">Gross Amount</th>
                  <th className="py-2.5 px-3 font-mono">Platform Fee (20%)</th>
                  <th className="py-2.5 px-3 font-mono">Net Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--panel-raised)]">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-dim)]">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-mono text-[10px]">
                      {tx.kind}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {tx.character_id || "Platform"}
                    </td>
                    <td className="py-2.5 px-3 font-mono">${(tx.amount_cents / 100).toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--bad)]">
                      -${(tx.platform_fee_cents / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--ok)]">
                      ${((tx.amount_cents - tx.platform_fee_cents) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
