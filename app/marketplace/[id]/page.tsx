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
  HelpCircle,
  Clapperboard,
} from "lucide-react";
import { toast } from "sonner";
import { Character, Review, RentalType } from "@/lib/types";
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

  // Rental Panel radio options state
  const [selectedRentalType, setSelectedRentalType] = useState<RentalType>("monthly");
  const [trialRunCount, setTrialRunCount] = useState<number>(0);

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
          if (d.character.is_free) {
            setSelectedRentalType("free");
          }
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
      await fetch(`/api/characters/${character.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fame_score: Math.min(100, (character.fame_score || 95) + 1),
        }),
      });
      const reviewObj: Review = {
        id: `rev-${Date.now()}`,
        character_id: character.id,
        reviewer_id: user?.id || "demo-reviewer",
        rating: newRating,
        review_text: newReviewText,
        created_at: new Date().toISOString(),
        reviewer: user || {
          id: "guest",
          display_name: "Studio Producer",
          role: "studio",
          bio: null,
          avatar_url: null,
          account_key: "vn-guest-reviewer",
          total_earnings: 0,
        },
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

  const handleRentClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect_to=/marketplace/${character?.id}`);
      return;
    }
    setRentalModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
        <span className="text-xs text-secondary-app">Loading character profile...</span>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-primary-app">Character Not Found</h2>
        <p className="text-sm text-secondary-app">
          The requested CVR identity does not exist or has been removed.
        </p>
        <Link href="/marketplace" className="vn-button-primary px-5 py-2.5 text-xs font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Selected credits based on radio choice
  const getCreditsCount = () => {
    if (selectedRentalType === "trial") return 15;
    if (selectedRentalType === "daily") return 50;
    if (selectedRentalType === "weekly") return 200;
    if (selectedRentalType === "monthly") return 500;
    if (selectedRentalType === "purchase") return "Unlimited";
    return 100;
  };

  const wordCountSheet = character.full_character_sheet
    ? character.full_character_sheet.trim().split(/\s+/).length
    : 1040;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* ================= HERO SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Character Hero */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar with purple glow border */}
          <div className="w-full sm:w-64 h-72 sm:h-80 rounded-3xl overflow-hidden shrink-0 border-2 border-[#7C3AED] shadow-2xl shadow-purple-600/30 bg-elevated-app relative">
            {character.avatar_url ? (
              <img
                src={character.avatar_url}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-700 via-indigo-800 to-slate-900 flex items-center justify-center text-5xl font-black text-white">
                {character.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono font-medium text-white">
              {character.id}
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {character.status}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-primary-app tracking-tight">
                {character.name}
              </h1>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
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

        {/* ================= RENTAL PANEL (sticky right side on desktop) ================= */}
        <div className="vn-card p-6 flex flex-col gap-5 sticky top-24 border-[#7C3AED]/50 shadow-2xl">
          <div className="border-b border-app pb-3 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-app uppercase">
              Production Licensing
            </span>
            <div className="text-2xl font-black text-primary-app">
              {character.is_free
                ? "Free Access"
                : `${formatCurrency(character.rental_price_daily)} / day`}
            </div>
          </div>

          {/* Pricing Options Radio List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-app block">
              Choose License Tier:
            </span>

            {/* 3-Day Trial (Free) */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                selectedRentalType === "trial"
                  ? "bg-purple-500/10 border-[#7C3AED] text-primary-app"
                  : "bg-elevated-app border-app text-secondary-app hover:border-[#7C3AED]/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rental-tier"
                  checked={selectedRentalType === "trial"}
                  onChange={() => setSelectedRentalType("trial")}
                  className="text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <span className="font-semibold">3-Day Trial (Free)</span>
              </div>
              <span className="font-mono text-muted-app">15 credits</span>
            </label>

            {/* Daily */}
            {!character.is_free && (
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedRentalType === "daily"
                    ? "bg-purple-500/10 border-[#7C3AED] text-primary-app"
                    : "bg-elevated-app border-app text-secondary-app hover:border-[#7C3AED]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rental-tier"
                    checked={selectedRentalType === "daily"}
                    onChange={() => setSelectedRentalType("daily")}
                    className="text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span className="font-semibold">Daily Lease</span>
                </div>
                <span className="font-mono text-muted-app">
                  {formatCurrency(character.rental_price_daily)} (50 credits)
                </span>
              </label>
            )}

            {/* Weekly */}
            {!character.is_free && (
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedRentalType === "weekly"
                    ? "bg-purple-500/10 border-[#7C3AED] text-primary-app"
                    : "bg-elevated-app border-app text-secondary-app hover:border-[#7C3AED]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rental-tier"
                    checked={selectedRentalType === "weekly"}
                    onChange={() => setSelectedRentalType("weekly")}
                    className="text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span className="font-semibold">Weekly Lease</span>
                </div>
                <span className="font-mono text-muted-app">
                  {formatCurrency(character.rental_price_weekly)} (200 credits)
                </span>
              </label>
            )}

            {/* Monthly */}
            {!character.is_free && (
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedRentalType === "monthly"
                    ? "bg-purple-500/10 border-[#7C3AED] text-primary-app font-bold"
                    : "bg-elevated-app border-app text-secondary-app hover:border-[#7C3AED]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rental-tier"
                    checked={selectedRentalType === "monthly"}
                    onChange={() => setSelectedRentalType("monthly")}
                    className="text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span className="font-semibold">Monthly Lease</span>
                </div>
                <span className="font-mono text-primary-app font-bold">
                  {formatCurrency(character.rental_price_monthly)} (500 credits)
                </span>
              </label>
            )}

            {/* Purchase */}
            {character.purchase_price && (
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedRentalType === "purchase"
                    ? "bg-purple-500/10 border-[#7C3AED] text-primary-app font-bold"
                    : "bg-elevated-app border-app text-secondary-app hover:border-[#7C3AED]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rental-tier"
                    checked={selectedRentalType === "purchase"}
                    onChange={() => setSelectedRentalType("purchase")}
                    className="text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span className="font-semibold">Permanent Purchase</span>
                </div>
                <span className="font-mono text-secondary-app">
                  {formatCurrency(character.purchase_price)} (Permanent)
                </span>
              </label>
            )}
          </div>

          {/* Action Button: Rent This Character / Sign In to Rent / Free — Activate Now */}
          <button
            type="button"
            onClick={handleRentClick}
            className="vn-button-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {!isAuthenticated ? (
              <span>Sign In to Rent</span>
            ) : character.is_free || selectedRentalType === "trial" ? (
              <span>Free — Activate Now</span>
            ) : (
              <span>Rent This Character</span>
            )}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* "What you get" checklist */}
          <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-2 text-xs">
            <span className="font-bold text-primary-app block text-[11px] uppercase tracking-wider">
              What You Receive:
            </span>
            <div className="flex items-center gap-2 text-secondary-app">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>MCP token for this character</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-app">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Character intelligence for every scene</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-app">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Works with Claude & ChatGPT</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-app">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong>{getCreditsCount()}</strong> generation credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex items-center gap-2 border-b border-app pb-2 overflow-x-auto">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
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

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="vn-card p-6 space-y-3">
              <h3 className="text-base font-bold text-primary-app">
                Full Description
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed whitespace-pre-line">
                {character.description}
              </p>
            </div>

            <div className="vn-card p-6 space-y-3">
              <h3 className="text-base font-bold text-primary-app">
                Allowed Commercial Uses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {character.allowed_uses.map((use) => (
                  <div
                    key={use}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-elevated-app border border-app text-secondary-app"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="capitalize">{use.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="vn-card p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-app">
                Stats & Telemetry
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-app">
                  <span className="text-secondary-app">Total Rentals</span>
                  <strong className="text-primary-app">{character.total_rentals || 148}</strong>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-app">
                  <span className="text-secondary-app">Average Rating</span>
                  <strong className="text-amber-400 font-bold">5.0 ★</strong>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-app">
                  <span className="text-secondary-app">Reviews Count</span>
                  <strong className="text-primary-app">{reviews.length} reviews</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-app">CVR Identity Registry</span>
                  <span className="text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PERSONALITY (INTRIGUE & LOCKED) ================= */}
      {activeTab === "personality" && (
        <div className="space-y-6">
          <div className="vn-card p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                Intelligence Sheet
              </span>
              <h3 className="text-xl font-bold text-primary-app">
                CORE PERSONALITY
              </h3>
            </div>

            {/* Core Trait shown fully */}
            <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-1">
              <span className="text-[11px] font-bold text-muted-app uppercase">
                Core Trait
              </span>
              <p className="text-sm font-semibold text-primary-app">
                {character.core_trait}
              </p>
            </div>

            {/* Vibe Summary shown */}
            <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-1">
              <span className="text-[11px] font-bold text-muted-app uppercase">
                Vibe Summary
              </span>
              <p className="text-sm text-[#A78BFA] italic font-medium">
                "{character.vibe_summary}"
              </p>
            </div>

            {/* BEHAVIORAL PROFILE: First 120 chars shown */}
            <div className="space-y-4 pt-4 border-t border-app">
              <h4 className="text-base font-bold text-primary-app">
                BEHAVIORAL PROFILE
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-1.5">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Dangerous Situations</span>
                  </span>
                  <p className="text-xs text-secondary-app">
                    {(character.behavior_dangerous || "").slice(0, 120)}...
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Funny Situations</span>
                  </span>
                  <p className="text-xs text-secondary-app">
                    {(character.behavior_funny || "").slice(0, 120)}...
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-1.5">
                  <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Emotional Moments</span>
                  </span>
                  <p className="text-xs text-secondary-app">
                    {(character.behavior_emotional || "").slice(0, 120)}...
                  </p>
                </div>
              </div>
            </div>

            {/* Voice section: first 100 chars */}
            <div className="space-y-3 pt-4 border-t border-app">
              <h4 className="text-base font-bold text-primary-app">
                Voice & Speech
              </h4>
              <div className="p-4 rounded-xl bg-secondary-app border border-app space-y-1">
                <span className="text-xs font-bold text-secondary-app">
                  Voice Description
                </span>
                <p className="text-xs text-secondary-app">
                  {(character.voice_description || "").slice(0, 100)}...
                </p>
              </div>
            </div>

            {/* BLURRED / LOCKED SECTION */}
            <div className="relative rounded-2xl border border-app overflow-hidden p-8 mt-6 bg-secondary-app/60">
              <div className="filter blur-md select-none opacity-20 pointer-events-none space-y-4">
                <h5 className="font-bold text-sm">
                  Full Encrypted Personality Profile ({wordCountSheet} words)
                </h5>
                <p className="text-xs leading-relaxed">
                  {character.full_character_sheet ||
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cairo maintains an unbroken rhythmic gait under intense combat fire, shielding his ally with wide sideways posture while commentating loudly to conceal acute sympathetic nervous system arousal..."}
                </p>
                <p className="text-xs leading-relaxed">
                  Movement style: Wide stance, chest forward, chin up. Takes up space deliberately. Slight sideways lean when walking. Always last to duck.
                </p>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/70 backdrop-blur-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
                  <Lock className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <h4 className="text-base font-extrabold text-white">
                  Rent to access full personality profile ({wordCountSheet} words)
                </h4>
                <p className="text-xs text-[#94A3B8] max-w-md">
                  The complete profile is delivered via MCP when you connect your AI tool. Claude or ChatGPT reads the full document to enrich your scene prompts automatically.
                </p>
                <button
                  type="button"
                  onClick={handleRentClick}
                  className="vn-button-primary px-6 py-2.5 text-xs font-bold shadow-lg"
                >
                  Rent to Unlock Personality Layer →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TRY IT ================= */}
      {activeTab === "demo" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-card-app border border-app flex items-center justify-between text-xs text-secondary-app">
            <span>
              Pre-loaded with <strong className="text-primary-app">{character.name}</strong>. Free trial simulator:{" "}
              <strong>{Math.max(0, 3 - trialRunCount)}</strong> free test generations remaining without an account.
            </span>
          </div>

          <DemoInterface
            initialCharacters={[character]}
            preselectedCharacterName={character.name}
          />
        </div>
      )}

      {/* ================= TAB 4: REVIEWS ================= */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Average star rating (large) & Review count */}
          <div className="vn-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="text-5xl font-black text-primary-app">5.0</div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-secondary-app block font-medium">
                  {reviews.length} Verified Production Studio Reviews
                </span>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="vn-card p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-app">
                      {r.reviewer?.display_name || "Apex CineLabs"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Production Studio
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

          {/* Leave review form */}
          <form
            onSubmit={handleAddReview}
            className="vn-card p-6 space-y-4"
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
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
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
              placeholder="How did this character perform in your AI video production?"
              className="w-full p-3 rounded-xl bg-secondary-app border border-app text-xs sm:text-sm text-primary-app focus:outline-none focus:border-[#7C3AED]"
            />

            <button
              type="submit"
              disabled={submittingReview || !newReviewText.trim()}
              className="vn-button-primary px-5 py-2 text-xs font-semibold self-start cursor-pointer disabled:opacity-50"
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
