"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageSquare, ArrowLeft, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Review, Rental, Character } from "@/lib/types";

export default function StudioReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [characters, setCharacters] = useState<{ [id: string]: Character }>({});
  const [loading, setLoading] = useState(true);

  // Active review form state
  const [activeRentalId, setActiveRentalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rating_consistency: 5,
    rating_depth: 5,
    rating_value: 5,
    rating_overall: 5,
    review_body: "",
    production_type: "Film / Narrative",
    would_rent_again: "yes",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rentsRes, charsRes] = await Promise.all([
        fetch("/api/rentals"),
        fetch("/api/characters"),
      ]);

      const rentsData = await rentsRes.json();
      const charsData = await charsRes.json();

      const allRentals: Rental[] = rentsData.rentals || rentsData.data || [];
      const allChars: Character[] = charsData.characters || charsData.data || [];

      const charMap: { [id: string]: Character } = {};
      allChars.forEach((c) => {
        charMap[c.id] = c;
      });
      setCharacters(charMap);
      setRentals(allRentals);

      // Collect all reviews for characters in studio library
      const revList: Review[] = [];
      for (const r of allRentals) {
        const revRes = await fetch(`/api/reviews?character_id=${r.character_id}`);
        const revData = await revRes.json();
        if (revData.ok && revData.data) {
          revData.data.forEach((rv: Review) => {
            if (rv.rental_id === r.id) {
              revList.push(rv);
            }
          });
        }
      }
      setReviews(revList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load review data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter rentals eligible for review: ended or expired, and not yet reviewed
  const reviewedRentalIds = new Set(reviews.map((r) => r.rental_id));
  const now = new Date();
  const eligibleRentals = rentals.filter((r) => {
    if (reviewedRentalIds.has(r.id)) return false;
    const isExpired = r.expires_at ? new Date(r.expires_at) < now : false;
    return isExpired || r.ended_early;
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRentalId) return;

    if (formData.review_body.trim().length < 50) {
      toast.error("Review must be at least 50 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rental_id: activeRentalId,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error?.message || "Failed to submit review.");
        return;
      }

      toast.success("Review submitted. Thank you for your feedback!");
      setActiveRentalId(null);
      setFormData({
        rating_consistency: 5,
        rating_depth: 5,
        rating_value: 5,
        rating_overall: 5,
        review_body: "",
        production_type: "Film / Narrative",
        would_rent_again: "yes",
      });
      loadData();
    } catch {
      toast.error("Could not reach Vynter North. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href="/studio/library"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to library
        </Link>
        <h1 className="text-3xl font-display font-medium text-[var(--text)]">
          Studio Reviews & Experience
        </h1>
        <p className="text-sm text-[var(--text-dim)] mt-1">
          Review completed rentals to help creators improve and build character reputation.
        </p>
      </div>

      {/* Eligible Rentals for Review */}
      {eligibleRentals.length > 0 && (
        <div className="vn-panel p-6 rounded-lg border border-[var(--glacier)]/30 space-y-4 bg-[var(--panel)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--glacier)]" />
            <h2 className="text-base font-semibold text-[var(--text)]">
              Rentals awaiting your review ({eligibleRentals.length})
            </h2>
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            These character rentals have concluded. Share your direct feedback on performance and behavioral consistency.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {eligibleRentals.map((r) => {
              const char = characters[r.character_id];
              const isFormOpen = activeRentalId === r.id;

              return (
                <div
                  key={r.id}
                  className="bg-[var(--panel-raised)] p-4 rounded border border-[var(--line)] flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-[var(--text)]">
                      {char?.name || "Character"}
                    </div>
                    <div className="text-xs text-[var(--text-dim)] font-mono mt-0.5">
                      {r.character_id} · {r.kind}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveRentalId(isFormOpen ? null : r.id)}
                    className="px-3 py-1.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110 transition-all self-start"
                  >
                    {isFormOpen ? "Close form" : "Write a review"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Review Form Drawer/Panel */}
          {activeRentalId && (
            <form
              onSubmit={handleSubmitReview}
              className="mt-6 p-6 rounded-lg bg-[var(--panel-raised)] border border-[var(--line)] space-y-4"
            >
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Review for {characters[rentals.find((r) => r.id === activeRentalId)?.character_id || ""]?.name}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-dim)] block mb-1">
                    Consistency (1–5 ★)
                  </label>
                  <select
                    value={formData.rating_consistency}
                    onChange={(e) =>
                      setFormData({ ...formData, rating_consistency: Number(e.target.value) })
                    }
                    className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--text)]"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>
                        {s} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-dim)] block mb-1">
                    Personality depth (1–5 ★)
                  </label>
                  <select
                    value={formData.rating_depth}
                    onChange={(e) =>
                      setFormData({ ...formData, rating_depth: Number(e.target.value) })
                    }
                    className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--text)]"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>
                        {s} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-dim)] block mb-1">
                    Value for price (1–5 ★)
                  </label>
                  <select
                    value={formData.rating_value}
                    onChange={(e) =>
                      setFormData({ ...formData, rating_value: Number(e.target.value) })
                    }
                    className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--text)]"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>
                        {s} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[var(--text-dim)] block mb-1">
                    Overall rating (1–5 ★)
                  </label>
                  <select
                    value={formData.rating_overall}
                    onChange={(e) =>
                      setFormData({ ...formData, rating_overall: Number(e.target.value) })
                    }
                    className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--text)] font-bold text-[var(--marquee)]"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>
                        {s} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-dim)] block mb-1">
                    Production type
                  </label>
                  <input
                    type="text"
                    value={formData.production_type}
                    onChange={(e) =>
                      setFormData({ ...formData, production_type: e.target.value })
                    }
                    placeholder="e.g. Narrative Short, Commercial, Game Pilot"
                    className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--text)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--text-dim)] block mb-1">
                    Would rent again?
                  </label>
                  <select
                    value={formData.would_rent_again}
                    onChange={(e) =>
                      setFormData({ ...formData, would_rent_again: e.target.value })
                    }
                    className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-1.5 text-xs text-[var(--text)]"
                  >
                    <option value="yes">Yes</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-dim)] block mb-1">
                  Written review (minimum 50 characters)
                </label>
                <textarea
                  rows={4}
                  value={formData.review_body}
                  onChange={(e) =>
                    setFormData({ ...formData, review_body: e.target.value })
                  }
                  placeholder="Describe how the character performed in your scenes, how well behavioral nuances carried across prompts, and tips for future directors..."
                  className="w-full bg-[var(--panel)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--glacier)]"
                />
                <div className="flex justify-between items-center text-[11px] text-[var(--text-dim)] mt-1">
                  <span>
                    {formData.review_body.length} / 50 min characters
                  </span>
                  {formData.review_body.length >= 50 && (
                    <span className="text-[var(--ok)] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid length
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRentalId(null)}
                  className="px-4 py-2 border border-[var(--line)] rounded text-xs text-[var(--text)] hover:bg-[var(--panel)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.review_body.trim().length < 50}
                  className="px-5 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Submitted Reviews List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--text)]">
          Your published reviews ({reviews.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="vn-panel p-6 animate-pulse h-28 rounded-lg" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="vn-panel p-8 text-center rounded-lg text-xs text-[var(--text-dim)]">
            You haven't submitted any character reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const char = characters[r.character_id];
              return (
                <div key={r.id} className="vn-panel p-5 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-[var(--text)]">
                        {char?.name || "Character"}
                      </span>
                      <span className="text-xs text-[var(--text-dim)] font-mono ml-2">
                        {r.character_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--marquee)]">
                      <Star className="w-3.5 h-3.5 fill-[var(--marquee)]" />
                      {r.rating_overall}.0
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text)] italic leading-relaxed">
                    "{r.body}"
                  </p>

                  <div className="text-[11px] text-[var(--text-dim)] flex items-center justify-between border-t border-[var(--line)] pt-2">
                    <span>
                      {r.production_type} · Would rent again: {r.would_rent_again}
                    </span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
