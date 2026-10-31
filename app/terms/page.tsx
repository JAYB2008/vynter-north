import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-secondary-app hover:text-primary-app mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED]">
          <Shield className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-primary-app">
          Terms of Service
        </h1>
      </div>

      <div className="vn-card p-8 space-y-6 text-secondary-app text-sm leading-relaxed">
        <p className="text-base text-primary-app font-medium">
          Last updated: October 2025
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Vynter North, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">2. Character Intellectual Property & Ownership</h2>
          <p>
            Character creators retain all original copyright and personality profile rights for AI characters registered on Vynter North. Renting or utilizing a character via MCP licenses behavioral intelligence for generative workflows, without transferring underlying IP ownership unless an explicit permanent purchase is completed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">3. Studio Code of Conduct</h2>
          <p>
            Studios and developers accessing character profiles agree not to scrape, reverse-engineer, or train derivative identity models on character sheets, and to respect the permitted use-case categories specified by creators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">4. Model Context Protocol (MCP) Usage</h2>
          <p>
            Account keys and MCP rental tokens are private to the registered subscriber. Misuse or automated redistribution outside agreed quotas may lead to token revocation.
          </p>
        </section>
      </div>
    </div>
  );
}
