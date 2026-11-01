"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Star,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Lock,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  DollarSign,
  Users,
} from "lucide-react";
import { Character, Rental, Review, Offer } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function ManageCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [character, setCharacter] = useState<Character | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "performance" | "rentals" | "reviews" | "offers" | "test" | "settings"
  >("performance");

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Test playground state (source: 'creator_test', Section 8.2)
  const [testScene, setTestScene] = useState(
    "Cairo is offered a lucrative contract by a corporate executive, but notices a recording device on the desk."
  );
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<any>(null);

  // Settings state
  const [saleEnabled, setSaleEnabled] = useState(false);
  const [salePrice, setSalePrice] = useState("750");
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    apiFetch<{ character: Character; reviews: Review[] }>(
      `/api/characters/${encodeURIComponent(id)}`
    ).then((res) => {
      setLoading(false);
      if (res.ok && res.data.character) {
        setCharacter(res.data.character);
        setReviews(res.data.reviews || []);
        setSaleEnabled(Boolean(res.data.character.sale_enabled));
        if (res.data.character.sale_price_cents) {
          setSalePrice((res.data.character.sale_price_cents / 100).toString());
        }
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Run creator test playground (free, Section 8.2)
  const handleRunTest = async () => {
    if (!character || !testScene.trim()) return;
    setTesting(true);
    const res = await apiFetch<any>("/api/enrich", {
      method: "POST",
      body: JSON.stringify({
        character_id: character.id,
        scene: testScene.trim(),
        source: "creator_test",
      }),
    });
    setTesting(false);
    if (res.ok && res.data) {
      setTestOutput(res.data);
    }
  };

  // Reply to review
  const handleReplyReview = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    const res = await apiFetch(`/api/reviews/${reviewId}/reply`, {
      method: "POST",
      body: JSON.stringify({ reply: replyText.trim() }),
    });
    setSubmittingReply(false);
    setReplyingReviewId(null);
    setReplyText("");
    if (res.ok) {
      loadData();
    }
  };

  // Toggle accept new rentals (status active vs closed, Section 8.2)
  const handleToggleAcceptRentals = async () => {
    if (!character) return;
    const newStatus = character.status === "active" ? "closed" : "active";
    setUpdatingSettings(true);
    const res = await apiFetch(`/api/characters/${character.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingSettings(false);
    if (res.ok) {
      loadData();
    }
  };

  // Update sale price / toggle
  const handleSaveSaleSettings = async () => {
    if (!character) return;
    setUpdatingSettings(true);
    const minSalePrice = (character.price_monthly_cents || 5000) * 10;
    const proposedCents = Math.round((parseFloat(salePrice) || 0) * 100);

    const res = await apiFetch(`/api/characters/${character.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        sale_enabled: saleEnabled,
        sale_price_cents: Math.max(minSalePrice, proposedCents),
      }),
    });
    setUpdatingSettings(false);
    if (res.ok) {
      loadData();
    }
  };

  // Delete character with active rental guard (Section 8.2)
  const handleDelete = async () => {
    if (!character) return;
    if (!confirm(`Are you sure you want to retire ${character.name}?`)) return;

    setIsDeleting(true);
    setDeletionError(null);

    const res = await apiFetch(`/api/characters/${character.id}`, {
      method: "DELETE",
    });

    setIsDeleting(false);
    if (res.ok) {
      router.push("/dashboard/characters");
    } else {
      setDeletionError(
        res.error.message ||
          "Cannot delete character while rentals or grace periods are active."
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h1 className="font-serif text-2xl text-[var(--text)]">Character Not Found</h1>
        <Link
          href="/dashboard/characters"
          className="inline-block px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          href="/dashboard/characters"
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {character.portrait_url && (
              <img
                src={character.portrait_url}
                alt={character.name}
                className="w-14 h-18 object-cover rounded-[2px] border border-[var(--line)]"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--text-dim)]">
                  {character.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded uppercase font-mono text-[10px] font-medium ${
                    character.status === "active"
                      ? "bg-[var(--ok)]/15 text-[var(--ok)]"
                      : "bg-[var(--line)] text-[var(--text-dim)]"
                  }`}
                >
                  {character.status}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] leading-tight">
                {character.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/characters/${character.id}`}
              className="px-3.5 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)] flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public View
            </Link>
            <Link
              href={`/dashboard/characters/${character.id}/edit`}
              className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Sheet
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--line)] flex gap-6 overflow-x-auto text-sm">
        {[
          { id: "performance", label: "Performance & Fame" },
          { id: "reviews", label: `Reviews (${reviews.length})` },
          { id: "test", label: "Creator Playground" },
          { id: "settings", label: "Registry Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-medium transition-colors whitespace-nowrap relative ${
              activeTab === tab.id
                ? "text-[var(--glacier)] font-semibold"
                : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--glacier)]" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PERFORMANCE */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-xs text-[var(--text-dim)]">Fame Score</span>
              <span className="text-2xl font-mono font-bold text-[var(--marquee)] block">
                {character.fame_score} pts
              </span>
              <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
                Tier: {character.fame_tier}
              </span>
            </div>

            <div className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-xs text-[var(--text-dim)]">Rentals Completed</span>
              <span className="text-2xl font-mono font-bold text-[var(--text)] block">
                {character.rental_count}
              </span>
              <span className="text-[10px] text-[var(--text-dim)]">
                {character.unique_studios} unique studios
              </span>
            </div>

            <div className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-xs text-[var(--text-dim)]">Average Rating</span>
              <span className="text-2xl font-mono font-bold text-[var(--text)] block">
                {character.rating_avg.toFixed(1)} / 5.0
              </span>
              <span className="text-[10px] text-[var(--text-dim)]">
                {character.review_count} reviews
              </span>
            </div>

            <div className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-1">
              <span className="text-xs text-[var(--text-dim)]">Sheet Depth</span>
              <span className="text-2xl font-mono font-bold text-[var(--glacier)] block">
                {(character.sheet_word_count || 1200).toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--text-dim)]">
                words in master sheet
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEWS */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--text-dim)] bg-[var(--panel)] border border-[var(--line)] rounded-[8px]">
              No reviews received yet.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text)]">
                      {rev.studio?.display_name || "Verified Studio"}
                    </span>
                    <span className="text-[var(--marquee)]">
                      ★ {rev.rating_overall}/5
                    </span>
                  </div>
                  <span className="font-mono text-[var(--text-dim)] text-[11px]">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-[var(--text)]">{rev.body}</p>

                {rev.creator_reply ? (
                  <div className="p-3 bg-[var(--panel-raised)] border-l-2 border-[var(--glacier)] rounded space-y-0.5">
                    <span className="font-semibold text-[var(--text)] text-[11px] block">
                      Your Reply:
                    </span>
                    <p className="text-[var(--text-dim)]">{rev.creator_reply}</p>
                  </div>
                ) : (
                  <div>
                    {replyingReviewId === rev.id ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a single public reply to this review..."
                          className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReplyReview(rev.id)}
                            disabled={submittingReply}
                            className="px-3 py-1 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded"
                          >
                            Post Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1 text-xs text-[var(--text-dim)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReplyingReviewId(rev.id)}
                        className="text-[var(--glacier)] hover:underline text-[11px]"
                      >
                        Reply to review →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CREATOR PLAYGROUND (Section 8.2) */}
      {activeTab === "test" && (
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-4 text-xs shadow-sm">
          <div>
            <h3 className="font-serif text-2xl text-[var(--text)]">
              In-Page Direction Playground
            </h3>
            <p className="text-xs text-[var(--text-dim)] mt-1">
              Test what studios receive when describing scenes for {character.name}. Free creator testing (30 runs/day).
            </p>
          </div>

          <textarea
            rows={4}
            value={testScene}
            onChange={(e) => setTestScene(e.target.value)}
            placeholder="Type a test scene..."
            className="w-full px-4 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] focus:ring-1 focus:ring-[var(--glacier)]"
          />

          <button
            type="button"
            onClick={handleRunTest}
            disabled={testing || !testScene.trim()}
            className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Run Direction Test
          </button>

          {testOutput && (
            <div className="p-5 bg-[var(--night)] border border-[var(--line)] rounded space-y-3 pt-4">
              <span className="text-[11px] font-mono text-[var(--glacier)] block">
                {testOutput.word_count?.original} words in → {testOutput.word_count?.enriched} words out ({testOutput.word_count?.multiplier})
              </span>
              <p className="text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed font-sans">
                {testOutput.enriched_prompt}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS (Section 8.2 rules) */}
      {activeTab === "settings" && (
        <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-6 text-xs shadow-sm">
          {deletionError && (
            <div className="p-4 bg-[var(--bad)]/15 border border-[var(--bad)] rounded text-xs text-[var(--bad)] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{deletionError}</span>
            </div>
          )}

          {/* Stop accepting new rentals (Section 8.2) */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <div>
              <strong className="text-[var(--text)] text-sm block">
                Accept New Rentals
              </strong>
              <span className="text-[var(--text-dim)]">
                {character.status === "active"
                  ? "Currently active on the marketplace. Closing will prevent new rentals while allowing current renters to complete their periods."
                  : "Currently closed to new rentals. Re-activate to show in marketplace search."}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAcceptRentals}
              disabled={updatingSettings}
              className={`px-4 py-2 rounded text-xs font-semibold ${
                character.status === "active"
                  ? "bg-[var(--bad)]/15 border border-[var(--bad)] text-[var(--bad)]"
                  : "bg-[var(--ok)] text-white"
              }`}
            >
              {character.status === "active" ? "Close to New Rentals" : "Re-open Rentals"}
            </button>
          </div>

          {/* Buyout Settings */}
          <div className="space-y-3 pb-4 border-b border-[var(--line)]">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-[var(--text)] text-sm block">
                  Exclusive Buyout Sale
                </strong>
                <span className="text-[var(--text-dim)]">
                  Must be at least 10× monthly rental price (${((character.price_monthly_cents || 5000) * 10 / 100).toFixed(0)} min).
                </span>
              </div>
              <input
                type="checkbox"
                checked={saleEnabled}
                onChange={(e) => setSaleEnabled(e.target.checked)}
                className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
              />
            </div>

            {saleEnabled && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-40 px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveSaleSettings}
                  disabled={updatingSettings}
                  className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] font-semibold rounded text-xs"
                >
                  Save Price
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone: Delete / Retire Character */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <strong className="text-[var(--bad)] text-sm block">
                Retire Character Identity
              </strong>
              <span className="text-[var(--text-dim)]">
                Permanently retires this registration. Blocked while any rental is active or in 10-day grace period.
              </span>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-[var(--bad)] text-white font-semibold rounded text-xs hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Retire Character
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
