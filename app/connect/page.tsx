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
  Radio,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ConnectMCPPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"desktop" | "web" | "chatgpt">("desktop");
  const [activeOsTab, setActiveOsTab] = useState<"windows" | "mac">("windows");
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);
  const [copiedSseUrl, setCopiedSseUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const accountKey = user?.account_key || "vn-test-key-001";
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "vynter-north": {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch"],
          env: {
            MCP_SERVER_URL: `${appUrl}/api/mcp`,
            ACCOUNT_KEY: accountKey,
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

  const copySseUrl = () => {
    navigator.clipboard.writeText(`${appUrl}/api/mcp/sse`);
    setCopiedSseUrl(true);
    toast.success("SSE URL copied!");
    setTimeout(() => setCopiedSseUrl(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(accountKey);
    setCopiedKey(true);
    toast.success("Account Key copied!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const exampleCommands = [
    "What characters do I have on Vynter North?",
    "Use Cairo. Scene: he walks into a job interview and the interviewer already looks thoroughly unimpressed.",
    "Check my Vynter North account status",
    "Use Sable. Scene: they find out something that changes everything.",
  ];

  const handleCopyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedPrompt(idx);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#A78BFA] text-xs font-semibold uppercase tracking-wider">
          <Bot className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Model Context Protocol Standard</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-primary-app tracking-tight">
          Connect Your AI Tools
        </h1>
        <p className="text-sm sm:text-base text-secondary-app leading-relaxed">
          Link Vynter North to Claude Desktop, Claude.ai Web, or ChatGPT to enrich scene prompts automatically with registered character personas.
        </p>
      </div>

      {/* Account Key Card */}
      <div className="vn-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app">
            Your Active Account Key
          </span>
          <code className="text-sm font-mono font-bold text-[#A78BFA] block select-all">
            {accountKey}
          </code>
          <p className="text-xs text-secondary-app">
            This key authenticates your active character rentals through the MCP server.
          </p>
        </div>

        <button
          type="button"
          onClick={copyKey}
          className="vn-button-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? "Copied" : "Copy Account Key"}</span>
        </button>
      </div>

      {/* Tabbed Guides: Claude Desktop | Claude.ai Web | ChatGPT */}
      <div className="vn-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-app pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("desktop")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "desktop"
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
            }`}
          >
            Claude Desktop
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("web")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "web"
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
            }`}
          >
            Claude.ai Web (SSE)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chatgpt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "chatgpt"
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
            }`}
          >
            ChatGPT
          </button>
        </div>

        {/* TAB 1: CLAUDE DESKTOP */}
        {activeTab === "desktop" && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Step 1 */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  1
                </span>
                <span>Download Claude Desktop</span>
              </h4>
              <p className="text-secondary-app text-xs pl-7">
                Ensure you have the native Claude Desktop app installed.
              </p>
              <div className="pl-7">
                <a
                  href="https://claude.ai/download"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-app bg-elevated-app hover:border-[#7C3AED] text-xs font-semibold text-primary-app transition-colors"
                >
                  <span>Download Claude Desktop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  2
                </span>
                <span>Open configuration file</span>
              </h4>
              <div className="pl-7 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveOsTab("windows")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      activeOsTab === "windows"
                        ? "bg-[#7C3AED] text-white"
                        : "bg-elevated-app text-secondary-app"
                    }`}
                  >
                    Windows
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOsTab("mac")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      activeOsTab === "mac"
                        ? "bg-[#7C3AED] text-white"
                        : "bg-elevated-app text-secondary-app"
                    }`}
                  >
                    macOS
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-secondary-app border border-app font-mono text-xs text-[#A78BFA] select-all">
                  {activeOsTab === "windows"
                    ? "%APPDATA%\\Claude\\claude_desktop_config.json"
                    : "~/Library/Application Support/Claude/claude_desktop_config.json"}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-primary-app flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <span>Paste JSON configuration</span>
                </h4>
                <button
                  type="button"
                  onClick={copyConfig}
                  className="px-3 py-1 rounded-lg bg-elevated-app hover:border-[#7C3AED] border border-app text-xs font-semibold text-primary-app flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedConfig ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedConfig ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>

              <div className="pl-7">
                <pre className="p-4 rounded-xl bg-secondary-app border border-app font-mono text-xs text-primary-app overflow-x-auto leading-relaxed">
                  {mcpConfigJson}
                </pre>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-1">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  4
                </span>
                <span>Restart Claude Desktop</span>
              </h4>
              <p className="text-secondary-app text-xs pl-7">
                Restart Claude Desktop to load the Vynter North MCP server.
              </p>
            </div>

            {/* Step 5 */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  5
                </span>
                <span>Test your integration</span>
              </h4>
              <div className="pl-7 space-y-2">
                <div className="p-2.5 rounded-xl bg-secondary-app border border-app font-mono text-xs text-[#A78BFA] flex items-center justify-between">
                  <span>List my Vynter North characters</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("List my Vynter North characters");
                      toast.success("Copied prompt!");
                    }}
                    className="text-muted-app hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary-app border border-app font-mono text-xs text-[#A78BFA] flex items-center justify-between">
                  <span>Use Cairo. Scene: he walks into a crowded room and everyone goes quiet.</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "Use Cairo. Scene: he walks into a crowded room and everyone goes quiet."
                      );
                      toast.success("Copied prompt!");
                    }}
                    className="text-muted-app hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLAUDE WEB */}
        {activeTab === "web" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <h4 className="font-bold text-primary-app">
              Claude.ai Web Server-Sent Events (SSE) Endpoint
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-secondary-app">
              <li>Open Claude.ai in your browser and click Settings.</li>
              <li>Navigate to <strong>Integrations</strong> or <strong>Custom Tools</strong>.</li>
              <li>Add Integration and paste this SSE endpoint:</li>
            </ol>

            <div className="p-3.5 rounded-xl bg-secondary-app border border-app flex items-center justify-between font-mono text-xs text-[#A78BFA]">
              <span>{`${appUrl}/api/mcp/sse`}</span>
              <button
                type="button"
                onClick={copySseUrl}
                className="px-3 py-1 rounded-lg bg-elevated-app text-primary-app text-xs font-semibold hover:border-[#7C3AED] border border-app"
              >
                {copiedSseUrl ? "Copied" : "Copy SSE URL"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CHATGPT */}
        {activeTab === "chatgpt" && (
          <div className="p-8 text-center rounded-2xl bg-secondary-app border border-app space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-[#A78BFA] flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-primary-app">
              ChatGPT MCP Connector — Coming Soon
            </h4>
            <p className="text-xs text-secondary-app max-w-md mx-auto">
              OpenAI is rolling out native MCP protocol connection. In the meantime, connect via Claude Desktop or use our Live Demo interface.
            </p>
          </div>
        )}
      </div>

      {/* HOW TO USE SECTION */}
      <div className="vn-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-primary-app">
            How to Use Character Intelligence in Your Chat
          </h2>
          <p className="text-xs text-secondary-app">
            Once connected, simply prompt Claude naturally with these commands:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exampleCommands.map((cmd, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-secondary-app border border-app flex items-start justify-between gap-3 group hover:border-[#7C3AED]/60 transition-colors"
            >
              <p className="text-xs text-primary-app font-medium leading-relaxed">
                "{cmd}"
              </p>
              <button
                type="button"
                onClick={() => handleCopyCmd(cmd, idx)}
                className="p-1.5 rounded-lg bg-card-app hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors shrink-0 cursor-pointer"
                title="Copy prompt"
              >
                {copiedPrompt === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
