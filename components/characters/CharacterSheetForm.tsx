"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Mic,
  Loader2,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  AlertCircle,
  Copy,
  Share2,
  CheckCircle2,
  Lock,
  ExternalLink,
  Film,
  Plus,
  Trash2,
} from "lucide-react";
import { Character, ReelScene } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharacterPosterCard } from "./CharacterPosterCard";

const GENRES = [
  "Action",
  "Drama",
  "Thriller",
  "Comedy",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Adventure",
  "Crime",
  "Mystery",
  "Romance",
  "Animation",
];

const ALLOWED_USES_LIST = [
  { id: "film", label: "Film & Cinematic Videos" },
  { id: "advertising", label: "Commercials & Brand Content" },
  { id: "social", label: "Social Media Series" },
  { id: "game", label: "Games & Interactive (NPCs)" },
];

const STEPS = [
  { id: 1, name: "Basics" },
  { id: 2, name: "Look" },
  { id: 3, name: "Personality" },
  { id: 4, name: "Situations" },
  { id: 5, name: "Voice" },
  { id: 6, name: "Pricing" },
  { id: 7, name: "Demo Reel" },
  { id: 8, name: "Review & Publish" },
];

const MIN_SHEET_WORDS = 1000;

interface CharacterSheetFormProps {
  initialCharacter?: Character;
  isEditMode?: boolean;
}

export function CharacterSheetForm({
  initialCharacter,
  isEditMode = false,
}: CharacterSheetFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [characterId, setCharacterId] = useState<string>(
    initialCharacter?.id || ""
  );
  const [step, setStep] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<Character | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // STEP 1: Basics
  const [name, setName] = useState(initialCharacter?.name || "");
  const [vibeSummary, setVibeSummary] = useState(
    initialCharacter?.vibe_summary || ""
  );
  const [tagline, setTagline] = useState(initialCharacter?.tagline || "");
  const [description, setDescription] = useState(
    initialCharacter?.description || ""
  );
  const [genres, setGenres] = useState<string[]>(
    initialCharacter?.genres || ["Drama"]
  );
  const [personalityTags, setPersonalityTags] = useState<string[]>(
    initialCharacter?.personality_tags || []
  );
  const [tagInput, setTagInput] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [nameNote, setNameNote] = useState<string | null>(null);
  const [nameChecking, setNameChecking] = useState(false);

  // STEP 2: Look
  const [portraitUrl, setPortraitUrl] = useState(
    initialCharacter?.portrait_url || initialCharacter?.avatar_url || ""
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialCharacter?.gallery_urls || initialCharacter?.reference_images || []
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // STEP 3: Personality Sheet
  const [fullSheet, setFullSheet] = useState(
    initialCharacter?.full_sheet || ""
  );
  const [checkingSheet, setCheckingSheet] = useState(false);
  const [sheetCheckResult, setSheetCheckResult] = useState<{
    score: number;
    suggestions: string[];
  } | null>(
    initialCharacter?.specificity_score
      ? { score: initialCharacter.specificity_score, suggestions: [] }
      : null
  );

  // STEP 4: Situations & Presence
  const [behaviorDanger, setBehaviorDanger] = useState(
    initialCharacter?.behavior_danger || ""
  );
  const [behaviorFunny, setBehaviorFunny] = useState(
    initialCharacter?.behavior_funny || ""
  );
  const [behaviorEmotional, setBehaviorEmotional] = useState(
    initialCharacter?.behavior_emotional || ""
  );
  const [behaviorSocial, setBehaviorSocial] = useState(
    initialCharacter?.behavior_social || ""
  );
  const [behaviorConflict, setBehaviorConflict] = useState(
    initialCharacter?.behavior_conflict || ""
  );
  const [physicalAppearance, setPhysicalAppearance] = useState(
    initialCharacter?.physical_appearance || ""
  );
  const [movementStyle, setMovementStyle] = useState(
    initialCharacter?.movement_style || ""
  );
  const [signatureGesture, setSignatureGesture] = useState(
    initialCharacter?.signature_gesture || ""
  );
  const [coreTrait, setCoreTrait] = useState(
    initialCharacter?.core_trait || ""
  );
  const [secondaryTrait, setSecondaryTrait] = useState(
    initialCharacter?.secondary_trait || ""
  );
  const [hiddenQuality, setHiddenQuality] = useState(
    initialCharacter?.hidden_quality || ""
  );
  const [greatestFear, setGreatestFear] = useState(
    initialCharacter?.greatest_fear || ""
  );

  // STEP 5: Voice Profile
  const [voicePitch, setVoicePitch] = useState(
    initialCharacter?.voice_pitch || "Medium"
  );
  const [voiceTone, setVoiceTone] = useState(
    initialCharacter?.voice_tone || "Grounded"
  );
  const [voicePace, setVoicePace] = useState(
    initialCharacter?.voice_pace || "Deliberate"
  );
  const [voiceAccent, setVoiceAccent] = useState(
    initialCharacter?.voice_accent || "Standard / Neutral"
  );
  const [voiceBaseline, setVoiceBaseline] = useState(
    initialCharacter?.voice_baseline || ""
  );
  const [voiceDescription, setVoiceDescription] = useState(
    initialCharacter?.voice_description || ""
  );
  const [speakingStyle, setSpeakingStyle] = useState(
    initialCharacter?.speaking_style || ""
  );
  const [verbalHabits, setVerbalHabits] = useState(
    initialCharacter?.verbal_habits || ""
  );
  const [voiceSamplePath, setVoiceSamplePath] = useState(
    initialCharacter?.voice_sample_path || ""
  );
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // STEP 6: Pricing & Availability
  const [isFree, setIsFree] = useState(Boolean(initialCharacter?.is_free));
  const [trialEnabled, setTrialEnabled] = useState(
    initialCharacter?.trial_enabled ?? true
  );
  const [priceDaily, setPriceDaily] = useState(
    initialCharacter?.price_daily_cents
      ? (initialCharacter.price_daily_cents / 100).toString()
      : "5"
  );
  const [priceWeekly, setPriceWeekly] = useState(
    initialCharacter?.price_weekly_cents
      ? (initialCharacter.price_weekly_cents / 100).toString()
      : "25"
  );
  const [priceMonthly, setPriceMonthly] = useState(
    initialCharacter?.price_monthly_cents
      ? (initialCharacter.price_monthly_cents / 100).toString()
      : "75"
  );
  const [allowedUses, setAllowedUses] = useState<string[]>(
    initialCharacter?.allowed_uses || [
      "film",
      "advertising",
      "social",
      "game",
    ]
  );
  const [saleEnabled, setSaleEnabled] = useState(
    Boolean(initialCharacter?.sale_enabled)
  );
  const [salePrice, setSalePrice] = useState(
    initialCharacter?.sale_price_cents
      ? (initialCharacter.sale_price_cents / 100).toString()
      : "750"
  );
  const [acceptOffers, setAcceptOffers] = useState(
    Boolean(initialCharacter?.accept_offers)
  );
  const [minOffer, setMinOffer] = useState(
    initialCharacter?.min_offer_cents
      ? (initialCharacter.min_offer_cents / 100).toString()
      : ""
  );

  // STEP 7: Reel
  const [reelScenes, setReelScenes] = useState<
    Array<{
      category: string;
      title: string;
      scene_text: string;
      video_url: string;
      production_title?: string;
      production_link?: string;
    }>
  >([]);

  // Word count helper
  const countWords = (text: string) =>
    text.trim().split(/\s+/).filter(Boolean).length;
  const sheetWordCount = countWords(fullSheet);

  // Live Name Availability Check
  useEffect(() => {
    if (!name.trim()) {
      setNameAvailable(null);
      setNameNote(null);
      return;
    }
    const timer = setTimeout(async () => {
      setNameChecking(true);
      const res = await apiFetch<{
        available: boolean;
        note?: string;
        message?: string;
      }>(
        `/api/characters/check-name?name=${encodeURIComponent(
          name.trim()
        )}&character_id=${characterId}`
      );
      setNameChecking(false);
      if (res.ok) {
        setNameAvailable(res.data.available);
        setNameNote(res.data.note || null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, characterId]);

  // Autosave Payload Builder
  const buildPayload = useCallback(() => {
    const dailyCents = Math.round((parseFloat(priceDaily) || 0) * 100);
    const weeklyCents = Math.round((parseFloat(priceWeekly) || 0) * 100);
    const monthlyCents = Math.round((parseFloat(priceMonthly) || 0) * 100);
    const saleCents = Math.round((parseFloat(salePrice) || 0) * 100);
    const minOfferCents = minOffer
      ? Math.round(parseFloat(minOffer) * 100)
      : null;

    return {
      name: name.trim() || "Untitled Character",
      vibe_summary: vibeSummary.trim(),
      tagline: tagline.trim() || null,
      description: description.trim(),
      genres,
      personality_tags: personalityTags,
      portrait_url: portraitUrl || null,
      gallery_urls: galleryUrls,
      full_sheet: fullSheet,
      behavior_danger: behaviorDanger || null,
      behavior_funny: behaviorFunny || null,
      behavior_emotional: behaviorEmotional || null,
      behavior_social: behaviorSocial || null,
      behavior_conflict: behaviorConflict || null,
      physical_appearance: physicalAppearance || null,
      movement_style: movementStyle || null,
      signature_gesture: signatureGesture || null,
      core_trait: coreTrait || null,
      secondary_trait: secondaryTrait || null,
      hidden_quality: hiddenQuality || null,
      greatest_fear: greatestFear || null,
      voice_pitch: voicePitch,
      voice_tone: voiceTone,
      voice_pace: voicePace,
      voice_accent: voiceAccent,
      voice_baseline: voiceBaseline || null,
      voice_description: voiceDescription || null,
      speaking_style: speakingStyle || null,
      verbal_habits: verbalHabits || null,
      voice_sample_path: voiceSamplePath || null,
      is_free: isFree,
      trial_enabled: trialEnabled,
      price_daily_cents: isFree ? 0 : dailyCents,
      price_weekly_cents: isFree ? 0 : weeklyCents,
      price_monthly_cents: isFree ? 0 : monthlyCents,
      sale_enabled: saleEnabled,
      sale_price_cents: saleEnabled ? saleCents : null,
      accept_offers: acceptOffers,
      min_offer_cents: minOfferCents,
      allowed_uses: allowedUses,
    };
  }, [
    name,
    vibeSummary,
    tagline,
    description,
    genres,
    personalityTags,
    portraitUrl,
    galleryUrls,
    fullSheet,
    behaviorDanger,
    behaviorFunny,
    behaviorEmotional,
    behaviorSocial,
    behaviorConflict,
    physicalAppearance,
    movementStyle,
    signatureGesture,
    coreTrait,
    secondaryTrait,
    hiddenQuality,
    greatestFear,
    voicePitch,
    voiceTone,
    voicePace,
    voiceAccent,
    voiceBaseline,
    voiceDescription,
    speakingStyle,
    verbalHabits,
    voiceSamplePath,
    isFree,
    trialEnabled,
    priceDaily,
    priceWeekly,
    priceMonthly,
    saleEnabled,
    salePrice,
    acceptOffers,
    minOffer,
    allowedUses,
  ]);

  // Save Draft (Creates draft if characterId is empty, updates if exists)
  const saveDraft = useCallback(
    async (showIndicator = true) => {
      if (showIndicator) setIsSavingDraft(true);
      const payload = buildPayload();

      if (!characterId) {
        // Create initial draft
        const res = await apiFetch<{ character: Character }>(
          "/api/characters",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        if (res.ok && res.data.character) {
          setCharacterId(res.data.character.id);
          setLastSaved(new Date());
        }
      } else {
        // Update existing draft
        const res = await apiFetch<{ character: Character }>(
          `/api/characters/${characterId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );
        if (res.ok) {
          setLastSaved(new Date());
        }
      }
      if (showIndicator) setIsSavingDraft(false);
    },
    [characterId, buildPayload]
  );

  // Autosave interval every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(false);
    }, 20000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // File Upload Helpers
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "portrait" | "gallery" | "audio"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "audio") {
      setUploadingAudio(true);
    } else {
      setUploadingImage(true);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", type === "audio" ? "audio" : "image");

    const res = await apiFetch<{ url?: string; path: string }>("/api/upload", {
      method: "POST",
      headers: {}, // let browser set boundary
      body: formData,
    });

    if (type === "audio") {
      setUploadingAudio(false);
      if (res.ok && res.data.path) {
        setVoiceSamplePath(res.data.path);
      }
    } else {
      setUploadingImage(false);
      if (res.ok && (res.data.url || res.data.path)) {
        const fileUrl = res.data.url || res.data.path;
        if (type === "portrait") {
          setPortraitUrl(fileUrl);
        } else {
          if (galleryUrls.length < 8) {
            setGalleryUrls([...galleryUrls, fileUrl]);
          }
        }
      }
    }
  };

  // Step 3: Check My Sheet
  const handleCheckSheet = async () => {
    if (sheetWordCount < 100) return;
    setCheckingSheet(true);
    const res = await apiFetch<{ score: number; suggestions: string[] }>(
      "/api/characters/check-sheet",
      {
        method: "POST",
        body: JSON.stringify({
          full_sheet: fullSheet,
          core_trait: coreTrait,
        }),
      }
    );
    setCheckingSheet(false);
    if (res.ok) {
      setSheetCheckResult(res.data);
    }
  };

  // Step 8: Publish
  const handlePublish = async () => {
    if (!characterId) {
      await saveDraft(true);
    }
    setIsPublishing(true);
    setPublishError(null);

    // Save final changes first
    await saveDraft(false);

    const res = await apiFetch<{
      character: Character;
      registration_hash: string;
      cvr_id: string;
    }>(`/api/characters/${characterId}/publish`, {
      method: "POST",
    });

    setIsPublishing(false);
    if (res.ok) {
      setPublishSuccess(res.data.character);
    } else {
      setPublishError(
        res.error.message ||
          "Publishing failed. Check checklist requirements below."
      );
    }
  };

  // Navigating steps autosaves
  const goToStep = async (nextStep: number) => {
    await saveDraft(false);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Checklist for Step 8
  const checklist = [
    {
      title: "Personality sheet depth",
      desc: `At least 1,000 words (currently ${sheetWordCount})`,
      pass: sheetWordCount >= MIN_SHEET_WORDS,
    },
    {
      title: "Portrait image",
      desc: "High-resolution casting headshot",
      pass: Boolean(portraitUrl),
    },
    {
      title: "Core trait & Situations",
      desc: "Core trait plus danger, funny, and emotional behaviors written",
      pass: Boolean(
        coreTrait && behaviorDanger && behaviorFunny && behaviorEmotional
      ),
    },
    {
      title: "Written voice profile",
      desc: "Baseline and verbal delivery habits defined",
      pass: Boolean(voiceBaseline || voiceDescription),
    },
    {
      title: "Pricing structure",
      desc: isFree ? "Free character" : "Daily and monthly pricing set",
      pass: isFree || parseFloat(priceDaily) > 0,
    },
  ];

  const allChecksPass = checklist.every((c) => c.pass);

  // Success Screen Modal/View
  if (publishSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--glacier)]/15 border border-[var(--glacier)] flex items-center justify-center text-[var(--glacier)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
          Registration Complete
        </span>
        <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text)] mt-2">
          {publishSuccess.name} is Live
        </h1>
        <p className="mt-3 text-sm text-[var(--text-dim)] max-w-lg mx-auto">
          Your character has been cataloged in the Vynter North registry with
          permanent registration number{" "}
          <strong className="text-[var(--text)] font-mono">
            {publishSuccess.id}
          </strong>
          .
        </p>

        <div className="mt-8 p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <span className="text-xs text-[var(--text-dim)]">Registration ID</span>
            <span className="text-sm font-mono text-[var(--text)] font-semibold">
              {publishSuccess.id}
            </span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <span className="text-xs text-[var(--text-dim)]">Certificate Hash</span>
            <span className="text-xs font-mono text-[var(--text-dim)]">
              {publishSuccess.registration_hash?.slice(0, 16)}…
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-dim)]">Intelligence Layer</span>
            <span className="text-xs text-[var(--ok)] font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Ready for enrichment
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/certificate/${publishSuccess.id}`}
            className="px-5 py-3 rounded-[6px] border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--text)] text-sm font-medium hover:border-[var(--glacier)] flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View certificate
          </Link>
          <Link
            href={`/characters/${publishSuccess.id}`}
            className="px-5 py-3 rounded-[6px] bg-[var(--glacier)] text-[var(--glacier-ink)] text-sm font-medium hover:brightness-110 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Test your character
          </Link>
          <Link
            href="/dashboard/characters"
            className="px-4 py-3 rounded-[6px] text-sm text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header & Persistent Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
              Creator Registry
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl text-[var(--text)] mt-1">
              {characterId ? `Edit ${name || "Character"}` : "Register an Original Character"}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--text-dim)] font-mono">
              Step {step} of {STEPS.length}: {STEPS[step - 1].name}
            </div>
            <div className="text-[11px] text-[var(--text-dim)] mt-0.5">
              {isSavingDraft ? (
                <span className="text-[var(--glacier)] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving draft…
                </span>
              ) : lastSaved ? (
                <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              ) : (
                <span>Autosaves continuously</span>
              )}
            </div>
          </div>
        </div>

        {/* 8-Step Navigation Tracker */}
        <div className="grid grid-cols-8 gap-1.5 h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-full transition-colors duration-300 ${
                s.id <= step ? "bg-[var(--glacier)]" : "bg-transparent"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text-dim)] overflow-x-auto py-1">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToStep(s.id)}
              className={`px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                s.id === step
                  ? "text-[var(--glacier)] font-semibold"
                  : s.id < step
                  ? "text-[var(--text)]"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {s.id}. {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Container */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 lg:p-8 shadow-sm">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Character Identity
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Establish the character's primary name and logline. The CVR registration ID ensures uniqueness on the registry.
              </p>
            </div>

            {/* Name with live availability */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Character Name *
                </label>
                {nameChecking && (
                  <span className="text-[11px] text-[var(--text-dim)] flex items-center gap-1 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking catalog…
                  </span>
                )}
                {!nameChecking && nameAvailable === true && (
                  <span className="text-[11px] text-[var(--ok)] flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3" /> Name available
                  </span>
                )}
                {!nameChecking && nameAvailable === false && (
                  <span className="text-[11px] text-[var(--bad)] flex items-center gap-1 font-mono">
                    <X className="w-3 h-3" /> Already in your catalog
                  </span>
                )}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cairo Vane"
                className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-[var(--text)] placeholder-[var(--text-dim)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
              />
              {nameNote && (
                <p className="text-[11px] text-[var(--text-dim)] mt-1">
                  {nameNote}
                </p>
              )}
            </div>

            {/* Vibe Summary */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Vibe Summary * (≤100 chars)
                </label>
                <span className="text-[11px] text-[var(--text-dim)] font-mono">
                  {vibeSummary.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={vibeSummary}
                onChange={(e) => setVibeSummary(e.target.value)}
                placeholder="Four words that capture them: Quiet, lethal, dry humor."
                className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-[var(--text)] placeholder-[var(--text-dim)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                Tagline (Optional)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. The fixer who never carries a gun."
                className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-[var(--text)] placeholder-[var(--text-dim)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Public Overview * (≤500 chars)
                </label>
                <span className="text-[11px] text-[var(--text-dim)] font-mono">
                  {description.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-level public description visible to studios before renting..."
                className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-[var(--text)] placeholder-[var(--text-dim)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--glacier)] resize-none"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                Primary Genres *
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {GENRES.map((g) => {
                  const selected = genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          if (genres.length > 1) {
                            setGenres(genres.filter((x) => x !== g));
                          }
                        } else {
                          setGenres([...genres, g]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors border ${
                        selected
                          ? "bg-[var(--glacier)] text-[var(--glacier-ink)] border-[var(--glacier)]"
                          : "bg-[var(--panel-raised)] text-[var(--text-dim)] border-[var(--line)] hover:text-[var(--text)]"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personality Tags */}
            <div>
              <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                Personality Tags (Max 6)
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {personalityTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs bg-[var(--panel-raised)] text-[var(--text)] border border-[var(--line)]"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() =>
                        setPersonalityTags(
                          personalityTags.filter((x) => x !== t)
                        )
                      }
                      className="text-[var(--text-dim)] hover:text-[var(--bad)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {personalityTags.length < 6 && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        if (!personalityTags.includes(tagInput.trim())) {
                          setPersonalityTags([
                            ...personalityTags,
                            tagInput.trim(),
                          ]);
                          setTagInput("");
                        }
                      }
                    }}
                    placeholder="Type tag and press enter (e.g. Stoic, Sarcastic)"
                    className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--glacier)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim() && !personalityTags.includes(tagInput.trim())) {
                        setPersonalityTags([...personalityTags, tagInput.trim()]);
                        setTagInput("");
                      }
                    }}
                    className="px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] text-xs text-[var(--text)] rounded-[6px] hover:border-[var(--glacier)]"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: LOOK */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Visual Casting Headshot
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Posters in Vynter North follow a 4:5 casting portrait format. Upload a clear, consistent reference headshot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Upload Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Primary 4:5 Portrait * (≤8 MB, JPG/PNG/WebP)
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="px-4 py-2.5 bg-[var(--glacier)] text-[var(--glacier-ink)] rounded-[6px] text-xs font-medium cursor-pointer hover:brightness-110 flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5" />
                      {portraitUrl ? "Change portrait" : "Upload portrait"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileUpload(e, "portrait")}
                        className="hidden"
                      />
                    </label>
                    {uploadingImage && (
                      <span className="text-xs text-[var(--text-dim)] flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Reference Gallery (Up to 8 angles / expressions)
                  </label>
                  <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                    Studios use gallery images for side profiles, costume references, and expressive range.
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {galleryUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-[4px] overflow-hidden border border-[var(--line)] group"
                      >
                        <img
                          src={url}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryUrls(
                              galleryUrls.filter((_, i) => i !== idx)
                            )
                          }
                          className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {galleryUrls.length < 8 && (
                      <label className="aspect-square rounded-[4px] border border-dashed border-[var(--line)] hover:border-[var(--glacier)] flex flex-col items-center justify-center cursor-pointer text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
                        <Plus className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">Add</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(e, "gallery")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Poster Card Live Preview */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-2">
                  Marketplace Poster Preview (2px corners)
                </label>
                <div className="max-w-[240px] mx-auto">
                  <CharacterPosterCard
                    character={{
                      id: characterId || "CVR-2026-00000",
                      owner_id: user?.id || "",
                      name: name || "Character Name",
                      status: "draft",
                      vibe_summary:
                        vibeSummary || "Quiet, lethal, dry humor.",
                      description: description || "Character description.",
                      portrait_url: portraitUrl || null,
                      genres: genres,
                      personality_tags: personalityTags,
                      allowed_uses: allowedUses,
                      is_free: isFree,
                      trial_enabled: trialEnabled,
                      price_daily_cents: isFree
                        ? 0
                        : Math.round((parseFloat(priceDaily) || 5) * 100),
                      price_weekly_cents: 2500,
                      price_monthly_cents: 7500,
                      sale_enabled: saleEnabled,
                      sale_price_cents: 75000,
                      fame_score: 45,
                      fame_tier: "newcomer",
                      rating_avg: 5.0,
                      review_count: 0,
                      rental_count: 0,
                      unique_studios: 0,
                      gallery_urls: galleryUrls,
                      sheet_word_count: sheetWordCount,
                      accept_offers: acceptOffers,
                      is_featured: false,
                      is_demo: false,
                      is_legend: false,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    } as unknown as Character}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PERSONALITY SHEET */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[var(--text)]">
                  The Master Personality Sheet
                </h2>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  This private document forms the brain of the character. Minimum{" "}
                  <strong>{MIN_SHEET_WORDS.toLocaleString()} words</strong>. The AI server selects relevant paragraphs per scene; the full sheet never leaves our server.
                </p>
              </div>

              {/* Live Word Count Indicator */}
              <div className="text-right">
                <span
                  className={`text-sm font-mono font-bold ${
                    sheetWordCount >= MIN_SHEET_WORDS
                      ? "text-[var(--ok)]"
                      : "text-[var(--marquee)]"
                  }`}
                >
                  {sheetWordCount.toLocaleString()} words
                </span>
                <span className="block text-[11px] text-[var(--text-dim)]">
                  {sheetWordCount >= MIN_SHEET_WORDS
                    ? "✓ Meets minimum"
                    : `${MIN_SHEET_WORDS - sheetWordCount} words to go`}
                </span>
              </div>
            </div>

            {/* Guided Prompt Topics */}
            <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] text-xs text-[var(--text-dim)] space-y-1.5">
              <span className="text-[var(--text)] font-semibold uppercase tracking-wider text-[11px] block">
                What to cover in this sheet:
              </span>
              <p>
                1. <strong>Identity & History:</strong> Core motivations, childhood, formative trauma, debts, and current occupation.
              </p>
              <p>
                2. <strong>Social & Interpersonal:</strong> How they treat allies, strangers, superiors, and subordinates.
              </p>
              <p>
                3. <strong>Contradictions & Moral Boundaries:</strong> Lines they will never cross, secrets they guard, hypocrisies.
              </p>
              <p>
                4. <strong>Micro-behaviors:</strong> Speech pauses, physical tells under pressure, relationship with violence and humor.
              </p>
            </div>

            {/* Sheet Textarea */}
            <div>
              <textarea
                rows={16}
                value={fullSheet}
                onChange={(e) => setFullSheet(e.target.value)}
                placeholder="Write the deep character sheet here in your own words. Originality and specific details yield the best video direction results..."
                className="w-full px-4 py-3 bg-[var(--night)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] font-mono leading-relaxed placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)] resize-y"
              />
            </div>

            {/* Check Sheet Button & Results */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheckSheet}
                  disabled={checkingSheet || sheetWordCount < 100}
                  className="px-4 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] text-[var(--text)] text-xs font-medium rounded-[6px] hover:border-[var(--glacier)] disabled:opacity-50 flex items-center gap-2"
                >
                  {checkingSheet ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[var(--marquee)]" />
                  )}
                  Check my sheet
                </button>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Evaluates originality and specificity (calls NVIDIA NIM)
                </span>
              </div>

              {sheetCheckResult && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px]">
                  <span className="text-xs text-[var(--text-dim)]">Specificity:</span>
                  <span className="text-sm font-mono font-bold text-[var(--marquee)]">
                    {sheetCheckResult.score}/100
                  </span>
                </div>
              )}
            </div>

            {sheetCheckResult && sheetCheckResult.suggestions?.length > 0 && (
              <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-2">
                <span className="text-xs font-semibold text-[var(--marquee)]">
                  Improvement suggestions from evaluation:
                </span>
                <ul className="text-xs text-[var(--text-dim)] space-y-1 list-disc list-inside">
                  {sheetCheckResult.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SITUATIONS & PRESENCE */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Situational Reactions & Physical Tells
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                These five scenario profiles allow the intelligence engine to inject distinctive reactions into high-intensity scenes.
              </p>
            </div>

            {/* Core Trait (One sentence) */}
            <div>
              <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                Core Trait * (One sentence summary)
              </label>
              <input
                type="text"
                value={coreTrait}
                onChange={(e) => setCoreTrait(e.target.value)}
                placeholder="e.g. Unflinching stillness under sudden threat."
                className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
              />
            </div>

            {/* Situation Boxes */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Danger & High Stakes Reaction * (80–600 words)
                  </label>
                  <span className="text-[11px] font-mono text-[var(--text-dim)]">
                    {countWords(behaviorDanger)} words
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                  Example: <em>Does not raise his voice; lowers his center of gravity and stops blinking.</em>
                </p>
                <textarea
                  rows={4}
                  value={behaviorDanger}
                  onChange={(e) => setBehaviorDanger(e.target.value)}
                  placeholder="Describe exact physical posture, breathing, and instinct when facing armed threat or mortal danger..."
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Awkward & Comedic Reaction * (80–600 words)
                  </label>
                  <span className="text-[11px] font-mono text-[var(--text-dim)]">
                    {countWords(behaviorFunny)} words
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                  Example: <em>Over-corrects with formal politeness; fixes cuff links to avoid eye contact.</em>
                </p>
                <textarea
                  rows={4}
                  value={behaviorFunny}
                  onChange={(e) => setBehaviorFunny(e.target.value)}
                  placeholder="How they react to ridiculous circumstances, social slip-ups, or uninvited banter..."
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Grief & Emotional Vulnerability * (80–600 words)
                  </label>
                  <span className="text-[11px] font-mono text-[var(--text-dim)]">
                    {countWords(behaviorEmotional)} words
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                  Example: <em>Turns sideways to the speaker; jaw clenches once before speaking in a lower register.</em>
                </p>
                <textarea
                  rows={4}
                  value={behaviorEmotional}
                  onChange={(e) => setBehaviorEmotional(e.target.value)}
                  placeholder="How they carry real loss, betrayals, and quiet intimacy..."
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Crowds & Social Situations
                  </label>
                  <textarea
                    rows={3}
                    value={behaviorSocial}
                    onChange={(e) => setBehaviorSocial(e.target.value)}
                    placeholder="Wallflower, room-controller, or calculating observer..."
                    className="mt-1.5 w-full px-3.5 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Interpersonal Conflict
                  </label>
                  <textarea
                    rows={3}
                    value={behaviorConflict}
                    onChange={(e) => setBehaviorConflict(e.target.value)}
                    placeholder="Verbal cutting, passive-aggressive silence, or immediate escalation..."
                    className="mt-1.5 w-full px-3.5 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--glacier)]"
                  />
                </div>
              </div>

              {/* Physical presence fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Movement Style
                  </label>
                  <input
                    type="text"
                    value={movementStyle}
                    onChange={(e) => setMovementStyle(e.target.value)}
                    placeholder="e.g. Economical, feline, slow stride"
                    className="mt-1 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Signature Gesture
                  </label>
                  <input
                    type="text"
                    value={signatureGesture}
                    onChange={(e) => setSignatureGesture(e.target.value)}
                    placeholder="e.g. Taps thumb against pinky knuckle"
                    className="mt-1 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Greatest Fear
                  </label>
                  <input
                    type="text"
                    value={greatestFear}
                    onChange={(e) => setGreatestFear(e.target.value)}
                    placeholder="e.g. Dying in an enclosed room"
                    className="mt-1 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: VOICE PROFILE */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Written Voice Profile
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Vynter North provides video tools with exact delivery direction (inflection, cadence, pauses) rather than spoken audio.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Pitch
                </label>
                <select
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                >
                  <option>Low / Baritone</option>
                  <option>Medium</option>
                  <option>High / Tenor</option>
                  <option>Husky</option>
                  <option>Gravelly</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Tone
                </label>
                <select
                  value={voiceTone}
                  onChange={(e) => setVoiceTone(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                >
                  <option>Grounded</option>
                  <option>Sharp / Snappy</option>
                  <option>Melodic</option>
                  <option>Monotone / Deadpan</option>
                  <option>Warm</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Pace
                </label>
                <select
                  value={voicePace}
                  onChange={(e) => setVoicePace(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                >
                  <option>Deliberate / Slow</option>
                  <option>Measured / Moderate</option>
                  <option>Rapid / Staccato</option>
                  <option>Hesitant</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Accent
                </label>
                <input
                  type="text"
                  value={voiceAccent}
                  onChange={(e) => setVoiceAccent(e.target.value)}
                  placeholder="e.g. London Estuary"
                  className="mt-1.5 w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Emotional Baseline
                </label>
                <input
                  type="text"
                  value={voiceBaseline}
                  onChange={(e) => setVoiceBaseline(e.target.value)}
                  placeholder="e.g. Quiet certainty, never shouts, speaks slightly after others stop talking."
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  Verbal Habits & Speech Rhythm
                </label>
                <textarea
                  rows={3}
                  value={verbalHabits}
                  onChange={(e) => setVerbalHabits(e.target.value)}
                  placeholder="Does not use filler words; trails off mid-sentence when distracted; speaks in fragments..."
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)]"
                />
              </div>

              {/* Honest Voice Sample Upload */}
              <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
                      Optional Voice Sample (≤15 MB MP3/WAV/M4A)
                    </span>
                    <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                      Audio analysis and voice cloning are not live yet. Your written voice profile is what studios' tools receive today.
                    </p>
                  </div>
                  <label className="px-3.5 py-2 bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] rounded-[6px] text-xs font-medium cursor-pointer hover:border-[var(--glacier)] flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-[var(--glacier)]" />
                    {voiceSamplePath ? "Sample saved" : "Upload sample"}
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(e, "audio")}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingAudio && (
                  <span className="text-xs text-[var(--text-dim)] flex items-center gap-1 mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading audio…
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PRICING & AVAILABILITY */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Pricing & Licensing
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Renting can be used by many studios at once; buying is exclusive and permanently removes the character from the market.
              </p>
            </div>

            {/* Free vs Paid Toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px]">
              <div>
                <span className="text-sm font-medium text-[var(--text)] block">
                  Free Character
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  Allow any studio to add this character to their library with 100 free credits.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
              />
            </div>

            {!isFree && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Daily Rental ($)
                  </label>
                  <div className="relative mt-1.5">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-[var(--text-dim)]" />
                    <input
                      type="number"
                      min={1}
                      value={priceDaily}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPriceDaily(val);
                        // Auto-suggest weekly ~5x and monthly ~15x
                        const d = parseFloat(val) || 0;
                        setPriceWeekly(Math.round(d * 5).toString());
                        setPriceMonthly(Math.round(d * 15).toString());
                      }}
                      className="w-full pl-8 pr-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)]"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-dim)] mt-1 block">
                    Includes 50 credits
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Weekly Rental ($)
                  </label>
                  <div className="relative mt-1.5">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-[var(--text-dim)]" />
                    <input
                      type="number"
                      min={1}
                      value={priceWeekly}
                      onChange={(e) => setPriceWeekly(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)]"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-dim)] mt-1 block">
                    Includes 200 credits
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                    Monthly Rental ($)
                  </label>
                  <div className="relative mt-1.5">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-[var(--text-dim)]" />
                    <input
                      type="number"
                      min={1}
                      value={priceMonthly}
                      onChange={(e) => setPriceMonthly(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)]"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-dim)] mt-1 block">
                    Includes 500 credits
                  </span>
                </div>
              </div>
            )}

            {/* Trial Toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px]">
              <div>
                <span className="text-sm font-medium text-[var(--text)] block">
                  Enable 3-Day Free Trial
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  Gives studios 15 preview credits to test the character in Claude or workspace.
                </span>
              </div>
              <input
                type="checkbox"
                checked={trialEnabled}
                onChange={(e) => setTrialEnabled(e.target.checked)}
                className="w-4 h-4 accent-[var(--glacier)] cursor-pointer"
              />
            </div>

            {/* Sale / Buyout Toggle */}
            <div className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block">
                    Permanent Buyout (Exclusive Sale)
                  </span>
                  <span className="text-xs text-[var(--text-dim)]">
                    Single studio acquires full ownership. Minimum is 10× monthly price (${((parseFloat(priceMonthly) || 50) * 10).toFixed(0)}).
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                      Buyout Price ($)
                    </label>
                    <div className="relative mt-1">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3 text-[var(--text-dim)]" />
                      <input
                        type="number"
                        min={(parseFloat(priceMonthly) || 50) * 10}
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-sm text-[var(--text)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                      Accept Studio Offers
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="checkbox"
                        checked={acceptOffers}
                        onChange={(e) => setAcceptOffers(e.target.checked)}
                        className="w-4 h-4 accent-[var(--glacier)]"
                      />
                      <span className="text-xs text-[var(--text-dim)]">
                        Allow studios to submit counter-offers
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: DEMO REEL */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Demo Reel (Optional)
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                A complete reel covers 4 categories (Danger, Social, Emotional, Light). Characters with complete reels are featured on the main marketplace; without one they appear in Rising.
              </p>
            </div>

            <div className="space-y-4">
              {reelScenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text)] uppercase">
                      Scene #{idx + 1}: {scene.category}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setReelScenes(reelScenes.filter((_, i) => i !== idx))
                      }
                      className="text-[var(--text-dim)] hover:text-[var(--bad)] text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={scene.title}
                      onChange={(e) => {
                        const copy = [...reelScenes];
                        copy[idx].title = e.target.value;
                        setReelScenes(copy);
                      }}
                      placeholder="Scene Title (e.g. The Warehouse Escape)"
                      className="px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                    />
                    <input
                      type="text"
                      value={scene.video_url}
                      onChange={(e) => {
                        const copy = [...reelScenes];
                        copy[idx].video_url = e.target.value;
                        setReelScenes(copy);
                      }}
                      placeholder="YouTube / Vimeo / mp4 link"
                      className="px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text)]"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2 flex-wrap">
                {["danger", "social", "emotional", "light", "extra"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setReelScenes([
                        ...reelScenes,
                        {
                          category: cat,
                          title: "",
                          scene_text: "",
                          video_url: "",
                        },
                      ])
                    }
                    className="px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[6px] text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--glacier)] flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" /> Add {cat} scene
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW & PUBLISH */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">
                Review & Publish Character
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Verify registry criteria. Publishing will run the similarity check and mint the cryptographic registration fingerprint.
              </p>
            </div>

            {publishError && (
              <div className="p-4 bg-[var(--bad)]/15 border border-[var(--bad)] rounded-[8px] flex items-start gap-3 text-xs text-[var(--bad)]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{publishError}</span>
              </div>
            )}

            {/* Checklist */}
            <div className="p-5 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-3">
              <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
                Publishing Requirements Checklist
              </span>
              <div className="divide-y divide-[var(--line)]">
                {checklist.map((item, i) => (
                  <div
                    key={i}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[var(--text)] block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[var(--text-dim)]">
                        {item.desc}
                      </span>
                    </div>
                    <div>
                      {item.pass ? (
                        <span className="px-2 py-0.5 rounded bg-[var(--ok)]/15 text-[var(--ok)] font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Pass
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[var(--bad)]/15 text-[var(--bad)] font-medium flex items-center gap-1">
                          <X className="w-3 h-3" /> Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="p-4 bg-[var(--night)] border border-[var(--line)] rounded-[8px] flex items-center gap-4">
              {portraitUrl && (
                <img
                  src={portraitUrl}
                  alt={name}
                  className="w-16 h-20 object-cover rounded-[2px] border border-[var(--line)]"
                />
              )}
              <div>
                <h3 className="font-serif text-2xl text-[var(--text)]">
                  {name || "Untitled"}
                </h3>
                <p className="text-xs text-[var(--text-dim)]">
                  {vibeSummary || "No logline"}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--text-dim)]">
                  <span>{genres.join(", ")}</span>
                  <span>•</span>
                  <span>{isFree ? "Free" : `$${priceDaily}/day`}</span>
                  <span>•</span>
                  <span className="font-mono">{sheetWordCount} words</span>
                </div>
              </div>
            </div>

            {/* Publish Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || !allChecksPass}
                className="w-full py-3.5 bg-[var(--glacier)] text-[var(--glacier-ink)] text-sm font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running similarity check & minting registration…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Publish character
                  </>
                )}
              </button>
              {!allChecksPass && (
                <p className="text-[11px] text-[var(--bad)] text-center mt-2">
                  Complete all items in the checklist above before publishing.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--line)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              className="px-4 py-2 bg-[var(--panel-raised)] border border-[var(--line)] text-[var(--text)] text-xs font-medium rounded-[6px] hover:border-[var(--glacier)] flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => saveDraft(true)}
              className="px-3.5 py-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
            >
              Save draft
            </button>

            {step < STEPS.length && (
              <button
                type="button"
                onClick={() => goToStep(step + 1)}
                className="px-5 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5"
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
