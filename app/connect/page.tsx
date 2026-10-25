"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Terminal,
  Settings,
  RefreshCw,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const SAMPLE_PROMPT = "Use the vynter-north tool to check my characters";

export default function ConnectMCPPage() {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [urlType, setUrlType] = useState<"local" | "custom">("local");
  const [customUrl, setCustomUrl] = useState("https://your-domain.com/api/mcp");
  const [serverStatus, setServerStatus] = useState<"online" | "checking" | "offline">("online");

  const mcpServerUrl =
    urlType === "local" ? "http://localhost:3000/api/mcp" : customUrl;

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "vynter-north": {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch"],
          env: {
            MCP_SERVER_URL: mcpServerUrl,
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
    navigator.clipboard.writeText(SAMPLE_PROMPT);
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
            Equip Claude Desktop with the Vynter North Character Intelligence Layer to verify characters, check credit status, and generate nuanced scene directions directly from your chats.
          </p>
        </div>

        {/* Environment Selector and Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">Local MCP Server Status:</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
              Online (Active on Port 3000)
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setUrlType("local")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                urlType === "local"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Localhost (3000)
            </button>
            <button
              type="button"
              onClick={() => setUrlType("custom")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                urlType === "custom"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Custom / Deployed URL
            </button>
          </div>
        </div>

        {urlType === "custom" && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Enter your deployed MCP URL:
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-domain.vercel.app/api/mcp"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        )}

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
              Target Endpoint: <code className="text-white font-mono font-bold">{mcpServerUrl}</code>
            </span>
            <span className="text-slate-400 text-[11px]">
              Key: <code className="text-purple-300 font-mono">vn-test-key-001</code>
            </span>
          </div>
        </div>

        {/* Claude Desktop Config File Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Windows Config File Path:</span>
            <code className="text-[11px] font-mono text-purple-300 break-all select-all">
              %APPDATA%\Claude\claude_desktop_config.json
            </code>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">macOS Config File Path:</span>
            <code className="text-[11px] font-mono text-purple-300 break-all select-all">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            Connection Instructions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-xs text-purple-300">
                  1
                </span>
                <span>Open Claude Settings</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Launch <strong className="text-white">Claude Desktop</strong> and click your profile icon or go to <strong className="text-white">Settings</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-xs text-purple-300">
                  2
                </span>
                <span>Navigate to Developer</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click on <strong className="text-white">Developer</strong> in the sidebar, then click <strong className="text-white">Edit Config</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-xs text-purple-300">
                  3
                </span>
                <span>Paste Configuration</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste the configuration block into your config file, adjust the URL if running locally, and save the file.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-xs text-purple-300">
                  4
                </span>
                <span>Restart Claude Desktop</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Completely close and restart Claude Desktop to initialize the <strong className="text-white">vynter-north</strong> server.
              </p>
            </div>
          </div>
        </div>

        {/* Verification in Claude Prompt */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/60 border border-purple-800/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              After Restart: Verification Prompt
            </span>
            <button
              type="button"
              onClick={copyPrompt}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
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

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm sm:text-base text-white">
            &ldquo;{SAMPLE_PROMPT}&rdquo;
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Type this message into any Claude Desktop conversation. Claude will invoke the <code className="text-purple-300 font-mono">verify_character</code> or <code className="text-purple-300 font-mono">get_character_status</code> MCP tools and return your registered character details and balance.
          </p>
        </div>

        {/* Tools Reference */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Registered MCP Tools
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

        {/* Bottom CTA to test page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Want to test the backend directly?</h3>
            <p className="text-xs text-slate-400">Run an instant browser test against /api/enrich with character Cairo.</p>
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
