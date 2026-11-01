"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Film,
  Key,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/api/admin/metrics").then((res) => {
      setLoading(false);
      if (res.ok && res.data) {
        setMetrics(res.data);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--marquee)] uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Administration Console
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Platform Metrics & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
            Gated executive control center for identity registry, verifications, and MCP health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/status"
            className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] text-xs font-medium text-[var(--text)] rounded hover:border-[var(--glacier)]"
          >
            System Status
          </Link>
        </div>
      </div>

      {/* Metrics Row (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
          <span className="text-[11px] text-[var(--text-dim)]">Accounts</span>
          <span className="text-2xl font-mono font-bold text-[var(--text)] block">
            {metrics?.accounts_count || 0}
          </span>
        </div>

        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
          <span className="text-[11px] text-[var(--text-dim)]">Characters</span>
          <span className="text-2xl font-mono font-bold text-[var(--text)] block">
            {metrics?.characters_count || 0}
          </span>
        </div>

        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
          <span className="text-[11px] text-[var(--text-dim)]">Rentals</span>
          <span className="text-2xl font-mono font-bold text-[var(--glacier)] block">
            {metrics?.rentals_count || 0}
          </span>
        </div>

        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
          <span className="text-[11px] text-[var(--text-dim)]">Enrichments</span>
          <span className="text-2xl font-mono font-bold text-[var(--text)] block">
            {metrics?.enrichments_count || 0}
          </span>
        </div>

        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
          <span className="text-[11px] text-[var(--text-dim)]">MCP Calls</span>
          <span className="text-2xl font-mono font-bold text-[var(--text)] block">
            {metrics?.mcp_calls_count || 0}
          </span>
        </div>

        <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
          <span className="text-[11px] text-[var(--text-dim)]">MCP Errors</span>
          <span className={`text-2xl font-mono font-bold block ${
            (metrics?.mcp_errors_count || 0) > 0 ? "text-[var(--bad)]" : "text-[var(--ok)]"
          }`}>
            {metrics?.mcp_errors_count || 0}
          </span>
        </div>
      </div>

      {/* Moderation Panels (Section 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/admin/characters"
          className="p-6 bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--glacier)] rounded-[10px] space-y-3 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Film className="w-5 h-5 text-[var(--glacier)]" />
            <ArrowRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--glacier)]" />
          </div>
          <span className="font-serif text-xl text-[var(--text)] block">
            Character Catalog Flags
          </span>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            Manage Demo characters (free demo access on hero), Featured talent cards, Legend induction, and suspension.
          </p>
        </Link>

        <Link
          href="/admin/verifications"
          className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] hover:border-[var(--glacier)] space-y-3 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
            <ArrowRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--glacier)]" />
          </div>
          <span className="font-serif text-xl text-[var(--text)] block">
            Studio Verification Queue
          </span>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            Review studio portfolio links, agency documentation, and approve/reject verified studio status badges.
          </p>
        </Link>

        <Link
          href="/admin/mcp-logs"
          className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] hover:border-[var(--glacier)] space-y-3 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Key className="w-5 h-5 text-[var(--marquee)]" />
            <ArrowRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--glacier)]" />
          </div>
          <span className="font-serif text-xl text-[var(--text)] block">
            MCP Protocol Logs
          </span>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            Inspect real-time Streamable HTTP remote MCP tool calls from Claude and ChatGPT connectors.
          </p>
        </Link>
      </div>
    </div>
  );
}
