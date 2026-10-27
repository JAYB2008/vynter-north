"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Lock,
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Heart,
  Eye,
  Activity,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Character, Review } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RentalModal } from "@/components/characters/RentalModal";
import { DemoInterface } from "@/components/demo/DemoInterface";
import { useAuth } from "@/lib/auth-context";

export default function CharacterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { user, role, isAuthenticated } = useAuth();

  const [character, setCharacter] = useState<Character | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "personality" | "demo" | "reviews"
  >("overview");
  const [rentalModalOpen, setRentalModalOpen] = useState(false);

  // New review form
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`/api/characters/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.character) {
          setCharacter(d.character);
          if (d.reviews) setReviews(d.reviews);
        }
      })
      .catch((e) => console.warn("Failed to load character", e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character || !newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/characters/${character.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fame_score: Math.min(100, character.fame_score + 1) }),
      });
      const reviewObj: Review = {
        id: `rev-${Date.now()}`,
        character_id: character.id,
        reviewer_id: user?.id || "demo-reviewer",
        rating: newRating,
        review_text: newReviewText,
        created_at: new Date().toISOString(),
        reviewer: user || undefined,
      };
      setReviews([reviewObj, ...reviews]);
      setNewReviewText("");
      toast.success("Review posted successfully!");
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-primary-app">Character Not Found</h2>
        <p className="text-sm text-secondary-app">
          The requested CVR identity does not exist or has been retired.
        </p>
        <Link href="/marketplace" className="vn-button-primary px-4 py-2 text-sm font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Top Section: Hero & Sticky Rental Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Character Hero */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar with purple border glow */}
          <div className="w-full sm:w-64 h-72 sm:h-80 rounded-2xl overflow-hidden shrink-0 border-2 border-[#7C3AED]/60 shadow-xl shadow-purple-600/20 bg-elevated-app relative">
            {character.avatar_url ? (
              <img
                src={character.avatar_url}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-700 to-slate-900 flex items-center justify-center text-5xl font-black text-white">
                {character.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono font-medium text-white">
              {character.id}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-primary-app tracking-tight">
                {character.name}
              </h1>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{character.fame_score} Fame</span>
              </div>
            </div>

            <p className="text-base text-[#A78BFA] italic font-medium">
              "{character.vibe_summary}"
            </p>

            {/* Genre Chips */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {character.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-elevated-app text-secondary-app border border-app"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Creator Info & Registered Date */}
            <div className="pt-3 border-t border-app flex flex-col gap-1 text-xs text-secondary-app">
              <div>
                Created by:{" "}
                <strong className="text-primary-app">
                  {character.owner?.display_name || "Elena Vance (NeoCinema)"}
                </strong>
              </div>
              <div className="flex items-center gap-1.5 text-muted-app">
                <Calendar className="w-3.5 h-3.5" />
                <span>Registered {formatDate(character.created_at)}</span>
              </div>
            </div>

            <p className="text-sm text-secondary-app leading-relaxed mt-2 line-clamp-3">
              {character.description}
            </p>
          </div>
        </div>

        {/* Right Column (1 col): Sticky Rental Panel */}
        <div className="vn-card p-6 flex flex-col gap-5 sticky top-24 border-[#7C3AED]/40 shadow-xl">
          <div className="flex items-center justify-between border-b border-app pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-muted-app uppercase">
                Rental Access
              </span>
              <div className="text-2xl font-black text-primary-app">
                {character.is_free
                  ? "Free Character"
                  : `${formatCurrency(character.rental_price_daily)}/day`}
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Instant MCP Ready
            </span>
          </div>

          {/* Pricing Options overview */}
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-elevated-app border border-app">
              <span className="font-semibold text-primary-app">Daily Rental</span>
              <span className="font-mono text-secondary-app">
                {formatCurrency(character.rental_price_daily)} (50 credits)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-elevated-app border border-app">
              <span className="font-semibold text-primary-app">Weekly Rental</span>
              <span className="font-mono text-secondary-app">
                {formatCurrency(character.rental_price_weekly)} (200 credits)
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-[#7C3AED]/30">
              <span className="font-semibold text-[#A78BFA]">Monthly Rental</span>
              <span className="font-mono text-primary-app font-bold">
                {formatCurrency(character.rental_price_monthly)} (500 credits)
              </span>
            </div>
            {character.purchase_price && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-elevated-app border border-app">
                <span className="font-semibold text-primary-app">Permanent Buy</span>
                <span className="font-mono text-secondary-app">
                  {formatCurrency(character.purchase_price)} (Unlimited)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setRentalModalOpen(true)}
              className="vn-button-primary w-full py-3 text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Rent This Character</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setRentalModalOpen(true)}
              className="w-full py-2.5 rounded-md border border-app hover:border-[#7C3AED] bg-card-app text-xs font-semibold text-secondary-app hover:text-primary-app transition-colors"
            >
              Free 3-Day Trial (15 Credits)
            </button>
          </div>

          {/* Voice Consistency Notice as specified */}
          <div className="p-3 rounded-lg bg-elevated-app border border-app text-xs text-secondary-app flex items-start gap-2">
            <Info className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Voice Consistency:</strong> Voice description is included in the
              character intelligence layer. For exact voice matching in video
              generation, use this character through HigsField's native Vynter
              North integration (coming soon).
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-app pb-2">
        {[
          { id: "overview", label: "Overview", icon: Info },
          { id: "personality", label: "Personality Sheet", icon: Layers },
          { id: "demo", label: "Try It (Live)", icon: Sparkles },
          { id: "reviews", label: `Reviews (${reviews.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                isSelected
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                  : "bg-card-app border-app text-secondary-app hover:text-primary-app hover:border-[#7C3AED]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="vn-card p-6 flex flex-col gap-3">
              <h3 className="text-base font-bold text-primary-app">
                About {character.name}
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed whitespace-pre-line">
                {character.description}
              </p>
            </div>

            <div className="vn-card p-6 flex flex-col gap-3">
              <h3 className="text-base font-bold text-primary-app">
                Permitted Commercial Uses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {character.allowed_uses.map((use) => (
                  <div
                    key={use}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-elevated-app border border-app text-secondary-app"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="capitalize">{use.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="vn-card p-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-app">
                Identity Telemetry
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between pb-1.5 border-b border-app">
                  <span className="text-secondary-app">Total Studio Rentals</span>
                  <strong className="text-primary-app">{character.total_rentals}</strong>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-app">
                  <span className="text-secondary-app">Marketplace Views</span>
                  <strong className="text-primary-app">{character.total_views}</strong>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-app">
                  <span className="text-secondary-app">Fame Index</span>
                  <strong className="text-[#A78BFA]">{character.fame_score} / 100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-app">Verified CVR Registry</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PERSONALITY (The Core Asset) */}
      {activeTab === "personality" && (
        <div className="flex flex-col gap-6">
          <div className="vn-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-app pb-3">
              <h3 className="text-base font-bold text-primary-app">
                Core Personality Blueprint
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-500/10 text-[#A78BFA] border border-purple-500/20 font-semibold">
                Permanent Identity Sheet
              </span>
            </div>

            <div className="p-4 rounded-xl bg-elevated-app border border-app flex flex-col gap-1">
              <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                Core Trait
              </span>
              <p className="text-sm font-semibold text-primary-app">
                {character.core_trait}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-elevated-app border border-app flex flex-col gap-1.5">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dangerous Situations</span>
                </span>
                <p className="text-xs text-secondary-app line-clamp-3">
                  {character.behavior_dangerous}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-elevated-app border border-app flex flex-col gap-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Funny / Comedic</span>
                </span>
                <p className="text-xs text-secondary-app line-clamp-3">
                  {character.behavior_funny}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-elevated-app border border-app flex flex-col gap-1.5">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Emotional Moments</span>
                </span>
                <p className="text-xs text-secondary-app line-clamp-3">
                  {character.behavior_emotional}
                </p>
              </div>
            </div>

            {/* BLURRED / LOCKED SECTION as specified */}
            <div className="relative rounded-2xl border border-app overflow-hidden p-6 mt-4 bg-elevated-app/40">
              <div className="filter blur-sm select-none opacity-40 pointer-events-none space-y-4">
                <h4 className="font-bold text-sm">
                  Complete 1,000+ Word Character Sheet & Movement Geometries
                </h4>
                <p className="text-xs leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cairo maintains an
                  unbroken rhythmic gait under intense combat fire, shielding his ally with wide
                  sideways posture while commentating loudly to conceal acute sympathetic nervous
                  system arousal...
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-card-app rounded-lg" />
                  <div className="h-20 bg-card-app rounded-lg" />
                </div>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA] mb-3">
                  <Lock className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <h4 className="text-base font-extrabold text-primary-app">
                  Encrypted Skill Profile
                </h4>
                <p className="text-xs text-secondary-app max-w-md mt-1">
                  Full 1,000+ word personality sheet, voice pitch analysis, and conflict
                  mechanisms are protected. Rent this character to access the full profile
                  seamlessly via MCP in Claude and ChatGPT.
                </p>
                <button
                  onClick={() => setRentalModalOpen(true)}
                  className="vn-button-primary px-5 py-2 text-xs font-bold mt-4 flex items-center gap-1.5"
                >
                  <span>Rent to Unlock Full MCP Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: TRY IT */}
      {activeTab === "demo" && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-elevated-app border border-app text-xs text-secondary-app flex items-center justify-between">
            <span>
              Testing with live NVIDIA NIM enrichment for{" "}
              <strong className="text-primary-app">{character.name}</strong>. Free preview mode.
            </span>
          </div>

          <DemoInterface
            initialCharacters={[character]}
            preselectedCharacterName={character.name}
          />
        </div>
      )}

      {/* Tab 4: REVIEWS */}
      {activeTab === "reviews" && (
        <div className="flex flex-col gap-6">
          <div className="vn-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-primary-app">5.0</div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-muted-app mt-0.5 block">
                  Based on verified studio production runs
                </span>
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="vn-card p-5 flex flex-col gap-2 bg-card-app border-app"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-app">
                      {r.reviewer?.display_name || "Apex CineLabs"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Verified Rental
                    </span>
                  </div>
                  <span className="text-xs text-muted-app">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-secondary-app leading-relaxed">
                  {r.review_text}
                </p>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <form
            onSubmit={handleAddReview}
            className="vn-card p-6 flex flex-col gap-4 border-app"
          >
            <h4 className="text-sm font-bold text-primary-app">
              Leave Studio Feedback
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary-app">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-app"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="How consistently did this character perform in your AI video pipeline?"
              className="vn-input w-full p-3 text-sm"
              required
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="vn-button-primary px-5 py-2.5 text-xs font-bold self-start cursor-pointer"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Rental Modal */}
      <RentalModal
        character={character}
        isOpen={rentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
      />
    </div>
  );
}
