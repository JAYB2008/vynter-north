"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Key, Check, X, RefreshCw, Loader2 } from "lucide-react";
import { McpLog } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function AdminMcpLogsPage() {
  const [logs, setLogs] = useState<McpLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    setLoading(true);
    apiFetch<{ logs: McpLog[] }>("/api/mcp/logs").then((res) => {
      setLoading(false);
      if (res.ok && res.data.logs) {
        setLogs(res.data.logs);
      }
    });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[var(--line)] gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)]">
            Streamable HTTP MCP Logs
          </h1>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Real-time JSON-RPC 2.0 remote protocol execution audit log from Claude and ChatGPT connectors.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="px-3.5 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded flex items-center gap-1.5 hover:border-[var(--glacier)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-xs text-[var(--text-dim)]">
            No remote MCP calls recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--panel-raised)] text-[var(--text-dim)] font-semibold uppercase">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Tool</th>
                  <th className="py-2.5 px-3">Character</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--panel-raised)]">
                    <td className="py-2.5 px-3 text-[var(--text-dim)] text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--glacier)]">
                      {log.method}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text)]">
                      {log.tool || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-dim)]">
                      {log.character_id || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.ok ? (
                        <span className="text-[var(--ok)] flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" /> OK
                        </span>
                      ) : (
                        <span className="text-[var(--bad)] flex items-center gap-1 font-semibold">
                          <X className="w-3 h-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-dim)]">
                      {log.ms}ms
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
