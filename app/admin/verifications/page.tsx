"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { Account } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadVerifications = () => {
    apiFetch<{ verifications: Account[] }>("/api/admin/verifications").then((res) => {
      setLoading(false);
      if (res.ok && res.data.verifications) {
        setVerifications(res.data.verifications);
      }
    });
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleDecision = async (accountId: string, status: "verified" | "rejected") => {
    setUpdatingId(accountId);
    const res = await apiFetch(`/api/admin/verifications`, {
      method: "PATCH",
      body: JSON.stringify({ account_id: accountId, status }),
    });
    setUpdatingId(null);
    if (res.ok) {
      loadVerifications();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)]">
          Studio Verification Queue
        </h1>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Review portfolio channels, agency links, and grant verified studio status badges.
        </p>
      </div>

      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] overflow-hidden shadow-sm">
        {verifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-dim)]">
            No studio verification applications pending.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {verifications.map((acc) => (
              <div
                key={acc.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base text-[var(--text)] font-bold">
                      {acc.studio_name || acc.display_name}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-dim)]">
                      @{acc.username}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium ${
                        acc.verification_status === "verified"
                          ? "bg-[var(--ok)]/15 text-[var(--ok)]"
                          : acc.verification_status === "rejected"
                          ? "bg-[var(--bad)]/15 text-[var(--bad)]"
                          : "bg-[var(--marquee)]/15 text-[var(--marquee)]"
                      }`}
                    >
                      {acc.verification_status}
                    </span>
                  </div>

                  <div className="text-[var(--text-dim)] flex items-center gap-4">
                    <span>Type: {acc.studio_type || "Independent"}</span>
                    {acc.verification_link && (
                      <a
                        href={acc.verification_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--glacier)] hover:underline flex items-center gap-1"
                      >
                        Portfolio Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updatingId === acc.id || acc.verification_status === "verified"}
                    onClick={() => handleDecision(acc.id, "verified")}
                    className="px-3.5 py-1.5 bg-[var(--ok)] text-white font-semibold rounded text-xs hover:brightness-110 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === acc.id || acc.verification_status === "rejected"}
                    onClick={() => handleDecision(acc.id, "rejected")}
                    className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] text-[var(--bad)] rounded text-xs hover:border-[var(--bad)] disabled:opacity-50 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
