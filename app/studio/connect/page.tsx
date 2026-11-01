"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  Bot,
  Copy,
  Check,
  RefreshCw,
  Play,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function StudioConnectPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"claude" | "chatgpt" | "desktop" | "higsfield">("claude");
  const [hostOrigin, setHostOrigin] = useState("");

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    tools?: string[];
    error?: string;
  } | null>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostOrigin(window.location.origin);
    }
  }, []);

  const loadLogs = async () => {
    setLoadingLogs(true);
    const res = await apiFetch<any[]>("/api/mcp/logs");
    setLoadingLogs(false);
    if (res.ok && res.data) {
      setLogs(res.data);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const personalUrl = `${hostOrigin || "https://vynter-north.vercel.app"}/api/mcp/${
    user?.account_key || "vn-your-key-here"
  }`;

  const copyUrl = () => {
    navigator.clipboard.writeText(personalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    const res = await apiFetch<{ tools_found: string[] }>("/api/mcp/test-connection", {
      method: "POST",
    });

    setTestingConnection(false);
    if (res.ok && res.data) {
      setTestResult({ ok: true, tools: res.data.tools_found });
      await loadLogs();
    } else {
      setTestResult({ ok: false, error: res.error.message });
    }
  };

  const handleRegenerateKey = async () => {
    if (
      !window.confirm(
        "Regenerate your personal MCP connector key? Your existing URL will stop working immediately."
      )
    ) {
      return;
    }
    const res = await apiFetch("/api/auth/regenerate-key", { method: "POST" });
    if (res.ok) {
      await refreshUser();
      await loadLogs();
    }
  };

  return (
    <div className="min-h-screen bg-night text-text py-12 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-panel-raised border border-line text-xs font-semibold uppercase text-glacier">
            <Bot className="w-3.5 h-3.5" />
            <span>Studio MCP Connector</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-text mt-2">
            One connection works everywhere.
          </h1>
          <p className="text-sm text-dim mt-1 max-w-2xl leading-relaxed">
            Claude and ChatGPT both add Vynter North as a connector using the same link; the steps differ only by menu. Every scene you describe is enriched on our private server.
          </p>
        </div>

        {/* Secret Connector URL Box */}
        <div className="p-6 rounded-[10px] bg-panel border border-line space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-dim block">
                Your Secret Remote MCP Connector URL
              </span>
              <p className="text-xs text-dim">
                The URL itself contains your authentication key. Keep this private.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRegenerateKey}
              className="btn-secondary text-xs !min-h-[34px] text-bad hover:bg-bad/10 hover:border-bad"
            >
              Regenerate
            </button>
          </div>

          <code className="block p-3.5 rounded-[6px] bg-night border border-line text-xs sm:text-sm font-mono text-glacier select-all overflow-x-auto">
            {personalUrl}
          </code>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={copyUrl}
              className="btn-primary text-xs !min-h-[38px]"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? "Copied" : "Copy connector URL"}</span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="btn-secondary text-xs !min-h-[38px]"
            >
              <Play className={`w-3.5 h-3.5 text-glacier ${testingConnection ? "animate-spin" : ""}`} />
              <span>{testingConnection ? "Testing server..." : "Test connection"}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-[6px] border text-xs leading-relaxed ${
                testResult.ok
                  ? "bg-ok/10 border-ok/30 text-ok"
                  : "bg-bad/10 border-bad/30 text-bad"
              }`}
            >
              {testResult.ok ? (
                <div>
                  <div className="font-semibold flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connection test successful! 6 tools verified:</span>
                  </div>
                  <div className="font-mono text-text flex flex-wrap gap-2 mt-2">
                    {testResult.tools?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-panel-raised border border-line">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection test failed: {testResult.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions Tabs */}
        <div className="p-6 sm:p-8 rounded-[10px] bg-panel border border-line space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
            <button
              onClick={() => setActiveTab("claude")}
              className={`px-4 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                activeTab === "claude"
                  ? "bg-glacier text-glacier-ink font-semibold"
                  : "text-dim hover:text-text hover:bg-panel-raised"
              }`}
            >
              Claude (Web, Desktop, Mobile)
            </button>
            <button
              onClick={() => setActiveTab("chatgpt")}
              className={`px-4 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                activeTab === "chatgpt"
                  ? "bg-glacier text-glacier-ink font-semibold"
                  : "text-dim hover:text-text hover:bg-panel-raised"
              }`}
            >
              ChatGPT
            </button>
            <button
              onClick={() => setActiveTab("desktop")}
              className={`px-4 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                activeTab === "desktop"
                  ? "bg-glacier text-glacier-ink font-semibold"
                  : "text-dim hover:text-text hover:bg-panel-raised"
              }`}
            >
              Claude Desktop (Advanced Config)
            </button>
            <button
              onClick={() => setActiveTab("higsfield")}
              className={`px-4 py-2 rounded-[6px] text-xs font-medium transition-colors ${
                activeTab === "higsfield"
                  ? "bg-glacier text-glacier-ink font-semibold"
                  : "text-dim hover:text-text hover:bg-panel-raised"
              }`}
            >
              HigsField / Video Tools
            </button>
          </div>

          <p className="text-xs text-dim italic">
            Menus change over time. If you cannot find the menu listed below, search the app&apos;s help for &quot;custom connector&quot;.
          </p>

          {activeTab === "claude" && (
            <div className="space-y-3 text-sm text-dim">
              <h3 className="text-base font-semibold text-text">Claude Setup</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Open Claude at <span className="font-mono text-text">claude.ai</span> or on the Claude app.</li>
                <li>Go to <strong>Settings</strong> &rarr; <strong>Connectors</strong> &rarr; <strong>Add custom connector</strong>.</li>
                <li>Name: <span className="font-mono text-text">Vynter North</span></li>
                <li>Paste your personal connector link from above.</li>
                <li>Click <strong>Add</strong>.</li>
              </ol>
              <p className="text-xs text-dim mt-2">
                Note: free Claude plans allow one custom connector. Connectors added on the web appear in desktop and mobile when signed into the same account.
              </p>
            </div>
          )}

          {activeTab === "chatgpt" && (
            <div className="space-y-3 text-sm text-dim">
              <h3 className="text-base font-semibold text-text">ChatGPT Setup</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Open ChatGPT and navigate to <strong>Settings</strong> &rarr; <strong>Apps/Connectors</strong>.</li>
                <li>Under <strong>Advanced</strong>, enable <strong>Developer mode</strong>.</li>
                <li>Click <strong>Create</strong>.</li>
                <li>Name: <span className="font-mono text-text">Vynter North</span></li>
                <li>Paste your personal connector URL.</li>
              </ol>
              <p className="text-xs text-dim mt-2">
                Note: needs a plan that includes developer mode; availability varies by plan and may change.
              </p>
            </div>
          )}

          {activeTab === "desktop" && (
            <div className="space-y-3 text-sm text-dim">
              <h3 className="text-base font-semibold text-text">Claude Desktop (Local JSON Config)</h3>
              <pre className="p-4 bg-night border border-line rounded-[6px] font-mono text-xs text-glacier overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "vynter-north": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${personalUrl}"]
    }
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === "higsfield" && (
            <div className="p-6 text-center space-y-2">
              <h3 className="text-base font-semibold text-text">Native Integration Planned</h3>
              <p className="text-xs text-dim">
                Export directly to HigsField and Kling pipelines will be supported in upcoming runtime releases.
              </p>
            </div>
          )}
        </div>

        {/* Live Connection Log (Investor Demo Moment) */}
        <div className="p-6 rounded-[10px] bg-panel border border-line space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text flex items-center gap-2">
                <Activity className="w-4 h-4 text-glacier" />
                <span>Live Connection Log</span>
              </h2>
              <p className="text-xs text-dim">
                Real-time activity from your connected Claude or ChatGPT sessions (last 10 calls).
              </p>
            </div>
            <button
              onClick={loadLogs}
              disabled={loadingLogs}
              className="p-1.5 rounded hover:bg-panel-raised text-dim hover:text-text cursor-pointer"
              title="Refresh log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center bg-night border border-line rounded-[6px] text-xs text-dim">
              No MCP calls recorded yet. Click &quot;Test connection&quot; above or run a query in Claude to see live telemetry.
            </div>
          ) : (
            <div className="divide-y divide-line bg-night border border-line rounded-[6px] overflow-hidden text-xs">
              {logs.map((log, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-4 font-mono">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.ok ? "bg-ok" : "bg-bad"
                      }`}
                    />
                    <span className="text-text font-semibold">
                      {log.tool || log.method || "call"}
                    </span>
                    {log.character_id && (
                      <span className="text-dim">({log.character_id})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-dim">
                    <span>{log.ms}ms</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
