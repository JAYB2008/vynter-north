import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
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
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-primary-app">
          Privacy Policy
        </h1>
      </div>

      <div className="vn-card p-8 space-y-6 text-secondary-app text-sm leading-relaxed">
        <p className="text-base text-primary-app font-medium">
          Last updated: October 2025
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">1. Information We Collect</h2>
          <p>
            Vynter North collects user account details (name, email, role) necessary to manage personality registrations and studio rentals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">2. Character Sheet Security</h2>
          <p>
            Full character sheets and deep psychological behavior parameters are encrypted and accessed exclusively through secure runtime enrichment processes. Unregistered third parties cannot inspect raw profile text.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-primary-app">3. AI Model Interaction</h2>
          <p>
            Prompt enrichments processed through our NVIDIA NIM intelligence pipeline transmit scene data solely for inference without training or indexing private prompts.
          </p>
        </section>
      </div>
    </div>
  );
}
