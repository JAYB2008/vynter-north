import Link from "next/link";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Vynter North",
  description: "Privacy policy regarding character data privacy and account credentials on Vynter North.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--glacier)]/10 text-[var(--glacier)] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-display font-medium text-[var(--text)]">
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-lg bg-[var(--marquee)]/10 border border-[var(--marquee)]/30 flex items-center gap-3 text-xs text-[var(--marquee)]">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Draft — pending legal review.</strong> Learn how Vynter North protects creator identity sheets, scene prompts, and account credentials.
        </span>
      </div>

      <div className="vn-panel p-8 rounded-lg border border-[var(--line)] space-y-6 text-xs text-[var(--text)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">1. Character Personality Sheet Confidentiality</h2>
          <p className="text-[var(--text-dim)]">
            The core promise of Vynter North is zero-leakage identity protection. Unregistered visitors and unrented studios only ever see short (~140-character) behavioral excerpts. Full character sheets are never sent to web browsers, never dumped to AI clients (Claude or ChatGPT), and never used to train public foundational AI models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">2. No Email / Username & Recovery Security</h2>
          <p className="text-[var(--text-dim)]">
            Vynter North accounts do not require email addresses, phone numbers, or third-party social logins. Passwords and 16-character emergency recovery codes are stored strictly as irreversible bcrypt hashes. Only you possess the unhashed recovery code generated during registration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">3. Scene Direction and Prompt Logs</h2>
          <p className="text-[var(--text-dim)]">
            Scene prompts submitted via our web workspace or remote MCP connector are transmitted over TLS directly to our server-side character intelligence layer. NVIDIA NIM inference requests process prompts ephemerally; neither prompts nor synthesized acting directions are retained by model hosting providers for training.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">4. Model Context Protocol (MCP) Telemetry</h2>
          <p className="text-[var(--text-dim)]">
            When connecting Claude or ChatGPT to your remote endpoint, Vynter North logs call metadata (timestamp, tool name, character CVR ID, latency, and success status) into your private connection log so you can monitor usage and verify security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">5. Account Deletion Rights</h2>
          <p className="text-[var(--text-dim)]">
            You may request complete account deletion at any time via Account Settings. Account records, character drafts, and API tokens will be permanently scrubbed, provided no active studio rentals are pending completion.
          </p>
        </section>
      </div>
    </div>
  );
}
