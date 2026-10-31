"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Terminal,
  Cpu,
  Bot,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Rental } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardConnectPage() {
  const { user, role, refreshProfile } = useAuth();
  const [accountKey, setAccountKey] = useState(
    user?.account_key || "vn-prod-key-pending"
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<number | null>(null);

  const [activeGuideTab, setActiveGuideTab] = useState<"desktop" | "web" | "chatgpt">(
    "desktop"
  );
  const [activeOsTab, setActiveOsTab] = useState<"windows" | "mac">("windows");
  const [rentals, setRentals] = useState<Rental[]>([]);

  useEffect(() => {
    if (user?.account_key) {
      setAccountKey(user.account_key);
    }
  }, [user]);

  useEffect(() => {
    fetch("/api/rentals")
      .then((r) => r.json())
      .then((d) => {
        if (d.rentals) setRentals(d.rentals);
      })
      .catch((e) => console.warn(e));
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(accountKey);
    setCopiedKey(true);
    toast.success("Account Key copied to clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (
      !window.confirm(
        "Are you sure you want to regenerate your Account Key? Existing MCP connections using your previous key will stop working immediately."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/profiles/key", {
        method: "POST",
      });
      const data = await res.json();
      if (data.account_key) {
        setAccountKey(data.account_key);
        await refreshProfile();
        toast.success("New Account Key generated!");
      }
    } catch {
      toast.error("Failed to regenerate key.");
    }
  };

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const claudeConfigJson = JSON.stringify(
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

  const copyConfigSnippet = () => {
    navigator.clipboard.writeText(claudeConfigJson);
    setCopiedSnippet(true);
    toast.success("Configuration snippet copied!");
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const exampleCommands = [
    "What characters do I have on Vynter North?",
    "Use Cairo. Scene: he walks into a job interview and the interviewer already looks thoroughly unimpressed.",
    "Check my Vynter North account status",
    "Use Sable. Scene: they find out something that changes everything.",
  ];

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(idx);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="border-b border-app pb-6 space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
          Protocol Standard
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight">
          MCP Integration Center
        </h1>
        <p className="text-xs sm:text-sm text-secondary-app">
          Connect your Vynter North AI characters to Claude Desktop, Claude.ai Web, and ChatGPT.
        </p>
      </div>

      {/* YOUR ACCOUNT KEY */}
      <div className="vn-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-primary-app">
              Your Account Key
            </h2>
            <p className="text-xs text-secondary-app">
              Your master key provides MCP access to all of your rented and owned characters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyKey}
              className="vn-button-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? "Copied" : "Copy Account Key"}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerateKey}
              className="px-3 py-1.5 rounded-xl border border-app bg-elevated-app hover:border-red-500/50 text-xs font-semibold text-secondary-app hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Large Monospace Display */}
        <div className="p-3.5 rounded-xl bg-secondary-app border border-app font-mono text-xs sm:text-sm text-[#A78BFA] select-all break-all flex items-center justify-between">
          <span>{accountKey}</span>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Keep this private. It gives access to all your active characters.</span>
        </div>
      </div>

      {/* YOUR ACTIVE CHARACTERS TABLE (for studios) */}
      <div className="vn-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-primary-app">
            Your Active Characters & MCP Tokens
          </h2>
          <p className="text-xs text-secondary-app">
            Specific MCP tokens for each character lease in your studio roster.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-app text-[11px] font-bold uppercase tracking-wider text-muted-app">
                <th className="py-2.5 px-3">Character</th>
                <th className="py-2.5 px-3">MCP Token</th>
                <th className="py-2.5 px-3">Expires</th>
                <th className="py-2.5 px-3">Credits Remaining</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {rentals.length > 0 ? (
                rentals.map((r) => {
                  const creditsLeft = Math.max(
                    0,
                    r.generation_credits - r.credits_used
                  );
                  return (
                    <tr key={r.id} className="hover:bg-elevated-app/40">
                      <td className="py-3 px-3 font-bold text-primary-app">
                        {r.character?.name || r.character_id}
                      </td>
                      <td className="py-3 px-3 font-mono text-secondary-app">
                        {r.mcp_token.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-3 text-secondary-app">
                        {r.expires_at ? formatDate(r.expires_at) : "Never"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-primary-app">
                        {creditsLeft} credits
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(r.mcp_token);
                            setCopiedToken(r.mcp_token);
                            toast.success("Token copied!");
                            setTimeout(() => setCopiedToken(null), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-elevated-app hover:border-[#7C3AED] border border-app text-[11px] font-semibold text-secondary-app hover:text-primary-app transition-colors"
                        >
                          {copiedToken === r.mcp_token ? "Copied" : "Copy Token"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-app">
                    No active leases. Visit the Marketplace to rent a character.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONNECTION GUIDES (TABBED) */}
      <div className="vn-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-primary-app">
            Connection Guides
          </h2>
          <p className="text-xs text-secondary-app">
            Step-by-step instructions for linking Vynter North to your preferred AI environment.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-app pb-3">
          <button
            type="button"
            onClick={() => setActiveGuideTab("desktop")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeGuideTab === "desktop"
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
            }`}
          >
            Claude Desktop
          </button>

          <button
            type="button"
            onClick={() => setActiveGuideTab("web")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeGuideTab === "web"
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
            }`}
          >
            Claude.ai Web (SSE)
          </button>

          <button
            type="button"
            onClick={() => setActiveGuideTab("chatgpt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeGuideTab === "chatgpt"
                ? "bg-[#7C3AED] text-white shadow-sm"
                : "text-secondary-app hover:text-primary-app hover:bg-elevated-app"
            }`}
          >
            ChatGPT
          </button>
        </div>

        {/* TAB 1 — CLAUDE DESKTOP */}
        {activeGuideTab === "desktop" && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Step 1: Download */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  1
                </span>
                <span>Download Claude Desktop</span>
              </h4>
              <p className="text-secondary-app text-xs pl-7">
                If you do not already have the native Claude Desktop application installed:
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

            {/* Step 2: Open config file */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  2
                </span>
                <span>Open your configuration file</span>
              </h4>

              <div className="pl-7 space-y-2">
                {/* OS Toggle */}
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

            {/* Step 3: Paste config */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-primary-app flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <span>Paste configuration</span>
                </h4>

                <button
                  type="button"
                  onClick={copyConfigSnippet}
                  className="px-3 py-1 rounded-lg bg-elevated-app hover:border-[#7C3AED] border border-app text-xs font-semibold text-primary-app flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSnippet ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSnippet ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>

              <div className="pl-7">
                <pre className="p-4 rounded-xl bg-secondary-app border border-app font-mono text-xs text-primary-app overflow-x-auto leading-relaxed">
                  {claudeConfigJson}
                </pre>
              </div>
            </div>

            {/* Step 4: Restart Claude */}
            <div className="space-y-1">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  4
                </span>
                <span>Restart Claude Desktop</span>
              </h4>
              <p className="text-secondary-app text-xs pl-7">
                Close and reopen Claude Desktop to reload MCP server definitions.
              </p>
            </div>

            {/* Step 5: Test */}
            <div className="space-y-2">
              <h4 className="font-bold text-primary-app flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] flex items-center justify-center">
                  5
                </span>
                <span>Test your integration</span>
              </h4>
              <p className="text-secondary-app text-xs pl-7">
                Type either of these prompt commands into Claude Desktop:
              </p>
              <div className="pl-7 space-y-2">
                <div className="p-2.5 rounded-xl bg-secondary-app border border-app font-mono text-xs text-[#A78BFA] flex items-center justify-between">
                  <span>List my Vynter North characters</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("List my Vynter North characters");
                      toast.success("Copied test command!");
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
                      toast.success("Copied test command!");
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

        {/* TAB 2 — CLAUDE.AI WEB */}
        {activeGuideTab === "web" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <h4 className="font-bold text-primary-app">
              Connect Claude.ai Web via Server-Sent Events (SSE)
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-secondary-app">
              <li>Open Claude.ai in your browser and click on your profile Settings.</li>
              <li>Navigate to <strong>Integrations</strong> or <strong>Custom Tools</strong>.</li>
              <li>Click <strong>Add Integration</strong> and paste this SSE Endpoint URL:</li>
            </ol>

            <div className="p-3 rounded-xl bg-secondary-app border border-app flex items-center justify-between font-mono text-xs text-[#A78BFA]">
              <span>{`${appUrl}/api/mcp/sse`}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${appUrl}/api/mcp/sse`);
                  toast.success("Copied SSE URL!");
                }}
                className="px-3 py-1 rounded-lg bg-elevated-app text-primary-app text-xs font-semibold"
              >
                Copy URL
              </button>
            </div>

            <p className="text-xs text-secondary-app">
              Click <strong>Connect</strong>. Claude will discover the three Vynter North tools automatically!
            </p>
          </div>
        )}

        {/* TAB 3 — CHATGPT */}
        {activeGuideTab === "chatgpt" && (
          <div className="p-8 text-center rounded-2xl bg-secondary-app border border-app space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-[#A78BFA] flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-primary-app">
              ChatGPT MCP Connector — Coming Soon
            </h4>
            <p className="text-xs text-secondary-app max-w-md mx-auto">
              OpenAI is standardizing MCP agent connection support. In the meantime, use the Web or Claude Desktop connectors or copy enriched prompts from our Live Demo.
            </p>
          </div>
        )}
      </div>

      {/* HOW TO USE SECTION: 4 example commands with copy buttons */}
      <div className="vn-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-primary-app">
            How to Use Character Intelligence in Your Chat
          </h2>
          <p className="text-xs text-secondary-app">
            Once connected, simply talk to your AI agent naturally. Try these commands:
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
                onClick={() => handleCopyCommand(cmd, idx)}
                className="p-1.5 rounded-lg bg-card-app hover:bg-elevated-app text-secondary-app hover:text-primary-app transition-colors shrink-0 cursor-pointer"
                title="Copy prompt"
              >
                {copiedCmd === idx ? (
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
