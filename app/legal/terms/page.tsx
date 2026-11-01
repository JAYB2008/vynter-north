import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Vynter North",
  description: "Terms of Service governing Vynter North character identity registration and rentals.",
};

export default function TermsOfServicePage() {
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
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-display font-medium text-[var(--text)]">
            Terms of Service
          </h1>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-lg bg-[var(--marquee)]/10 border border-[var(--marquee)]/30 flex items-center gap-3 text-xs text-[var(--marquee)]">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Draft — pending legal review.</strong> These terms outline current platform operations, licensing scopes, and sandbox parameters.
        </span>
      </div>

      <div className="vn-panel p-8 rounded-lg border border-[var(--line)] space-y-6 text-xs text-[var(--text)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">1. Purpose and Identity Registry</h2>
          <p className="text-[var(--text-dim)]">
            Vynter North provides an identity registry, behavioral intelligence layer, and marketplace for original synthetic AI characters. Character identities registered under a Character Verification Registry (CVR) ID represent proprietary personality and stylistic profiles designed for generative video and interactive media.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">2. Creator Rights and Intellectual Property</h2>
          <p className="text-[var(--text-dim)]">
            Creators retain 100% ownership of their original character profiles, physical appearance specifications, and situational behavior sheets. Registering a character licenses Vynter North to index the sheet and synthesize behavioral acting instructions. Unless an explicit, permanent exclusive buyout is executed, creators may license or rent the character concurrently to multiple studios.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">3. Studio Access, Rentals & Licensing Scope</h2>
          <p className="text-[var(--text-dim)]">
            Studios renting a character receive temporary behavioral enrichment direction via the web workspace or remote Model Context Protocol (MCP) connection for the duration of the rental. Studios agree:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-dim)]">
            <li>Not to attempt reverse-engineering, scraping, or training derivative identity models from the character sheet.</li>
            <li>To respect permitted usage categories (film, advertising, social, gaming) declared by the creator.</li>
            <li>That rentals grant non-exclusive generative acting rights and do not transfer character trademark or underlying IP ownership.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">4. Remote Model Context Protocol (MCP) Standards</h2>
          <p className="text-[var(--text-dim)]">
            Personal connector links (<code className="text-[var(--glacier)] font-mono">/api/mcp/[key]</code>) and session keys are private to your studio account. Automated distribution or sharing of keys beyond your production team is strictly prohibited. Vynter North reserves the right to revoke or rate-limit keys that exhibit abusive patterns.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">5. Payments and Test Mode Notice</h2>
          <p className="text-[var(--text-dim)]">
            All marketplace transactions, credit purchases, and plan subscriptions currently execute in <strong>test mode</strong>. No real credit card charges are processed and no financial disbursements take place until production live billing is officially enabled.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">6. Character Termination & Deletion Protections</h2>
          <p className="text-[var(--text-dim)]">
            To protect studio productions, creators may not delete or retire an active character while active rental agreements or 10-day post-expiration grace periods remain in effect. Characters may only be deleted once all active rentals have fully concluded.
          </p>
        </section>
      </div>
    </div>
  );
}
