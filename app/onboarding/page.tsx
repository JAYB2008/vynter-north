"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clapperboard,
  Check,
  ArrowRight,
  Copy,
  CheckCircle2,
  Upload,
  ShieldCheck,
  FileText,
  Globe,
  Loader2,
  Star,
  Film,
  Bot,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/lib/types";

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
  "Documentary",
];

const STUDIO_TYPES = [
  { id: "independent", label: "Independent creator / solo filmmaker" },
  { id: "team", label: "Small production team (2-10 people)" },
  { id: "company", label: "Company or agency" },
];

const CREATION_TYPES = [
  "AI Films",
  "Advertisements",
  "Social Content",
  "Music Videos",
  "Games",
  "VR Content",
  "Educational Videos",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form State
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Step 2A (Creator) State
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [website, setWebsite] = useState("");

  // Step 2B (Studio) State
  const [studioName, setStudioName] = useState("");
  const [studioType, setStudioType] = useState("independent");
  const [creationTypes, setCreationTypes] = useState<string[]>([]);
  const [studioBio, setStudioBio] = useState("");
  const [studioWebsite, setStudioWebsite] = useState("");

  // Step 3 (Studio Verification) State
  const [basicConfirmed, setBasicConfirmed] = useState({
    rule1: false,
    rule2: false,
    rule3: false,
    rule4: false,
  });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  // Load user session and resume progress
  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login?redirect_to=/onboarding");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push("/dashboard");
          return;
        }

        if (profile) {
          setUserProfile(profile as Profile);
          setDisplayName(profile.display_name || user.email?.split("@")[0] || "");
          if (profile.role) {
            setSelectedRole(profile.role);
            // If role is already selected, advance to step 2
            setCurrentStep(2);
          }
          if (profile.username) setUsername(profile.username);
          if (profile.bio) setBio(profile.bio);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
          if (profile.website) setWebsite(profile.website);
          if (profile.creator_speciality) setSelectedGenres(profile.creator_speciality);
          if (profile.studio_name) setStudioName(profile.studio_name);
          if (profile.studio_type) setStudioType(profile.studio_type);
        } else {
          // Initialize profile state
          setDisplayName(user.email?.split("@")[0] || "");
        }
      } catch (err) {
        console.warn("Onboarding load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router, supabase]);

  // Real-time username uniqueness check with debounce
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const res = await fetch(`/api/profiles/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(true);
      } finally {
        setUsernameChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  // Save Step 1: Role
  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleConfirmRole = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            role: selectedRole,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
      setCurrentStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save role.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Save Step 2A: Creator Info
  const handleSaveCreatorInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && usernameAvailable === false) {
      setErrorMsg("Please choose an available username.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            display_name: displayName.trim(),
            username: username.trim().toLowerCase() || null,
            bio: bio.trim() || null,
            avatar_url: avatarUrl.trim() || null,
            creator_speciality: selectedGenres,
            website: website.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      // Creators jump straight to step 4 (Ready)
      setCurrentStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save creator profile.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Save Step 2B: Studio Info
  const handleSaveStudioInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioName.trim()) {
      setErrorMsg("Studio name is required.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            studio_name: studioName.trim(),
            studio_type: studioType,
            bio: studioBio.trim() || null,
            website: studioWebsite.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      // Studios advance to step 3 (Verification)
      setCurrentStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save studio profile.";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Save Step 3: Studio Verification
  const handleSaveVerification = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isBasic =
          basicConfirmed.rule1 &&
          basicConfirmed.rule2 &&
          basicConfirmed.rule3 &&
          basicConfirmed.rule4;

        await supabase
          .from("profiles")
          .update({
            studio_verified: verificationSubmitted || isBasic,
            studio_verification_docs: uploadedFile ? [uploadedFile] : [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
      setCurrentStep(4);
    } catch (err) {
      console.warn("Verification update error:", err);
      setCurrentStep(4);
    } finally {
      setSaving(false);
    }
  };

  // Final Step 4: Complete Onboarding & Navigate
  const handleCompleteOnboarding = async (destination: string) => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      router.push(destination);
    } catch {
      router.push(destination);
    }
  };

  const copyAccountKey = () => {
    const key = userProfile?.account_key || "vn-prod-key-pending";
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080F] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  const isBasicUnlocked =
    basicConfirmed.rule1 &&
    basicConfirmed.rule2 &&
    basicConfirmed.rule3 &&
    basicConfirmed.rule4;

  const totalSteps = selectedRole === "studio" ? 4 : 3;
  const displayStepNumber =
    selectedRole === "creator" && currentStep === 4 ? 3 : currentStep;

  return (
    <div className="min-h-screen bg-[#08080F] text-[#F1F5F9] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Progress Indicator at Top */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            <span>Step {displayStepNumber} of {totalSteps}</span>
            <span>
              {currentStep === 1
                ? "Choose Role"
                : currentStep === 2
                ? "Your Info"
                : currentStep === 3
                ? "Verification"
                : "Ready"}
            </span>
          </div>
          <div className="w-full bg-[#1C1C35] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] h-full transition-all duration-300"
              style={{
                width: `${(displayStepNumber / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Inline Error Notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 1 — CHOOSE YOUR ROLE
            ════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How will you use Vynter North?
              </h1>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Choose your primary role. You can always change this later.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CARD 1 — CHARACTER CREATOR */}
              <div
                onClick={() => handleSelectRole("creator")}
                className={`p-6 sm:p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative bg-[#14142A] ${
                  selectedRole === "creator"
                    ? "border-[#7C3AED] ring-2 ring-[#7C3AED] shadow-xl shadow-[#7C3AED]/20"
                    : "border-[#1E1E3A] hover:border-[#7C3AED]/50"
                }`}
              >
                {selectedRole === "creator" && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Character Creator</h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                      I build AI characters, define their personalities, and earn money when studios use them.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
                      What you'll do:
                    </p>
                    <ul className="text-xs text-[#F1F5F9] space-y-1">
                      <li>✦ Register original AI characters</li>
                      <li>✦ Build detailed personality profiles</li>
                      <li>✦ List characters on the marketplace</li>
                      <li>✦ Earn from every rental and purchase</li>
                      <li>✦ Grow your characters' Fame Score</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#1E1E3A] mt-6 space-y-3">
                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedRole === "creator"
                        ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30"
                        : "border border-[#7C3AED] text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white"
                    }`}
                  >
                    I'm a Creator
                  </button>
                  <p className="text-[11px] text-[#64748B] text-center">
                    Best for: Designers, character artists, storytellers, world builders
                  </p>
                </div>
              </div>

              {/* CARD 2 — PRODUCTION STUDIO */}
              <div
                onClick={() => handleSelectRole("studio")}
                className={`p-6 sm:p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative bg-[#14142A] ${
                  selectedRole === "studio"
                    ? "border-[#7C3AED] ring-2 ring-[#7C3AED] shadow-xl shadow-[#7C3AED]/20"
                    : "border-[#1E1E3A] hover:border-[#7C3AED]/50"
                }`}
              >
                {selectedRole === "studio" && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A78BFA]">
                    <Clapperboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Production Studio</h3>
                    <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                      I create AI videos and need consistent characters with real personalities for my productions.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
                      What you'll do:
                    </p>
                    <ul className="text-xs text-[#F1F5F9] space-y-1">
                      <li>✦ Browse and rent AI characters</li>
                      <li>✦ Connect characters to Claude & ChatGPT</li>
                      <li>✦ Get automatic character intelligence</li>
                      <li>✦ Use characters across all your videos</li>
                      <li>✦ Build consistent series and franchises</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#1E1E3A] mt-6 space-y-3">
                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedRole === "studio"
                        ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30"
                        : "border border-[#7C3AED] text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white"
                    }`}
                  >
                    I'm a Studio
                  </button>
                  <p className="text-[11px] text-[#64748B] text-center">
                    Best for: Video creators, filmmakers, advertisers, game developers
                  </p>
                </div>
              </div>
            </div>

            {selectedRole && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleConfirmRole}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-[#7C3AED]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 2A — CREATOR PROFILE SETUP
            ════════════════════════════════════════════ */}
        {currentStep === 2 && selectedRole === "creator" && (
          <div className="bg-[#14142A] border border-[#1E1E3A] rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Set up your creator profile
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Studios will see this when they browse your characters
              </p>
            </div>

            <form onSubmit={handleSaveCreatorInfo} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Display name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Elena Vance"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                    Username @handle
                  </label>
                  {usernameChecking && (
                    <span className="text-[11px] text-[#A78BFA] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                    </span>
                  )}
                  {!usernameChecking && usernameAvailable === true && (
                    <span className="text-[11px] text-emerald-400">✓ Available</span>
                  )}
                  {!usernameChecking && usernameAvailable === false && (
                    <span className="text-[11px] text-red-400">✗ Taken or invalid</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="elenavance"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
                <p className="text-[11px] text-[#64748B]">
                  Public URL: <span className="text-[#A78BFA]">vynternorth.com/creator/{username || "[username]"}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Creator bio
                  </label>
                  <span className={`text-[11px] ${bio.length > 280 ? "text-amber-400" : "text-[#64748B]"}`}>
                    {bio.length}/300
                  </span>
                </div>
                <textarea
                  maxLength={300}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell studios about yourself and the types of characters you create..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Profile photo URL (optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  What genres do you specialize in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGenres(selectedGenres.filter((item) => item !== g));
                          } else {
                            setSelectedGenres([...selectedGenres, g]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                            : "bg-[#0F0F1A] border-[#1E1E3A] text-[#94A3B8] hover:border-[#7C3AED]"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Website or social link (optional)
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://x.com/elenavance or artstation.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 2B — STUDIO PROFILE SETUP
            ════════════════════════════════════════════ */}
        {currentStep === 2 && selectedRole === "studio" && (
          <div className="bg-[#14142A] border border-[#1E1E3A] rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Set up your studio profile
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Character creators will see this when you request to rent their work
              </p>
            </div>

            <form onSubmit={handleSaveStudioInfo} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Studio name
                </label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Apex CineLabs"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Studio type
                </label>
                <div className="space-y-2">
                  {STUDIO_TYPES.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        studioType === type.id
                          ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white"
                          : "border-[#1E1E3A] bg-[#0F0F1A] text-[#94A3B8] hover:border-[#7C3AED]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="studioType"
                        value={type.id}
                        checked={studioType === type.id}
                        onChange={() => setStudioType(type.id)}
                        className="text-[#7C3AED] focus:ring-[#7C3AED]"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  What do you primarily create?
                </label>
                <div className="flex flex-wrap gap-2">
                  {CREATION_TYPES.map((type) => {
                    const isSelected = creationTypes.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          if (isSelected) {
                            setCreationTypes(creationTypes.filter((c) => c !== type));
                          } else {
                            setCreationTypes([...creationTypes, type]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                            : "bg-[#0F0F1A] border-[#1E1E3A] text-[#94A3B8] hover:border-[#7C3AED]"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Studio bio
                  </label>
                  <span className={`text-[11px] ${studioBio.length > 280 ? "text-amber-400" : "text-[#64748B]"}`}>
                    {studioBio.length}/300
                  </span>
                </div>
                <textarea
                  maxLength={300}
                  rows={3}
                  value={studioBio}
                  onChange={(e) => setStudioBio(e.target.value)}
                  placeholder="Describe your studio's productions and upcoming projects..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                  Website (optional)
                </label>
                <input
                  type="url"
                  value={studioWebsite}
                  onChange={(e) => setStudioWebsite(e.target.value)}
                  placeholder="https://apexcine.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#1E1E3A] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 3 — STUDIO VERIFICATION (Studios Only)
            ════════════════════════════════════════════ */}
        {currentStep === 3 && selectedRole === "studio" && (
          <div className="bg-[#14142A] border border-[#1E1E3A] rounded-3xl p-6 sm:p-10 space-y-7">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Verify your studio
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Character creators need to know you're a legitimate studio before they approve access to their work. Verification makes them more likely to accept your rental requests.
              </p>
            </div>

            {/* Banner */}
            <div className="p-4 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/40 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#A78BFA] shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-[#A78BFA]">
                Studios with Verified badge receive 3x more rental approvals
              </p>
            </div>

            {/* Basic Verification Section */}
            <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">BASIC VERIFICATION (Available immediately)</h4>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                  isBasicUnlocked ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-900 text-slate-600 border-slate-800"
                }`}>
                  Studio — Basic
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">To proceed, confirm the following:</p>

              <div className="space-y-2 text-xs text-[#F1F5F9]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={basicConfirmed.rule1}
                    onChange={(e) => setBasicConfirmed({ ...basicConfirmed, rule1: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-[#2A2A4A] bg-[#14142A] text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span>I will only use rented characters for the agreed purposes</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={basicConfirmed.rule2}
                    onChange={(e) => setBasicConfirmed({ ...basicConfirmed, rule2: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-[#2A2A4A] bg-[#14142A] text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span>I will not attempt to copy, extract, or reverse-engineer any character's personality data</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={basicConfirmed.rule3}
                    onChange={(e) => setBasicConfirmed({ ...basicConfirmed, rule3: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-[#2A2A4A] bg-[#14142A] text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span>I understand that character ownership belongs to the creator</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={basicConfirmed.rule4}
                    onChange={(e) => setBasicConfirmed({ ...basicConfirmed, rule4: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-[#2A2A4A] bg-[#14142A] text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span>I agree to Vynter North's Studio Code of Conduct</span>
                </label>
              </div>
            </div>

            {/* Verified Studio Section */}
            <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">VERIFIED STUDIO (1-2 business days)</h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Upload one of the following to receive the Verified Studio badge:</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  ✓ Verified Studio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#94A3B8]">
                <div className="p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A]">
                  <p className="font-semibold text-white">Option A</p>
                  <p className="mt-1 text-[11px]">Business registration document</p>
                </div>
                <div className="p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A]">
                  <p className="font-semibold text-white">Option B</p>
                  <p className="mt-1 text-[11px]">Portfolio link (YouTube/Vimeo channel)</p>
                </div>
                <div className="p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A]">
                  <p className="font-semibold text-white">Option C</p>
                  <p className="mt-1 text-[11px]">Company email domain verification</p>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-[#2A2A4A] rounded-2xl p-6 text-center space-y-2 hover:border-[#7C3AED] transition-colors cursor-pointer bg-[#14142A]">
                <Upload className="w-8 h-8 text-[#A78BFA] mx-auto" />
                <p className="text-xs text-white font-medium">
                  {uploadedFile ? `Uploaded: ${uploadedFile}` : "Drag and drop or click to upload verification document"}
                </p>
                <p className="text-[11px] text-[#64748B]">Accepts PDF, JPG, PNG (Max 10MB)</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file.name);
                  }}
                  className="hidden"
                  id="doc-upload"
                />
                <label
                  htmlFor="doc-upload"
                  className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-[#A78BFA] cursor-pointer"
                >
                  Choose File
                </label>
              </div>

              {uploadedFile && (
                <button
                  type="button"
                  onClick={() => setVerificationSubmitted(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
                >
                  {verificationSubmitted ? "✓ Submitted for Review" : "Submit for Verification"}
                </button>
              )}

              <p className="text-[11px] text-[#64748B]">
                Note: You can start using the platform while verification is in progress.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                Skip for Now
              </button>

              <button
                type="button"
                onClick={handleSaveVerification}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-md shadow-[#7C3AED]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 4 — READY SCREEN
            ════════════════════════════════════════════ */}
        {currentStep === 4 && selectedRole === "creator" && (
          <div className="bg-[#14142A] border border-[#1E1E3A] rounded-3xl p-6 sm:p-10 space-y-8 text-center sm:text-left">
            {/* Header with success animation */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Your creator account is ready
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Time to register your first character
                </p>
              </div>
            </div>

            {/* Account Key Box */}
            <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                  Your Account Key
                </span>
                <button
                  type="button"
                  onClick={copyAccountKey}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                </button>
              </div>
              <code className="block p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A] text-xs sm:text-sm font-mono text-[#A78BFA] overflow-x-auto select-all">
                {userProfile?.account_key || "vn-creator-ready-key-001"}
              </code>
              <p className="text-[11px] text-[#64748B]">
                Keep this private. You'll use it to connect your characters to AI tools.
              </p>
            </div>

            {/* Next Steps (3 Cards) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] text-left">
                Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Card 1 */}
                <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Register Your First Character</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Create a character, build their personality profile, and list them on the marketplace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOnboarding("/characters/new")}
                    className="w-full py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    Create Character →
                  </button>
                </div>

                {/* Card 2 */}
                <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Explore the Marketplace</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      See what other creators are building and understand what makes characters valuable to studios.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOnboarding("/marketplace")}
                    className="w-full py-2 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] cursor-pointer"
                  >
                    Browse Marketplace →
                  </button>
                </div>

                {/* Card 3 */}
                <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Read the Creator Guide</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Learn how to write character profiles and behavioral packs that studios love.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOnboarding("/skills")}
                    className="w-full py-2 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] cursor-pointer"
                  >
                    View Guide →
                  </button>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <div className="pt-4 border-t border-[#1E1E3A]">
              <button
                type="button"
                onClick={() => handleCompleteOnboarding("/dashboard")}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-xl shadow-[#7C3AED]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 4 — READY SCREEN (STUDIOS)
            ════════════════════════════════════════════ */}
        {currentStep === 4 && selectedRole === "studio" && (
          <div className="bg-[#14142A] border border-[#1E1E3A] rounded-3xl p-6 sm:p-10 space-y-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Your studio is ready
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Connect your AI tools and start using characters in your productions
                </p>
              </div>
            </div>

            {/* Account Key Box */}
            <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                  Your Account Key
                </span>
                <button
                  type="button"
                  onClick={copyAccountKey}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1C1C35] hover:bg-[#2A2A4A] text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                </button>
              </div>
              <code className="block p-3 rounded-xl bg-[#14142A] border border-[#1E1E3A] text-xs sm:text-sm font-mono text-[#A78BFA] overflow-x-auto select-all">
                {userProfile?.account_key || "vn-studio-ready-key-002"}
              </code>
              <p className="text-[11px] text-[#64748B]">
                This key connects your AI tools to your rented characters.
              </p>
            </div>

            {/* Next Steps (3 Cards) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] text-left">
                Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Card 1 */}
                <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Connect Claude or ChatGPT</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Add the Vynter North MCP connection to your AI tool of choice.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOnboarding("/connect")}
                    className="w-full py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    Set Up Connection →
                  </button>
                </div>

                {/* Card 2 */}
                <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                      <Film className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Browse Characters</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Find the perfect characters for your upcoming productions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOnboarding("/marketplace")}
                    className="w-full py-2 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] cursor-pointer"
                  >
                    Browse Marketplace →
                  </button>
                </div>

                {/* Card 3 */}
                <div className="p-5 rounded-2xl bg-[#0F0F1A] border border-[#1E1E3A] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Try the Demo</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      See how character intelligence transforms your scene prompts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOnboarding("/demo")}
                    className="w-full py-2 rounded-xl border border-[#7C3AED] hover:bg-[#7C3AED]/10 text-xs font-semibold text-[#A78BFA] cursor-pointer"
                  >
                    Try Demo →
                  </button>
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <div className="pt-4 border-t border-[#1E1E3A]">
              <button
                type="button"
                onClick={() => handleCompleteOnboarding("/dashboard")}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-xl shadow-[#7C3AED]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
