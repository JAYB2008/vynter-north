import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-night py-12 text-sm text-dim">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-line">
          {/* Col 1: Logo & Brand */}
          <div className="md:col-span-2 space-y-3">
            <Logo size="md" />
            <p className="text-sm text-dim max-w-sm leading-relaxed mt-2">
              The character intelligence layer for AI video. Register original AI characters once. Enrich scenes dynamically in Claude, ChatGPT, and video production tools.
            </p>
            <div className="inline-block mt-3 px-2.5 py-1 rounded bg-panel-raised border border-line text-xs text-marquee">
              Payments are in test mode — no real money moves.
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-text block mb-1">
              Platform
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="hover:text-text transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-text transition-colors">
                  Skills
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-text transition-colors">
                  Live demo
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-text transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/casting" className="hover:text-text transition-colors">
                  Casting calls
                </Link>
              </li>
              <li>
                <Link href="/connect" className="hover:text-text transition-colors">
                  Connect MCP
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Legal */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-text block mb-1">
              Resources
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-text transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-text transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-text transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-text transition-colors">
                  System status
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-text transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-text transition-colors">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dim">
          <div>
            &copy; {new Date().getFullYear()} Vynter North. Registered AI talent and character intelligence.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/status" className="hover:text-text transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-ok" />
              <span>Operational</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
