"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Copy, Check, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ConnectPublicPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"claude" | "chatgpt" | "desktop" | "higsfield">("claude");
  const [hostOrigin, setHostOrigin] = useState("");
  const [copiedSample, setCopiedSample] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostOrigin(window.location.origin);
    }
  }, []);

  const sampleUrl = `${hostOrigin || "https://vynter-north.vercel.app"}/api/mcp/${
    user?.account_key || "YOUR_ACCOUNT_KEY"
  }`;

  const prompts = [
    "List my Vynter North characters",
    "Check character Cairo on Vynter North",
    "Use Cairo. Scene: he walks into a tense job interview and the interviewer looks unimpressed.",
    "Use Sable. Scene: she notices an armed perimeter patrol while waiting in an empty parking garage.",
    "Check my Vynter North account status",
  ];

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSample(idx);
    setTimeout(() => setCopiedSample(null), 2000);
  };

  return (
    <div className="min-h-screen bg-night text-text py-16 px-4 sm:px-6">
      <div className="max-w-[960px] mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-panel-raised border border-line text-xs font-semibold uppercase text-glacier">
            <Bot className="w-3.5 h-3.5" />
            <span>Remote Model Context Protocol (MCP)</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-text">
            One connection works everywhere.
          </h1>
          <p className="text-base text-dim leading-relaxed">
            Claude and ChatGPT both add Vynter North as a remote connector using the same link; the steps differ only by menu. Once connected, your characters are available directly in your conversations.
          </p>

          {isAuthenticated ? (
            <div className="pt-2">
              <Link href="/studio/connect" className="btn-primary">
                Open your personal connector dashboard
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <Link href="/signup" className="btn-primary">
                Create account to get your personal connector URL
              </Link>
            </div>
          )}
        </div>

        {/* Universal Connector URL Box */}
        <div className="p-6 rounded-[10px] bg-panel border border-line space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-dim">
              Universal Remote MCP Connector Link Format
            </span>
            {isAuthenticated && (
              <span className="text-xs text-glacier font-medium">Personal Key Embedded</span>
            )}
          </div>
          <code className="block p-3.5 rounded-[6px] bg-night border border-line text-sm font-mono text-glacier select-all overflow-x-auto">
            {sampleUrl}
          </code>
          <p className="text-xs text-dim">
            This URL acts as your secret key. Never share it publicly. It automatically routes tool calls to your active character rentals.
          </p>
        </div>

        {/* Platform Tabs */}
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
              Claude Desktop (Local Config)
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

          {/* TAB 1: CLAUDE */}
          {activeTab === "claude" && (
            <div className="space-y-4 text-sm text-dim leading-relaxed">
              <h3 className="text-base font-semibold text-text">Connecting Claude (Web, Desktop, and Mobile)</h3>
              <ol className="list-decimal list-inside space-y-2.5">
                <li>Open Claude at <span className="text-text font-mono">claude.ai</span> or on the Claude mobile/desktop app.</li>
                <li>Go to <strong>Settings</strong> &rarr; <strong>Connectors</strong> (or <strong>Custom Connectors</strong>).</li>
                <li>Click <strong>Add custom connector</strong>.</li>
                <li>Set the connector name to: <span className="font-mono text-text">Vynter North</span></li>
                <li>Paste your personal connector URL.</li>
                <li>Click <strong>Add</strong>.</li>
              </ol>
              <div className="p-3.5 bg-panel-raised border border-line rounded-[6px] text-xs text-dim">
                <strong>Note:</strong> Free Claude plans allow one custom connector. Connectors added on the web appear in desktop and mobile automatically when signed into the same account.
              </div>
            </div>
          )}

          {/* TAB 2: CHATGPT */}
          {activeTab === "chatgpt" && (
            <div className="space-y-4 text-sm text-dim leading-relaxed">
              <h3 className="text-base font-semibold text-text">Connecting ChatGPT</h3>
              <ol className="list-decimal list-inside space-y-2.5">
                <li>Open ChatGPT and go to <strong>Settings</strong> &rarr; <strong>Apps & Connectors</strong>.</li>
                <li>Navigate to <strong>Advanced</strong> and enable <strong>Developer mode</strong>.</li>
                <li>Click <strong>Create Connector</strong>.</li>
                <li>Set the name to: <span className="font-mono text-text">Vynter North</span></li>
                <li>Paste your personal connector URL.</li>
              </ol>
              <div className="p-3.5 bg-panel-raised border border-line rounded-[6px] text-xs text-dim">
                <strong>Note:</strong> Requires a ChatGPT subscription that supports developer mode and custom connectors. Availability varies by plan.
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCED LOCAL CONFIG */}
          {activeTab === "desktop" && (
            <div className="space-y-4 text-sm text-dim leading-relaxed">
              <h3 className="text-base font-semibold text-text">Claude Desktop (Local File Configuration)</h3>
              <p>For developers who prefer file-based configuration. Requires Node.js installed locally:</p>
              <pre className="p-4 bg-night border border-line rounded-[6px] font-mono text-xs text-glacier overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "vynter-north": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${sampleUrl}"]
    }
  }
}`}
              </pre>
              <p className="text-xs text-dim">
                Save in <span className="font-mono text-text">%APPDATA%\Claude\claude_desktop_config.json</span> on Windows or <span className="font-mono text-text">~/Library/Application Support/Claude/claude_desktop_config.json</span> on macOS.
              </p>
            </div>
          )}

          {/* TAB 4: HIGSFIELD */}
          {activeTab === "higsfield" && (
            <div className="p-8 text-center space-y-3">
              <h3 className="text-lg font-serif text-text">Native Integration Planned</h3>
              <p className="text-xs text-dim max-w-md mx-auto">
                Direct export to HigsField, Kling, and Runway is currently under development. Today, copy the enriched film direction prompt from Claude directly into your video generator.
              </p>
            </div>
          )}
        </div>

        {/* Copy-ready Test Prompts */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-serif text-text tracking-tight">Copy-Ready Test Prompts</h2>
            <p className="text-xs text-dim mt-0.5">
              Paste these into Claude or ChatGPT once connected:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[8px] bg-panel border border-line flex items-center justify-between gap-3 text-sm hover:border-glacier transition-colors"
              >
                <span className="text-xs font-mono text-text truncate">&quot;{p}&quot;</span>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(p, idx)}
                  className="p-1.5 rounded hover:bg-panel-raised text-dim hover:text-text shrink-0 cursor-pointer"
                  title="Copy prompt"
                >
                  {copiedSample === idx ? (
                    <Check className="w-3.5 h-3.5 text-ok" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
