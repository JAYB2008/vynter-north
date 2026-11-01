"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageSquare, CornerDownRight, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Review, Character } from "@/lib/types";

interface ReviewWithCharacter extends Review {
  character?: Character;
}

export default function CreatorReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [reviewId: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [reviewId: string]: boolean }>({});

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch creator characters first
      const charRes = await fetch("/api/characters?status=all");
      const charData = await charRes.json();
      const myCharacters: Character[] = charData.data || charData.characters || [];

      // Collect reviews for all my characters
      const allReviews: ReviewWithCharacter[] = [];
      for (const char of myCharacters) {
        const revRes = await fetch(`/api/reviews?character_id=${char.id}`);
        const revData = await revRes.json();
        if (revData.ok && revData.data) {
          revData.data.forEach((r: Review) => {
            allReviews.push({ ...r, character: char });
          });
        }
      }

      setReviews(allReviews);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId: string) => {
    const text = (replyText[reviewId] || "").trim();
    if (!text) {
      toast.error("Reply cannot be empty.");
      return;
    }

    try {
      setSubmittingReply((prev) => ({ ...prev, [reviewId]: true }));
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error?.message || "Failed to post reply.");
        return;
      }
      toast.success("Reply published.");
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      fetchReviews();
    } catch {
      toast.error("Could not reach Vynter North. Check your connection.");
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to overview
          </Link>
          <h1 className="text-3xl font-display font-medium text-[var(--text)]">
            Character Reviews
          </h1>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            Ratings and feedback from studios that have used your characters.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vn-panel p-6 animate-pulse h-32 rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="vn-panel p-12 text-center rounded-lg space-y-3">
          <MessageSquare className="w-10 h-10 text-[var(--text-dim)] mx-auto opacity-50" />
          <h3 className="text-base font-medium text-[var(--text)]">No reviews yet</h3>
          <p className="text-xs text-[var(--text-dim)] max-w-md mx-auto">
            Once studios complete their rental periods, their ratings and written feedback will appear here. You can post a public reply to any review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="vn-panel p-6 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {rev.character?.name || "Character"}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-dim)]">
                      {rev.character?.id}
                    </span>
                    {rev.production_type && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] border border-[var(--line)]">
                        {rev.production_type}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] mt-1">
                    Reviewed on {new Date(rev.created_at).toLocaleDateString()} · Would rent again: <span className="text-[var(--text)] capitalize font-medium">{rev.would_rent_again || "Yes"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[var(--panel-raised)] px-3 py-1 rounded border border-[var(--line)] self-start sm:self-auto">
                  <Star className="w-4 h-4 fill-[var(--marquee)] text-[var(--marquee)]" />
                  <span className="text-sm font-bold text-[var(--marquee)]">
                    {rev.rating_overall}.0
                  </span>
                </div>
              </div>

              {/* Breakdown ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[var(--panel-raised)] p-2 rounded border border-[var(--line)]">
                  <div className="text-[var(--text-dim)]">Consistency</div>
                  <div className="font-semibold text-[var(--text)] mt-0.5">{rev.rating_consistency} / 5 ★</div>
                </div>
                <div className="bg-[var(--panel-raised)] p-2 rounded border border-[var(--line)]">
                  <div className="text-[var(--text-dim)]">Depth</div>
                  <div className="font-semibold text-[var(--text)] mt-0.5">{rev.rating_depth} / 5 ★</div>
                </div>
                <div className="bg-[var(--panel-raised)] p-2 rounded border border-[var(--line)]">
                  <div className="text-[var(--text-dim)]">Value</div>
                  <div className="font-semibold text-[var(--text)] mt-0.5">{rev.rating_value} / 5 ★</div>
                </div>
                <div className="bg-[var(--panel-raised)] p-2 rounded border border-[var(--line)]">
                  <div className="text-[var(--text-dim)]">Overall</div>
                  <div className="font-semibold text-[var(--text)] mt-0.5">{rev.rating_overall} / 5 ★</div>
                </div>
              </div>

              {/* Review text */}
              <p className="text-sm text-[var(--text)] leading-relaxed italic">
                "{rev.body}"
              </p>

              {/* Creator reply section */}
              {rev.creator_reply ? (
                <div className="mt-3 pl-4 border-l-2 border-[var(--glacier)] space-y-1 bg-[var(--panel-raised)]/40 p-3 rounded-r">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--glacier)]">
                    <CornerDownRight className="w-3.5 h-3.5" /> Your reply
                    {rev.creator_reply_at && (
                      <span className="text-[var(--text-dim)] font-normal text-[11px]">
                        · {new Date(rev.creator_reply_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed">
                    {rev.creator_reply}
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-[var(--line)] space-y-2">
                  <label className="text-xs font-medium text-[var(--text-dim)] block">
                    Post a public creator response (once per review):
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={replyText[rev.id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [rev.id]: e.target.value }))
                      }
                      placeholder="Thank the studio or share advice on directing this character..."
                      className="flex-1 bg-[var(--panel-raised)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--glacier)] resize-none"
                    />
                    <button
                      onClick={() => handleSendReply(rev.id)}
                      disabled={submittingReply[rev.id] || !replyText[rev.id]?.trim()}
                      className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110 transition-all disabled:opacity-50 self-end"
                    >
                      {submittingReply[rev.id] ? "Posting..." : "Reply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
