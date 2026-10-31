"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function CreatorEarningsPage() {
  const { user } = useAuth();

  const totalEarnings = user?.total_earnings || 14250.0;
  const pendingPayout = 1840.0;

  // Last 30 days chart mock data points
  const earningsData = [
    { day: "Day 1", amount: 120 },
    { day: "Day 5", amount: 280 },
    { day: "Day 9", amount: 450 },
    { day: "Day 13", amount: 390 },
    { day: "Day 17", amount: 620 },
    { day: "Day 21", amount: 840 },
    { day: "Day 25", amount: 1100 },
    { day: "Day 30", amount: 1350 },
  ];

  // Per-character breakdown: character name | total earned | active rentals | total uses
  const characterBreakdown = [
    {
      id: "CVR-2025-00001",
      name: "Cairo",
      vibe: "Loud. Performative. Secretly terrified.",
      totalEarned: 8420.0,
      activeRentals: 42,
      totalUses: 148,
    },
    {
      id: "CVR-2025-00002",
      name: "Sable",
      vibe: "Still. Watchful. Already decided.",
      totalEarned: 4680.0,
      activeRentals: 28,
      totalUses: 212,
    },
    {
      id: "CVR-2025-00003",
      name: "Drew",
      vibe: "Warm. Impulsive. Breaks things trying to fix them.",
      totalEarned: 1150.0,
      activeRentals: 16,
      totalUses: 410,
    },
  ];

  // Transaction history table: date | character | studio | amount
  const transactions = [
    {
      id: "tx-901",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
      character: "Cairo",
      studio: "Apex CineLabs",
      type: "Monthly Rental",
      amount: 180.0,
      status: "completed",
    },
    {
      id: "tx-902",
      date: new Date(Date.now() - 3600000 * 28).toISOString(),
      character: "Sable",
      studio: "Hyperion Digital",
      type: "Weekly Rental",
      amount: 65.0,
      status: "completed",
    },
    {
      id: "tx-903",
      date: new Date(Date.now() - 3600000 * 72).toISOString(),
      character: "Cairo",
      studio: "NeoTokyo FX",
      type: "Monthly Rental",
      amount: 180.0,
      status: "completed",
    },
    {
      id: "tx-904",
      date: new Date(Date.now() - 3600000 * 120).toISOString(),
      character: "Drew",
      studio: "Starlight Games",
      type: "Credit Boost",
      amount: 45.0,
      status: "completed",
    },
    {
      id: "tx-905",
      date: new Date(Date.now() - 3600000 * 200).toISOString(),
      character: "Sable",
      studio: "Vanguard XR",
      type: "Daily Rental",
      amount: 15.0,
      status: "completed",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Revenue & Royalties
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight mt-1">
            Creator Earnings
          </h1>
          <p className="text-xs sm:text-sm text-secondary-app mt-0.5">
            Real-time character lease royalties, monthly payouts, and studio transactions.
          </p>
        </div>

        <button
          onClick={() => alert("Payout request submitted to processing partner.")}
          className="vn-button-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Earnings */}
        <div className="vn-card p-6 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-app">
            Total All-Time Earnings
          </span>
          <div className="text-3xl sm:text-4xl font-black text-primary-app">
            {formatCurrency(totalEarnings)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+24.6% vs last 30 days</span>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="vn-card p-6 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-app">
            Pending Balance
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#A78BFA]">
            {formatCurrency(pendingPayout)}
          </div>
          <p className="text-xs text-secondary-app">
            Automatically pays out on the 1st of each month.
          </p>
        </div>

        {/* Active Character Leases */}
        <div className="vn-card p-6 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-app">
            Active Character Leases
          </span>
          <div className="text-3xl sm:text-4xl font-black text-primary-app">
            86
          </div>
          <p className="text-xs text-secondary-app">
            Across 14 verified AI production studios.
          </p>
        </div>
      </div>

      {/* Chart: Earnings Over Time (Last 30 Days) */}
      <div className="vn-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-app">
              Earnings Over Time (Last 30 Days)
            </h2>
            <p className="text-xs text-secondary-app">
              Daily accrued rental fees and character generation boosts.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-elevated-app border border-app text-secondary-app">
            30-Day Window
          </span>
        </div>

        {/* CSS Bar Chart Visualization */}
        <div className="h-48 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-app">
          {earningsData.map((d, idx) => {
            const heightPercent = Math.min(100, (d.amount / 1400) * 100);
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              >
                <div
                  className="w-full bg-gradient-to-t from-[#7C3AED] to-[#A78BFA] rounded-t-lg group-hover:brightness-125 transition-all duration-300 relative shadow-sm"
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-0.5 rounded bg-black/90 text-[10px] font-bold text-white whitespace-nowrap z-20">
                    ${d.amount}
                  </div>
                </div>
                <span className="text-[10px] text-muted-app font-medium">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Character Breakdown: character name | total earned | active rentals | total uses */}
      <div className="vn-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-primary-app">
            Per-Character Revenue Breakdown
          </h2>
          <p className="text-xs text-secondary-app">
            Performance metrics across your registered character identity catalog.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-bold uppercase tracking-wider text-muted-app">
                <th className="py-3 px-4">Character Name</th>
                <th className="py-3 px-4">Total Earned</th>
                <th className="py-3 px-4">Active Leases</th>
                <th className="py-3 px-4">Total Uses</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app text-xs">
              {characterBreakdown.map((char) => (
                <tr key={char.id} className="hover:bg-elevated-app/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-primary-app">
                    <div>
                      <span className="font-bold text-sm">{char.name}</span>
                      <span className="block text-[11px] text-muted-app font-mono">
                        {char.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary-app">
                    {formatCurrency(char.totalEarned)}
                  </td>
                  <td className="py-3.5 px-4 text-secondary-app font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px]">
                      {char.activeRentals} studios
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-secondary-app font-mono">
                    {char.totalUses} scenes
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/marketplace/${char.id}`}
                      className="text-xs font-semibold text-[#A78BFA] hover:text-white"
                    >
                      View Profile →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Table: date | character | studio | amount */}
      <div className="vn-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-app">
              Recent Studio Transactions
            </h2>
            <p className="text-xs text-secondary-app">
              Direct settlement records from studio rentals and generation credit purchases.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app text-[11px] font-bold uppercase tracking-wider text-muted-app">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Character</th>
                <th className="py-3 px-4">Studio Client</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app text-xs">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-elevated-app/50 transition-colors">
                  <td className="py-3.5 px-4 text-muted-app whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary-app">
                    {tx.character}
                  </td>
                  <td className="py-3.5 px-4 text-secondary-app font-medium">
                    {tx.studio}
                  </td>
                  <td className="py-3.5 px-4 text-secondary-app">
                    <span className="px-2 py-0.5 rounded-md bg-elevated-app border border-app text-[10px] font-semibold">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    +{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
