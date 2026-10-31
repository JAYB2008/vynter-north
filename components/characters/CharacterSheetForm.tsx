"use client";

import { useState, useEffect, useRef } from "react";
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
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Character } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Adventure",
  "Romance",
  "Animation",
];

const ALLOWED_USES_OPTIONS = [
  { id: "film", label: "Film & Short Videos" },
  { id: "advertising", label: "Advertising & Brand Content" },
  { id: "social_content", label: "Social Media Content" },
  { id: "gaming", label: "Game Development (NPC use)" },
  { id: "vr", label: "Virtual Reality" },
  { id: "educational", label: "Educational Content" },
  { id: "companion", label: "AI Companion Applications" },
];

const STEPS = [
  { id: 1, name: "Basic" },
  { id: 2, name: "Images" },
  { id: 3, name: "Personality" },
  { id: 4, name: "Voice" },
  { id: 5, name: "Pricing" },
  { id: 6, name: "Review" },
];

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

  const [step, setStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedCharacter, setPublishedCharacter] = useState<Character | null>(
    null
  );

  // STEP 1: Basic Info
  const [name, setName] = useState(initialCharacter?.name || "");
  const [nameChecking, setNameChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [vibeSummary, setVibeSummary] = useState(
    initialCharacter?.vibe_summary || ""
  );
  const [description, setDescription] = useState(
    initialCharacter?.description || ""
  );
  const [genres, setGenres] = useState<string[]>(
    initialCharacter?.genres || ["Action", "Thriller"]
  );

  // STEP 2: Visual Identity
  const [avatarUrl, setAvatarUrl] = useState(
    initialCharacter?.avatar_url || ""
  );
  const [referenceImages, setReferenceImages] = useState<string[]>(
    initialCharacter?.reference_images || []
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // STEP 3: Personality Profile
  // Section A: Full Character Sheet
  const [fullCharacterSheet, setFullCharacterSheet] = useState(
    initialCharacter?.full_character_sheet || ""
  );
  // Section B: Specific Situations
  const [behaviorDangerous, setBehaviorDangerous] = useState(
    initialCharacter?.behavior_dangerous || ""
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
  // Section C: Physical Presence
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
  const [hiddenQuality, setHiddenQuality] = useState(
    initialCharacter?.hidden_quality || ""
  );
  const [greatestFear, setGreatestFear] = useState(
    initialCharacter?.greatest_fear || ""
  );

  // STEP 4: Voice & Speech Profile
  const [voiceDescription, setVoiceDescription] = useState(
    initialCharacter?.voice_description || ""
  );
  const [speakingStyle, setSpeakingStyle] = useState(
    initialCharacter?.speaking_style || ""
  );
  const [verbalHabits, setVerbalHabits] = useState(
    initialCharacter?.verbal_habits || ""
  );
  const [voiceSampleUrl, setVoiceSampleUrl] = useState(
    initialCharacter?.voice_sample_url || ""
  );
  const [voiceAnalyzedDescription, setVoiceAnalyzedDescription] = useState(
    initialCharacter?.voice_analyzed_description || ""
  );
  const [analyzingVoice, setAnalyzingVoice] = useState(false);

  // STEP 5: Pricing & Availability
  const [isFree, setIsFree] = useState<boolean>(
    initialCharacter?.is_free ?? false
  );
  const [rentalDaily, setRentalDaily] = useState<number>(
    initialCharacter?.rental_price_daily || 15
  );
  const [rentalWeekly, setRentalWeekly] = useState<number>(
    initialCharacter?.rental_price_weekly || 65
  );
  const [rentalMonthly, setRentalMonthly] = useState<number>(
    initialCharacter?.rental_price_monthly || 200
  );
  const [isPurchasable, setIsPurchasable] = useState<boolean>(
    Boolean(initialCharacter?.purchase_price)
  );
  const [purchasePrice, setPurchasePrice] = useState<number>(
    initialCharacter?.purchase_price || 2500
  );
  const [allowedUses, setAllowedUses] = useState<string[]>(
    initialCharacter?.allowed_uses || [
      "film",
      "advertising",
      "social_content",
      "gaming",
    ]
  );

  // Word counter calculation for Full Character Sheet
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };
  const sheetWordCount = countWords(fullCharacterSheet);

  // Live name check
  useEffect(() => {
    if (!name.trim() || (isEditMode && name === initialCharacter?.name)) {
      setNameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setNameChecking(true);
      try {
        const res = await fetch(
          `/api/characters/check-name?name=${encodeURIComponent(name.trim())}`
        );
        const data = await res.json();
        setNameAvailable(data.available);
      } catch {
        setNameAvailable(true);
      } finally {
        setNameChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, isEditMode, initialCharacter?.name]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (name.trim()) {
        saveDraft(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [
    name,
    vibeSummary,
    description,
    genres,
    avatarUrl,
    fullCharacterSheet,
    behaviorDangerous,
    coreTrait,
  ]);

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const toggleAllowedUse = (useId: string) => {
    if (allowedUses.includes(useId)) {
      setAllowedUses(allowedUses.filter((u) => u !== useId));
    } else {
      setAllowedUses([...allowedUses, useId]);
    }
  };

  // Daily price adjustment auto-updates suggested weekly/monthly
  const handleDailyChange = (val: number) => {
    setRentalDaily(val);
    setRentalWeekly(Math.round(val * 5));
    setRentalMonthly(Math.round(val * 15));
  };

  // Upload handler (images)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAvatar: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "character-images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isAvatar) {
        setAvatarUrl(data.url);
        toast.success("Main avatar uploaded!");
      } else {
        if (referenceImages.length < 8) {
          setReferenceImages([...referenceImages, data.url]);
          toast.success("Reference angle added!");
        } else {
          toast.error("Maximum 8 reference images reached.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload handler (voice sample)
  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Audio sample must be under 10MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "voice-samples");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVoiceSampleUrl(data.url);
      toast.success("Voice sample uploaded. Ready for AI Analysis!");
    } catch (err: any) {
      toast.error(err.message || "Voice upload failed.");
    }
  };

  // Analyze voice sample with NVIDIA NIM
  const handleAnalyzeVoice = async () => {
    setAnalyzingVoice(true);
    try {
      const res = await fetch(
        `/api/characters/${initialCharacter?.id || "temp"}/voice-analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioUrl: voiceSampleUrl,
            notes: `${voiceDescription} ${speakingStyle}`,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVoiceAnalyzedDescription(data.voice_analyzed_description);
      toast.success("AI Voice Analysis generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Voice analysis failed.");
    } finally {
      setAnalyzingVoice(false);
    }
  };

  // Pre-fill James or Cairo preset for testing
  const handleFillTemplate = () => {
    setName("Cairo");
    setVibeSummary("Loud. Performative. Secretly terrified.");
    setDescription(
      "A magnetic, razor-sharp rogue who commands every room he enters. His swagger is infectious, but beneath the diamond-hard banter lies a hyper-vigilant survivor."
    );
    setGenres(["Action", "Comedy", "Adventure", "Thriller"]);
    setAvatarUrl(
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80"
    );
    setFullCharacterSheet(`Cairo is a master of situational dominance who learned very early in life that whoever controls the rhythm of a conversation controls the outcome. Raised in volatile, unstable transit hubs between industrial megastructures, Cairo discovered that appearing confident and indispensable was the only armor that truly protected him from predation.

WHO THEY ARE:
Describe your character's fundamental nature. Cairo is exceptionally skilled: he possesses instinctual tactical awareness, lightning-fast reflexes, and an innate knack for reading micro-expressions. However, he refuses to let his competence speak quietly. Instead, he relentlessly oversells everything he does, narrating his actions with witty bravado and theatrical showmanship. He dresses in sharp, tailored coats with subtle scuffs at the cuffs—clothing that looks opulent at ten paces but reveals frantic wear up close.

WHAT THEY WANT:
Cairo wants unconditional relevance and absolute security for his crew. He works obsessively toward carving out a permanent sanctuary free from jurisdictional surveillance. He thinks that reaching the apex of reputation will make him untouchable.

WHAT THEY FEAR:
Cairo is most terrified of being rendered helpless, pitiful, or exposed as ordinary. The prospect of sitting in a room where his words carry zero weight causes acute nausea. He cannot stand people witnessing his exhaustion or terror.

HOW THEY RELATE TO PEOPLE:
With strangers, Cairo is an avalanche of magnetic charm and transactional flattery. He smiles broadly, shakes hands firmly, and makes immediate, slightly scandalous jokes to disarm suspicion. With people he genuinely cares about, he becomes quietly watchful, frequently offering warm shelter or supplies under the guise of 'getting rid of extra inventory.'

THEIR CONTRADICTIONS:
Cairo appears completely selfish, vain, and self-serving on the surface, yet in actual mortal danger he will reflexively throw himself between hostile fire and a junior crew member without a second thought. He acts like he hates responsibility while carrying the weight of everyone's survival on his shoulders.

THEIR HISTORY:
Orphaned in a transit terminal collapse, Cairo grew up fast-talking station security guards and fixing faulty atmospheric seals. He knows hunger, abandonment, and betrayal intimately.

THEIR SENSE OF HUMOR:
Rapid-fire, sarcastic, and self-aggrandizing. When terrified, he tells jokes faster and louder.

WHAT THEY WOULD NEVER DO:
Cairo would never abandon an injured subordinate, accept a bribe to betray a friend, or beg for mercy in public.`);

    setBehaviorDangerous(
      "Gets louder and more theatrical when scared. The more terrified he is, the bigger his performance. His face goes completely blank for one second when something genuinely surprises him — the mask drops — then snaps back."
    );
    setBehaviorFunny(
      "Laughs too loudly and too fast. Uses humor offensively to control situations. Will do something physical if the joke doesn't land."
    );
    setBehaviorEmotional(
      "Deflects immediately with humor or movement. Cannot sit still in emotional conversations. The performance cracks only when someone else is in real danger."
    );
    setBehaviorSocial(
      "Dominates by default. Takes up space deliberately. Always the center until something genuinely frightening happens."
    );
    setBehaviorConflict(
      "Escalates first, assesses second. Goes louder before going quieter. Rarely backs down publicly."
    );
    setPhysicalAppearance(
      "Lean, athletic build around 6'1\", sharp angular jawline, close-trimmed fade, penetrating hazel eyes. Tailored long coat."
    );
    setMovementStyle(
      "Wide stance, chest forward, chin up. Takes up space deliberately. Slight sideways lean when walking. Always last to duck."
    );
    setSignatureGesture("Smoothly adjusts both coat cuffs with his thumbs.");
    setCoreTrait(
      "Overconfident but genuinely skilled — always oversells what he can actually deliver."
    );
    setHiddenQuality(
      "When someone ELSE is in real danger he drops every performance completely. Becomes quiet, focused, and utterly competent. Unrecognizable."
    );
    setGreatestFear(
      "Being seen as helpless, pitiful, or easily replaced."
    );
    setVoiceDescription(
      "Medium-deep baritone, smooth delivery slightly faster than natural. Cracks under genuine stress."
    );
    setSpeakingStyle(
      "Fast when performing, deliberate when serious. Commentates on own actions under pressure."
    );
    setVerbalHabits(
      "Says 'Watch and learn' right before attempting risky maneuvers."
    );
    toast.success("Loaded Cairo character blueprint!");
  };

  const saveDraft = async (silent = false) => {
    if (!name.trim()) {
      if (!silent) toast.error("Please provide at least a character name.");
      return;
    }

    setIsSavingDraft(true);
    try {
      const payload = {
        name,
        vibe_summary: vibeSummary,
        description,
        genres,
        avatar_url: avatarUrl,
        reference_images: referenceImages,
        full_character_sheet: fullCharacterSheet,
        behavior_dangerous: behaviorDangerous,
        behavior_funny: behaviorFunny,
        behavior_emotional: behaviorEmotional,
        behavior_social: behaviorSocial,
        behavior_conflict: behaviorConflict,
        physical_appearance: physicalAppearance,
        movement_style: movementStyle,
        signature_gesture: signatureGesture,
        core_trait: coreTrait,
        hidden_quality: hiddenQuality,
        greatest_fear: greatestFear,
        voice_description: voiceDescription,
        speaking_style: speakingStyle,
        verbal_habits: verbalHabits,
        voice_sample_url: voiceSampleUrl,
        voice_analyzed_description: voiceAnalyzedDescription,
        is_free: isFree,
        rental_price_daily: rentalDaily,
        rental_price_weekly: rentalWeekly,
        rental_price_monthly: rentalMonthly,
        purchase_price: isPurchasable ? purchasePrice : null,
        allowed_uses: allowedUses,
        status: "draft",
      };

      const url =
        isEditMode && initialCharacter?.id
          ? `/api/characters/${initialCharacter.id}`
          : "/api/characters";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLastSaved(new Date());
      if (!silent) toast.success("Draft saved successfully.");
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!name.trim()) {
      toast.error("Please enter a character name.");
      setStep(1);
      return;
    }

    if (!coreTrait.trim() || !fullCharacterSheet.trim()) {
      toast.error("Please provide the character sheet and core trait in Step 3.");
      setStep(3);
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        name,
        vibe_summary: vibeSummary || "Original AI Character",
        description: description || "Verified persona for AI video productions.",
        genres: genres.length > 0 ? genres : ["Drama"],
        avatar_url:
          avatarUrl ||
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
        reference_images: referenceImages,
        full_character_sheet: fullCharacterSheet,
        behavior_dangerous: behaviorDangerous,
        behavior_funny: behaviorFunny,
        behavior_emotional: behaviorEmotional,
        behavior_social: behaviorSocial,
        behavior_conflict: behaviorConflict,
        physical_appearance: physicalAppearance,
        movement_style: movementStyle,
        signature_gesture: signatureGesture,
        core_trait: coreTrait,
        hidden_quality: hiddenQuality,
        greatest_fear: greatestFear,
        voice_description: voiceDescription,
        speaking_style: speakingStyle,
        verbal_habits: verbalHabits,
        voice_sample_url: voiceSampleUrl,
        voice_analyzed_description: voiceAnalyzedDescription,
        is_free: isFree,
        rental_price_daily: isFree ? 0 : rentalDaily,
        rental_price_weekly: isFree ? 0 : rentalWeekly,
        rental_price_monthly: isFree ? 0 : rentalMonthly,
        purchase_price: isPurchasable ? purchasePrice : null,
        allowed_uses: allowedUses,
        status: "active",
      };

      const url =
        isEditMode && initialCharacter?.id
          ? `/api/characters/${initialCharacter.id}`
          : "/api/characters";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const savedChar: Character = data.character;
      setPublishedCharacter(savedChar);
      toast.success(`Character ${savedChar.name} is now live!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish character.");
    } finally {
      setIsPublishing(false);
    }
  };

  // SUCCESS PUBLISHED SCREEN
  if (publishedCharacter) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://vynter-north.vercel.app";
    const shareUrl = `${origin}/marketplace/${publishedCharacter.id}`;

    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-elevated-app border border-app text-[#A78BFA]">
            {publishedCharacter.id}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-app">
            Your character {publishedCharacter.name} is now live!
          </h1>
          <p className="text-sm text-secondary-app max-w-md mx-auto">
            Studios can now discover, test in the demo simulator, and rent{" "}
            {publishedCharacter.name} directly into Claude and ChatGPT.
          </p>
        </div>

        {/* Share buttons */}
        <div className="p-6 rounded-2xl bg-card-app border border-app flex flex-col gap-4">
          <span className="text-xs font-semibold text-secondary-app uppercase tracking-wider">
            Share Your Character
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-elevated-app border border-app text-xs font-mono text-primary-app select-all"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Profile link copied!");
              }}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href={`https://twitter.com/intent/tweet?text=Meet%20${encodeURIComponent(
                publishedCharacter.name
              )}%20on%20Vynter%20North%20—%20AI%20character%20identity%20registry!&url=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl border border-app bg-elevated-app hover:bg-[#1C1C35] text-xs font-semibold text-primary-app flex items-center gap-2 transition-colors"
            >
              <span>Twitter / X</span>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl border border-app bg-elevated-app hover:bg-[#1C1C35] text-xs font-semibold text-primary-app flex items-center gap-2 transition-colors"
            >
              <span>TikTok</span>
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/marketplace/${publishedCharacter.id}`}
            className="vn-button-primary px-6 py-2.5 text-sm font-bold shadow-lg"
          >
            View on Marketplace →
          </Link>
          <Link
            href="/dashboard/characters"
            className="px-5 py-2.5 rounded-xl border border-app bg-card-app hover:bg-elevated-app text-sm font-semibold text-secondary-app hover:text-primary-app transition-colors"
          >
            Back to Characters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header & Preset button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            {isEditMode ? "Editing Character" : "Character Creator Wizard"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-app tracking-tight mt-1">
            {isEditMode
              ? `Edit ${initialCharacter?.name}`
              : "Register AI Character"}
          </h1>
          <p className="text-xs sm:text-sm text-secondary-app mt-0.5">
            Define personality profiles and behavioral parameters for AI video
            tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFillTemplate}
            className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[#A78BFA] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Load complete pre-filled Cairo template"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Load Demo Template</span>
          </button>

          <button
            type="button"
            onClick={() => saveDraft(false)}
            disabled={isSavingDraft}
            className="px-3.5 py-1.5 rounded-xl border border-app bg-elevated-app hover:border-[#7C3AED] text-xs font-semibold text-secondary-app hover:text-primary-app transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      {/* Progress Bar Header: Basic → Images → Personality → Voice → Pricing → Review */}
      <div className="w-full bg-card-app border border-app rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-6 gap-2">
          {STEPS.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? "text-[#7C3AED] font-bold"
                    : isCompleted
                    ? "text-emerald-400 font-semibold"
                    : "text-muted-app font-medium"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-elevated-app text-muted-app border border-app"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className="text-[11px] truncate hidden sm:inline">
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1 — BASIC INFO */}
      {step === 1 && (
        <div className="vn-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary-app">
              Step 1 — Basic Information
            </h2>
            <p className="text-xs sm:text-sm text-secondary-app">
              Give your character a distinct name, vibe summary, and genre classifications.
            </p>
          </div>

          <div className="space-y-4">
            {/* Character Name with Live Uniqueness Check */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary-app block">
                Character Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cairo"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-sm focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold">
                  {nameChecking && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-app" />
                  )}
                  {!nameChecking && nameAvailable === true && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Available
                    </span>
                  )}
                  {!nameChecking && nameAvailable === false && (
                    <span className="text-red-400 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Already taken
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vibe Summary with Character Counter (max 100) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary-app">
                  Vibe Summary (max 100 chars) *
                </label>
                <span
                  className={`text-xs ${
                    vibeSummary.length > 100
                      ? "text-red-400 font-bold"
                      : "text-muted-app"
                  }`}
                >
                  {vibeSummary.length}/100
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={vibeSummary}
                onChange={(e) => setVibeSummary(e.target.value)}
                placeholder="4 words that capture this character, e.g. Loud. Performative. Secretly terrified."
                className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-sm focus:outline-none focus:border-[#7C3AED] transition-colors italic"
              />
            </div>

            {/* General Description (max 500 chars) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary-app">
                  General Description (max 500 chars)
                </label>
                <span
                  className={`text-xs ${
                    description.length > 500
                      ? "text-red-400 font-bold"
                      : "text-muted-app"
                  }`}
                >
                  {description.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of who this character is and their narrative role."
                className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-sm focus:outline-none focus:border-[#7C3AED] transition-colors resize-none"
              />
            </div>

            {/* Genre Tags (Multi-select) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary-app block">
                Genre Specialties (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const isSelected = genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                          : "bg-elevated-app text-secondary-app hover:text-primary-app border border-app"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 — VISUAL IDENTITY */}
      {step === 2 && (
        <div className="vn-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary-app">
              Step 2 — Visual Identity & Angles
            </h2>
            <p className="text-xs sm:text-sm text-secondary-app">
              Upload your character from multiple angles. These are the reference
              images studios use when generating AI videos with your character.
            </p>
          </div>

          {/* Main Avatar Dropzone */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary-app block">
              Main Avatar Portrait *
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-secondary-app border border-dashed border-app">
              {avatarUrl ? (
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#7C3AED] shrink-0 shadow-lg relative group">
                  <img
                    src={avatarUrl}
                    alt="Main Avatar"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-red-400 hover:text-red-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-elevated-app border border-app flex flex-col items-center justify-center text-muted-app shrink-0">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[11px] mt-1">No Image</span>
                </div>
              )}

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-primary-app">
                  Upload primary character headshot
                </p>
                <p className="text-xs text-secondary-app">
                  PNG, JPG, or WebP. Optimal size 800x800px.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md transition-all cursor-pointer">
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Choose Headshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Reference Images (Up to 8) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary-app">
                Reference Angles & Expressions (up to 8)
              </label>
              <span className="text-xs text-muted-app">
                {referenceImages.length}/8
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {referenceImages.map((img, idx) => (
                <div
                  key={idx}
                  className="h-28 rounded-xl overflow-hidden border border-app bg-secondary-app relative group"
                >
                  <img
                    src={img}
                    alt={`Reference ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReferenceImages(
                        referenceImages.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {referenceImages.length < 8 && (
                <label className="h-28 rounded-xl border border-dashed border-app bg-secondary-app hover:border-[#7C3AED] flex flex-col items-center justify-center gap-1.5 text-muted-app hover:text-primary-app transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#A78BFA]" />
                  <span className="text-[11px] font-semibold">Add Angle</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — PERSONALITY PROFILE */}
      {step === 3 && (
        <div className="vn-card p-6 sm:p-8 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-[#A78BFA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Personality Profile</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-primary-app">
              The Heart of Your Character
            </h2>
            <div className="p-4 rounded-xl bg-elevated-app border border-app text-xs sm:text-sm text-secondary-app leading-relaxed">
              When a studio types a scene, our AI reads this and writes exactly
              how YOUR character would behave. The more you write, the better and
              more consistent your character performs.
            </div>
          </div>

          {/* SECTION A — FULL CHARACTER SHEET (MIN 1000 WORDS) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-primary-app">
                Section A — Complete Character Document (Min 1,000 Words)
              </label>
              <div
                className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                  sheetWordCount >= 1000
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {sheetWordCount >= 1000 ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {sheetWordCount} words —{" "}
                  {sheetWordCount >= 1000
                    ? "Minimum reached ✓"
                    : `${1000 - sheetWordCount} more words required`}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-app">
              Write everything about your character: Background, personality,
              motivations, quirks, contradictions, how they think, what they
              want, what they fear, how they treat people, their history. Minimum
              1,000 words. No maximum.
            </p>

            <textarea
              rows={24}
              value={fullCharacterSheet}
              onChange={(e) => setFullCharacterSheet(e.target.value)}
              placeholder={`Write your character's complete personality here.

WHO THEY ARE:
Describe your character's fundamental nature. What is their core personality? How do others perceive them versus how they see themselves?

WHAT THEY WANT:
What does this character want more than anything? What are they working toward? What do they think will make them happy?

WHAT THEY FEAR:
What are they most afraid of? What would break them? What do they most not want to be seen as?

HOW THEY RELATE TO PEOPLE:
Are they warm or cold? Do they trust easily or not at all? How do they treat strangers vs people they care about?

THEIR CONTRADICTIONS:
Every interesting character has contradictions. What are the tensions within this character?

THEIR HISTORY:
What shaped them? What happened to them that made them who they are?

THEIR SENSE OF HUMOR:
Do they have one? What do they find funny? How do they express it?

WHAT THEY WOULD NEVER DO:
What lines would they never cross? What would cause them to walk away from anything?

The more specific you are, the more consistently and precisely your character will perform in every scene.`}
              className="w-full p-4 rounded-xl bg-secondary-app border border-app text-primary-app text-sm leading-relaxed font-mono focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* SECTION B — SPECIFIC SITUATIONS (5 TEXTAREAS) */}
          <div className="space-y-5 pt-6 border-t border-app">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-primary-app">
                Section B — Behavioral Specifics
              </h3>
              <p className="text-xs text-secondary-app">
                Answer each question precisely. These are used when scenes match
                specific emotional categories.
              </p>
            </div>

            {/* 1. Dangerous */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-app block">
                1. In dangerous situations (chases, fights, life threats):
              </label>
              <textarea
                rows={6}
                value={behaviorDangerous}
                onChange={(e) => setBehaviorDangerous(e.target.value)}
                placeholder="Describe their exact physical and emotional response when in danger. Do they freeze? Fight? Run? How does their body move? What happens to their voice? What do they say or not say?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* 2. Comedic/Funny */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-app block">
                2. In funny or awkward situations:
              </label>
              <textarea
                rows={6}
                value={behaviorFunny}
                onChange={(e) => setBehaviorFunny(e.target.value)}
                placeholder="Do they laugh easily or suppress it? Do they make jokes or stay serious? What does their face do when something absurd happens? Do they play along or refuse to engage?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* 3. Emotional moments */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-app block">
                3. In moments of grief, loss, or deep emotion:
              </label>
              <textarea
                rows={6}
                value={behaviorEmotional}
                onChange={(e) => setBehaviorEmotional(e.target.value)}
                placeholder="Do they show emotion openly or close down? How do they handle their own pain? How do they respond when others are hurting? What breaks through their guard?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* 4. Social situations */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-app block">
                4. In social situations (parties, crowds, meetings):
              </label>
              <textarea
                rows={6}
                value={behaviorSocial}
                onChange={(e) => setBehaviorSocial(e.target.value)}
                placeholder="Do they dominate a room or disappear to the edges? Are they energized by people or drained? How do they behave in groups vs one-on-one?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* 5. Conflict */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-app block">
                5. In arguments or when directly challenged:
              </label>
              <textarea
                rows={6}
                value={behaviorConflict}
                onChange={(e) => setBehaviorConflict(e.target.value)}
                placeholder="Do they escalate or de-escalate? Get louder or quieter? Go cold or explode? Do they fight back immediately or calculate first? What does their face do when someone challenges them?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* SECTION C — PHYSICAL PRESENCE */}
          <div className="space-y-4 pt-6 border-t border-app">
            <h3 className="text-base font-bold text-primary-app">
              Section C — Physical Presence
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary-app block">
                  Physical Appearance (4 rows)
                </label>
                <textarea
                  rows={4}
                  value={physicalAppearance}
                  onChange={(e) => setPhysicalAppearance(e.target.value)}
                  placeholder="Describe their look — build, height impression, face structure, hair, skin, how they dress, what someone notices first about them."
                  className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary-app block">
                  How They Move (4 rows)
                </label>
                <textarea
                  rows={4}
                  value={movementStyle}
                  onChange={(e) => setMovementStyle(e.target.value)}
                  placeholder="How do they walk, stand, sit? Do they take up space or make themselves small? Fast or slow? Deliberate or impulsive? What does their body do when they're thinking?"
                  className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Signature Physical Habit (optional)
              </label>
              <input
                type="text"
                value={signatureGesture}
                onChange={(e) => setSignatureGesture(e.target.value)}
                placeholder="One thing they always do — a gesture, posture, or movement that belongs only to them."
                className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Core Trait in one sentence *
              </label>
              <input
                type="text"
                value={coreTrait}
                onChange={(e) => setCoreTrait(e.target.value)}
                placeholder="Overconfident but genuinely skilled — always oversells what he can actually deliver."
                className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                What They Hide (3 rows)
              </label>
              <textarea
                rows={3}
                value={hiddenQuality}
                onChange={(e) => setHiddenQuality(e.target.value)}
                placeholder="Something about this character that only appears in rare, unguarded moments. The thing that surprises people about them."
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Greatest Fear
              </label>
              <input
                type="text"
                value={greatestFear}
                onChange={(e) => setGreatestFear(e.target.value)}
                placeholder="Not necessarily physical — what does this character most not want to happen or be seen as?"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 — VOICE & SPEECH */}
      {step === 4 && (
        <div className="vn-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary-app">
              Step 4 — Voice & Speech Profile
            </h2>
            <p className="text-xs sm:text-sm text-secondary-app">
              Studios need to understand how your character sounds so their AI
              video tool can match the voice style.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Voice Quality (4 rows)
              </label>
              <textarea
                rows={4}
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                placeholder="Describe how they sound. Pitch (high/medium/low), tone (warm/cold/gravelly/smooth/husky/sharp), distinctive qualities. What would you notice about this voice in a dark room?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                How They Speak (3 rows)
              </label>
              <textarea
                rows={3}
                value={speakingStyle}
                onChange={(e) => setSpeakingStyle(e.target.value)}
                placeholder="Fast or slow? Formal or casual? Long sentences or short bursts? Loud or quiet? Direct or circles around things? How does their speaking style change with emotion?"
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-secondary-app block">
                Verbal Habits (optional, 3 rows)
              </label>
              <textarea
                rows={3}
                value={verbalHabits}
                onChange={(e) => setVerbalHabits(e.target.value)}
                placeholder="Catchphrases, repeated words or phrases, things they always say in specific situations, language patterns, accent details, anything that makes their speech recognizable."
                className="w-full p-3 rounded-xl bg-secondary-app border border-app text-primary-app text-xs sm:text-sm"
              />
            </div>

            {/* Optional Voice Sample Upload */}
            <div className="p-6 rounded-2xl bg-secondary-app border border-dashed border-app space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-[#A78BFA] flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary-app">
                    Upload a voice recording (optional)
                  </h4>
                  <p className="text-xs text-secondary-app">
                    Record yourself speaking as this character, or find a reference clip. Our AI analyzes it and generates a detailed voice description. Accepts .mp3, .wav, .m4a (max 10MB).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="px-4 py-2 rounded-xl bg-elevated-app border border-app hover:border-[#7C3AED] text-xs font-semibold text-primary-app flex items-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Select Audio File</span>
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,audio/*"
                    onChange={handleVoiceUpload}
                    className="hidden"
                  />
                </label>

                {voiceSampleUrl && (
                  <button
                    type="button"
                    onClick={handleAnalyzeVoice}
                    disabled={analyzingVoice}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {analyzingVoice ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Analyze Voice Sample with AI</span>
                  </button>
                )}
              </div>

              {voiceAnalyzedDescription && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-[#A78BFA] block">
                    AI Voice Analysis — Review and edit this:
                  </label>
                  <textarea
                    rows={4}
                    value={voiceAnalyzedDescription}
                    onChange={(e) => setVoiceAnalyzedDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-card-app border border-app text-primary-app text-xs leading-relaxed"
                  />
                  <p className="text-[11px] text-amber-400">
                    Review carefully. Edit to match what you actually hear in your recording.
                  </p>
                </div>
              )}
            </div>

            {/* Voice Consistency Info Banner */}
            <div className="p-4 rounded-xl bg-elevated-app border border-app text-xs text-secondary-app leading-relaxed">
              <span className="font-bold text-primary-app">
                Voice in video generation:
              </span>{" "}
              The voice profile is included in your character's intelligence
              layer, giving video tools detailed instructions about your
              character's voice. For exact voice replication in AI video (lip
              sync + matching voice), this requires direct platform integration
              like HigsField — coming soon.
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 — PRICING & AVAILABILITY */}
      {step === 5 && (
        <div className="vn-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary-app">
              Step 5 — Pricing & Availability
            </h2>
            <p className="text-xs sm:text-sm text-secondary-app">
              Choose how studios can rent or buy your character persona.
            </p>
          </div>

          <div className="space-y-6">
            {/* Free Character Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-app border border-app">
              <div>
                <p className="text-sm font-bold text-primary-app">
                  Free Community Character
                </p>
                <p className="text-xs text-secondary-app">
                  Make this character freely available to all studios. Good for building Fame Score and getting your first reviews.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-5 h-5 rounded border-app bg-card-app text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
              />
            </div>

            {!isFree && (
              <div className="space-y-4 p-5 rounded-2xl bg-secondary-app border border-app">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-app block">
                  Rental Pricing
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-secondary-app">
                      Daily Rate ($/day)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={rentalDaily}
                      onChange={(e) => handleDailyChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-card-app border border-app text-primary-app text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-secondary-app">
                      Weekly Rate ($/week)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={rentalWeekly}
                      onChange={(e) => setRentalWeekly(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-card-app border border-app text-primary-app text-sm"
                    />
                    <span className="text-[10px] text-muted-app">
                      Suggested: ${rentalDaily * 5} (5x daily)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-secondary-app">
                      Monthly Rate ($/month)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={rentalMonthly}
                      onChange={(e) => setRentalMonthly(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-card-app border border-app text-primary-app text-sm"
                    />
                    <span className="text-[10px] text-muted-app">
                      Suggested: ${rentalDaily * 15} (15x daily)
                    </span>
                  </div>
                </div>

                {/* Permanent Purchase Toggle */}
                <div className="pt-4 border-t border-app space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-primary-app">
                        Available for Permanent Purchase
                      </p>
                      <p className="text-xs text-secondary-app">
                        Once purchased by a studio, this character is removed from the marketplace permanently. Only one studio can ever buy a character.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPurchasable}
                      onChange={(e) => setIsPurchasable(e.target.checked)}
                      className="w-5 h-5 rounded border-app bg-card-app text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                    />
                  </div>

                  {isPurchasable && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-secondary-app">
                        Purchase Price ($)
                      </label>
                      <input
                        type="number"
                        min={rentalMonthly * 10}
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(Number(e.target.value))}
                        className="w-full sm:w-64 px-3 py-2 rounded-xl bg-card-app border border-app text-primary-app text-sm"
                      />
                      <span className="text-[10px] text-muted-app block">
                        Minimum: ${rentalMonthly * 10} (10x monthly rate)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Allowed Uses Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-app block">
                Allowed Commercial & Production Uses
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALLOWED_USES_OPTIONS.map((opt) => {
                  const isChecked = allowedUses.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary-app border border-app hover:border-[#7C3AED] transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAllowedUse(opt.id)}
                        className="w-4 h-4 rounded border-app bg-card-app text-[#7C3AED] focus:ring-[#7C3AED]"
                      />
                      <span className="text-xs font-medium text-primary-app">
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6 — REVIEW & PUBLISH */}
      {step === 6 && (
        <div className="vn-card p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary-app">
              Step 6 — Review & Publish
            </h2>
            <p className="text-xs sm:text-sm text-secondary-app">
              Review your character profile before publishing to the global registry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-secondary-app border border-app">
            {/* Left: Avatar preview */}
            <div className="w-full h-56 rounded-xl overflow-hidden border border-app bg-card-app flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-700 to-indigo-800 flex items-center justify-center text-3xl font-black text-white">
                  {name ? name.slice(0, 2).toUpperCase() : "VN"}
                </div>
              )}
            </div>

            {/* Right: Summary specs */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <h3 className="text-2xl font-black text-primary-app">{name || "Untitled"}</h3>
                <p className="text-xs text-[#A78BFA] italic">"{vibeSummary}"</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-elevated-app text-secondary-app border border-app"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-card-app border border-app">
                  <span className="text-muted-app block text-[10px] uppercase font-bold">
                    Character Sheet
                  </span>
                  <span
                    className={`font-bold ${
                      sheetWordCount >= 1000
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {sheetWordCount} words {sheetWordCount >= 1000 ? "✓" : ""}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-card-app border border-app">
                  <span className="text-muted-app block text-[10px] uppercase font-bold">
                    Pricing
                  </span>
                  <span className="font-bold text-primary-app">
                    {isFree
                      ? "Free Access"
                      : `$${rentalDaily}/day • $${rentalMonthly}/mo`}
                  </span>
                </div>
              </div>

              <div className="text-xs text-secondary-app">
                <strong className="text-primary-app">Core Trait:</strong>{" "}
                {coreTrait || "Not specified"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-app flex items-center justify-between">
            <button
              type="button"
              onClick={() => saveDraft(false)}
              className="px-5 py-2.5 rounded-xl border border-app bg-card-app hover:bg-elevated-app text-xs font-semibold text-secondary-app hover:text-primary-app transition-colors cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="vn-button-primary px-8 py-3 text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Character</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons: Previous & Next */}
      <div className="flex items-center justify-between pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-app bg-card-app text-xs font-semibold text-secondary-app hover:text-primary-app transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        {step < 6 && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="vn-button-primary flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold shadow-md cursor-pointer"
          >
            <span>Next: {STEPS[step].name}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
