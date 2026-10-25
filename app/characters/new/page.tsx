"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Activity,
  Smile,
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Wand2,
} from "lucide-react";
import Link from "next/link";

export default function NewCharacterPage() {
  const router = useRouter();

  // Basic Info State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isNameChecking, setIsNameChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  // Accordion open states (Personality open by default)
  const [openPanels, setOpenPanels] = useState({
    physical: false,
    personality: true,
    dialogue: false,
  });

  // Panel 1: Physical Style
  const [restingExpression, setRestingExpression] = useState("Neutral");
  const [movementStyle, setMovementStyle] = useState("");
  const [signatureGesture, setSignatureGesture] = useState("");
  const [stressReaction, setStressReaction] = useState("");

  // Panel 2: Personality
  const [coreTrait, setCoreTrait] = useState("Anxious");
  const [secondaryTrait, setSecondaryTrait] = useState("");
  const [handlesDanger, setHandlesDanger] = useState("");
  const [whatMakesLaugh, setWhatMakesLaugh] = useState("");
  const [whatMakesAngry, setWhatMakesAngry] = useState("");
  const [hiddenQuality, setHiddenQuality] = useState("");

  // Panel 3: Dialogue Style
  const [speakingPace, setSpeakingPace] = useState("Normal");
  const [languageMixing, setLanguageMixing] = useState("");
  const [humorStyle, setHumorStyle] = useState("Dry/Sarcastic");
  const [catchphrase, setCatchphrase] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live name uniqueness check
  useEffect(() => {
    if (!name.trim()) {
      setNameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsNameChecking(true);
        const res = await fetch(`/api/characters/check-name?name=${encodeURIComponent(name.trim())}`);
        const data = await res.json();
        setNameAvailable(data.available);
      } catch (err) {
        console.error("Name check error:", err);
      } finally {
        setIsNameChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [name]);

  const togglePanel = (panel: "physical" | "personality" | "dialogue") => {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  // Preset filler for "James"
  const loadJamesPreset = () => {
    setName("James");
    setDescription("High-performing academy candidate concealing acute imposter anxiety behind an ironclad shield of formal perfectionism.");
    setRestingExpression("Serious");
    setMovementStyle("Measured, stiff posture, walks deliberately without casual swagger");
    setSignatureGesture("Repeatedly straightens kit collar or cufflinks to give hands purpose");
    setStressReaction("Freezes momentarily, face flushes red, then overcorrects with sudden urgent movements and forced composure");
    setCoreTrait("Anxious");
    setSecondaryTrait("Hyper-competitive, meticulous, proud");
    setHandlesDanger("Freezes then overcorrects with reckless overachievement and forced confidence");
    setWhatMakesLaugh("Dry situational ironies when another person breaks an unnecessary rule");
    setWhatMakesAngry("Being pitied, patronized, or having his competence questioned in front of peers");
    setHiddenQuality("Deeply proud and terrified of admitting weakness or failure");
    setSpeakingPace("Fast");
    setLanguageMixing("Clipped military academy terminology under extreme pressure");
    setHumorStyle("Dry/Sarcastic");
    setCatchphrase("Standard procedure. Let's not make a spectacle of ourselves.");
    toast.info("Loaded 'James' personality preset!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Character name is required");
      return;
    }

    if (nameAvailable === false) {
      toast.error("Character name is already taken. Please choose another name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        resting_expression: restingExpression,
        movement_style: movementStyle.trim(),
        signature_gesture: signatureGesture.trim(),
        stress_reaction: stressReaction.trim(),
        core_trait: coreTrait,
        secondary_trait: secondaryTrait.trim(),
        handles_danger: handlesDanger.trim(),
        what_makes_laugh: whatMakesLaugh.trim(),
        what_makes_angry: whatMakesAngry.trim(),
        hidden_quality: hiddenQuality.trim(),
        speaking_pace: speakingPace,
        language_mixing: languageMixing.trim(),
        humor_style: humorStyle,
        catchphrase: catchphrase.trim(),
      };

      const res = await fetch("/api/characters/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create character");
      }

      toast.success(`Character "${data.character.name}" created successfully!`);
      router.push(`/characters/${data.character.id}`);
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      const msg = err instanceof Error ? err.message : "Error creating character";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
      {/* Back button and title */}
      <div className="mb-8">
        <Link
          href="/characters"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to characters
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Create New Character</h1>
            <p className="text-sm text-slate-600 mt-1">
              Configure the behavioral DNA and psychological traits that power the Intelligence Layer.
            </p>
          </div>

          <button
            type="button"
            onClick={loadJamesPreset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] text-xs font-semibold border border-purple-200 transition-all cursor-pointer shadow-xs"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#7C3AED]" />
            Load &ldquo;James&rdquo; Preset
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1 — Basic Info */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-purple-50 text-[#7C3AED]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Section 1 — Basic Info</h2>
              <p className="text-xs text-slate-500">Identity and background description</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Name Input with Live Uniqueness Check */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">
                  Character Name <span className="text-[#7C3AED]">*</span>
                </label>
                {/* Live validation badge */}
                {name.trim() !== "" && (
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {isNameChecking ? (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                        Checking...
                      </span>
                    ) : nameAvailable === true ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Available ✓
                      </span>
                    ) : nameAvailable === false ? (
                      <span className="text-rose-600 flex items-center gap-1 font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        Name taken ✗
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. James"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-slate-900 text-sm placeholder:text-slate-400 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">
                  Description
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  {description.length}/300
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setDescription(e.target.value);
                  }
                }}
                rows={3}
                placeholder="Brief summary of who they are and their core struggle..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#7C3AED] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-slate-900 text-sm placeholder:text-slate-400 resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2 — Skill Profile (Accordion) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-purple-50 text-[#7C3AED]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Section 2 — Skill Profile</h2>
              <p className="text-xs text-slate-500">
                The core behavioral parameters that Claude uses to enrich scene prompts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Panel 1 — Physical Style */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
              <button
                type="button"
                onClick={() => togglePanel("physical")}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[#7C3AED]" />
                  <span className="font-semibold text-sm text-slate-900">
                    Panel 1 — Physical Style
                  </span>
                </div>
                {openPanels.physical ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openPanels.physical && (
                <div className="p-5 pt-2 border-t border-slate-200 space-y-4 text-sm bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Resting Expression
                    </label>
                    <select
                      value={restingExpression}
                      onChange={(e) => setRestingExpression(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    >
                      <option value="Neutral">Neutral</option>
                      <option value="Serious">Serious</option>
                      <option value="Smiling">Smiling</option>
                      <option value="Intense">Intense</option>
                      <option value="Relaxed">Relaxed</option>
                      <option value="Suspicious">Suspicious</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Movement Style
                    </label>
                    <input
                      type="text"
                      value={movementStyle}
                      onChange={(e) => setMovementStyle(e.target.value)}
                      placeholder="How do they walk and carry themselves?"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Signature Gesture
                    </label>
                    <input
                      type="text"
                      value={signatureGesture}
                      onChange={(e) => setSignatureGesture(e.target.value)}
                      placeholder="The one physical habit they always do"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Stress Reaction
                    </label>
                    <input
                      type="text"
                      value={stressReaction}
                      onChange={(e) => setStressReaction(e.target.value)}
                      placeholder="What does their body do under pressure?"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Panel 2 — Personality (Expanded by default) */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/20 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => togglePanel("personality")}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-purple-50/50 transition-colors bg-purple-50/40"
              >
                <div className="flex items-center gap-3">
                  <Smile className="w-4 h-4 text-[#7C3AED]" />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      Panel 2 — Personality
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-[#7C3AED] font-semibold">
                      Core Focus
                    </span>
                  </div>
                </div>
                {openPanels.personality ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openPanels.personality && (
                <div className="p-5 pt-2 border-t border-purple-100 space-y-4 text-sm bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Core Trait <span className="text-[#7C3AED]">*</span>
                    </label>
                    <select
                      value={coreTrait}
                      onChange={(e) => setCoreTrait(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    >
                      <option value="Brave">Brave</option>
                      <option value="Funny">Funny</option>
                      <option value="Mysterious">Mysterious</option>
                      <option value="Calculating">Calculating</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                      <option value="Reckless">Reckless</option>
                      <option value="Noble">Noble</option>
                      <option value="Protective">Protective</option>
                      <option value="Anxious">Anxious</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Secondary Trait
                    </label>
                    <input
                      type="text"
                      value={secondaryTrait}
                      onChange={(e) => setSecondaryTrait(e.target.value)}
                      placeholder="e.g. Perfectionist, competitive"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      How They Handle Danger
                    </label>
                    <input
                      type="text"
                      value={handlesDanger}
                      onChange={(e) => setHandlesDanger(e.target.value)}
                      placeholder="e.g. Freezes then overcorrects with forced confidence"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      What Makes Them Laugh
                    </label>
                    <input
                      type="text"
                      value={whatMakesLaugh}
                      onChange={(e) => setWhatMakesLaugh(e.target.value)}
                      placeholder="e.g. Awkward absurdities when someone breaks formal protocol"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      What Makes Them Angry
                    </label>
                    <input
                      type="text"
                      value={whatMakesAngry}
                      onChange={(e) => setWhatMakesAngry(e.target.value)}
                      placeholder="e.g. Being pitied or patronized; incompetence"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Hidden Quality
                    </label>
                    <input
                      type="text"
                      value={hiddenQuality}
                      onChange={(e) => setHiddenQuality(e.target.value)}
                      placeholder="Something they hide from others"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Panel 3 — Dialogue Style */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
              <button
                type="button"
                onClick={() => togglePanel("dialogue")}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                  <span className="font-semibold text-sm text-slate-900">
                    Panel 3 — Dialogue Style
                  </span>
                </div>
                {openPanels.dialogue ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {openPanels.dialogue && (
                <div className="p-5 pt-2 border-t border-slate-200 space-y-4 text-sm bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Speaking Pace
                    </label>
                    <select
                      value={speakingPace}
                      onChange={(e) => setSpeakingPace(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    >
                      <option value="Very Fast">Very Fast</option>
                      <option value="Fast">Fast</option>
                      <option value="Normal">Normal</option>
                      <option value="Slow">Slow</option>
                      <option value="Deliberate">Deliberate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Language Mixing
                    </label>
                    <input
                      type="text"
                      value={languageMixing}
                      onChange={(e) => setLanguageMixing(e.target.value)}
                      placeholder="e.g. Mixes French phrases into English sentences"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Humor Style
                    </label>
                    <select
                      value={humorStyle}
                      onChange={(e) => setHumorStyle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    >
                      <option value="None">None</option>
                      <option value="Dry/Sarcastic">Dry/Sarcastic</option>
                      <option value="Physical">Physical</option>
                      <option value="Self-deprecating">Self-deprecating</option>
                      <option value="Dark">Dark</option>
                      <option value="Absurdist">Absurdist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Catchphrase or Verbal Habit
                    </label>
                    <input
                      type="text"
                      value={catchphrase}
                      onChange={(e) => setCatchphrase(e.target.value)}
                      placeholder="e.g. Standard operational procedure."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/characters"
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors border border-slate-200"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || nameAvailable === false}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/25 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Registering Character...</span>
              </>
            ) : (
              <span>Create Character</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
