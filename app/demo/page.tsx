import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { getCharacters } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interactive Intelligence Demo — Vynter North",
  description:
    "Test how Vynter North applies character personality to raw scene descriptions in real time.",
};

export default async function DemoPage() {
  const session = await getSession();
  const admin = isAdmin(session);
  const demoCharacters = await getCharacters({ is_demo: true });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--glacier)]/10 border border-[var(--glacier)]/30 text-xs font-mono text-[var(--glacier)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Intelligence Board</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[var(--text)] tracking-tight">
          Test the Character Intelligence Layer
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-dim)] leading-relaxed">
          Type what happens. The character sheet is read on our server, relevant behavioral traits are retrieved, and camera-ready acting direction is returned.
        </p>
      </div>

      {/* Main Demo Board */}
      <DemoInterface initialCharacters={demoCharacters} isAdmin={admin} />

      {/* Footer Banner */}
      <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-[var(--text)] block text-sm">
            Ready to use your rented characters in Claude or ChatGPT?
          </span>
          <span className="text-[var(--text-dim)]">
            Connect our remote MCP server URL to enrich scenes inside your daily AI workflow.
          </span>
        </div>
        <Link
          href="/connect"
          className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded-[6px] hover:brightness-110 shrink-0 flex items-center gap-1.5"
        >
          View Connect Guide <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
