"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Sparkles,
  Lock,
  Copy,
  Check,
  Share2,
  Heart,
  ShieldCheck,
  ExternalLink,
  Film,
  Play,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Character, Review, ReelScene } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { user, isAuthenticated } = useAuth();

  const [character, setCharacter] = useState<Character | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reelScenes, setReelScenes] = useState<ReelScene[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "overview" | "personality" | "reel" | "try" | "reviews" | "details"
  >("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<"1d" | "7d" | "30d">(
    "30d"
  );
  const [copiedId, setCopiedId] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFamePopover, setShowFamePopover] = useState(false);

  // Try it interactive state
  const [tryScene, setTryScene] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState<any>(null);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingConsistency, setRatingConsistency] = useState(5);
  const [ratingDepth, setRatingDepth] = useState(5);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingOverall, setRatingOverall] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [productionType, setProductionType] = useState("Narrative Film");
  const [wouldRentAgain, setWouldRentAgain] = useState<"yes" | "no" | "maybe">(
    "yes"
  );
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(
    null
  );

  // Load character data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiFetch<{
        character: Character;
        reviews: Review[];
        reelScenes: ReelScene[];
        isOwner: boolean;
      }>(`/api/characters/${encodeURIComponent(id)}`);

      setLoading(false);
      if (res.ok && res.data.character) {
        setCharacter(res.data.character);
        setReviews(res.data.reviews || []);
        setReelScenes(res.data.reelScenes || []);
        setIsOwner(res.data.isOwner);

        // Pre-fill sample try scene
        setTryScene(
          `${res.data.character.name} enters a noisy train station. A courier accidentally bumps into their shoulder and drops an envelope.`
        );
      } else {
        setErrorMsg(
          res.error?.message || "Couldn't load character details."
        );
      }
    }
    loadData();
  }, [id]);

  const copyRegistrationId = () => {
    if (!character) return;
    navigator.clipboard.writeText(character.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleAction = (kind: "trial" | "rental" | "purchase" | "free") => {
    if (!character) return;
    if (!isAuthenticated) {
      router.push(`/signin?next=/characters/${character.id}`);
      return;
    }
    if (kind === "free") {
      router.push(`/checkout?character_id=${character.id}&kind=free`);
    } else if (kind === "trial") {
      router.push(`/checkout?character_id=${character.id}&kind=trial`);
    } else if (kind === "purchase") {
      router.push(`/checkout?character_id=${character.id}&kind=purchase`);
    } else {
      router.push(
        `/checkout?character_id=${character.id}&kind=rental&period=${selectedPeriod}`
      );
    }
  };

  // Run interactive enrichment
  const handleRunTry = async () => {
    if (!character || !tryScene.trim()) return;
    setIsEnriching(true);
    setEnrichmentError(null);
    setEnrichmentResult(null);

    const res = await apiFetch<any>("/api/enrich", {
      method: "POST",
      body: JSON.stringify({
        character_id: character.id,
        scene: tryScene.trim(),
        source: character.is_demo ? "demo" : "web",
      }),
    });

    setIsEnriching(false);
    if (res.ok && res.data) {
      setEnrichmentResult(res.data);
    } else {
      setEnrichmentError(
        res.error?.message ||
          "Enrichment failed. Start a free 3-day trial to enrich scenes with this character."
      );
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;
    if (reviewBody.trim().length < 50) {
      setReviewSubmitError("Review must be at least 50 characters.");
      return;
    }

    setSubmittingReview(true);
    setReviewSubmitError(null);

    const res = await apiFetch<{ review: Review }>(`/api/reviews`, {
      method: "POST",
      body: JSON.stringify({
        character_id: character.id,
        rating_consistency: ratingConsistency,
        rating_depth: ratingDepth,
        rating_value: ratingValue,
        rating_overall: ratingOverall,
        body: reviewBody.trim(),
        production_type: productionType,
        would_rent_again: wouldRentAgain,
      }),
    });

    setSubmittingReview(false);
    if (res.ok && res.data?.review) {
      setReviews([res.data.review, ...reviews]);
      setShowReviewForm(false);
      setReviewBody("");
    } else {
      setReviewSubmitError(
        res.error?.message || "Failed to submit review. Verify your rental eligibility."
      );
    }
  };

  // Handle helpful vote
  const handleHelpfulVote = async (reviewId: string) => {
    if (!isAuthenticated) {
      router.push(`/signin?next=/characters/${id}`);
      return;
    }
    await apiFetch(`/api/reviews/${reviewId}/vote`, { method: "POST" });
    setReviews(
      reviews.map((r) =>
        r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-2/3 bg-[var(--panel-raised)] rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-[var(--panel-raised)] rounded animate-pulse" />
            <div className="aspect-[16/9] bg-[var(--panel-raised)] rounded animate-pulse" />
          </div>
          <div className="h-80 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (errorMsg || !character) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-[var(--bad)] mb-4" />
        <h1 className="font-serif text-3xl text-[var(--text)]">
          Character Not Found
        </h1>
        <p className="text-sm text-[var(--text-dim)] mt-2">
          {errorMsg || "The requested character does not exist or has been removed."}
        </p>
        <Link
          href="/marketplace"
          className="inline-block mt-6 px-4 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px]"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const portrait = character.portrait_url || character.avatar_url;
  const dailyPrice = character.price_daily_cents ? (character.price_daily_cents / 100).toFixed(0) : "5";
  const weeklyPrice = character.price_weekly_cents ? (character.price_weekly_cents / 100).toFixed(0) : "25";
  const monthlyPrice = character.price_monthly_cents ? (character.price_monthly_cents / 100).toFixed(0) : "75";

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Breadcrumb & Metadata Slate */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--line)] mb-6 text-xs text-[var(--text-dim)]">
        <div className="flex items-center gap-2">
          <Link href="/marketplace" className="hover:text-[var(--text)]">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-[var(--text)]">{character.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[var(--text-dim)]">
            Registered{" "}
            {new Date(character.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <Link
            href={`/certificate/${character.id}`}
            className="text-[var(--glacier)] hover:underline flex items-center gap-1 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Certificate
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Sticky Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Portrait, Header, Tabs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header block with 4:5 Portrait + Meta */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* 4:5 Portrait */}
            <div className="w-full sm:w-52 shrink-0 aspect-[4/5] bg-[var(--panel)] border border-[var(--line)] rounded-[2px] overflow-hidden relative shadow-sm">
              {portrait ? (
                <img
                  src={portrait}
                  alt={character.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--panel-raised)] text-[var(--text-dim)]">
                  <span className="font-serif text-5xl text-[var(--text)]">
                    {character.name.slice(0, 2)}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Slate */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-[2px] bg-[var(--panel-raised)] text-[var(--text-dim)] font-mono text-xs border border-[var(--line)] flex items-center gap-1.5">
                  {character.id}
                  <button
                    type="button"
                    onClick={copyRegistrationId}
                    title="Copy CVR ID"
                    className="hover:text-[var(--text)]"
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-[var(--ok)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </span>

                <span
                  className={`px-2 py-0.5 rounded-[2px] text-xs font-medium uppercase tracking-wider ${
                    character.status === "active"
                      ? "bg-[var(--ok)]/15 text-[var(--ok)]"
                      : character.status === "closed"
                      ? "bg-[var(--warn)]/15 text-[var(--warn)]"
                      : "bg-[var(--line)] text-[var(--text-dim)]"
                  }`}
                >
                  {character.status}
                </span>

                {character.is_demo && (
                  <span className="px-2 py-0.5 rounded-[2px] bg-[var(--glacier)]/15 text-[var(--glacier)] text-xs font-medium">
                    Demo Character
                  </span>
                )}
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl text-[var(--text)] leading-tight">
                {character.name}
              </h1>

              <p className="text-base text-[var(--text-dim)] italic">
                "{character.vibe_summary || character.tagline}"
              </p>

              {/* Creator & Fame Line */}
              <div className="flex items-center gap-4 pt-2 text-xs text-[var(--text-dim)] flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span>Registered by</span>
                  <Link
                    href={`/creators/${character.owner?.username || "creator"}`}
                    className="text-[var(--text)] font-medium hover:text-[var(--glacier)] flex items-center gap-1"
                  >
                    {character.owner?.display_name || "Verified Creator"}
                    {character.owner?.verification_status === "verified" && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--glacier)]" />
                    )}
                  </Link>
                </div>

                <span>•</span>

                {/* Fame Popover Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFamePopover(!showFamePopover)}
                    className="flex items-center gap-1.5 text-[var(--marquee)] font-medium hover:underline"
                  >
                    <span>★ {character.fame_tier.toUpperCase()}</span>
                    <span className="font-mono">({character.fame_score})</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Section 9.6 Fame Breakdown Popover */}
                  {showFamePopover && (
                    <div className="absolute left-0 top-full mt-2 w-72 p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] shadow-xl z-20 text-xs text-[var(--text-dim)] space-y-2">
                      <div className="font-semibold text-[var(--text)] pb-1 border-b border-[var(--line)]">
                        Fame Score Computation
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Rentals:</span>
                        <span className="font-mono text-[var(--text)]">
                          +{character.rental_count * 10}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unique Studios:</span>
                        <span className="font-mono text-[var(--text)]">
                          +{character.unique_studios * 25}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating Weight:</span>
                        <span className="font-mono text-[var(--text)]">
                          +{(character.rating_avg * 40).toFixed(0)}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-[var(--line)] flex justify-between font-bold text-[var(--marquee)]">
                        <span>Total Fame:</span>
                        <span>{character.fame_score} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[var(--marquee)] text-[var(--marquee)]" />
                  <span className="font-semibold text-[var(--text)]">
                    {character.rating_avg.toFixed(1)}
                  </span>
                  <span>({character.review_count} reviews)</span>
                </div>
              </div>

              {/* Genre & Tag Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {character.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-[4px] text-[11px] bg-[var(--panel-raised)] text-[var(--text)] border border-[var(--line)]"
                  >
                    {g}
                  </span>
                ))}
                {character.personality_tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-[4px] text-[11px] bg-[var(--panel)] text-[var(--text-dim)] border border-[var(--line)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reference Gallery Thumbnails */}
          {character.gallery_urls && character.gallery_urls.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
                Reference Expressions & Angles
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {character.gallery_urls.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`Gallery ${i + 1}`}
                    className="w-16 h-20 object-cover rounded-[2px] border border-[var(--line)] shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 6 Tabs Navigation */}
          <div className="border-b border-[var(--line)] flex gap-6 overflow-x-auto text-sm">
            {[
              { id: "overview", label: "Overview" },
              { id: "personality", label: "Personality (Preview)" },
              { id: "reel", label: `Demo Reel (${reelScenes.length})` },
              { id: "try", label: "Try Scene" },
              { id: "reviews", label: `Reviews (${reviews.length})` },
              { id: "details", label: "Details & Ledger" },
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

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl text-[var(--text)] mb-2">
                  Character Background
                </h3>
                <p className="text-sm text-[var(--text)] leading-relaxed">
                  {character.description || "No public overview provided."}
                </p>
              </div>

              {/* Allowed Uses */}
              <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-2">
                <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
                  Permitted Commercial Uses
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[var(--text-dim)]">
                  {character.allowed_uses.map((u) => (
                    <div key={u} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[var(--ok)]" />
                      <span className="capitalize">{u}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] text-center">
                <div>
                  <span className="text-xl font-bold font-mono text-[var(--text)] block">
                    {character.rental_count}
                  </span>
                  <span className="text-[11px] text-[var(--text-dim)]">
                    Rentals Completed
                  </span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-[var(--text)] block">
                    {character.unique_studios}
                  </span>
                  <span className="text-[11px] text-[var(--text-dim)]">
                    Unique Studios
                  </span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-[var(--text)] block">
                    {character.rating_avg.toFixed(1)} / 5.0
                  </span>
                  <span className="text-[11px] text-[var(--text-dim)]">
                    Average Rating
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONALITY (PREVIEW) - SECTION 7.3 PRIVACY RULE */}
          {activeTab === "personality" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-[var(--glacier)] uppercase tracking-wider block mb-1">
                  Core Trait & Presence
                </span>
                <h3 className="font-serif text-2xl text-[var(--text)]">
                  {character.core_trait || "Distinctive screen demeanor"}
                </h3>
              </div>

              {/* 3 Situation Behavior Excerpts (~140 chars) */}
              <div className="space-y-4">
                <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px]">
                  <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block mb-1">
                    Danger & High Stakes Behavior
                  </span>
                  <p className="text-xs text-[var(--text-dim)] italic">
                    "{character.behavior_danger || "Calculated physical stillness and tactical awareness..."}"
                  </p>
                </div>

                <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px]">
                  <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block mb-1">
                    Awkward & Comedic Situations
                  </span>
                  <p className="text-xs text-[var(--text-dim)] italic">
                    "{character.behavior_funny || "Deadpan understatement and formal deflection..."}"
                  </p>
                </div>

                <div className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px]">
                  <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block mb-1">
                    Grief & Emotional Vulnerability
                  </span>
                  <p className="text-xs text-[var(--text-dim)] italic">
                    "{character.behavior_emotional || "Guarded hesitation and deliberate tonal restraint..."}"
                  </p>
                </div>
              </div>

              {/* Locked Full Sheet Banner */}
              <div className="p-5 bg-[var(--night)] border border-[var(--line)] rounded-[8px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)]">
                    <Lock className="w-5 h-5 text-[var(--glacier)]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text)] block">
                      Full Sheet: {(character.sheet_word_count || 1200).toLocaleString()} words
                    </span>
                    <span className="text-[11px] text-[var(--text-dim)]">
                      Unlocked for renters — delivered exclusively as finished scene direction via MCP or workspace.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAction("trial")}
                  className="px-3.5 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
                >
                  Start trial
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REEL */}
          {activeTab === "reel" && (
            <div className="space-y-6">
              {reelScenes.length === 0 ? (
                <div className="p-12 text-center bg-[var(--panel)] border border-[var(--line)] rounded-[8px]">
                  <Film className="w-8 h-8 mx-auto text-[var(--text-dim)] mb-2" />
                  <p className="text-sm text-[var(--text-dim)]">
                    This creator hasn't added a demo reel yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reelScenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="p-4 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--text)]">
                          {scene.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--panel-raised)] text-[var(--text-dim)] uppercase text-[10px]">
                          {scene.category}
                        </span>
                      </div>
                      {scene.video_url && (
                        <div className="aspect-video bg-black rounded overflow-hidden">
                          <iframe
                            src={scene.video_url.replace("watch?v=", "embed/")}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {scene.production_title && (
                        <span className="text-[11px] text-[var(--glacier)] flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> Appears in: {scene.production_title}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRY IT INTERACTIVE */}
          {activeTab === "try" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl text-[var(--text)]">
                  Live Scene Enrichment Test
                </h3>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Describe what happens. Our server retrieves {character.name}'s traits and formats camera-ready behavioral acting direction.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block mb-1.5">
                  Describe the Scene
                </label>
                <textarea
                  rows={4}
                  value={tryScene}
                  onChange={(e) => setTryScene(e.target.value)}
                  placeholder="e.g. Cairo is cornered in an alley by two loan sharks..."
                  className="w-full px-4 py-3 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
                />
              </div>

              <button
                type="button"
                onClick={handleRunTry}
                disabled={isEnriching || !tryScene.trim()}
                className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enriching scene…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Enrich with {character.name}
                  </>
                )}
              </button>

              {enrichmentError && (
                <div className="p-4 bg-[var(--bad)]/15 border border-[var(--bad)] rounded-[8px] text-xs text-[var(--bad)]">
                  {enrichmentError}
                </div>
              )}

              {enrichmentResult && (
                <div className="p-6 bg-[var(--night)] border border-[var(--line)] rounded-[8px] space-y-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-dim)] pb-2 border-b border-[var(--line)]">
                    <span className="font-mono text-[var(--glacier)]">
                      {enrichmentResult.word_count?.original} words in → {enrichmentResult.word_count?.enriched} words out ({enrichmentResult.word_count?.multiplier})
                    </span>
                    <span className="capitalize font-mono">
                      {enrichmentResult.scene_analysis?.primary_category} scene
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[var(--text-dim)] uppercase block mb-1">
                      Camera-Ready Acting Direction:
                    </span>
                    <p className="text-sm text-[var(--text)] font-sans leading-relaxed whitespace-pre-wrap">
                      {enrichmentResult.enriched_prompt}
                    </p>
                  </div>

                  {enrichmentResult.fields_used && (
                    <div className="pt-2 border-t border-[var(--line)] text-xs text-[var(--text-dim)] flex items-center gap-2">
                      <span>Fields retrieved:</span>
                      {enrichmentResult.fields_used.map((f: string) => (
                        <span key={f} className="px-1.5 py-0.5 rounded bg-[var(--panel-raised)] font-mono text-[10px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Summary bars */}
              <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-5xl text-[var(--text)]">
                      {character.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-xs text-[var(--text-dim)]">out of 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[var(--marquee)]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--text-dim)] block mt-2">
                    Based on {reviews.length} studio rental reviews
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { label: "Behavioral Consistency", val: "4.9" },
                    { label: "Personality Depth", val: "4.8" },
                    { label: "Value for Price", val: "4.9" },
                    { label: "Overall Screen Presence", val: "5.0" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[var(--text-dim)]">{b.label}</span>
                      <span className="font-mono text-[var(--text)] font-semibold">
                        {b.val} / 5.0
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form Toggle */}
              {isAuthenticated && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
                  >
                    {showReviewForm ? "Cancel review" : "Write a rental review"}
                  </button>
                </div>
              )}

              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-6 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-4"
                >
                  <h4 className="font-serif text-xl text-[var(--text)]">
                    Studio Rental Review
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-[var(--text-dim)] mb-1">Consistency (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={ratingConsistency}
                        onChange={(e) => setRatingConsistency(parseInt(e.target.value) || 5)}
                        className="w-full px-2 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-center text-[var(--text)] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-dim)] mb-1">Depth (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={ratingDepth}
                        onChange={(e) => setRatingDepth(parseInt(e.target.value) || 5)}
                        className="w-full px-2 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-center text-[var(--text)] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-dim)] mb-1">Value (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={ratingValue}
                        onChange={(e) => setRatingValue(parseInt(e.target.value) || 5)}
                        className="w-full px-2 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-center text-[var(--text)] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-dim)] mb-1">Overall (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={ratingOverall}
                        onChange={(e) => setRatingOverall(parseInt(e.target.value) || 5)}
                        className="w-full px-2 py-1.5 bg-[var(--panel)] border border-[var(--line)] rounded text-center text-[var(--text)] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Written Review * (Min 50 chars)
                    </label>
                    <textarea
                      rows={4}
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Describe how the character performed in your prompts, consistency across scenes, and acting nuance..."
                      className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
                    />
                  </div>

                  {reviewSubmitError && (
                    <div className="p-3 bg-[var(--bad)]/15 border border-[var(--bad)] rounded text-xs text-[var(--bad)]">
                      {reviewSubmitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110 disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting…" : "Publish Review"}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[var(--text-dim)] italic">
                    No reviews yet. Studios review characters after their rental period concludes.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text)]">
                            {rev.studio?.display_name || "Verified Studio"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--glacier)]/15 text-[var(--glacier)] text-[10px] font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Renter
                          </span>
                        </div>
                        <span className="text-[var(--text-dim)] font-mono">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[var(--marquee)] text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating_overall ? "fill-current" : "opacity-30"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-[var(--text)] leading-relaxed">
                        {rev.body}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-[11px] text-[var(--text-dim)]">
                        <span>Production: {rev.production_type || "Narrative video"}</span>
                        <button
                          type="button"
                          onClick={() => handleHelpfulVote(rev.id)}
                          className="flex items-center gap-1 hover:text-[var(--text)]"
                        >
                          <ThumbsUp className="w-3 h-3" /> Helpful ({rev.helpful_count || 0})
                        </button>
                      </div>

                      {rev.creator_reply && (
                        <div className="p-3 bg-[var(--panel-raised)] border-l-2 border-[var(--glacier)] rounded text-xs text-[var(--text-dim)] space-y-1">
                          <span className="font-semibold text-[var(--text)] block">
                            Creator Response:
                          </span>
                          <p>{rev.creator_reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DETAILS & LEDGER */}
          {activeTab === "details" && (
            <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[8px] space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <span className="text-[var(--text-dim)]">Registration ID</span>
                <span className="font-mono text-[var(--text)] font-semibold">
                  {character.id}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <span className="text-[var(--text-dim)]">Cryptographic Fingerprint</span>
                <span className="font-mono text-[var(--text)]">
                  {character.registration_hash
                    ? `${character.registration_hash.slice(0, 16)}…`
                    : "Computed upon publication"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <span className="text-[var(--text-dim)]">Registration Date</span>
                <span className="text-[var(--text)]">
                  {new Date(character.created_at).toUTCString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-dim)]">Intelligence Engine</span>
                <span className="text-[var(--glacier)] font-medium">
                  NVIDIA NIM + Paragraph Retrieval
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Sticky Action Panel */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-6 shadow-sm">
            {isOwner ? (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[var(--glacier)] uppercase tracking-wider block">
                  Creator Management
                </span>
                <p className="text-xs text-[var(--text-dim)]">
                  You are viewing your registered character. Visit the dashboard to inspect earnings, rentals, or update your sheet.
                </p>
                <Link
                  href={`/dashboard/characters/${character.id}`}
                  className="w-full py-3 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center justify-center gap-2"
                >
                  Manage Character
                </Link>
              </div>
            ) : character.is_free ? (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[var(--ok)] uppercase tracking-wider block">
                  Free Character
                </span>
                <p className="text-xs text-[var(--text-dim)]">
                  This character is provided free of charge by the creator with 100 enrichment credits and no expiration.
                </p>
                <button
                  type="button"
                  onClick={() => handleAction("free")}
                  className="w-full py-3 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110"
                >
                  Add to my library — free
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block mb-2">
                    Select Rental Access Period
                  </span>

                  <div className="space-y-2">
                    {[
                      { id: "1d", label: "1 Day Access", price: `$${dailyPrice}`, credits: "50 credits" },
                      { id: "7d", label: "7 Days Access", price: `$${weeklyPrice}`, credits: "200 credits" },
                      { id: "30d", label: "30 Days Access", price: `$${monthlyPrice}`, credits: "500 credits" },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-[6px] border cursor-pointer transition-colors ${
                          selectedPeriod === p.id
                            ? "bg-[var(--panel-raised)] border-[var(--glacier)] text-[var(--text)]"
                            : "border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="period"
                            value={p.id}
                            checked={selectedPeriod === p.id}
                            onChange={() => setSelectedPeriod(p.id as any)}
                            className="accent-[var(--glacier)]"
                          />
                          <div>
                            <span className="text-xs font-medium text-[var(--text)] block">
                              {p.label}
                            </span>
                            <span className="text-[10px] text-[var(--text-dim)]">
                              {p.credits}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-mono font-bold text-[var(--text)]">
                          {p.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAction("rental")}
                    className="w-full py-3.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center justify-center gap-2 shadow"
                  >
                    Rent character → Checkout
                  </button>

                  {character.trial_enabled && (
                    <button
                      type="button"
                      onClick={() => handleAction("trial")}
                      className="w-full py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] text-xs font-medium text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
                    >
                      Start 3-day trial (15 credits free)
                    </button>
                  )}
                </div>

                {/* Exclusive Buyout Option */}
                {character.sale_enabled && (
                  <div className="pt-4 border-t border-[var(--line)] space-y-2">
                    <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
                      Permanent Buyout
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAction("purchase")}
                      className="w-full py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)] flex items-center justify-between px-4"
                    >
                      <span>Buy permanently</span>
                      <span className="font-mono text-[var(--glacier)] font-bold">
                        ${((character.sale_price_cents || 75000) / 100).toFixed(0)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Utility buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)] text-xs text-[var(--text-dim)]">
              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1.5 hover:text-[var(--text)] ${
                  isSaved ? "text-[var(--bad)]" : ""
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                className="flex items-center gap-1.5 hover:text-[var(--text)]"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedShare ? "Link copied" : "Share"}
              </button>
            </div>

            {/* Privacy Notice */}
            <p className="text-[11px] text-[var(--text-dim)] text-center leading-relaxed">
              Your AI video tool never sees the personality sheet. Our server returns finished acting direction only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
