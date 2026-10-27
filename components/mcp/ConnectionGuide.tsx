"use client";

import { useState } from "react";
import {
  Bot,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Monitor,
  Globe,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Rental } from "@/lib/types";

interface ConnectionGuideProps {
  accountKey: string;
  activeRentals?: Rental[];
  onRegenerateKey?: () => void;
}

export function ConnectionGuide({
  accountKey,
  activeRentals = [],
  onRegenerateKey,
}: ConnectionGuideProps) {
  const [platformTab, setPlatformTab] = useState<"windows" | "mac">("windows");
  const [activeGuide, setActiveGuide] = useState<"desktop" | "web" | "chatgpt">(
    "desktop"
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedSse, setCopiedSse] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<number | null>(null);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const desktopConfig = JSON.stringify(
    {
      mcpServers: {
        "vynter-north": {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch"],
          env: {
            MCP_SERVER_URL: `${origin}/api/mcp`,
            ACCOUNT_KEY: accountKey || "vn-test-key-001",
          },
        },
      },
    },
    null,
    2
  );

  const sseUrl = `${origin}/api/mcp/sse`;

  const copyText = (
    text: string,
    setFn: (v: boolean) => void,
    msg = "Copied to clipboard!"
  ) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    toast.success(msg);
    setTimeout(() => setFn(false), 2000);
  };

  const exampleCommands = [
    "What characters do I have access to on Vynter North?",
    "Use Cairo. Scene: he sits across from someone in an empty interrogation room.",
    "Check my Vynter North credits",
    "Use Sable. Scene: the group realizes they went the wrong direction and lost an hour.",
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ACCOUNT KEY SECTION */}
      <div className="vn-card p-6 flex flex-col gap-4 border-[#7C3AED]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app pb-3">
          <div>
            <h3 className="text-base font-bold text-primary-app">
              Your Personal Studio Account Key
            </h3>
            <p className="text-xs text-secondary-app">
              This master key links your AI client directly to your registered and rented characters.
            </p>
          </div>
          {onRegenerateKey && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to regenerate your key? You will need to update your Claude config."
                  )
                ) {
                  onRegenerateKey();
                }
              }}
              className="text-xs text-muted-app hover:text-red-400 flex items-center gap-1 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Key</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 font-mono text-sm px-4 py-2.5 rounded-lg bg-elevated-app border border-app text-[#A78BFA] font-bold truncate select-all">
            {accountKey || "vn-test-key-001"}
          </div>
          <button
            onClick={() =>
              copyText(
                accountKey || "vn-test-key-001",
                setCopiedKey,
                "Account key copied!"
              )
            }
            className="vn-button-primary px-5 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedKey ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Key</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Keep this key private. It grants immediate authorization to your rented characters and generation credits.
          </span>
        </div>
      </div>

      {/* ACTIVE CHARACTERS & TOKENS SECTION */}
      {activeRentals.length > 0 && (
        <div className="vn-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-app pb-3">
            <div>
              <h3 className="text-base font-bold text-primary-app">
                Active Character Tokens ({activeRentals.length})
              </h3>
              <p className="text-xs text-secondary-app">
                Direct MCP tokens for your current character roster
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-app text-muted-app uppercase font-semibold text-[10px]">
                  <th className="pb-2.5">Character</th>
                  <th className="pb-2.5">MCP Token</th>
                  <th className="pb-2.5">Credits Left</th>
                  <th className="pb-2.5">Expiry</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {activeRentals.map((r) => {
                  const creditsRemaining = r.generation_credits - r.credits_used;
                  return (
                    <tr key={r.id} className="hover:bg-elevated-app/50">
                      <td className="py-3 font-bold text-primary-app">
                        {r.character?.name || "Cairo"} ({r.character?.id || "CVR"})
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#A78BFA] max-w-[180px] truncate">
                        {r.mcp_token}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {creditsRemaining} credits
                        </span>
                      </td>
                      <td className="py-3 text-secondary-app">
                        {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "Permanent"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(r.mcp_token);
                            toast.success(`Copied token for ${r.character?.name || "character"}`);
                          }}
                          className="px-2.5 py-1 rounded border border-app hover:border-[#7C3AED] bg-elevated-app text-secondary-app hover:text-primary-app font-semibold text-[11px]"
                        >
                          Copy Token
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONNECTION GUIDES */}
      <div className="flex flex-col gap-4">
        {/* Guide Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-app pb-2">
          <button
            onClick={() => setActiveGuide("desktop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              activeGuide === "desktop"
                ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                : "bg-card-app border-app text-secondary-app hover:text-primary-app"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Guide 1: Claude Desktop</span>
          </button>

          <button
            onClick={() => setActiveGuide("web")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              activeGuide === "web"
                ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                : "bg-card-app border-app text-secondary-app hover:text-primary-app"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Guide 2: Claude.ai Web (SSE)</span>
          </button>

          <button
            onClick={() => setActiveGuide("chatgpt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              activeGuide === "chatgpt"
                ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                : "bg-card-app border-app text-secondary-app hover:text-primary-app"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Guide 3: ChatGPT</span>
          </button>
        </div>

        {/* GUIDE 1: CLAUDE DESKTOP */}
        {activeGuide === "desktop" && (
          <div className="vn-card p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <h4 className="text-sm font-bold text-primary-app">
                  Install Claude Desktop
                </h4>
                <p className="text-xs text-secondary-app">
                  Download the official native client from Anthropic if you have not already.
                </p>
              </div>
              <a
                href="https://claude.ai/download"
                target="_blank"
                rel="noreferrer"
                className="ml-auto px-3 py-1.5 rounded-md border border-app hover:border-[#7C3AED] text-xs font-semibold text-secondary-app hover:text-primary-app flex items-center gap-1.5"
              >
                <span>Download</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h4 className="text-sm font-bold text-primary-app">
                  Open your config file
                </h4>
              </div>

              {/* OS Tabs */}
              <div className="flex items-center gap-2 ml-9">
                <button
                  onClick={() => setPlatformTab("windows")}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    platformTab === "windows"
                      ? "bg-elevated-app border border-[#7C3AED] text-primary-app"
                      : "text-muted-app hover:text-secondary-app"
                  }`}
                >
                  Windows
                </button>
                <button
                  onClick={() => setPlatformTab("mac")}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    platformTab === "mac"
                      ? "bg-elevated-app border border-[#7C3AED] text-primary-app"
                      : "text-muted-app hover:text-secondary-app"
                  }`}
                >
                  macOS
                </button>
              </div>

              <div className="ml-9 p-3 rounded-lg bg-elevated-app border border-app font-mono text-xs text-secondary-app select-all">
                {platformTab === "windows"
                  ? "%APPDATA%\\Claude\\claude_desktop_config.json"
                  : "~/Library/Application Support/Claude/claude_desktop_config.json"}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-primary-app">
                    Add your personalized Vynter North connection
                  </h4>
                </div>
                <button
                  onClick={() =>
                    copyText(
                      desktopConfig,
                      setCopiedConfig,
                      "Claude Desktop configuration copied!"
                    )
                  }
                  className="px-3 py-1.5 rounded-md border border-app hover:border-[#7C3AED] text-xs font-semibold flex items-center gap-1.5 text-secondary-app hover:text-primary-app"
                >
                  {copiedConfig ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="ml-9 p-4 rounded-xl bg-elevated-app border border-app font-mono text-xs text-primary-app whitespace-pre overflow-x-auto">
                {desktopConfig}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="text-sm font-bold text-primary-app">
                Restart Claude Desktop
              </h4>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center">
                  5
                </span>
                <h4 className="text-sm font-bold text-primary-app">
                  Test your connection in Claude
                </h4>
              </div>
              <p className="text-xs text-secondary-app ml-9">
                Open a new chat in Claude and run any of these commands:
              </p>
              <div className="ml-9 flex flex-col gap-2">
                <div className="p-3 rounded-lg bg-elevated-app border border-app flex items-center justify-between">
                  <span className="font-mono text-xs text-primary-app">
                    "List my Vynter North characters"
                  </span>
                  <button
                    onClick={() =>
                      copyText(
                        "List my Vynter North characters",
                        () => {},
                        "Prompt copied!"
                      )
                    }
                    className="p-1 text-muted-app hover:text-primary-app"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-elevated-app border border-app flex items-center justify-between">
                  <span className="font-mono text-xs text-primary-app">
                    "Use Cairo. Scene: he walks into a job interview and the interviewer already looks unimpressed."
                  </span>
                  <button
                    onClick={() =>
                      copyText(
                        "Use Cairo. Scene: he walks into a job interview and the interviewer already looks unimpressed.",
                        () => {},
                        "Prompt copied!"
                      )
                    }
                    className="p-1 text-muted-app hover:text-primary-app"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GUIDE 2: CLAUDE.AI WEB */}
        {activeGuide === "web" && (
          <div className="vn-card p-6 flex flex-col gap-5">
            <h4 className="text-sm font-bold text-primary-app">
              Connect to Claude.ai Web via Server-Sent Events (SSE)
            </h4>
            <div className="flex flex-col gap-3 text-xs text-secondary-app">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Open Claude.ai &rarr; Settings &rarr; Integrations.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Click "Add Integration" and select Custom MCP.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div className="flex-1 flex flex-col gap-2">
                  <span>Enter this SSE endpoint URL:</span>
                  <div className="p-3 rounded-lg bg-elevated-app border border-app font-mono text-xs text-primary-app flex items-center justify-between">
                    <span>{sseUrl}</span>
                    <button
                      onClick={() =>
                        copyText(sseUrl, setCopiedSse, "SSE URL copied!")
                      }
                      className="p-1 text-muted-app hover:text-primary-app"
                    >
                      {copiedSse ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <span>Click Connect. Claude will handshake with the Vynter North server.</span>
              </div>
            </div>
          </div>
        )}

        {/* GUIDE 3: CHATGPT */}
        {activeGuide === "chatgpt" && (
          <div className="vn-card p-6 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-primary-app">
              ChatGPT Actions & Custom GPT
            </h4>
            <p className="text-xs text-secondary-app leading-relaxed">
              Native GPT Actions integration is currently in private development preview. You can use OpenAPI action schema linking directly to our <code className="font-mono text-[#A78BFA]">/api/enrich</code> endpoint with your account key.
            </p>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-[#A78BFA] font-medium">
              Coming soon: 1-Click "Add to ChatGPT" button via verified OpenAI Custom GPT directory.
            </div>
          </div>
        )}
      </div>

      {/* HOW TO USE IN CONVERSATION */}
      <div className="vn-card p-6 flex flex-col gap-4">
        <h3 className="text-base font-bold text-primary-app flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
          <span>How to Command Your Characters in Conversation</span>
        </h3>
        <p className="text-xs text-secondary-app">
          Once your MCP server is connected, Claude handles everything natively without you needing to explain character backstory:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exampleCommands.map((cmd, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-elevated-app border border-app flex items-center justify-between gap-2 group hover:border-[#7C3AED] transition-colors"
            >
              <span className="font-mono text-xs text-primary-app">
                "{cmd}"
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cmd);
                  setCopiedCmd(idx);
                  toast.success("Command copied!");
                  setTimeout(() => setCopiedCmd(null), 2000);
                }}
                className="p-1.5 text-muted-app hover:text-primary-app shrink-0"
                title="Copy Command"
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
