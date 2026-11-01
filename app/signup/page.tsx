"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Shield,
  Film,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

type RoleChoice = "creator" | "studio";

export default function SignUpPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Wizard state: 1 to 6
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<RoleChoice>("creator");

  // Step 2 fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 fields
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioType, setStudioType] = useState("solo");
  const [studioFocus, setStudioFocus] = useState<string[]>([]);

  // Step 4 fields (Studio Agreement)
  const [pledge1, setPledge1] = useState(false);
  const [pledge2, setPledge2] = useState(false);
  const [pledge3, setPledge3] = useState(false);
  const [pledge4, setPledge4] = useState(false);
  const [verificationLink, setVerificationLink] = useState("");

  // Step 5 fields (Recovery code)
  const [recoveryCode, setRecoveryCode] = useState<string>("");
  const [savedCodeAck, setSavedCodeAck] = useState(false);
  const [copied, setCopied] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableGenres = [
    "Sci-Fi",
    "Drama",
    "Thriller",
    "Comedy",
    "Action",
    "Fantasy",
    "Horror",
    "Cyberpunk",
    "Noir",
  ];

  const availableFocus = [
    "Narrative Films",
    "Commercial Ads",
    "Gaming / NPCs",
    "Social Media Series",
    "Music Videos",
    "Virtual Production",
  ];

  const toggleGenre = (genre: string) => {
    setSpecialties((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleFocus = (f: string) => {
    setStudioFocus((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  // STEP 2 SUBMIT: Create account immediately
  const handleAccountCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanUser = username.trim().toLowerCase();
    if (cleanUser.includes("@")) {
      cleanUser = cleanUser.split("@")[0];
    }
    cleanUser = cleanUser.replace(/[^a-z0-9_]/g, "").slice(0, 24);

    if (cleanUser.length < 3 || cleanUser.length > 24) {
      setError("Username must be between 3 and 24 characters (letters, numbers, underscores).");
      return;
    }
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setUsername(cleanUser);
    setLoading(true);
    try {
      const res = await apiFetch<{ account: any; recovery_code: string }>(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            username: cleanUser,
            display_name: displayName.trim(),
            password,
            role,
          }),
        }
      );

      if (!res.ok) {
        setError(res.error.message);
        setLoading(false);
        return;
      }

      setRecoveryCode(res.data.recovery_code);
      await refreshUser();
      setStep(3);
    } catch {
      setError("Couldn't reach Vynter North. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 SUBMIT: Update Profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/auth/add-role", {
        method: "POST",
        body: JSON.stringify({
          role,
          bio: bio.trim(),
          creator_specialties: specialties,
          website: website.trim(),
          studio_name: studioName.trim() || displayName,
          studio_type: studioType,
          studio_focus: studioFocus,
        }),
      });
      await refreshUser();
      if (role === "studio") {
        setStep(4);
      } else {
        setStep(5);
      }
    } catch {
      setError("Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 4 SUBMIT: Studio Agreement
  const handleAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledge1 || !pledge2 || !pledge3 || !pledge4) {
      setError("Please accept all four terms of the studio agreement to proceed.");
      return;
    }
    setError(null);
    setStep(5);
  };

  // COPY RECOVERY CODE
  const copyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // DOWNLOAD RECOVERY CODE (.txt)
  const downloadRecoveryCode = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `VYNTER NORTH ACCOUNT RECOVERY CODE\n` +
          `Username: ${username}\n` +
          `Recovery Code: ${recoveryCode}\n\n` +
          `Store this file safely. If you lose your password, this code is the only way to recover access.`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `vynter-north-recovery-${username}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-night text-text flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" />
        <h2 className="mt-6 text-3xl font-serif tracking-tight text-text">
          {step === 1 && "Choose how you'll use Vynter North"}
          {step === 2 && "Create your account"}
          {step === 3 && (role === "creator" ? "Your creator profile" : "Your studio profile")}
          {step === 4 && "Studio code of conduct"}
          {step === 5 && "Your emergency recovery code"}
          {step === 6 && "You're all set"}
        </h2>
        <p className="mt-2 text-sm text-dim">
          {step === 1 && "Select your primary role. You can add the other role at any time."}
          {step === 2 && "No emails, no third-party tracking. Username and password only."}
          {step === 3 && "Tell us about the work you do."}
          {step === 4 && "Respect character ownership and strict behavioral integrity."}
          {step === 5 && "Because there is no email verification, this code is your master key."}
          {step === 6 && "Welcome to Vynter North."}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-panel-raised h-1.5 rounded-full mt-6 overflow-hidden">
          <div
            className="bg-glacier h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-panel border border-line p-6 sm:p-8 rounded-[10px]">
          {error && (
            <div className="mb-6 p-3.5 bg-bad/10 border border-bad/30 rounded-md flex items-start gap-3 text-bad text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* STEP 1: CHOOSE ROLE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`p-6 text-left rounded-[8px] border transition-all flex flex-col justify-between ${
                    role === "creator"
                      ? "border-glacier bg-panel-raised ring-1 ring-glacier"
                      : "border-line bg-panel hover:border-text-dim"
                  }`}
                >
                  <div>
                    <div className="p-3 w-fit rounded-md bg-glacier/10 text-glacier mb-4">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-text">Creator</h3>
                    <p className="mt-2 text-sm text-dim leading-relaxed">
                      I build original AI characters and earn revenue when studios rent or buy them.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-xs font-medium text-glacier">
                    {role === "creator" ? "Selected" : "Select Creator"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("studio")}
                  className={`p-6 text-left rounded-[8px] border transition-all flex flex-col justify-between ${
                    role === "studio"
                      ? "border-glacier bg-panel-raised ring-1 ring-glacier"
                      : "border-line bg-panel hover:border-text-dim"
                  }`}
                >
                  <div>
                    <div className="p-3 w-fit rounded-md bg-marquee/10 text-marquee mb-4">
                      <Film className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-text">Studio</h3>
                    <p className="mt-2 text-sm text-dim leading-relaxed">
                      I make AI videos, ads, or games and need consistent characters via MCP.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-xs font-medium text-marquee">
                    {role === "studio" ? "Selected" : "Select Studio"}
                  </div>
                </button>
              </div>

              <div className="text-center text-xs text-dim">
                You can add the other role later from your profile.
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full btn-primary"
              >
                Continue as {role === "creator" ? "Creator" : "Studio"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="text-center text-sm text-dim mt-4">
                Already have an account?{" "}
                <Link href="/signin" className="text-glacier hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: ACCOUNT CREDENTIALS */}
          {step === 2 && (
            <form onSubmit={handleAccountCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Display name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Vance or Apex CineLabs"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Username
                </label>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. isebrain2008 or cairo"
                  value={username}
                  onChange={(e) => {
                    let val = e.target.value.toLowerCase().trim();
                    if (val.includes("@")) {
                      val = val.split("@")[0];
                    }
                    val = val.replace(/[^a-z0-9_]/g, "").slice(0, 24);
                    setUsername(val);
                    if (error) setError(null);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text").toLowerCase().trim();
                    if (pasted.includes("@")) {
                      e.preventDefault();
                      const cleaned = pasted.split("@")[0].replace(/[^a-z0-9_]/g, "").slice(0, 24);
                      setUsername(cleaned);
                      if (error) setError(null);
                    }
                  }}
                  className="input-base"
                />
                <p className="text-xs text-dim mt-1">
                  3–24 characters (letters, numbers, underscores). No email needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-dim hover:text-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-base"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ROLE PROFILE */}
          {step === 3 && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {role === "creator" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Short bio (max 300 characters)
                    </label>
                    <textarea
                      rows={3}
                      maxLength={300}
                      placeholder="Specializing in grounded cyberpunk thrillers and complex procedural dramas..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="input-base"
                    />
                    <div className="text-right text-xs text-dim mt-1">
                      {bio.length}/300
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Character Specialties
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableGenres.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            specialties.includes(g)
                              ? "bg-glacier text-glacier-ink border-glacier"
                              : "bg-panel-raised text-dim border-line hover:border-text-dim"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Portfolio or website (optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="input-base"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Studio or team name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex CineLabs"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Studio structure
                    </label>
                    <select
                      value={studioType}
                      onChange={(e) => setStudioType(e.target.value)}
                      className="input-base"
                    >
                      <option value="solo">Solo Creator / Independent Director</option>
                      <option value="small_team">Small Studio / Boutique Team</option>
                      <option value="company">Agency / Commercial Production House</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      What you produce
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableFocus.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleFocus(f)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            studioFocus.includes(f)
                              ? "bg-marquee text-night border-marquee"
                              : "bg-panel-raised text-dim border-line hover:border-text-dim"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Saving details..." : "Save and continue"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: STUDIO AGREEMENT */}
          {step === 4 && (
            <form onSubmit={handleAgreementSubmit} className="space-y-5">
              <div className="p-4 bg-panel-raised border border-line rounded-[6px] space-y-3.5">
                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={pledge1}
                    onChange={(e) => setPledge1(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line text-glacier focus:ring-glacier"
                  />
                  <span>
                    <strong>Agreed usage:</strong> I will use character direction strictly within authorized production purposes and will not repurpose character identities outside granted terms.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={pledge2}
                    onChange={(e) => setPledge2(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line text-glacier focus:ring-glacier"
                  />
                  <span>
                    <strong>No extraction:</strong> I will not attempt to extract, scrape, reverse-engineer, or duplicate private personality sheets from prompt outputs.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={pledge3}
                    onChange={(e) => setPledge3(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line text-glacier focus:ring-glacier"
                  />
                  <span>
                    <strong>Creator ownership:</strong> I acknowledge that creators retain permanent intellectual ownership of their registered character identities.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={pledge4}
                    onChange={(e) => setPledge4(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line text-glacier focus:ring-glacier"
                  />
                  <span>
                    <strong>Code of conduct:</strong> I accept the Vynter North Studio Code of Conduct and agree to honest, respectful review standards.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Studio verification link (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@studio or IMDb link"
                  value={verificationLink}
                  onChange={(e) => setVerificationLink(e.target.value)}
                  className="input-base"
                />
                <p className="text-xs text-dim mt-1">
                  Verified studios receive a badge and access to exclusive character castings.
                </p>
              </div>

              <button
                type="submit"
                disabled={!pledge1 || !pledge2 || !pledge3 || !pledge4}
                className="btn-primary w-full disabled:opacity-50"
              >
                Accept agreement and continue
              </button>
            </form>
          )}

          {/* STEP 5: RECOVERY CODE */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="p-4 bg-night border border-line rounded-[8px] text-center">
                <span className="text-xs uppercase tracking-wider text-dim block mb-1">
                  Your Master Recovery Code
                </span>
                <span className="font-mono text-2xl font-bold tracking-widest text-glacier select-all block py-2">
                  {recoveryCode}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyRecoveryCode}
                  className="btn-secondary flex-1 text-sm"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy code"}
                </button>
                <button
                  type="button"
                  onClick={downloadRecoveryCode}
                  className="btn-secondary flex-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </button>
              </div>

              <div className="p-3.5 bg-warn/10 border border-warn/30 rounded-md text-xs text-warn leading-relaxed">
                <strong>Important:</strong> We do not store your recovery code in plain text and cannot email it to you. If you ever forget your password, this code is the only way to recover your account.
              </div>

              <label className="flex items-center gap-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={savedCodeAck}
                  onChange={(e) => setSavedCodeAck(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-glacier focus:ring-glacier"
                />
                <span className="text-text">I have securely saved my recovery code.</span>
              </label>

              <button
                type="button"
                disabled={!savedCodeAck}
                onClick={() => setStep(6)}
                className="btn-primary w-full disabled:opacity-50"
              >
                Continue to ready screen
              </button>
            </div>
          )}

          {/* STEP 6: READY SCREEN */}
          {step === 6 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-glacier/10 text-glacier rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-medium text-text">Account Ready</h3>
                <p className="text-sm text-dim mt-1">
                  You are registered as <strong>@{username}</strong> ({role === "creator" ? "Creator" : "Studio"}).
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {role === "creator" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/characters/new")}
                      className="btn-primary w-full"
                    >
                      Create your first character
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/marketplace")}
                      className="btn-secondary w-full"
                    >
                      Browse the marketplace
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push("/marketplace")}
                      className="btn-primary w-full"
                    >
                      Browse characters to rent
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/connect")}
                      className="btn-secondary w-full"
                    >
                      Connect Claude or ChatGPT
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
