"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Terminal,
  Bot,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Globe,
} from "lucide-react";
import Link from "next/link";

const EXACT_PROMPT = "Use the vynter-north tool to check my characters";

export default function ConnectMCPPage() {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [urlOption, setUrlOption] = useState<"deployed" | "template" | "local">("deployed");

  const getUrl = () => {
    switch (urlOption) {
      case "deployed":
        return "https://vynter-north.vercel.app/api/mcp";
      case "template":
        return "https://[their-deployed-url]/api/mcp";
      case "local":
        return "http://localhost:3000/api/mcp";
    }
  };

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "vynter-north": {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch"],
          env: {
            MCP_SERVER_URL: getUrl(),
            ACCOUNT_KEY: "vn-test-key-001",
          },
        },
      },
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopiedConfig(true);
    toast.success("Claude Desktop MCP configuration copied!");
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(EXACT_PROMPT);
    setCopiedPrompt(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-800/50 text-purple-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            Model Context Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Connect to Claude Desktop
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Connect your Claude Desktop client to Vynter North to verify characters, check active balances, and rewrite video scenes into nuanced cinematic directions.
          </p>
        </div>

        {/* Step-by-Step Direct Action Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-purple-950/70 border border-purple-800/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Connection Instructions</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/60 text-sm sm:text-base font-semibold text-white leading-relaxed">
            Go to <strong className="text-purple-300">Claude Desktop</strong> → <strong className="text-purple-300">Settings</strong> → <strong className="text-purple-300">Developer</strong> → <strong className="text-purple-300">Edit Config</strong> → paste this → save → restart Claude Desktop.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="text-slate-400">Config file location:</span>
            <code className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[11px]">
              %APPDATA%\Claude\claude_desktop_config.json
            </code>
            <span className="text-slate-500">or</span>
            <code className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[11px]">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
          </div>
        </div>

        {/* Target URL Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">Select MCP Server Target:</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setUrlOption("deployed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                urlOption === "deployed"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live Vercel URL
            </button>
            <button
              type="button"
              onClick={() => setUrlOption("template")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                urlOption === "template"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              [their-deployed-url]
            </button>
            <button
              type="button"
              onClick={() => setUrlOption("local")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                urlOption === "local"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              localhost:3000
            </button>
          </div>
        </div>

        {/* Configuration Code Block */}
        <div className="rounded-2xl bg-slate-900 border border-purple-900/50 overflow-hidden shadow-2xl shadow-purple-950/30">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">claude_desktop_config.json</span>
            </div>
            <button
              type="button"
              onClick={copyConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-900/40 cursor-pointer"
            >
              {copiedConfig ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copy Config</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 font-mono text-xs sm:text-sm text-purple-100 bg-slate-950 overflow-x-auto leading-relaxed">
            <pre>{mcpConfigJson}</pre>
          </div>

          <div className="p-3.5 bg-purple-950/30 border-t border-purple-950/60 text-xs text-purple-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Configured URL: <code className="text-white font-mono font-bold">{getUrl()}</code>
            </span>
            <span className="text-slate-400 text-[11px]">
              Key: <code className="text-purple-300 font-mono">vn-test-key-001</code>
            </span>
          </div>
        </div>

        {/* Prompt to run in Claude after restart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              After restart, type in Claude:
            </span>
            <button
              type="button"
              onClick={copyPrompt}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 font-mono text-sm sm:text-base text-white">
            &ldquo;{EXACT_PROMPT}&rdquo;
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Claude will automatically invoke the <code className="text-purple-300 font-mono">verify_character</code> and <code className="text-purple-300 font-mono">get_character_status</code> MCP tools to return your active character balance (500 credits) and skill profile for Cairo.
          </p>
        </div>

        {/* Tools Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Available MCP Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400 block">
                verify_character
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verifies account key and checks if Cairo is active with remaining credits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400 block">
                get_scene_instruction
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enriches any raw scene description with Cairo&apos;s behavioral traits and camera directions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400 block">
                get_character_status
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Returns the list of active characters, balance (500 credits), and 30-day expiration.
              </p>
            </div>
          </div>
        </div>

        {/* Link to Test Page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Need to test character enrichment directly in browser?</h3>
            <p className="text-xs text-slate-400">Run test prompts against /api/enrich on the dedicated testing bench.</p>
          </div>
          <Link
            href="/test"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <span>Open Test Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
