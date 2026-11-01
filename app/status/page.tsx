"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface HealthData {
  ok: boolean;
  version: string;
  time: string;
  services: {
    database: string;
    storage: string;
    nim: string;
    session_secret: string;
  };
  missing_env: string[];
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<HealthData>("/api/health");
      if (res.ok && res.data) {
        setHealth(res.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="min-h-screen bg-night text-text py-16 px-4 sm:px-6">
      <div className="max-w-[760px] mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>

        <div>
          <h1 className="text-3xl font-serif text-text tracking-tight">System Status</h1>
          <p className="mt-1 text-sm text-dim">
            Live operational status across Vynter North database, intelligence runtime, and storage.
          </p>
        </div>

        {/* Global Status Banner */}
        <div
          className={`p-5 rounded-[8px] border flex items-center justify-between ${
            health?.ok
              ? "bg-ok/10 border-ok/30 text-ok"
              : "bg-warn/10 border-warn/30 text-warn"
          }`}
        >
          <div className="flex items-center gap-3">
            {health?.ok ? (
              <CheckCircle2 className="w-6 h-6 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {health?.ok ? "All Systems Operational" : "Degraded Performance or Configuration Needed"}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                Version {health?.version || "1.0.0"} &bull; Last inspected at {lastChecked || "now"}
              </p>
            </div>
          </div>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="p-2 rounded hover:bg-panel focus-ring transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Service Metrics List */}
        <div className="bg-panel border border-line rounded-[8px] divide-y divide-line overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-medium text-sm text-text block">Database Layer</span>
              <span className="text-xs text-dim">Server-side PostgreSQL / Persistence</span>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-panel-raised border border-line text-text">
              {health?.services?.database || "Checking..."}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-medium text-sm text-text block">NVIDIA NIM Runtime</span>
              <span className="text-xs text-dim">Character intelligence prompt synthesis</span>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-panel-raised border border-line text-text">
              {health?.services?.nim || "Checking..."}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-medium text-sm text-text block">Storage System</span>
              <span className="text-xs text-dim">Character portraits and reference vaults</span>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-panel-raised border border-line text-text">
              {health?.services?.storage || "Checking..."}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-medium text-sm text-text block">Session Authentication</span>
              <span className="text-xs text-dim">30-day signed JWT session secrets</span>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-panel-raised border border-line text-text">
              {health?.services?.session_secret || "Checking..."}
            </span>
          </div>
        </div>

        {health?.missing_env && health.missing_env.length > 0 && (
          <div className="p-4 bg-warn/10 border border-warn/30 rounded-[8px] text-xs text-warn">
            <strong>Notice to Administrators:</strong> The following optional or target variables are not configured in this environment:
            <ul className="list-disc list-inside mt-2 font-mono space-y-0.5">
              {health.missing_env.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
